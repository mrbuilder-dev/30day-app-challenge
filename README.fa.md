# 🚀 چالش ۳۰ روزه ساخت اپلیکیشن: سیستم‌عامل سازنده مستقل (Mr. Builder)

> یک آزمایش مستقل برای طراحی، توسعه و انتشار ۳۰ وب‌اپلیکیشن کاربردی در ۳۰ روز، با مستندسازی کاملاً شفاف در فضای عمومی (#BuildInPublic).

[![نسخه لایو محصول ۱](https://img.shields.io/badge/نسخه_لایو-LocalBeam_روز_۱-brightgreen.svg)](https://mrbuilder-dev.github.io/30day-app-challenge/)
[![توییتر](https://img.shields.io/badge/𝕏_توییتر-MrBuildersai-blue.svg)](https://x.com/MrBuildersai)
[![کانال تلگرام](https://img.shields.io/badge/کانال_تلگرام-MrbuildersAI-2BA2DE.svg)](https://t.me/MrbuildersAI)

---

## 🏛️ معماری ۵ ستون پروژه (The 5 Pillars)

این مخزن به عنوان یک استودیوی ساخت محصول تک‌نفره با هوش مصنوعی و بر پایه ۵ بال عملیاتی سازمان‌دهی شده است:

```
├── build/          ─── [ستون ۱: کد و محصول]
│   └── day01-localbeam/    -> انتقال مستقیم فایل P2P بدون اینترنت بین آیفون، مک و ویندوز
├── growth/         ─── [ستون ۲: بازاریابی و ویروسی‌شدن]
│   ├── day01-localbeam/    -> رشته‌توییت، پست تلگرام و سناریوی ویدیوی ۱۰ ثانیه‌ای
│   └── brand-assets/       -> آواتارهای اختصاصی با کیفیت بالا و بنرهای هماهنگ
├── community/      ─── [ستون ۳: تعامل و هم‌بنیان‌گذاری]
│   ├── user-feedback.md    -> ثبت باگ‌ها و درخواست‌های ارسالی فالوورها
│   └── ideas-inbox.md      -> صندوق ایده‌های پیشنهادی مخاطبان برای روزهای بعد
├── learning/       ─── [ستون ۴: موتور یادگیری و کالبدشکافی]
│   ├── day01-post-mortem.md -> تحلیل ریشه‌ای علت کم بودن ایمپرشن روز اول و برنامه روز دوم
│   └── metrics-tracker.md   -> جدول رصد روزانه ایمپرشن، کلیک، نصب و فالوورها
└── vault/          ─── [ستون ۵: گنجینه تجارب و قطعات آماده]
    ├── playbook/           -> مانیفست استودیو و استانداردهای Solo Builder OS
    └── tech-snippets/      -> کدهای آماده WebRTC، صدای دوتُن وب و PWA برای استفاده مجدد
```

---

## ⚡ اجرای محلی و تست

```bash
# اجرای نسخه روز اول (LocalBeam):
npm run dev

# یا مستقیماً از داخل پوشه محصول:
cd build/day01-localbeam
npm run dev

# کامپایل نسخه نهایی:
npm run build

# استقرار خودکار روی GitHub Pages:
npm run deploy
```

---

## 📅 جدول محصولات چالش ۳۰ روزه

| روز | نام محصول | شرح عملکرد | تکنولوژی‌ها | وضعیت | لینک اجرا |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **۰۱** | **LocalBeam** | انتقال مستقیم فایل در شبکه محلی بدون اینترنت | React, WebRTC, PWA, PeerJS | 🟢 لایو | [اجرای آنلاین](https://mrbuilder-dev.github.io/30day-app-challenge/) |
| **۰۲** | *به‌زودی* | - | - | ⏳ فردا | - |

---

## 🔗 راه‌های ارتباطی

- **𝕏 (توییتر):** [@MrBuildersai](https://x.com/MrBuildersai)
- **کانال تلگرام:** [t.me/MrbuildersAI](https://t.me/MrbuildersAI)
