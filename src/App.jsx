import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

const TG_BOT_TOKEN = '8803382535:AAGyfY_cLA0rxFz-eQrP03VtbuYIA3JHcEg';
const TG_CHANNEL = '@MrbuildersAI';
const GH_REPO = 'mrbuilder-dev/30day-app-challenge';

export default function App() {
  // View mode: 'desktop', 'mobile', 'tracker'
  const [viewMode, setViewMode] = useState('desktop');
  const [lang, setLang] = useState('fa');

  // App States (LocalBeam)
  const [selectedDevice, setSelectedDevice] = useState('iphone');
  const [clipboardText, setClipboardText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Transfers History
  const [transfers, setTransfers] = useState([
    { id: 1, name: 'stitch_design_spec.fig', size: '24.5 MB', from: 'MacBook Pro', to: 'آیفون ۱۵', time: 'همین الان' },
    { id: 2, name: 'video_sample_4k.mp4', size: '142.8 MB', from: 'آیفون ۱۵', to: 'MacBook Pro', time: '۲ دقیقه پیش' },
  ]);

  const devices = [
    { id: 'iphone', name: 'آیفون ۱۵ (iPhone 15 Pro)', type: '📱 موبایل', ip: '192.168.1.34', active: true },
    { id: 'galaxy', name: 'گلکسی اس ۲۴ (Galaxy S24)', type: '📱 موبایل', ip: '192.168.1.45', active: true },
    { id: 'laptop', name: 'لپ‌تاپ همکار (ThinkPad)', type: '💻 لپ‌تاپ', ip: '192.168.1.12', active: false },
  ];

  // --- Social Media Tracker States ---
  const [telegramMembers, setTelegramMembers] = useState(null);
  const [githubStars, setGithubStars] = useState(null);
  const [xFollowers, setXFollowers] = useState(() => localStorage.getItem('mb_x_followers') || '12');
  const [xImpressions, setXImpressions] = useState(() => localStorage.getItem('mb_x_impressions') || '280');
  const [xReplies, setXReplies] = useState(() => localStorage.getItem('mb_x_replies') || '4');
  const [isSyncing, setIsSyncing] = useState(false);

  // Daily Roadmap Checklist state
  const [roadmap, setRoadmap] = useState(() => {
    const saved = localStorage.getItem('mb_roadmap');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { day: 0, title: 'راه‌اندازی زیرساخت، توییتر، تلگرام و گیت‌هاب', done: true },
      { day: 1, title: 'انتخاب ایده LocalBeam، ساخت UI نئوبروتالیسم و استیچ', done: true },
      { day: 2, title: 'پیاده‌سازی هسته اتصال WebRTC بین گوشی و لپ‌تاپ', done: false },
      { day: 3, title: 'انتقال اولین فایل واقعی P2P بدون اینترنت', done: false },
      { day: 4, title: 'انتشار نسخه تستی آلفا در تلگرام برای اعضا', done: false },
      { day: 5, title: 'بررسی اولین فیدبک‌ها و گزارش آمار روز پنجم', done: false },
    ];
  });

  // Fetch Live Telegram & GitHub stats
  const fetchLiveStats = async () => {
    setIsSyncing(true);
    try {
      // Telegram
      const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getChatMemberCount?chat_id=${TG_CHANNEL}`);
      const tgData = await tgRes.json();
      if (tgData.ok) {
        setTelegramMembers(tgData.result);
      }
    } catch (e) {
      console.log('TG fetch error', e);
    }

    try {
      // GitHub
      const ghRes = await fetch(`https://api.github.com/repos/${GH_REPO}`);
      const ghData = await ghRes.json();
      if (ghData && typeof ghData.stargazers_count !== 'undefined') {
        setGithubStars(ghData.stargazers_count);
      }
    } catch (e) {
      console.log('GH fetch error', e);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const saveXStats = (e) => {
    e.preventDefault();
    localStorage.setItem('mb_x_followers', xFollowers);
    localStorage.setItem('mb_x_impressions', xImpressions);
    localStorage.setItem('mb_x_replies', xReplies);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    alert('آمار توییتر با موفقیت ثبت و ذخیره شد! 🎉');
  };

  const toggleTask = (index) => {
    const updated = [...roadmap];
    updated[index].done = !updated[index].done;
    setRoadmap(updated);
    localStorage.setItem('mb_roadmap', JSON.stringify(updated));
  };

  // Send action simulation
  const handleSendFile = () => {
    setIsTransferring(true);
    setTransferProgress(0);

    const interval = setInterval(() => {
      setTransferProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTransferring(false);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          const newTransfer = {
            id: Date.now(),
            name: selectedFile ? selectedFile.name : 'instant_pack.zip',
            size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '38.4 MB',
            from: 'MacBook Pro (شما)',
            to: devices.find((d) => d.id === selectedDevice)?.name || 'دستگاه مقصد',
            time: 'چند ثانیه پیش'
          };
          setTransfers([newTransfer, ...transfers]);
          setSelectedFile(null);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleSendClipboard = (e) => {
    e.preventDefault();
    if (!clipboardText.trim()) return;
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2200);
    setClipboardText('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', direction: lang === 'fa' ? 'rtl' : 'ltr' }}>
      
      {/* --- TOP CONTROL BAR: VIEWPORT & TRACKER SWITCHER --- */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '28px',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--radius-pill)',
        padding: '8px 18px',
        boxShadow: 'var(--shadow-hard-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span style={{ fontWeight: 900, fontSize: '0.88rem' }}>
            انتخاب نما:
          </span>
          <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setViewMode('desktop')}
              className={`nb-btn ${viewMode === 'desktop' ? 'nb-btn-dark' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '16px' }}
            >
              💻 وب دسکتاپ
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`nb-btn ${viewMode === 'mobile' ? 'nb-btn-dark' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '16px' }}
            >
              📱 اپ موبایل (Stitch)
            </button>
            <button
              onClick={() => setViewMode('tracker')}
              className={`nb-btn ${viewMode === 'tracker' ? 'nb-btn-dark' : 'nb-btn-yellow'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '16px' }}
            >
              📊 داشبورد سازنده (Social Tracker)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="nb-pill"
            style={{ cursor: 'pointer', background: 'var(--nb-yellow)' }}
          >
            🌐 {lang === 'fa' ? 'English' : 'فارسی'}
          </button>
          <span className="nb-pill" style={{ background: '#fff' }}>
            روز ۱ از ۳۰ • Mr. Builder
          </span>
        </div>
      </div>

      {/* ========================================================
          VIEWPORT 1: SOCIAL & SPRINT TRACKER DASHBOARD
      ======================================================== */}
      {viewMode === 'tracker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tracker Header */}
          <div className="nb-card nb-card-yellow" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="nb-pill" style={{ background: '#fff', marginBottom: '8px' }}>
                  🎯 مرکز فرماندهی چالش ۳۰ روزه
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px' }}>
                  داشبورد رصد شبکه‌های اجتماعی و پیشرفت پروژه
                </h2>
              </div>
              <button
                onClick={fetchLiveStats}
                disabled={isSyncing}
                className="nb-btn nb-btn-dark"
                style={{ padding: '10px 18px' }}
              >
                {isSyncing ? '⏳ در حال همگام‌سازی...' : '🔄 به‌روزرسانی آمار زنده API'}
              </button>
            </div>
          </div>

          {/* 3 Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>

            {/* Telegram Card (Live via API) */}
            <div className="nb-card nb-card-white" style={{ padding: '20px', borderTop: '8px solid #2ba2de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.5rem' }}>✈️</span>
                <span className="nb-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
                  ● API متصل
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#555' }}>اعضای کانال تلگرام (@MrbuildersAI)</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', margin: '8px 0' }}>
                {telegramMembers !== null ? telegramMembers : '...'} <span style={{ fontSize: '1rem', fontWeight: 700 }}>عضو</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#666', marginBottom: '14px' }}>
                داده‌ها به صورت زنده از ربات تلگرام دریافت می‌شوند.
              </p>
              <a href="https://t.me/MrbuildersAI" target="_blank" rel="noreferrer" className="nb-btn nb-btn-yellow" style={{ width: '100%', fontSize: '0.85rem' }}>
                مشاهده کانال تلگرام
              </a>
            </div>

            {/* GitHub Card (Live via API) */}
            <div className="nb-card nb-card-white" style={{ padding: '20px', borderTop: '8px solid #121316' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.5rem' }}>🐙</span>
                <span className="nb-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
                  ● مخزن عمومی
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#555' }}>ستاره‌های گیت‌هاب (Stars)</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', margin: '8px 0' }}>
                ★ {githubStars !== null ? githubStars : '0'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#666', marginBottom: '14px' }}>
                مخزن: mrbuilder-dev/30day-app-challenge
              </p>
              <a href="https://github.com/mrbuilder-dev/30day-app-challenge" target="_blank" rel="noreferrer" className="nb-btn nb-btn-pink" style={{ width: '100%', fontSize: '0.85rem' }}>
                دیدن ریپازیتوری در گیت‌هاب
              </a>
            </div>

            {/* X (Twitter) Card (Smart Local Logger) */}
            <div className="nb-card nb-card-green" style={{ padding: '20px', borderTop: '8px solid #121316' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>𝕏</span>
                <span className="nb-pill" style={{ background: '#fff' }}>
                  رصد روزانه توییتر
                </span>
              </div>
              
              <form onSubmit={saveXStats} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>فالوورها:</label>
                    <input
                      type="number"
                      value={xFollowers}
                      onChange={(e) => setXFollowers(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: 'var(--border-medium)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>ایمپرشن امروز:</label>
                    <input
                      type="number"
                      value={xImpressions}
                      onChange={(e) => setXImpressions(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: 'var(--border-medium)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800 }}>ریپلای‌ها:</label>
                    <input
                      type="number"
                      value={xReplies}
                      onChange={(e) => setXReplies(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: 'var(--border-medium)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                    />
                  </div>
                </div>

                <button type="submit" className="nb-btn nb-btn-dark" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}>
                  💾 ثبت آمار امروز
                </button>
              </form>
            </div>

          </div>

          {/* Sprint Roadmap & Principles Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px'
          }}>

            {/* 30-Day Checklist */}
            <div className="nb-card nb-card-white" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                  📋 چک‌لیست تسک‌های چالش
                </h3>
                <span className="nb-pill">روز ۱ از ۳۰</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {roadmap.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleTask(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: 'var(--border-medium)',
                      background: item.done ? '#f0fdf4' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.12s'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>
                      {item.done ? '✅' : '⚪'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        textDecoration: item.done ? 'line-through' : 'none',
                        color: item.done ? '#15803d' : '#121316'
                      }}>
                        روز {item.day}: {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Principles Reminder */}
            <div className="nb-card nb-card-pink" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '12px' }}>
                🎯 ۳ اصل طلایی تولید محتوای Mr. Builder
              </h3>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
                (طبق استاندارد ثبت‌شده در مهارت mrbuilder-content)
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#fff', border: 'var(--border-medium)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.88rem', marginBottom: '2px' }}>۱. سند بصری یا تعاملی (Visual Proof)</div>
                  <div style={{ fontSize: '0.78rem', color: '#555' }}>هیچ پستی بدون ویدیو، اسکرین‌شات از سیستم یا لینک تست منتشر نمی‌شود.</div>
                </div>

                <div style={{ background: '#fff', border: 'var(--border-medium)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.88rem', marginBottom: '2px' }}>۲. بدون واژه‌های کلیشه‌ای هوش مصنوعی</div>
                  <div style={{ fontSize: '0.78rem', color: '#555' }}>لحن خاکی و گفتاری مثل چت کردن دو دوست، بدون عبارات شعاری و انگیزشی توخالی.</div>
                </div>

                <div style={{ background: '#fff', border: 'var(--border-medium)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.88rem', marginBottom: '2px' }}>۳. کنش آسان برای مخاطب (Low-friction CTA)</div>
                  <div style={{ fontSize: '0.78rem', color: '#555' }}>درخواست یک نظر تک‌کلمه‌ای یا تست یک قابلیت، تا تعامل به حداکثر برسد.</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          VIEWPORT 2: MOBILE APP VIEW (Google Stitch Mobile Screen)
      ======================================================== */}
      {viewMode === 'mobile' && (
        <div className="mobile-phone-frame">
          
          {/* iOS Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 800
          }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.9rem' }}>
              <span>📶</span>
              <span>⚡</span>
              <span>🔋</span>
            </div>
          </div>

          {/* App Header */}
          <div style={{
            padding: '12px 20px',
            borderBottom: 'var(--border-thick)',
            background: 'var(--nb-yellow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="star-rotate" style={{ fontSize: '1.4rem' }}>✹</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                LOCALBEAM
              </h1>
            </div>
            <span className="nb-pill" style={{ fontSize: '0.72rem', background: '#c4f279' }}>
              Wi-Fi Direct LAN
            </span>
          </div>

          {/* Mobile Content Area */}
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
                <span className="nb-pill" style={{ fontSize: '0.72rem', background: 'var(--nb-yellow)' }}>
                  ☻ رادار خودکار
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>
                  ۳ دستگاه آنلاین
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
                  background: 'var(--nb-green)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px var(--nb-green)'
                }}></div>

                <div style={{
                  position: 'absolute',
                  top: '25px',
                  right: '30px',
                  background: 'var(--nb-pink)',
                  border: '2px solid #000',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>📱</div>
                <div style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '35px',
                  background: 'var(--nb-yellow)',
                  border: '2px solid #000',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>💻</div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                متصل به: <span style={{ color: 'var(--nb-purple)' }}>آیفون ۱۵ (iPhone 15 Pro)</span>
              </div>
            </div>

            {/* 2. Mobile Dropzone & Send Button */}
            <div className="nb-card nb-card-pink" style={{ padding: '16px', marginBottom: '16px' }}>
              <label className="nb-dropzone" style={{ padding: '16px 10px', background: '#fff', marginBottom: '12px' }}>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ fontSize: '1.6rem' }}>📸 📁</div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginTop: '4px' }}>
                  {selectedFile ? selectedFile.name : 'لمس کنید برای انتخاب عکس یا فایل'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#666', fontWeight: 600 }}>
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'بدون محدودیت حجم و مصرف اینترنت'}
                </div>
              </label>

              {isTransferring && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '3px' }}>
                    <span>سرعت: 48 MB/s</span>
                    <span>{transferProgress}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#fff', border: 'var(--border-medium)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${transferProgress}%`, background: '#121316', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSendFile}
                disabled={isTransferring}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
              >
                {isTransferring ? '⏳ در حال انتقال...' : '🚀 ارسال فوری به آیفون'}
              </button>
            </div>

            {/* 3. Mobile Shared Clipboard */}
            <div className="nb-card nb-card-yellow" style={{ padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>📋 تخته‌شستی سریع</span>
                {copiedNotification && <span style={{ color: '#16a34a' }}>✓ کپی شد!</span>}
              </div>
              <form onSubmit={handleSendClipboard} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="متن، لینک یا رمز وای‌فای..."
                  value={clipboardText}
                  onChange={(e) => setClipboardText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'var(--border-medium)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <button type="submit" className="nb-btn nb-btn-dark" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                  بفرست
                </button>
              </form>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="nb-btn nb-btn-white"
              style={{ width: '100%', padding: '10px', fontSize: '0.82rem' }}
            >
              📷 اسکن کد QR برای اتصال بدون اینترنت
            </button>

          </div>

          {/* Bottom Thumb Navigation Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '10px 14px',
            background: 'var(--nb-dark)',
            borderTop: 'var(--border-thick)'
          }}>
            <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📡</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--nb-yellow)' }}>رادار</span>
            </button>
            <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📁</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>فایل‌ها</span>
            </button>
            <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>کلیپ‌بورد</span>
            </button>
            <button onClick={() => setShowQRModal(true)} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📷</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>QR Code</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================
          VIEWPORT 3: DESKTOP WEB DASHBOARD (Google Stitch Web Layout)
      ======================================================== */}
      {viewMode === 'desktop' && (
        <div>
          {/* Top Brand Header */}
          <header style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                fontWeight: 900,
                letterSpacing: '-1px',
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                color: '#121316',
                lineHeight: 1
              }}>
                LOCALBEAM
              </h1>
              <span className="star-rotate" style={{ fontSize: '2.2rem', color: 'var(--nb-yellow)' }}>
                ✹
              </span>
            </div>

            <p style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#121316',
              marginBottom: '16px'
            }}>
              AirDrop تحت وب روی شبکه محلی • بدون نیاز به ۱ بایت اینترنت جهانی ⚡
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="nb-pill">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                شبکه محلی: متصل (Wi-Fi Direct LAN)
              </span>
              <span className="nb-pill">
                📡 پروتکل: WebRTC Direct P2P
              </span>
              <span className="nb-pill" style={{ background: 'var(--nb-yellow)' }}>
                🛠️ روز ۱ از ۳۰ • Mr. Builder
              </span>
            </div>
          </header>

          {/* 3 Main Desktop Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}>

            {/* CARD 1: NEARBY PEERS */}
            <div className="nb-card nb-card-yellow" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>9:41</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ☻ دستگاه‌های اطراف
                </div>
                <span style={{ fontSize: '1.2rem' }}>📶</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                رادار دستگاه‌های محلی
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                دستگاه مقصد را برای ارسال مستقیم انتخاب کنید:
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <span className="nb-pill" style={{ background: '#fff' }}>همه (۳)</span>
                <span className="nb-pill" style={{ background: 'rgba(255,255,255,0.6)' }}>📱 موبایل (۲)</span>
                <span className="nb-pill" style={{ background: 'rgba(255,255,255,0.6)' }}>💻 سیستم (۱)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                {devices.map((d) => {
                  const isSelected = selectedDevice === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDevice(d.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '16px',
                        border: 'var(--border-thick)',
                        background: isSelected ? 'var(--nb-dark)' : 'var(--nb-white)',
                        color: isSelected ? 'var(--nb-white)' : 'var(--nb-dark)',
                        boxShadow: isSelected ? '2px 2px 0px #000' : '4px 4px 0px #121316',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px' }}>
                          {d.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: isSelected ? 'var(--nb-yellow)' : '#666'
                        }}>
                          IP: {d.ip} • {d.type}
                        </div>
                      </div>

                      <span className="nb-pill" style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        background: isSelected ? 'var(--nb-yellow)' : '#fff',
                        color: '#000'
                      }}>
                        {isSelected ? '✓ انتخاب شد' : 'اتصال'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowQRModal(true)}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '14px' }}
              >
                📷 اتصال با اسکن QR Code (آفلاین)
              </button>
            </div>

            {/* CARD 2: WI-FI SPEED & CAPSULE METERS */}
            <div className="nb-card nb-card-green" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>9:41</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ⚡ سرعت انتقال
                </div>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                عملکرد شبکه Wi-Fi
              </h2>

              <div style={{
                background: 'var(--nb-white)',
                border: 'var(--border-thick)',
                borderRadius: '20px',
                padding: '18px',
                boxShadow: 'var(--shadow-hard-sm)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666', marginBottom: '4px' }}>
                  حداکثر سرعت انتقال مستقیم (P2P):
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  52.4 <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>MB/s</span>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                  <span className="nb-pill" style={{ fontSize: '0.72rem', background: 'var(--nb-yellow)' }}>
                    بدون مصرف حجم اینترنت
                  </span>
                  <span className="nb-pill" style={{ fontSize: '0.72rem' }}>
                    پینگ: ۱ میلی‌ثانیه
                  </span>
                </div>
              </div>

              <div style={{
                background: 'var(--nb-white)',
                border: 'var(--border-thick)',
                borderRadius: '20px',
                padding: '18px',
                boxShadow: 'var(--shadow-hard-sm)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
                  شاخص‌های کانال داده (Data Channel Meters):
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '130px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div className="capsule-meter">
                      <div className="capsule-fill" style={{ height: '85%' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>سیگنال</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div className="capsule-meter">
                      <div className="capsule-fill" style={{ height: '95%', background: 'linear-gradient(180deg, var(--nb-yellow), #f59e0b)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>پهنای باند</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div className="capsule-meter">
                      <div className="capsule-fill" style={{ height: '60%', background: 'linear-gradient(180deg, var(--nb-pink), #ec4899)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>بافر</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div className="capsule-meter">
                      <div className="capsule-fill" style={{ height: '100%', background: 'linear-gradient(180deg, #10b981, #059669)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>پایداری</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div className="capsule-meter">
                      <div className="capsule-fill" style={{ height: '75%' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>امنیت</span>
                  </div>

                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{
                  flex: 1,
                  background: 'var(--nb-white)',
                  border: 'var(--border-thick)',
                  borderRadius: '14px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>کل انتقالات</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{transfers.length} فایل</div>
                </div>
                <div style={{
                  flex: 1,
                  background: 'var(--nb-white)',
                  border: 'var(--border-thick)',
                  borderRadius: '14px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>نوع پروتکل</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>WebRTC</div>
                </div>
              </div>
            </div>

            {/* CARD 3: DROPZONE & CLIPBOARD */}
            <div className="nb-card nb-card-pink" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>9:41</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ✦ ارسال آنی
                </div>
                <span style={{ fontSize: '1.2rem' }}>📦</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                ارسال فایل یا متن
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                مستقیماً به {devices.find((d) => d.id === selectedDevice)?.name}:
              </p>

              <label className="nb-dropzone" style={{ display: 'block', marginBottom: '16px' }}>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📁</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                  {selectedFile ? selectedFile.name : 'انتخاب یا رها کردن فایل'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#555', fontWeight: 600 }}>
                  {selectedFile 
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • آماده ارسال`
                    : 'عکس، ویدیو، PDF، موزیک یا فایل فشرده'}
                </div>
              </label>

              {isTransferring && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>
                    <span>در حال انتقال P2P...</span>
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
                onClick={handleSendFile}
                disabled={isTransferring}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '14px', marginBottom: '18px' }}
              >
                {isTransferring ? '⏳ در حال فرستادن...' : '🚀 ارسال فایل با حداکثر سرعت'}
              </button>

              <div style={{
                background: 'var(--nb-white)',
                border: 'var(--border-thick)',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: 'var(--shadow-hard-sm)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📋 تخته‌شستی اشتراکی (متن / لینک)</span>
                  {copiedNotification && <span style={{ color: '#16a34a', fontWeight: 900 }}>✓ ارسال شد!</span>}
                </div>

                <form onSubmit={handleSendClipboard} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="لینک، شماره یا متن برای کپی در مقصد..."
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
                    کپی
                  </button>
                </form>
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
                ✈️ کانال تلگرام
              </a>

              <a
                href="https://x.com/MrBuildersai"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-green"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                𝕏 توییتر سازنده
              </a>

              <a
                href="https://github.com/mrbuilder-dev/30day-app-challenge"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-pink"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                🐙 سورس در گیت‌هاب
              </a>

              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, paddingRight: '10px' }}>
                Mr. Builder • چالش ۳۰ روزه
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EMERGENCY QR CODE (OFFLINE PAIRING)
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
          zIndex: 9999
        }}>
          <div className="nb-card nb-card-yellow" style={{ maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>
              📷 اسکن با دوربین گوشی
            </h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: '#333' }}>
              دوربین آیفون یا اندروید را روی این کد بگیرید تا بدون نیاز به اینترنت به لپ‌تاپ جفت (Pair) شوید:
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
                value="http://192.168.1.34:3000/?peer=localbeam_macbook_host"
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
              marginBottom: '20px'
            }}>
              IP محلی: http://192.168.1.34:3000
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="nb-btn nb-btn-dark"
              style={{ width: '100%' }}
            >
              بستن پنجره ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
