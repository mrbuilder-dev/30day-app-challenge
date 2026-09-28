# 🔔 تکه‌کد آماده: صدای دوتُن زنگوله و ویبره حسی با Web Audio API

بدون نیاز به لود کردن هیچ فایل صوتی MP3 (سبک و صفر بایت بار دانلودی). صدای زنگوله ملایم دوتُن (شبیه ایردراپ اپل):

```javascript
export function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, time, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.18, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.45);        // D5 note
    playTone(880.00, now + 0.12, 0.65); // A5 note

    // ویبره گوشی در صورت پشتیبانی مرورگر
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 80]);
    }
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}
```
