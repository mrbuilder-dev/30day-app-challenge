import { Peer } from 'peerjs';

// Helper to detect human-readable device name & platform
export function getDeviceInfo() {
  const ua = navigator.userAgent;
  let name = 'دستگاه کاربر';
  let type = '💻 کامپیوتر';

  if (/iPhone/i.test(ua)) {
    name = 'آیفون (iPhone)';
    type = '📱 موبایل';
  } else if (/iPad/i.test(ua)) {
    name = 'آیپد (iPad)';
    type = '📱 تبلت';
  } else if (/Android/i.test(ua)) {
    name = 'گوشی اندروید';
    type = '📱 موبایل';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    name = 'مک‌بوک (macOS)';
    type = '💻 لپ‌تاپ';
  } else if (/Windows/i.test(ua)) {
    name = 'سیستم ویندوز (PC)';
    type = '💻 ویندوز';
  } else if (/Linux/i.test(ua)) {
    name = 'سیستم لینوکس';
    type = '💻 لینوکس';
  }

  return { name, type };
}

// Generate a random clean room/peer ID
export function generatePeerId() {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let result = 'beam-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const CHUNK_SIZE = 32 * 1024; // 32KB safe SCTP chunk size (fits comfortably under the 64KB WebRTC SCTP limit on iOS & Android)
const HIGH_BUFFER_THRESHOLD = 512 * 1024; // 512KB buffer ceiling before pausing stream
const LOW_BUFFER_THRESHOLD = 128 * 1024; // 128KB buffer floor before resuming stream

export class P2PManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.peer = null;
    this.activeConnection = null;
    this.myPeerId = null;
    this.remoteDeviceInfo = null;
    this.incomingFiles = {};
    this.pendingAcks = {};
    this.isDestroyed = false;
  }

  init(customPeerId = null) {
    const peerId = customPeerId || generatePeerId();
    this.myPeerId = peerId;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
          ],
          iceCandidatePoolSize: 10
        }
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        if (this.callbacks.onReady) {
          this.callbacks.onReady(id);
        }
      });

      this.peer.on('connection', (conn) => {
        this._setupConnection(conn, false);
      });

      this.peer.on('error', (err) => {
        console.warn('P2P Peer error:', err);
        if (this.callbacks.onError) {
          this.callbacks.onError(err);
        }
      });

      this.peer.on('disconnected', () => {
        if (!this.isDestroyed && this.peer) {
          this.peer.reconnect();
        }
      });
    } catch (e) {
      console.error('Failed to init PeerJS:', e);
      if (this.callbacks.onError) {
        this.callbacks.onError(e);
      }
    }
  }

  connectToPeer(remotePeerId) {
    if (!this.peer || !remotePeerId) return;
    if (this.activeConnection) {
      this.activeConnection.close();
    }

    if (this.callbacks.onConnecting) {
      this.callbacks.onConnecting(remotePeerId);
    }

    const conn = this.peer.connect(remotePeerId, {
      reliable: true
    });

    this._setupConnection(conn, true);
  }

  _setupConnection(conn, isInitiator) {
    this.activeConnection = conn;

    conn.on('open', () => {
      // Send handshake with local device info
      const info = getDeviceInfo();
      conn.send({
        type: 'handshake',
        deviceName: info.name,
        deviceType: info.type
      });

      if (this.callbacks.onConnected) {
        this.callbacks.onConnected({
          peerId: conn.peer,
          isInitiator
        });
      }
    });

    conn.on('data', (data) => {
      this._handleIncomingData(data);
    });

    conn.on('close', () => {
      this.activeConnection = null;
      this.remoteDeviceInfo = null;
      if (this.callbacks.onDisconnected) {
        this.callbacks.onDisconnected();
      }
    });

    conn.on('error', (err) => {
      console.warn('P2P Connection error:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
    });
  }

  _handleIncomingData(data) {
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'handshake':
        this.remoteDeviceInfo = {
          name: data.deviceName || 'دستگاه متصل',
          type: data.deviceType || '📱 دیوایس'
        };
        if (this.callbacks.onRemoteDeviceDetected) {
          this.callbacks.onRemoteDeviceDetected(this.remoteDeviceInfo);
        }
        break;

      case 'clipboard':
        if (this.callbacks.onClipboardReceived) {
          this.callbacks.onClipboardReceived(data.text, data.sender);
        }
        break;

      case 'file-meta':
        this.incomingFiles[data.id] = {
          meta: data,
          chunks: [],
          receivedBytes: 0,
          startTime: Date.now()
        };
        if (this.callbacks.onTransferStart) {
          this.callbacks.onTransferStart({
            mode: 'receiving',
            fileName: data.name,
            fileSize: data.size,
            mime: data.mime
          });
        }
        break;

      case 'file-chunk': {
        const fileState = this.incomingFiles[data.id];
        if (!fileState) return;

        fileState.chunks[data.index] = data.data;
        fileState.receivedBytes += data.data.byteLength;

        const now = Date.now();
        if (now - (fileState.lastProgressUpdate || 0) > 80 || fileState.receivedBytes >= fileState.meta.size) {
          fileState.lastProgressUpdate = now;
          const progress = Math.min(100, Math.round((fileState.receivedBytes / fileState.meta.size) * 100));
          const elapsedSec = (now - fileState.startTime) / 1000;
          const speedMBs = elapsedSec > 0 ? (fileState.receivedBytes / (1024 * 1024) / elapsedSec).toFixed(1) : '0.0';

          if (this.callbacks.onTransferProgress) {
            this.callbacks.onTransferProgress({
              mode: 'receiving',
              progress,
              speedMBs,
              fileName: fileState.meta.name,
              receivedBytes: fileState.receivedBytes,
              totalBytes: fileState.meta.size
            });
          }
        }
        break;
      }

      case 'file-ack':
        if (this.pendingAcks && this.pendingAcks[data.id]) {
          this.pendingAcks[data.id]();
          delete this.pendingAcks[data.id];
        }
        break;

      case 'file-complete': {
        const fileState = this.incomingFiles[data.id];
        if (!fileState) return;

        const blob = new Blob(fileState.chunks, { type: fileState.meta.mime || 'application/octet-stream' });
        const downloadUrl = URL.createObjectURL(blob);

        if (this.callbacks.onFileReceived) {
          this.callbacks.onFileReceived({
            id: data.id,
            name: fileState.meta.name,
            size: fileState.meta.size,
            mime: fileState.meta.mime,
            url: downloadUrl,
            time: 'همین الان'
          });
        }

        // Send two-way acknowledgment back to sender
        if (this.activeConnection && this.activeConnection.open) {
          try {
            this.activeConnection.send({
              type: 'file-ack',
              id: data.id
            });
          } catch (e) {
            console.warn('Could not send file-ack:', e);
          }
        }

        delete this.incomingFiles[data.id];
        break;
      }

      default:
        break;
    }
  }

  sendClipboard(text) {
    if (!this.activeConnection || !this.activeConnection.open) {
      throw new Error('دستگاهی برای ارسال متن متصل نیست');
    }

    const info = getDeviceInfo();
    this.activeConnection.send({
      type: 'clipboard',
      text,
      sender: info.name
    });
  }

  async sendFile(file) {
    if (!this.activeConnection || !this.activeConnection.open) {
      throw new Error('دستگاهی برای ارسال فایل متصل نیست یا اتصال قطع شده است');
    }

    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // 1. Send metadata
    this.activeConnection.send({
      type: 'file-meta',
      id: fileId,
      name: file.name,
      size: file.size,
      mime: file.type || 'application/octet-stream',
      totalChunks
    });

    if (this.callbacks.onTransferStart) {
      this.callbacks.onTransferStart({
        mode: 'sending',
        fileName: file.name,
        fileSize: file.size
      });
    }

    const startTime = Date.now();
    let offset = 0;
    let chunkIndex = 0;
    let lastProgressUpdate = 0;

    // 2. Stream binary chunks with robust cross-browser backpressure
    while (offset < file.size) {
      if (!this.activeConnection || !this.activeConnection.open) {
        throw new Error('اتصال با دستگاه مقابل در حین انتقال قطع شد');
      }

      const dataChannel = this.activeConnection.dataChannel;

      // Reliable backpressure flow control for iOS Safari, Android, and Desktop
      if (dataChannel && dataChannel.bufferedAmount > HIGH_BUFFER_THRESHOLD) {
        while (dataChannel && dataChannel.bufferedAmount > LOW_BUFFER_THRESHOLD) {
          if (!this.activeConnection || !this.activeConnection.open) {
            throw new Error('اتصال با دستگاه مقابل در حین انتقال قطع شد');
          }
          await new Promise((resolve) => setTimeout(resolve, 15));
        }
      }

      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await slice.arrayBuffer();

      this.activeConnection.send({
        type: 'file-chunk',
        id: fileId,
        index: chunkIndex,
        data: buffer
      });

      offset += CHUNK_SIZE;
      chunkIndex++;

      const now = Date.now();
      if (now - lastProgressUpdate > 80 || offset >= file.size) {
        lastProgressUpdate = now;
        const progress = Math.min(100, Math.round((offset / file.size) * 100));
        const elapsedSec = (now - startTime) / 1000;
        const speedMBs = elapsedSec > 0 ? (offset / (1024 * 1024) / elapsedSec).toFixed(1) : '0.0';

        if (this.callbacks.onTransferProgress) {
          this.callbacks.onTransferProgress({
            mode: 'sending',
            progress,
            speedMBs,
            fileName: file.name,
            transferredBytes: Math.min(offset, file.size),
            totalBytes: file.size
          });
        }
      }
    }

    if (!this.activeConnection || !this.activeConnection.open) {
      throw new Error('اتصال با دستگاه مقابل قبل از دریافت فایل قطع شد');
    }

    // 3. Send complete signal and wait for receiver confirmation (prevents false 100% completion)
    this.activeConnection.send({
      type: 'file-complete',
      id: fileId
    });

    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 4000); // 4-second safety fallback
      this.pendingAcks[fileId] = () => {
        clearTimeout(timeout);
        resolve();
      };
    });

    return {
      id: fileId,
      name: file.name,
      size: file.size
    };
  }

  disconnect() {
    if (this.activeConnection) {
      this.activeConnection.close();
      this.activeConnection = null;
    }
  }

  destroy() {
    this.isDestroyed = true;
    this.disconnect();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
