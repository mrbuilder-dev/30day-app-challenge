import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { P2PManager, getDeviceInfo } from './services/webrtc';

// Comprehensive Bilingual Dictionary (FA & EN)
const translations = {
  fa: {
    guideTab: '🚀 راهنمای ۳ مرحله‌ای (Stitch)',
    desktopTab: '💻 وب دسکتاپ (P2P Hub)',
    mobileTab: '📱 اپ موبایل (Stitch)',
    brandSubtitle: 'انتقال پرسرعت فایل و کلیپ‌بورد در شبکه محلی بدون نیاز به ۱ بایت اینترنت',
    guideBtn: '💡 راهنمای ۳ مرحله‌ای',
    copyLink: '🔗 کپی لینک اتصال',
    copied: '✓ کپی شد!',
    scanQR: '📷 اسکن QR کد',
    statusReady: 'آماده اتصال',
    statusConnecting: 'در حال برقراری P2P...',
    statusConnected: 'متصل به',
    localCardTitle: 'دستگاه‌های محلی',
    localCardDesc: 'دستگاه دوم را با لینک، QR کد یا وارد کردن کد وصل کنید:',
    localCodeLabel: 'کد اختصاصی این دستگاه',
    copyCode: 'کپی لینک',
    readyExchange: 'آماده تبادل',
    manualInputPrompt: 'یا کد دستگاه مقابل را وارد کنید:',
    manualPlaceholder: 'مثلاً beam-x4k9...',
    connectBtn: 'اتصال 🔗',
    scanQrBtn: '📷 اتصال با اسکن QR Code (آفلاین)',
    historyTitle: 'تاریخچه و دریافت‌ها',
    historyDesc: 'فایل‌های دریافتی مستقیماً در مرورگر ذخیره و قابل دانلود می‌شوند:',
    noTransfers: 'هنوز فایلی منتقل نشده است.',
    downloadBtn: '💾 دانلود فایل',
    currentSpeed: 'سرعت لحظه‌ای',
    encryptionType: 'نوع رمزنگاری',
    sendCardTitle: 'ارسال فایل یا متن',
    sendCardDesc: 'مستقیماً به',
    remotePeerPlaceholder: 'دستگاه متصل',
    dropzoneText: 'انتخاب یا رها کردن فایل',
    dropzoneHint: 'عکس، ویدیو، PDF، موزیک یا فایل فشرده',
    readyToSend: 'آماده ارسال',
    transferring: 'در حال انتقال P2P...',
    sendBtn: '🚀 ارسال فایل با حداکثر سرعت',
    sendingBtn: '⏳ در حال فرستادن چانک‌های باینری...',
    sharedClipboard: '📋 تخته‌شستی اشتراکی (متن / لینک)',
    clipboardPlaceholder: 'لینک، شماره یا متن برای کپی در مقصد...',
    sendClipboardBtn: 'ارسال',
    receivedClipboardLabel: 'متن دریافت‌شده:',
    sentToast: '✓ ارسال شد!',
    modalTitle: '📷 اسکن با دوربین گوشی',
    modalDesc: 'دوربین آیفون یا اندروید را روی این کد بگیرید تا مستقیماً به این صفحه وصل شوید:',
    roomCode: 'کد اتاق',
    closeModal: 'بستن پنجره ✕',
    activeTransferTitle: 'انتقال فعال فایل',
    transferModalBadge: 'BEAMING ⚡',
    transferModalDesc: '0% اینترنت • مستقیم روتر LAN',
    senderLabel: 'این دستگاه',
    receiverLabel: 'دستگاه مقابل',
    rateLabel: 'سرعت لحظه‌ای',
    etaLabel: 'زمان تخمینی',
    sctpLabel: 'پکت‌های SCTP',
    protocolLabel: 'کانال داده P2P',
    closeTransferModal: 'ادامه در پس‌زمینه ✕',
    radarAuto: '☻ رادار خودکار',
    radarConnected: '● متصل P2P',
    radarWaiting: 'در انتظار اتصال دیوایس مقابل...',
    guideHeader: 'چگونه LocalBeam کار می‌کند؟',
    guideHeroSub: 'انتقال مستقیم فایل، ویدیو و پوشه بین لپ‌تاپ، آیفون و اندروید بدون نیاز به اینترنت، کابل یا ثبت‌نام',
    guideStep1Title: 'اسکن یا اشتراک لینک',
    guideStep1Desc: 'دستگاه‌های متصل به وای‌فای مشترک را رادار هوشمند به‌صورت خودکار شناسایی می‌کند، یا با اسکن یک کد QR سریع به یکدیگر متصل شوید.',
    guideStep2Title: 'دست‌تکانی مستقیم LAN',
    guideStep2Desc: 'اتصال امن و همتا-به-همتا (WebRTC Direct DataChannel) بدون آپلود به کلود و با رمزنگاری سرتاسری انجام می‌شود.',
    guideStep3Title: 'انتقال موشکی ۶۰MB/s',
    guideStep3Desc: 'عکس‌ها، ویدیوهای حجیم 4K یا پوشه‌های سنگین را بکشید و رها کنید؛ فایل‌ها با حداکثر ظرفیت پهنای‌باند جابجا می‌شوند.',
    connectedSubtitle: 'کانال مستقیم WebRTC فعال • بدون مصرف نت'
  },
  en: {
    guideTab: '🚀 3-Step Guide (Stitch)',
    desktopTab: '💻 Desktop Web (P2P Hub)',
    mobileTab: '📱 Mobile App (Stitch)',
    brandSubtitle: 'High-speed local peer-to-peer file & clipboard beam. 0 bytes internet used.',
    guideBtn: '💡 3-Step Guide',
    copyLink: '🔗 Copy Pairing Link',
    copied: '✓ Copied!',
    scanQR: '📷 Scan QR Code',
    statusReady: 'Ready to Pair',
    statusConnecting: 'Connecting P2P...',
    statusConnected: 'Connected to',
    localCardTitle: 'Local Peers',
    localCardDesc: 'Connect your 2nd device via QR, pairing link, or room code:',
    localCodeLabel: 'This Device Code',
    copyCode: 'Copy Link',
    readyExchange: 'Ready to Beam',
    manualInputPrompt: 'Or enter peer room code:',
    manualPlaceholder: 'e.g. beam-x4k9...',
    connectBtn: 'Connect 🔗',
    scanQrBtn: '📷 Pair via QR Code (Offline)',
    historyTitle: 'History & Received Files',
    historyDesc: 'Received files are reassembled in-memory and ready to download:',
    noTransfers: 'No files transferred yet.',
    downloadBtn: '💾 Download File',
    currentSpeed: 'Current Speed',
    encryptionType: 'Encryption',
    sendCardTitle: 'Beam File or Text',
    sendCardDesc: 'Directly to',
    remotePeerPlaceholder: 'Target Peer',
    dropzoneText: 'Choose or drop a file here',
    dropzoneHint: 'Images, 4K videos, PDFs, music, or archives',
    readyToSend: 'Ready to beam',
    transferring: 'P2P Beaming...',
    sendBtn: '🚀 Beam File at Max Speed',
    sendingBtn: '⏳ Streaming binary chunks...',
    sharedClipboard: '📋 Shared Clipboard (Text / URLs)',
    clipboardPlaceholder: 'Paste link, phone number, or notes...',
    sendClipboardBtn: 'Send',
    receivedClipboardLabel: 'Received Text:',
    sentToast: '✓ Sent!',
    modalTitle: '📷 Scan with Camera',
    modalDesc: 'Point your iPhone or Android camera at this code to instant-pair:',
    roomCode: 'Room Code',
    closeModal: 'Close Window ✕',
    activeTransferTitle: 'Active Data Beam',
    transferModalBadge: 'BEAMING ⚡',
    transferModalDesc: '0% Internet • Direct LAN Router',
    senderLabel: 'This Device',
    receiverLabel: 'Target Device',
    rateLabel: 'Transfer Rate',
    etaLabel: 'Estimated ETA',
    sctpLabel: 'SCTP Packets',
    protocolLabel: 'P2P Data Channel',
    closeTransferModal: 'Run in Background ✕',
    radarAuto: '☻ Auto Radar',
    radarConnected: '● P2P Linked',
    radarWaiting: 'Waiting for peer device to connect...',
    guideHeader: 'How LocalBeam Works?',
    guideHeroSub: 'Direct file, video, and folder transfer between laptop, iPhone, and Android without internet, cables, or signup.',
    guideStep1Title: 'Scan or Share Link',
    guideStep1Desc: 'Smart radar detects devices on the same Wi-Fi, or scan a dynamic QR code to pair in a millisecond.',
    guideStep2Title: 'Direct LAN Handshake',
    guideStep2Desc: 'Secure peer-to-peer WebRTC DataChannel connects devices directly without cloud uploads and with E2EE.',
    guideStep3Title: 'Instant 60MB/s Beam',
    guideStep3Desc: 'Drop photos, 4K videos, or heavy archives; streams directly at full hardware Wi-Fi bandwidth.',
    connectedSubtitle: 'Direct WebRTC channel active • 0 byte internet used'
  }
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('localbeam_lang') || 'fa');
  
  // Default view is 'guide' (Exact Google Stitch 1:1 screen from Image 1!)
  const [viewMode, setViewMode] = useState('guide'); // 'guide' | 'desktop' | 'mobile'
  const [showTechModal, setShowTechModal] = useState(false);

  // Local Device Info
  const [localDevice] = useState(() => getDeviceInfo());

  // WebRTC / P2P State
  const p2pManagerRef = useRef(null);
  const [myPeerId, setMyPeerId] = useState('');
  const [p2pStatus, setP2pStatus] = useState('initializing');
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [targetPeerInput, setTargetPeerInput] = useState('');
  const [toastNotification, setToastNotification] = useState(null);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Transfer States
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState('0.0');
  const [transferFileName, setTransferFileName] = useState('');
  const [transferFileSize, setTransferFileSize] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Simulated Fluctuating Speed in Guide (from Stitch spec)
  const [fluctuatingSpeed, setFluctuatingSpeed] = useState('58.4');

  // Clipboard States
  const [clipboardText, setClipboardText] = useState('');
  const [incomingClipboard, setIncomingClipboard] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Current translation object
  const text = translations[lang] || translations.fa;

  // Persist language selection & sync document attributes
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('localbeam_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Speedometer fluctuation interval for Stitch screen
  useEffect(() => {
    const interval = setInterval(() => {
      const speed = (54 + Math.random() * 12).toFixed(1);
      setFluctuatingSpeed(speed);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Transfers History
  const [transfers, setTransfers] = useState([
    {
      id: 'sample-1',
      name: 'stitch_design_spec.fig',
      size: '24.5 MB',
      from: 'MacBook Pro',
      to: 'iPhone 15 Pro',
      time: 'همین الان',
      isDownloadable: false
    }
  ]);

  // --- Initialize WebRTC P2P ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectTarget = params.get('connect') || params.get('peer');

    const manager = new P2PManager({
      onReady: (id) => {
        setMyPeerId(id);
        setP2pStatus('waiting');

        if (connectTarget && connectTarget !== id) {
          setP2pStatus('connecting');
          setViewMode('desktop');
          setTimeout(() => {
            manager.connectToPeer(connectTarget);
          }, 600);
        }
      },
      onConnecting: () => {
        setP2pStatus('connecting');
      },
      onConnected: () => {
        setP2pStatus('connected');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        showToast(lang === 'fa' ? '🟢 اتصال مستقیم P2P برقرار شد!' : '🟢 Direct P2P Connection Established!');
      },
      onRemoteDeviceDetected: (info) => {
        setConnectedDevice(info);
      },
      onDisconnected: () => {
        setP2pStatus('waiting');
        setConnectedDevice(null);
        setShowTransferModal(false);
        showToast(lang === 'fa' ? '⚠️ ارتباط با دستگاه مقابل قطع شد.' : '⚠️ Connection with peer closed.');
      },
      onTransferStart: ({ fileName, fileSize }) => {
        setIsTransferring(true);
        setShowTransferModal(true);
        setTransferProgress(0);
        setTransferFileName(fileName);
        setTransferFileSize(`${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
      },
      onTransferProgress: ({ progress, speedMBs }) => {
        setTransferProgress(progress);
        setTransferSpeed(speedMBs);
      },
      onFileReceived: (fileObj) => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        const receivedEntry = {
          id: fileObj.id,
          name: fileObj.name,
          size: `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`,
          from: connectedDevice ? connectedDevice.name : (lang === 'fa' ? 'دستگاه مقابل' : 'Remote Peer'),
          to: `${localDevice.name}`,
          time: lang === 'fa' ? 'همین الان' : 'Just now',
          downloadUrl: fileObj.url,
          isDownloadable: true
        };
        setTransfers((prev) => [receivedEntry, ...prev]);
        setIsTransferring(false);
        setTransferProgress(100);
        setTimeout(() => setShowTransferModal(false), 2000);
        showToast(lang === 'fa' ? `📁 فایل "${fileObj.name}" با موفقیت دریافت شد!` : `📁 File "${fileObj.name}" received!`);
      },
      onClipboardReceived: (clipText, sender) => {
        setIncomingClipboard(clipText);
        showToast(lang === 'fa' ? `📋 متن جدید از ${sender || 'دستگاه متصل'} دریافت شد!` : `📋 New text received from ${sender || 'Peer'}!`);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(clipText).catch(() => {});
        }
      },
      onError: (err) => {
        console.warn('P2P Notice:', err);
      }
    });

    manager.init();
    p2pManagerRef.current = manager;

    return () => {
      manager.destroy();
    };
  }, [lang]);

  const showToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  const getPairingUrl = () => {
    if (!myPeerId) return window.location.href;
    const url = new URL(window.location.href);
    url.searchParams.set('connect', myPeerId);
    return url.toString();
  };

  const handleCopyPairingLink = () => {
    const url = getPairingUrl();
    navigator.clipboard.writeText(url);
    setCopyLinkSuccess(true);
    setTimeout(() => setCopyLinkSuccess(false), 2500);
  };

  const handleConnectManual = (e) => {
    e?.preventDefault();
    if (!targetPeerInput.trim() || !p2pManagerRef.current) return;
    p2pManagerRef.current.connectToPeer(targetPeerInput.trim());
    setTargetPeerInput('');
  };

  const handleSendFileReal = async () => {
    if (!selectedFile) {
      alert(lang === 'fa' ? 'لطفاً ابتدا یک فایل را انتخاب یا رها کنید.' : 'Please select or drop a file first.');
      return;
    }
    if (p2pStatus !== 'connected' || !p2pManagerRef.current) {
      alert(lang === 'fa' ? 'ابتدا دستگاه دوم را متصل کنید!' : 'Please pair the second device first!');
      setShowQRModal(true);
      return;
    }

    try {
      setIsTransferring(true);
      setShowTransferModal(true);
      setTransferProgress(0);
      setTransferFileName(selectedFile.name);
      setTransferFileSize(`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`);

      await p2pManagerRef.current.sendFile(selectedFile);

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      const newEntry = {
        id: Date.now(),
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        from: `${localDevice.name}`,
        to: connectedDevice ? connectedDevice.name : (lang === 'fa' ? 'دستگاه مقصد' : 'Target Peer'),
        time: lang === 'fa' ? 'همین الان' : 'Just now',
        isDownloadable: false
      };
      setTransfers((prev) => [newEntry, ...prev]);
      setSelectedFile(null);
      setIsTransferring(false);
      setTimeout(() => setShowTransferModal(false), 2000);
      showToast(lang === 'fa' ? '🚀 فایل با موفقیت به دستگاه مقصد رسید!' : '🚀 File sent successfully!');
    } catch (err) {
      console.error('Send error:', err);
      alert((lang === 'fa' ? 'خطا در ارسال فایل: ' : 'Error beaming file: ') + (err.message || 'DataChannel issue'));
      setIsTransferring(false);
      setShowTransferModal(false);
    }
  };

  const handleSendClipboardReal = (e) => {
    e.preventDefault();
    if (!clipboardText.trim()) return;
    if (p2pStatus !== 'connected' || !p2pManagerRef.current) {
      alert(lang === 'fa' ? 'ابتدا دستگاه دوم را متصل کنید!' : 'Please pair the second device first!');
      setShowQRModal(true);
      return;
    }

    try {
      p2pManagerRef.current.sendClipboard(clipboardText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2200);
      setClipboardText('');
      showToast(lang === 'fa' ? '📋 متن به دستگاه مقصد فرستاده شد.' : '📋 Text synced to remote clipboard.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', direction: lang === 'fa' ? 'rtl' : 'ltr' }}>
      
      {/* Toast Notification Alert */}
      {toastNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'var(--nb-dark)',
          color: 'var(--nb-white)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-pill)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-hard)',
          fontWeight: 800,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{toastNotification}</span>
        </div>
      )}

      {/* ========================================================
          SCREEN 1: EXACT 1:1 GOOGLE STITCH ONBOARDING GUIDE (IMAGE 1)
      ======================================================== */}
      {viewMode === 'guide' && (
        <div style={{ position: 'relative' }}>
          
          {/* Top Shared App Bar from Stitch */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--nb-bg)',
            borderBottom: 'var(--border-thick)',
            padding: '14px 20px',
            boxShadow: '0px 4px 0px #000',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Brand Cluster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--nb-yellow)',
                border: 'var(--border-thick)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#000' }}>flare</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  lineHeight: 1
                }}>
                  LOCALBEAM
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--nb-dark)',
                  marginTop: '3px'
                }}>
                  {lang === 'fa' ? 'AirDrop تحت وب • آفلاین ۱۰۰٪' : 'Web AirDrop • 100% Offline'}
                </span>
              </div>
            </div>

            {/* Trailing Telemetry Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--nb-green)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }}></span>
                <span>Wi-Fi Direct LAN</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: 'var(--border-thick)',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                <span style={{ color: '#ef4444' }}>☁️✕</span>
                <span>{lang === 'fa' ? '۰ بایت اینترنت' : '0 Byte Internet'}</span>
              </div>

              <button
                onClick={() => handleLanguageChange(lang === 'fa' ? 'en' : 'fa')}
                className="nb-btn nb-btn-yellow"
                style={{ padding: '5px 14px', fontSize: '0.8rem' }}
              >
                {lang === 'fa' ? 'EN / FA' : 'FA / EN'}
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 36px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fff',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 18px',
              boxShadow: 'var(--shadow-hard-sm)',
              marginBottom: '16px',
              fontSize: '0.85rem',
              fontWeight: 800
            }}>
              <span>✨</span>
              <span>{lang === 'fa' ? '۳ مرحله فوق‌سریع و کاملاً آفلاین • 3 Easy Steps' : '3 Easy Steps • 100% Offline'}</span>
            </div>

            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: '12px',
              color: 'var(--nb-dark)'
            }}>
              {lang === 'fa' ? (
                <>چگونه <span style={{ color: 'var(--nb-purple)' }}>LocalBeam</span> کار می‌کند؟</>
              ) : (
                <>How <span style={{ color: 'var(--nb-purple)' }}>LocalBeam</span> Works?</>
              )}
            </h1>

            <p style={{ fontSize: '1rem', color: '#242730', fontWeight: 600, lineHeight: 1.6, marginBottom: '22px' }}>
              {text.guideHeroSub}
            </p>

            {/* Action Buttons (side by side between subtitle and 3 cards) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setViewMode('desktop')}
                className="nb-btn nb-btn-dark"
                style={{
                  padding: '14px 30px',
                  fontSize: '1.05rem',
                  minWidth: '260px',
                  boxShadow: 'var(--shadow-hard)'
                }}
              >
                <span>⚡</span> {lang === 'fa' ? 'شروع انتقال فایل • Start Beaming' : 'Start Beaming Files • P2P Hub'}
              </button>

              <button
                onClick={() => setShowTechModal(true)}
                className="nb-btn nb-btn-white"
                style={{
                  padding: '14px 24px',
                  fontSize: '0.98rem',
                  boxShadow: 'var(--shadow-hard-sm)'
                }}
              >
                <span>📖</span> {lang === 'fa' ? 'راهنمای فنی آفلاین' : 'Offline Tech Docs'}
              </button>
            </div>
          </div>

          {/* 3-Column Bento Deck Cards (Yellow, Lime Green, Pastel Pink) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            
            {/* STEP 1: Sunny Cheddar Yellow (#fdcf55) */}
            <div className="nb-card nb-card-yellow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="nb-pill" style={{ background: '#fff', fontSize: '0.8rem', fontWeight: 900 }}>
                    {lang === 'fa' ? 'مرحله ۱ • STEP 01' : 'STEP 01'}
                  </span>
                  <span style={{ fontSize: '1.6rem' }}>📷</span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>
                  {text.guideStep1Title}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.85)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {text.guideStep1Desc}
                </p>

                {/* White Interactive Module */}
                <div style={{
                  background: '#fff',
                  border: 'var(--border-thick)',
                  borderRadius: '20px',
                  padding: '16px',
                  marginBottom: '18px',
                  boxShadow: 'var(--shadow-hard-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px dashed #000',
                    paddingBottom: '8px',
                    marginBottom: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📡</span> {lang === 'fa' ? 'رادار خودکار دستگاه‌ها' : 'Auto Peer Radar'}
                    </span>
                    <span className="nb-pill" style={{ background: 'var(--nb-green)', padding: '2px 8px', fontSize: '0.7rem' }}>
                      {lang === 'fa' ? 'فعال' : 'Active'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#f1f5f9',
                    border: 'var(--border-medium)',
                    borderRadius: '14px',
                    padding: '10px 12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      background: '#fff',
                      border: 'var(--border-medium)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      📱
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>
                        {lang === 'fa' ? 'آیفون ۱۵ (iPhone 15 Pro)' : 'iPhone 15 Pro'}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#64748b' }} dir="ltr">192.168.1.34:8080</div>
                      <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800, marginTop: '2px' }}>
                        ● {lang === 'fa' ? 'آماده جفت‌سازی' : 'Ready to Pair'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyPairingLink}
                    className="nb-btn nb-btn-yellow"
                    style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  >
                    {copyLinkSuccess ? text.copied : (lang === 'fa' ? '📋 کپی آدرس LAN' : '📋 Copy LAN URL')}
                  </button>
                </div>
              </div>

              {/* Bottom Technical Tag */}
              <div style={{
                background: 'var(--nb-dark)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                justifyContent: 'space-between',
                direction: 'ltr'
              }}>
                <span>mDNS Peer Discovery</span>
                <span style={{ color: 'var(--nb-yellow)', fontWeight: 800 }}>192.168.1.*</span>
              </div>
            </div>

            {/* STEP 2: Fresh Lime Green (#c4f279) */}
            <div className="nb-card nb-card-green" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="nb-pill" style={{ background: '#fff', fontSize: '0.8rem', fontWeight: 900 }}>
                    {lang === 'fa' ? 'مرحله ۲ • STEP 02' : 'STEP 02'}
                  </span>
                  <span style={{ fontSize: '1.6rem' }}>📶</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                    {text.guideStep2Title}
                  </h2>
                </div>

                <span style={{
                  display: 'inline-block',
                  background: '#fff',
                  border: '1.5px solid #000',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  marginBottom: '10px'
                }}>
                  {lang === 'fa' ? 'بدون عبور از سرور اینترنتی' : 'Zero Cloud Hops'}
                </span>

                <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.85)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {text.guideStep2Desc}
                </p>

                {/* White Interactive Diagram */}
                <div style={{
                  background: '#fff',
                  border: 'var(--border-thick)',
                  borderRadius: '20px',
                  padding: '16px',
                  marginBottom: '18px',
                  boxShadow: 'var(--shadow-hard-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px dashed #000',
                    paddingBottom: '8px',
                    marginBottom: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🔒</span> {lang === 'fa' ? 'امنیت E2EE مستقیم' : 'Direct E2EE Security'}
                    </span>
                    <span className="nb-pill" style={{ background: 'var(--nb-yellow)', padding: '2px 8px', fontSize: '0.7rem' }}>
                      DTLS / SCTP
                    </span>
                  </div>

                  {/* Peer Node A to Node B Diagram */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px 14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: '#e2e8f0',
                        border: 'var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: 'var(--shadow-hard-sm)'
                      }}>
                        💻
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '4px' }}>
                        {lang === 'fa' ? 'مک‌بوک پرو' : 'MacBook Pro'}
                      </span>
                    </div>

                    <div style={{ flex: 1, margin: '0 12px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: '4px', background: '#000', borderRadius: '2px' }}></div>
                      <div className="animate-pulse-beam" style={{
                        position: 'absolute',
                        top: '-5px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: 'var(--nb-yellow)',
                        border: '2px solid #000'
                      }}></div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', marginTop: '6px' }}>DIRECT</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'var(--nb-pink)',
                        border: 'var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: 'var(--shadow-hard-sm)'
                      }}>
                        📱
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '4px' }}>
                        {lang === 'fa' ? 'آیفون ۱۵' : 'iPhone 15'}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    background: '#f1f5f9',
                    border: '1.5px solid #000',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    <span>🛡 {lang === 'fa' ? 'تأیید گواهی نشست' : 'Session Verified'}</span>
                    <span style={{ color: '#15803d' }}>TLS 1.3 Verified</span>
                  </div>
                </div>
              </div>

              {/* Bottom Technical Tag */}
              <div style={{
                background: 'var(--nb-dark)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                justifyContent: 'space-between',
                direction: 'ltr'
              }}>
                <span>WebRTC DataChannel</span>
                <span style={{ color: 'var(--nb-green)', fontWeight: 800 }}>Zero Cloud Hops</span>
              </div>
            </div>

            {/* STEP 3: Bubblegum Pastel Pink (#ffaec8) */}
            <div className="nb-card nb-card-pink" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="nb-pill" style={{ background: '#fff', fontSize: '0.8rem', fontWeight: 900 }}>
                    {lang === 'fa' ? 'مرحله ۳ • STEP 03' : 'STEP 03'}
                  </span>
                  <span style={{ fontSize: '1.6rem' }}>🚀</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                    {text.guideStep3Title}
                  </h2>
                </div>

                <span style={{
                  display: 'inline-block',
                  background: '#fff',
                  border: '1.5px solid #000',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  marginBottom: '10px'
                }}>
                  {lang === 'fa' ? 'بدون فشرده‌سازی و محدودیت حجم' : 'Raw Uncompressed Quality'}
                </span>

                <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.85)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {text.guideStep3Desc}
                </p>

                {/* White Interactive Speedometer */}
                <div style={{
                  background: '#fff',
                  border: 'var(--border-thick)',
                  borderRadius: '20px',
                  padding: '16px',
                  marginBottom: '18px',
                  boxShadow: 'var(--shadow-hard-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px dashed #000',
                    paddingBottom: '8px',
                    marginBottom: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}>
                    <span>⚡ {lang === 'fa' ? 'سرعت کنونی انتقال' : 'Current Speed'}</span>
                    <span className="nb-pill" style={{ background: 'var(--nb-yellow)', padding: '2px 8px', fontSize: '0.7rem' }}>
                      {lang === 'fa' ? 'پینگ: ۱ میلی‌ثانیه' : 'Ping: 1ms'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', direction: 'ltr' }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                        {fluctuatingSpeed}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>MB/s</span>
                    </div>
                    <span className="nb-pill" style={{ background: 'var(--nb-green)', fontSize: '0.75rem', padding: '2px 8px' }}>
                      LAN 5GHz
                    </span>
                  </div>

                  {/* Striped Bar */}
                  <div style={{
                    height: '16px',
                    background: '#e2e8f0',
                    border: 'var(--border-medium)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                  }}>
                    <div className="striped-bar" style={{ width: '78%', height: '100%', borderRadius: '6px' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                    <span>{lang === 'fa' ? 'فایل: RAW_4K_Video.mov' : 'File: RAW_4K_Video.mov'}</span>
                    <span>{lang === 'fa' ? '۳.۲GB از ۴.۱GB' : '3.2GB of 4.1GB'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Technical Tag */}
              <div style={{
                background: 'var(--nb-dark)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                justifyContent: 'space-between',
                direction: 'ltr'
              }}>
                <span>Max File Payload</span>
                <span style={{ color: '#ffaec8', fontWeight: 800 }}>Unlimited 100GB+</span>
              </div>
            </div>

          </div>

          {/* Network Telemetry Capsule Banner */}
          <div style={{
            background: '#fff',
            border: 'var(--border-thick)',
            borderRadius: '20px',
            padding: '18px 24px',
            boxShadow: 'var(--shadow-hard)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--nb-green)',
                border: 'var(--border-thick)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                🌐
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2px' }}>
                  {lang === 'fa' ? 'آماده برقراری ارتباط در شبکه محلی شما' : 'Ready to Beam across Local Network'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  {lang === 'fa' 
                    ? 'برای انتقال فایل نیازی نیست هر دو دستگاه سیم‌کارت یا بسته اینترنت داشته باشند. فقط به یک مودم یا هات‌اسپات وصل باشید!'
                    : 'No internet connection or SIM cards needed. Just be on the same local Wi-Fi router or personal hotspot!'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="nb-pill" style={{ background: '#f1f5f9' }}>
                ✓ {lang === 'fa' ? 'پورت باز 8080' : 'Port 8080 Open'}
              </span>
              <span className="nb-pill" style={{ background: '#f1f5f9' }}>
                📶 {lang === 'fa' ? 'Wi-Fi متصل' : 'Wi-Fi Connected'}
              </span>
            </div>
          </div>



          {/* Footer Dock */}
          <footer style={{
            borderTop: 'var(--border-thick)',
            padding: '24px 10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'var(--nb-yellow)',
              border: 'var(--border-medium)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 900,
              boxShadow: 'var(--shadow-hard-sm)'
            }}>
              Mr. Builder • 30 Day App Challenge
            </span>

            <a
              href="https://github.com/mrbuilder-dev/30day-app-challenge"
              target="_blank"
              rel="noreferrer"
              className="nb-btn nb-btn-white"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              🐙 Source on GitHub
            </a>

            <a
              href="https://x.com/MrBuildersai"
              target="_blank"
              rel="noreferrer"
              className="nb-btn nb-btn-white"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              𝕏 Developer Twitter
            </a>

            <a
              href="https://t.me/MrbuildersAI"
              target="_blank"
              rel="noreferrer"
              className="nb-btn nb-btn-white"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              ✈️ Telegram Channel
            </a>
          </footer>

        </div>
      )}

      {/* ========================================================
          SCREEN 2: P2P TRANSFER HUB (DESKTOP CARDS - IMAGE 2)
      ======================================================== */}
      {viewMode === 'desktop' && (
        <div>
          {/* Top Brand Header */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                background: 'var(--nb-yellow)',
                border: 'var(--border-thick)',
                borderRadius: '16px',
                width: '52px',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-hard)',
                fontSize: '1.8rem',
                transform: 'rotate(-3deg)'
              }}>
                ⚡
              </div>
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: 0
                }}>
                  LocalBeam
                  <span className="nb-pill" style={{ fontSize: '0.75rem', background: 'var(--nb-green)' }}>
                    P2P LAN v0.2
                  </span>
                </h1>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#333', fontWeight: 700 }}>
                  {text.brandSubtitle}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons Group */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode('guide')}
                className="nb-btn nb-btn-yellow"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                {text.guideBtn}
              </button>

              <button
                onClick={handleCopyPairingLink}
                className="nb-btn nb-btn-white"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                {copyLinkSuccess ? text.copied : text.copyLink}
              </button>

              <button
                onClick={() => setShowQRModal(true)}
                className="nb-btn nb-btn-white"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                {text.scanQR}
              </button>

              <button
                onClick={() => handleLanguageChange(lang === 'fa' ? 'en' : 'fa')}
                className="nb-btn nb-btn-yellow"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                {lang === 'fa' ? 'EN / FA' : 'FA / EN'}
              </button>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'var(--border-medium)',
                background: p2pStatus === 'connected' ? '#dcfce7' : p2pStatus === 'connecting' ? '#fef3c7' : '#fff',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: p2pStatus === 'connected' ? '#15803d' : '#121316'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: p2pStatus === 'connected' ? '#22c55e' : p2pStatus === 'connecting' ? '#eab308' : '#9ca3af'
                }}></span>
                {p2pStatus === 'connected' 
                  ? `${text.statusConnected}: ${connectedDevice ? connectedDevice.name : text.remotePeerPlaceholder}`
                  : p2pStatus === 'connecting' 
                    ? text.statusConnecting 
                    : `${text.statusReady} (${myPeerId || '...'})`}
              </div>
            </div>
          </header>

          {/* 3-Column Neo-Brutalism Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}>

            {/* CARD 1: PAIRING & NEARBY PEERS */}
            <div className="nb-card nb-card-yellow" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>LAN</span>
                <div className="nb-pill" style={{
                  padding: '3px 10px',
                  fontSize: '0.8rem',
                  background: p2pStatus === 'connected' ? 'var(--nb-green)' : '#fff'
                }}>
                  {p2pStatus === 'connected' ? (lang === 'fa' ? '● متصل شد' : '● Connected') : (lang === 'fa' ? '☻ آماده' : '☻ Ready')}
                </div>
                <span style={{ fontSize: '1.2rem' }}>📶</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                {text.localCardTitle}
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                {text.localCardDesc}
              </p>

              {/* Local Peer Box */}
              <div style={{
                background: '#fff',
                border: 'var(--border-thick)',
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#666', marginBottom: '4px' }}>
                  {text.localCodeLabel} ({localDevice.name}):
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    color: 'var(--nb-dark)'
                  }}>
                    {myPeerId || '...'}
                  </span>
                  <button
                    onClick={handleCopyPairingLink}
                    className="nb-pill"
                    style={{ background: 'var(--nb-yellow)', cursor: 'pointer', border: 'var(--border-medium)' }}
                  >
                    {copyLinkSuccess ? text.copied : text.copyCode}
                  </button>
                </div>
              </div>

              {/* Connected Peer Status Card */}
              {p2pStatus === 'connected' && connectedDevice ? (
                <div style={{
                  padding: '14px',
                  borderRadius: '16px',
                  border: 'var(--border-thick)',
                  background: 'var(--nb-dark)',
                  color: 'var(--nb-white)',
                  boxShadow: 'var(--shadow-hard-sm)',
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px', color: 'var(--nb-yellow)' }}>
                      ✓ {connectedDevice.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {text.connectedSubtitle}
                    </div>
                  </div>
                  <span className="nb-pill" style={{ background: 'var(--nb-green)', color: '#000', fontSize: '0.75rem' }}>
                    {text.readyExchange}
                  </span>
                </div>
              ) : (
                /* Manual Connect Input Form */
                <form onSubmit={handleConnectManual} style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
                    {text.manualInputPrompt}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={text.manualPlaceholder}
                      value={targetPeerInput}
                      onChange={(e) => setTargetPeerInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: 'var(--border-medium)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={p2pStatus === 'connecting'}
                      className="nb-btn nb-btn-dark"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      {p2pStatus === 'connecting' ? '⏳...' : text.connectBtn}
                    </button>
                  </div>
                </form>
              )}

              <button
                onClick={() => setShowQRModal(true)}
                className="nb-btn nb-btn-white"
                style={{ width: '100%', padding: '14px' }}
              >
                {text.scanQrBtn}
              </button>
            </div>

            {/* CARD 2: RECEIVED FILES & SPEED */}
            <div className="nb-card nb-card-green" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>P2P LAN</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ⚡ Live
                </div>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                {text.historyTitle}
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                {text.historyDesc}
              </p>

              {/* Real Received / History List */}
              <div style={{
                background: 'var(--nb-white)',
                border: 'var(--border-thick)',
                borderRadius: '20px',
                padding: '14px',
                boxShadow: 'var(--shadow-hard-sm)',
                marginBottom: '18px',
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {transfers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.85rem', color: '#777' }}>
                    {text.noTransfers}
                  </div>
                ) : (
                  transfers.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: 'var(--border-medium)',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '2px' }}>
                          📄 {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#666', fontFamily: 'var(--font-mono)' }}>
                          {item.size} • {item.from} ➔ {item.to}
                        </div>
                      </div>

                      {item.isDownloadable && item.downloadUrl ? (
                        <a
                          href={item.downloadUrl}
                          download={item.name}
                          className="nb-btn nb-btn-green"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                        >
                          {text.downloadBtn}
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                          {item.time}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Protocol Metrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{
                  flex: 1,
                  background: 'var(--nb-white)',
                  border: 'var(--border-thick)',
                  borderRadius: '14px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>{text.currentSpeed}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    {transferSpeed} MB/s
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  background: 'var(--nb-white)',
                  border: 'var(--border-thick)',
                  borderRadius: '14px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>{text.encryptionType}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>DTLS/SCTP</div>
                </div>
              </div>
            </div>

            {/* CARD 3: DROPZONE & CLIPBOARD */}
            <div className="nb-card nb-card-pink" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>P2P Data</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ✦ Instant
                </div>
                <span style={{ fontSize: '1.2rem' }}>📦</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                {text.sendCardTitle}
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                {text.sendCardDesc} {connectedDevice ? connectedDevice.name : text.remotePeerPlaceholder}:
              </p>

              <label className="nb-dropzone" style={{ display: 'block', marginBottom: '16px' }}>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📁</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                  {selectedFile ? selectedFile.name : text.dropzoneText}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#555', fontWeight: 600 }}>
                  {selectedFile 
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ${text.readyToSend}`
                    : text.dropzoneHint}
                </div>
              </label>

              {/* Live Transfer Progress */}
              {isTransferring && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>
                    <span>{text.transferring} ({transferSpeed} MB/s)</span>
                    <span>{transferProgress}%</span>
                  </div>
                  <div style={{
                    height: '14px',
                    background: '#fff',
                    border: 'var(--border-medium)',
                    borderRadius: '7px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${transferProgress}%`,
                      background: 'var(--nb-dark)',
                      transition: 'width 0.2s ease'
                    }}></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSendFileReal}
                disabled={isTransferring}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '14px', marginBottom: '18px' }}
              >
                {isTransferring ? text.sendingBtn : text.sendBtn}
              </button>

              {/* Shared Clipboard */}
              <div style={{
                background: 'var(--nb-white)',
                border: 'var(--border-thick)',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{text.sharedClipboard}</span>
                  {copiedNotification && <span style={{ color: '#16a34a', fontWeight: 900 }}>{text.sentToast}</span>}
                </div>

                <form onSubmit={handleSendClipboardReal} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder={text.clipboardPlaceholder}
                    value={clipboardText}
                    onChange={(e) => setClipboardText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: 'var(--border-medium)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    className="nb-btn nb-btn-yellow"
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    {text.sendClipboardBtn}
                  </button>
                </form>

                {incomingClipboard && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: '#fef3c7',
                    border: 'var(--border-medium)',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ fontWeight: 800, marginBottom: '2px' }}>{text.receivedClipboardLabel}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{incomingClipboard}</div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Bottom Floating Dock */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--nb-dark)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 24px',
              boxShadow: 'var(--shadow-hard)',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <a
                href="https://t.me/MrbuildersAI"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-yellow"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                ✈️ Telegram
              </a>

              <a
                href="https://x.com/MrBuildersai"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-white"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                𝕏 Twitter
              </a>

              <a
                href="https://github.com/mrbuilder-dev/30day-app-challenge"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-green"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                🐙 GitHub
              </a>

              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, paddingRight: '10px' }}>
                Mr. Builder • 30-Day App Challenge
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN 3: MOBILE APP PREVIEW FRAME (STITCH MOBILE SCREEN)
      ======================================================== */}
      {viewMode === 'mobile' && (
        <div className="mobile-phone-frame">
          
          <div className="mobile-status-bar">
            <span>9:41</span>
            <span>LocalBeam P2P</span>
            <span>100% 🔋</span>
          </div>

          <div style={{ padding: '18px 16px', background: '#f4f0ff', minHeight: '620px' }}>
            
            {/* 1. Radar Screen */}
            <div className="nb-card nb-card-white" style={{
              padding: '18px',
              textAlign: 'center',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="nb-pill" style={{
                  fontSize: '0.72rem',
                  background: p2pStatus === 'connected' ? 'var(--nb-green)' : 'var(--nb-yellow)'
                }}>
                  {p2pStatus === 'connected' ? text.radarConnected : text.radarAuto}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>
                  {text.roomCode}: {myPeerId || '...'}
                </span>
              </div>

              {/* Animated Radar Graphic */}
              <div style={{
                width: '180px',
                height: '180px',
                margin: '10px auto 14px',
                borderRadius: '50%',
                border: 'var(--border-thick)',
                background: 'linear-gradient(135deg, #121316, #242730)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 20px rgba(157, 132, 246, 0.4)'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(255, 255, 255, 0.3)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)'
                }}></div>

                <div className="radar-sweep-beam" style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  top: 0,
                  right: 0,
                  background: 'conic-gradient(from 0deg, rgba(196, 242, 121, 0.5) 0deg, transparent 60deg)',
                  borderRadius: '100% 0 0 0'
                }}></div>

                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: p2pStatus === 'connected' ? '#22c55e' : 'var(--nb-green)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px var(--nb-green)'
                }}></div>

                {connectedDevice && (
                  <div style={{
                    position: 'absolute',
                    top: '25px',
                    right: '30px',
                    background: 'var(--nb-pink)',
                    border: '2px solid #000',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: '0 0 8px #fff'
                  }}>💻</div>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                {p2pStatus === 'connected' ? (
                  <span>{text.statusConnected}: <span style={{ color: 'var(--nb-purple)' }}>{connectedDevice?.name}</span></span>
                ) : (
                  <span>{text.radarWaiting}</span>
                )}
              </div>
            </div>

            {/* 2. Mobile Dropzone & Send Button */}
            <div className="nb-card nb-card-pink" style={{ padding: '16px', marginBottom: '16px' }}>
              <label className="nb-dropzone" style={{ padding: '16px 10px', background: '#fff', marginBottom: '12px' }}>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ fontSize: '1.6rem' }}>📸 📁</div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginTop: '4px' }}>
                  {selectedFile ? selectedFile.name : text.dropzoneText}
                </div>
                {selectedFile && (
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {text.readyToSend}
                  </div>
                )}
              </label>

              <button
                onClick={handleSendFileReal}
                disabled={isTransferring}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
              >
                {isTransferring ? text.sendingBtn : text.sendBtn}
              </button>
            </div>

            {/* 3. Mobile Clipboard Sync */}
            <div className="nb-card nb-card-yellow" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{text.sharedClipboard}</span>
                {copiedNotification && <span style={{ color: '#16a34a' }}>{text.sentToast}</span>}
              </div>
              <form onSubmit={handleSendClipboardReal} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder={text.clipboardPlaceholder}
                  value={clipboardText}
                  onChange={(e) => setClipboardText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'var(--border-medium)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <button type="submit" className="nb-btn nb-btn-dark" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  {text.sendClipboardBtn}
                </button>
              </form>
            </div>

            {/* QR Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="nb-btn nb-btn-white"
              style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
            >
              {text.scanQrBtn}
            </button>

          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            background: 'var(--nb-dark)',
            padding: '12px 10px',
            borderTop: 'var(--border-thick)'
          }}>
            <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📡</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px', color: 'var(--nb-yellow)' }}>Radar</span>
            </button>
            <button onClick={() => setShowQRModal(true)} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📷</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px' }}>QR</span>
            </button>
            <button onClick={() => setViewMode('desktop')} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>💻</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px' }}>Desktop</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================
          ACTIVE DATA BEAM MODAL (FROM GOOGLE STITCH)
      ======================================================== */}
      {showTransferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px',
          zIndex: 99999
        }}>
          <div className="nb-card" style={{
            maxWidth: '620px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-hard-lg)'
          }}>
            {/* Modal Header Strip */}
            <div style={{
              background: 'var(--nb-yellow)',
              borderBottom: 'var(--border-thick)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid #000' }}></span>
                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{text.activeTransferTitle}</span>
                <span className="nb-pill" style={{ background: '#fff', fontSize: '0.72rem', padding: '2px 8px' }}>
                  {text.transferModalBadge}
                </span>
              </div>

              <button
                onClick={() => setShowTransferModal(false)}
                className="nb-btn nb-btn-pink"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '22px' }}>
              
              {/* SENDER TO RECEIVER BEAM ANIMATION STAGE (From Stitch) */}
              <div style={{
                background: '#f8fafc',
                border: 'var(--border-thick)',
                borderRadius: '18px',
                padding: '16px',
                marginBottom: '18px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Sender Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'var(--nb-green)',
                      border: 'var(--border-thick)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: 'var(--shadow-hard-sm)'
                    }}>
                      💻
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{text.senderLabel}</span>
                  </div>

                  {/* Animated WebRTC Pipeline */}
                  <div style={{ flex: 1, margin: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <svg style={{ width: '100%', height: '30px' }} preserveAspectRatio="none" viewBox="0 0 200 30">
                      <line className="beam-pipeline" stroke="#121316" strokeLinecap="round" strokeWidth="4" x1="10" x2="190" y1="15" y2="15"></line>
                    </svg>

                    <div className="bounce-payload" style={{
                      position: 'absolute',
                      top: '-6px',
                      background: '#fff',
                      border: 'var(--border-medium)',
                      borderRadius: '20px',
                      padding: '2px 12px',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      boxShadow: 'var(--shadow-hard-sm)'
                    }}>
                      ⚡ P2P DATA BEAM
                    </div>

                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: '#b91c1c',
                      background: '#fee2e2',
                      border: '1.5px solid #000',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {text.transferModalDesc}
                    </div>
                  </div>

                  {/* Receiver Node */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'var(--nb-yellow)',
                      border: 'var(--border-thick)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: 'var(--shadow-hard-sm)'
                    }}>
                      📱
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{connectedDevice ? connectedDevice.name : text.receiverLabel}</span>
                  </div>
                </div>
              </div>

              {/* File Info & Percentage */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
                border: 'var(--border-thick)',
                borderRadius: '16px',
                padding: '12px 16px',
                marginBottom: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '2px' }}>
                    📁 {transferFileName || 'file_packet.bin'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'var(--font-mono)' }}>
                    {transferFileSize || '34.2 MB'} • WebRTC DataChannel
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                  {transferProgress}%
                </div>
              </div>

              {/* Chunky Striped Progress Bar from Stitch */}
              <div style={{
                height: '24px',
                background: '#e2e8f0',
                border: 'var(--border-thick)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '18px'
              }}>
                <div
                  className="striped-progress"
                  style={{
                    height: '100%',
                    width: `${transferProgress}%`,
                    borderRight: 'var(--border-medium)',
                    transition: 'width 0.2s ease'
                  }}
                ></div>
              </div>

              {/* 4-Grid Telemetry Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '18px'
              }}>
                <div style={{ background: '#f8fafc', border: 'var(--border-medium)', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', fontWeight: 700 }}>{text.rateLabel}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{transferSpeed} MB/s</span>
                </div>

                <div style={{ background: '#f8fafc', border: 'var(--border-medium)', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', fontWeight: 700 }}>{text.etaLabel}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>~4s</span>
                </div>

                <div style={{ background: '#f8fafc', border: 'var(--border-medium)', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', fontWeight: 700 }}>{text.sctpLabel}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>16KB/ea</span>
                </div>

                <div style={{ background: '#f8fafc', border: 'var(--border-medium)', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', fontWeight: 700 }}>{text.protocolLabel}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#16a34a' }}>WebRTC</span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <button
                onClick={() => setShowTransferModal(false)}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '12px', fontSize: '0.88rem' }}
              >
                {text.closeTransferModal}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          OFFLINE TECHNICAL DOCUMENTATION MODAL (FROM STITCH)
      ======================================================== */}
      {showTechModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 99999
        }}>
          <div className="nb-card" style={{
            maxWidth: '560px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--shadow-hard-lg)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 'var(--border-thick)',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>💻</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                  {lang === 'fa' ? 'پروتکل فنی LocalBeam' : 'LocalBeam Technical Protocol'}
                </h3>
              </div>
              <button
                onClick={() => setShowTechModal(false)}
                className="nb-btn nb-btn-pink"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '14px', border: 'var(--border-medium)', padding: '12px' }}>
                <h4 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px' }}>
                  {lang === 'fa' ? '۱. نحوه کشف دستگاه‌ها (mDNS & LAN Broadcast)' : '1. Device Discovery (mDNS & LAN Broadcast)'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  {lang === 'fa'
                    ? 'برنامه از پورت‌های محلی برای ارسال بسته لرزشی (Beacon) استفاده می‌کند. هیچ داده‌ای به خارج از شبکه وای‌فای ارسال نخواهد شد.'
                    : 'The app discovers local nodes inside the router. Zero packets travel to the public internet.'}
                </p>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '14px', border: 'var(--border-medium)', padding: '12px' }}>
                <h4 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px' }}>
                  {lang === 'fa' ? '۲. لایه انتقال داده (SCTP over DTLS)' : '2. Transport Layer (SCTP over DTLS)'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  {lang === 'fa'
                    ? 'فایل‌ها به قطعات ۱۶ تا ۶۴ کیلوبایتی بافر شده تبدیل و از طریق سوکت امن با حداکثر توان کارت شبکه Wi-Fi جابجا می‌شوند.'
                    : 'Files are streamed in 16KB/64KB binary chunks with hardware flow control at full Wi-Fi capability.'}
                </p>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '14px', border: 'var(--border-medium)', padding: '12px' }}>
                <h4 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px' }}>
                  {lang === 'fa' ? '۳. سازگاری متقابل سیستم‌عامل‌ها' : '3. Cross-Platform Interoperability'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  {lang === 'fa'
                    ? 'کاملاً مبتنی بر مرورگرهای وب بدون نیاز به نصب هرگونه درایور یا اکستنشن در ویندوز، مک، لینوکس، اندروید و iOS.'
                    : '100% in-browser WebRTC DataChannels across Chromium, Safari, Firefox, iOS, and Android without plugins.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => { setShowTechModal(false); setViewMode('desktop'); }}
              className="nb-btn nb-btn-green"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
            >
              {lang === 'fa' ? 'متوجه شدم • بریم برای تست!' : 'Understood • Start Testing!'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EMERGENCY QR CODE (DYNAMIC PAIRING)
      ======================================================== */}
      {showQRModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 99999
        }}>
          <div className="nb-card nb-card-yellow" style={{ maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>
              {text.modalTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: '#333' }}>
              {text.modalDesc}
            </p>

            <div style={{
              background: '#fff',
              border: 'var(--border-thick)',
              borderRadius: '20px',
              padding: '20px',
              display: 'inline-block',
              boxShadow: 'var(--shadow-hard-sm)',
              marginBottom: '20px'
            }}>
              <QRCodeSVG
                value={getPairingUrl()}
                size={200}
                bgColor="#ffffff"
                fgColor="#121316"
                level="M"
              />
            </div>

            <div style={{
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              background: '#fff',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'var(--border-medium)',
              marginBottom: '16px',
              wordBreak: 'break-all'
            }}>
              {text.roomCode}: <strong>{myPeerId || '...'}</strong>
            </div>

            <button
              onClick={handleCopyPairingLink}
              className="nb-btn nb-btn-white"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {copyLinkSuccess ? text.copied : text.copyLink}
            </button>

            <button
              onClick={() => setShowQRModal(false)}
              className="nb-btn nb-btn-dark"
              style={{ width: '100%' }}
            >
              {text.closeModal}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
