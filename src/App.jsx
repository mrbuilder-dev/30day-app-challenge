import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { P2PManager, getDeviceInfo } from './services/webrtc';

const TG_BOT_TOKEN = '8803382535:AAGyfY_cLA0rxFz-eQrP03VtbuYIA3JHcEg';
const TG_CHANNEL = '@MrbuildersAI';
const GH_REPO = 'mrbuilder-dev/30day-app-challenge';

export default function App() {
  // View mode: 'desktop', 'mobile', 'tracker'
  const [viewMode, setViewMode] = useState('desktop');
  const [lang, setLang] = useState('fa');

  // Local Device Info
  const [localDevice] = useState(() => getDeviceInfo());

  // WebRTC / P2P State
  const p2pManagerRef = useRef(null);
  const [myPeerId, setMyPeerId] = useState('');
  const [p2pStatus, setP2pStatus] = useState('initializing'); // 'initializing' | 'waiting' | 'connecting' | 'connected' | 'error'
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [targetPeerInput, setTargetPeerInput] = useState('');
  const [toastNotification, setToastNotification] = useState(null);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Transfer States
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState('0.0');
  const [transferFileName, setTransferFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Clipboard States
  const [clipboardText, setClipboardText] = useState('');
  const [incomingClipboard, setIncomingClipboard] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Transfers History
  const [transfers, setTransfers] = useState([
    {
      id: 'sample-1',
      name: 'stitch_design_spec.fig',
      size: '24.5 MB',
      from: 'سیستم محلی',
      to: 'آیفون ۱۵',
      time: 'پیش‌نمایش',
      isDownloadable: false
    }
  ]);

  // --- Social Media Tracker States ---
  const [telegramMembers, setTelegramMembers] = useState(null);
  const [githubStars, setGithubStars] = useState(null);
  const [xFollowers, setXFollowers] = useState(() => localStorage.getItem('mb_x_followers') || '14');
  const [xImpressions, setXImpressions] = useState(() => localStorage.getItem('mb_x_impressions') || '420');
  const [xReplies, setXReplies] = useState(() => localStorage.getItem('mb_x_replies') || '8');
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
      { day: 2, title: 'پیاده‌سازی هسته اتصال WebRTC بین گوشی و لپ‌تاپ', done: true },
      { day: 3, title: 'انتقال اولین فایل واقعی P2P بدون اینترنت', done: false },
      { day: 4, title: 'انتشار نسخه تستی آلفا در تلگرام برای اعضا', done: false },
      { day: 5, title: 'بررسی اولین فیدبک‌ها و گزارش آمار روز پنجم', done: false },
    ];
  });

  // --- Initialize P2P Engine ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectTarget = params.get('connect') || params.get('peer');

    const manager = new P2PManager({
      onReady: (id) => {
        setMyPeerId(id);
        setP2pStatus('waiting');

        // Auto-connect if URL has a target peer
        if (connectTarget && connectTarget !== id) {
          setP2pStatus('connecting');
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
        showToast('🟢 اتصال مستقیم P2P برقرار شد!');
      },
      onRemoteDeviceDetected: (info) => {
        setConnectedDevice(info);
      },
      onDisconnected: () => {
        setP2pStatus('waiting');
        setConnectedDevice(null);
        showToast('⚠️ ارتباط با دستگاه مقابل قطع شد.');
      },
      onTransferStart: ({ mode, fileName }) => {
        setIsTransferring(true);
        setTransferProgress(0);
        setTransferFileName(fileName);
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
          from: connectedDevice ? connectedDevice.name : 'دستگاه مقابل',
          to: `${localDevice.name} (شما)`,
          time: 'همین الان',
          downloadUrl: fileObj.url,
          isDownloadable: true
        };
        setTransfers((prev) => [receivedEntry, ...prev]);
        setIsTransferring(false);
        setTransferProgress(100);
        showToast(`📁 فایل "${fileObj.name}" با موفقیت دریافت شد!`);
      },
      onClipboardReceived: (text, sender) => {
        setIncomingClipboard(text);
        showToast(`📋 متن جدید از ${sender || 'دستگاه متصل'} دریافت شد!`);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
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
  }, []);

  const showToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Quick Pairing Link
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

  // Manual Connect
  const handleConnectManual = (e) => {
    e?.preventDefault();
    if (!targetPeerInput.trim() || !p2pManagerRef.current) return;
    p2pManagerRef.current.connectToPeer(targetPeerInput.trim());
    setTargetPeerInput('');
  };

  // Real File Transfer
  const handleSendFileReal = async () => {
    if (!selectedFile) {
      alert('لطفاً ابتدا یک فایل را انتخاب یا رها کنید.');
      return;
    }
    if (p2pStatus !== 'connected' || !p2pManagerRef.current) {
      alert('ابتدا دستگاه دوم را با اسکن QR کد یا ارسال لینک متصل کنید!');
      setShowQRModal(true);
      return;
    }

    try {
      setIsTransferring(true);
      setTransferProgress(0);
      setTransferFileName(selectedFile.name);

      await p2pManagerRef.current.sendFile(selectedFile);

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      const newEntry = {
        id: Date.now(),
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        from: `${localDevice.name} (شما)`,
        to: connectedDevice ? connectedDevice.name : 'دستگاه مقصد',
        time: 'همین الان',
        isDownloadable: false
      };
      setTransfers((prev) => [newEntry, ...prev]);
      setSelectedFile(null);
      setIsTransferring(false);
      showToast('🚀 فایل با موفقیت به دستگاه مقصد رسید!');
    } catch (err) {
      console.error('Send error:', err);
      alert('خطا در ارسال فایل: ' + (err.message || 'مشکل در برقراری کانال'));
      setIsTransferring(false);
    }
  };

  // Real Clipboard Send
  const handleSendClipboardReal = (e) => {
    e.preventDefault();
    if (!clipboardText.trim()) return;
    if (p2pStatus !== 'connected' || !p2pManagerRef.current) {
      alert('ابتدا دستگاه دوم را متصل کنید!');
      setShowQRModal(true);
      return;
    }

    try {
      p2pManagerRef.current.sendClipboard(clipboardText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2200);
      setClipboardText('');
      showToast('📋 متن به دستگاه مقصد فرستاده شد.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Fetch Live Telegram & GitHub stats
  const fetchLiveStats = async () => {
    setIsSyncing(true);
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getChatMemberCount?chat_id=${TG_CHANNEL}`);
      const tgData = await tgRes.json();
      if (tgData.ok) {
        setTelegramMembers(tgData.result);
      }
    } catch (e) {
      console.log('TG fetch error', e);
    }

    try {
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
    showToast('آمار توییتر با موفقیت ثبت شد! 🎉');
  };

  const toggleTask = (index) => {
    const updated = [...roadmap];
    updated[index].done = !updated[index].done;
    setRoadmap(updated);
    localStorage.setItem('mb_roadmap', JSON.stringify(updated));
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
          {/* P2P Live Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
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
              ? `متصل به: ${connectedDevice ? connectedDevice.name : 'دستگاه مقصد'}`
              : p2pStatus === 'connecting' 
                ? 'در حال برقراری P2P...' 
                : `آماده اتصال (${myPeerId || '...'})`}
          </div>

          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="nb-pill"
            style={{ cursor: 'pointer', background: 'var(--nb-yellow)' }}
          >
            🌐 {lang === 'fa' ? 'English' : 'فارسی'}
          </button>
        </div>
      </div>

      {/* ========================================================
          VIEWPORT 1: SOCIAL & SPRINT TRACKER DASHBOARD
      ======================================================== */}
      {viewMode === 'tracker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
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
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '6px' }}>
                کانال تلگرام (@MrbuildersAI)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                {telegramMembers !== null ? telegramMembers : '...'} <span style={{ fontSize: '1rem', fontWeight: 700 }}>عضو</span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#666' }}>
                ربات تلگرام آمار زنده اعضا را مستقیماً فراخوانی می‌کند.
              </div>
            </div>

            {/* GitHub Card (Live via API) */}
            <div className="nb-card nb-card-white" style={{ padding: '20px', borderTop: '8px solid #121316' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.5rem' }}>🐙</span>
                <span className="nb-pill" style={{ background: '#dcfce7', color: '#15803d' }}>
                  ● API متصل
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '6px' }}>
                ستاره‌های گیت‌هاب (Repo Stars)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                {githubStars !== null ? githubStars : '...'} <span style={{ fontSize: '1rem', fontWeight: 700 }}>★</span>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#666' }}>
                مخزن: mrbuilder-dev/30day-app-challenge
              </div>
            </div>

            {/* Twitter Card (Manual Quick Logger) */}
            <div className="nb-card nb-card-white" style={{ padding: '20px', borderTop: '8px solid #000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.5rem' }}>𝕏</span>
                <span className="nb-pill" style={{ background: '#fef3c7', color: '#b45309' }}>
                  ثبت سریع
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '6px' }}>
                اکانت توییتر (@MrBuildersai)
              </div>
              
              <form onSubmit={saveXStats} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>فالوورها:</span>
                  <input
                    type="number"
                    value={xFollowers}
                    onChange={(e) => setXFollowers(e.target.value)}
                    style={{ width: '80px', padding: '4px 8px', borderRadius: '8px', border: 'var(--border-medium)', fontFamily: 'var(--font-mono)', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>ایمپرشن (بازدید):</span>
                  <input
                    type="number"
                    value={xImpressions}
                    onChange={(e) => setXImpressions(e.target.value)}
                    style={{ width: '80px', padding: '4px 8px', borderRadius: '8px', border: 'var(--border-medium)', fontFamily: 'var(--font-mono)', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>ریپلای‌ها:</span>
                  <input
                    type="number"
                    value={xReplies}
                    onChange={(e) => setXReplies(e.target.value)}
                    style={{ width: '80px', padding: '4px 8px', borderRadius: '8px', border: 'var(--border-medium)', fontFamily: 'var(--font-mono)', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>
                <button type="submit" className="nb-btn nb-btn-yellow" style={{ marginTop: '6px', padding: '6px', fontSize: '0.75rem' }}>
                  💾 ذخیره آمار
                </button>
              </form>
            </div>

          </div>

          {/* Roadmap & Content Principles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            <div className="nb-card nb-card-white" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>
                  🗺 چک‌لیست و برنامه ۳۰ روزه
                </h3>
                <span className="nb-pill" style={{ background: 'var(--nb-green)' }}>
                  روز ۲ فعال
                </span>
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

            <div className="nb-card nb-card-pink" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '12px' }}>
                🎯 ۳ اصل طلایی تولید محتوای Mr. Builder
              </h3>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#333', marginBottom: '16px' }}>
                (ثبت‌شده در مهارت mrbuilder-content)
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
                  {p2pStatus === 'connected' ? '● متصل P2P' : '☻ رادار خودکار'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>
                  کد: {myPeerId || '...'}
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
                  <span>متصل به: <span style={{ color: 'var(--nb-purple)' }}>{connectedDevice?.name}</span></span>
                ) : (
                  <span>در انتظار اتصال دیوایس مقابل...</span>
                )}
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
                {selectedFile && (
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • آماده ارسال
                  </div>
                )}
              </label>

              {isTransferring && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '3px' }}>
                    <span>در حال ارسال P2P... ({transferSpeed} MB/s)</span>
                    <span>{transferProgress}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#fff', border: '1.5px solid #000', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${transferProgress}%`, background: 'var(--nb-dark)', transition: 'width 0.15s ease' }}></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSendFileReal}
                disabled={isTransferring}
                className="nb-btn nb-btn-dark"
                style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
              >
                {isTransferring ? '⏳ در حال فرستادن...' : '🚀 ارسال فایل مستقیم'}
              </button>
            </div>

            {/* 3. Mobile Clipboard Sync */}
            <div className="nb-card nb-card-yellow" style={{ padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>📋 کپی‌پیست سریع متن</span>
                {copiedNotification && <span style={{ color: '#16a34a' }}>✓ ارسال شد</span>}
              </div>
              <form onSubmit={handleSendClipboardReal} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="متن را بنویسید..."
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
                  ارسال
                </button>
              </form>
            </div>

            {/* QR Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="nb-btn nb-btn-white"
              style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
            >
              📷 نمایش QR Code اتصال
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
              <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px', color: 'var(--nb-yellow)' }}>رادار</span>
            </button>
            <button onClick={() => setShowQRModal(true)} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📷</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px' }}>اسکن</span>
            </button>
            <button onClick={() => setViewMode('desktop')} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>💻</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px' }}>دسکتاپ</span>
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
                  انتقال پرسرعت فایل و کلیپ‌بورد در شبکه محلی بدون نیاز به ۱ بایت اینترنت
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={handleCopyPairingLink}
                className="nb-btn nb-btn-white"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                {copyLinkSuccess ? '✓ کپی شد!' : '🔗 کپی لینک اتصال'}
              </button>

              <button
                onClick={() => setShowQRModal(true)}
                className="nb-btn nb-btn-yellow"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                📷 اسکن QR کد
              </button>
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
                  {p2pStatus === 'connected' ? '● متصل شد' : '☻ آماده اتصال'}
                </div>
                <span style={{ fontSize: '1.2rem' }}>📶</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                دستگاه‌های محلی
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                دستگاه دوم را با لینک، QR کد یا وارد کردن کد وصل کنید:
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
                  کد اختصاصی این دستگاه ({localDevice.name}):
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
                    {myPeerId || 'در حال دریافت...'}
                  </span>
                  <button
                    onClick={handleCopyPairingLink}
                    className="nb-pill"
                    style={{ background: 'var(--nb-yellow)', cursor: 'pointer', border: 'var(--border-medium)' }}
                  >
                    {copyLinkSuccess ? 'کپی شد' : 'کپی لینک'}
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
                      کانال مستقیم WebRTC فعال • بدون مصرف نت
                    </div>
                  </div>
                  <span className="nb-pill" style={{ background: 'var(--nb-green)', color: '#000', fontSize: '0.75rem' }}>
                    آماده تبادل
                  </span>
                </div>
              ) : (
                /* Manual Connect Input Form */
                <form onSubmit={handleConnectManual} style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
                    یا کد دستگاه مقابل را وارد کنید:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="مثلاً beam-x4k9..."
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
                      {p2pStatus === 'connecting' ? '⏳...' : 'اتصال 🔗'}
                    </button>
                  </div>
                </form>
              )}

              <button
                onClick={() => setShowQRModal(true)}
                className="nb-btn nb-btn-white"
                style={{ width: '100%', padding: '14px' }}
              >
                📷 اتصال با اسکن QR Code (آفلاین)
              </button>
            </div>

            {/* CARD 2: WI-FI SPEED & RECEIVED FILES */}
            <div className="nb-card nb-card-green" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>P2P LAN</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ⚡ لایو
                </div>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                تاریخچه و دریافت‌ها
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                فایل‌های دریافتی مستقیماً در مرورگر ذخیره و قابل دانلود می‌شوند:
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
                    هنوز فایلی منتقل نشده است.
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
                          💾 دانلود
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
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>سرعت لحظه‌ای</div>
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
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>نوع رمزنگاری</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>DTLS/SCTP</div>
                </div>
              </div>
            </div>

            {/* CARD 3: DROPZONE & CLIPBOARD */}
            <div className="nb-card nb-card-pink" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>P2P Data</span>
                <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
                  ✦ ارسال آنی
                </div>
                <span style={{ fontSize: '1.2rem' }}>📦</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
                ارسال فایل یا متن
              </h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
                مستقیماً به {connectedDevice ? connectedDevice.name : 'دستگاه متصل'}:
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

              {/* Live Transfer Progress */}
              {isTransferring && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>
                    <span>در حال انتقال P2P... ({transferSpeed} MB/s)</span>
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
                {isTransferring ? '⏳ در حال فرستادن چانک‌های باینری...' : '🚀 ارسال فایل با حداکثر سرعت'}
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
                  <span>📋 تخته‌شستی اشتراکی (متن / لینک)</span>
                  {copiedNotification && <span style={{ color: '#16a34a', fontWeight: 900 }}>✓ ارسال شد!</span>}
                </div>

                <form onSubmit={handleSendClipboardReal} style={{ display: 'flex', gap: '8px' }}>
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
                    ارسال
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
                    <div style={{ fontWeight: 800, marginBottom: '2px' }}>متن دریافت‌شده:</div>
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
                ✈️ کانال تلگرام
              </a>

              <a
                href="https://x.com/MrBuildersai"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-white"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                𝕏 توییتر پروژه
              </a>

              <a
                href="https://github.com/mrbuilder-dev/30day-app-challenge"
                target="_blank"
                rel="noreferrer"
                className="nb-btn nb-btn-green"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                🐙 سورس گیت‌هاب
              </a>

              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, paddingRight: '10px' }}>
                Mr. Builder • چالش ۳۰ روزه
              </span>
            </div>
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
          zIndex: 9999
        }}>
          <div className="nb-card nb-card-yellow" style={{ maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>
              📷 اسکن با دوربین گوشی
            </h3>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: '#333' }}>
              دوربین آیفون یا اندروید را روی این کد بگیرید تا مستقیماً به این صفحه وصل شوید:
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
              کد اتاق: <strong>{myPeerId || '...'}</strong>
            </div>

            <button
              onClick={handleCopyPairingLink}
              className="nb-btn nb-btn-white"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {copyLinkSuccess ? '✓ لینک کپی شد' : '🔗 کپی لینک اتصال مستقیم'}
            </button>

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
