# 📦 تکه‌کد آماده: انتقال نقطه به نقطه WebRTC بدون فریز شدن در iOS

این ماژول برای حل مشکل قطعی و فریز شدن بافر WebRTC DataChannel (مخصوصاً در iOS Safari و فایل‌های سنگین) طراحی شده است.

---

## ۱. تنظیمات حیاتی DataChannel
```javascript
const peer = new Peer({
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
});
```

## ۲. قانون چانک‌های ۳۲ کیلوبایتی و بکت‌پرسر سخت‌افزاری
ارسال یکپارچه بافر باعث پر شدن صف SCTP سافاری می‌شود. اندازه چانک باید دقیقاً ۳۲ کیلوبایت باشد و قبل از ارسال چانک بعدی، منتظر خالی شدن بافر بماند:

```javascript
const CHUNK_SIZE = 32 * 1024; // 32KB chunks
const MAX_BUFFER = 64 * 1024; // 64KB threshold

async function sendDataWithBackpressure(dataChannel, arrayBuffer) {
  let offset = 0;
  while (offset < arrayBuffer.byteLength) {
    if (dataChannel.bufferedAmount > MAX_BUFFER) {
      await new Promise(resolve => {
        const check = () => {
          if (dataChannel.bufferedAmount <= MAX_BUFFER / 2) {
            resolve();
          } else {
            setTimeout(check, 10);
          }
        };
        check();
      });
    }
    const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
    dataChannel.send(chunk);
    offset += CHUNK_SIZE;
  }
}
```
