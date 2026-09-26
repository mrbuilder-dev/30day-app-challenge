import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export default function App() {
  // --- States ---
  const [selectedDevice, setSelectedDevice] = useState('iphone');
  const [clipboardText, setClipboardText] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Transfer history
  const [transfers, setTransfers] = useState([
    { id: 1, name: 'design_specs_v2.fig', size: '24.5 MB', from: 'MacBook Pro', to: 'iPhone 15', time: 'همین الان' },
    { id: 2, name: 'vacation_clip_4k.mov', size: '180.2 MB', from: 'iPhone 15', to: 'MacBook Pro', time: '۵ دقیقه پیش' },
  ]);

  // Devices in Local Wi-Fi
  const devices = [
    { id: 'iphone', name: 'آیفون ۱۵ (iPhone 15 Pro)', type: '📱 موبایل', ip: '192.168.1.34', active: true },
    { id: 'galaxy', name: 'گلکسی اس ۲۴ (Galaxy S24)', type: '📱 موبایل', ip: '192.168.1.45', active: true },
    { id: 'laptop', name: 'لپ‌تاپ همکار (ThinkPad)', type: '💻 لپ‌تاپ', ip: '192.168.1.12', active: false },
  ];

  // Trigger File Send Simulation
  const handleSendFile = () => {
    setIsTransferring(true);
    setTransferProgress(0);

    const interval = setInterval(() => {
      setTransferProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTransferring(false);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
          const newTransfer = {
            id: Date.now(),
            name: selectedFile ? selectedFile.name : 'quick_share_pack.zip',
            size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '42.8 MB',
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

  // Clipboard Send
  const handleSendClipboard = (e) => {
    e.preventDefault();
    if (!clipboardText.trim()) return;
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
    setClipboardText('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* --- TOP BRAND HEADER --- */}
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '36px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-1px',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            color: '#121316',
            lineHeight: 1
          }}>
            LOCALBEAM
          </h1>
          <span className="star-rotate" style={{ fontSize: '2rem', color: 'var(--nb-yellow)' }}>
            ✹
          </span>
        </div>

        <p style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#121316',
          marginBottom: '16px'
        }}>
          AirDrop تحت وب روی شبکه محلی • بدون نیاز به ۱ بایت اینترنت جهانی ⚡
        </p>

        {/* Badges Bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="nb-pill">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            شبکه محلی: متصل (Wi-Fi LAN)
          </span>
          <span className="nb-pill">
            📡 پروتکل: WebRTC Direct P2P
          </span>
          <span className="nb-pill" style={{ background: 'var(--nb-yellow)' }}>
            🛠️ روز ۱ از ۳۰ • Mr. Builder
          </span>
        </div>
      </header>

      {/* --- MAIN 3-COLUMN SHOWCASE (Inspired by reference Neo-Brutalism cards) --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* ========================================================
            CARD 1: YELLOW CARD (MY DEVICE & RADAR)
        ======================================================== */}
        <div className="nb-card nb-card-yellow" style={{ padding: '24px' }}>
          
          {/* Top Card Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800 }}>9:41</span>
            <div className="nb-pill" style={{ padding: '3px 10px', fontSize: '0.8rem' }}>
              ☻ دستگاه‌های اطراف
            </div>
            <span style={{ fontSize: '1.2rem' }}>📶</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>
            رادار محلی
          </h2>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: '16px' }}>
            دستگاه مقصد را برای ارسال انتخاب کنید:
          </p>

          {/* Quick Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <span className="nb-pill" style={{ background: '#fff' }}>همه (۳)</span>
            <span className="nb-pill" style={{ background: 'rgba(255,255,255,0.6)' }}>📱 موبایل (۲)</span>
            <span className="nb-pill" style={{ background: 'rgba(255,255,255,0.6)' }}>💻 سیستم (۱)</span>
          </div>

          {/* Device Selection List */}
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

          {/* QR Code Action Button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="nb-btn nb-btn-dark"
            style={{ width: '100%', padding: '14px' }}
          >
            📷 اتصال با اسکن QR Code (آفلاین)
          </button>
        </div>

        {/* ========================================================
            CARD 2: GREEN CARD (NETWORK & SPEED GAUGES)
        ======================================================== */}
        <div className="nb-card nb-card-green" style={{ padding: '24px' }}>
          
          {/* Top Card Bar */}
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

          {/* Big Metric Box */}
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

          {/* Liquid Capsule Meters (Direct from reference image!) */}
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

          {/* Quick Metrics Footer */}
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
              <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>نوع رمزنگاری</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>TLS / E2EE</div>
            </div>
          </div>

        </div>

        {/* ========================================================
            CARD 3: PINK CARD (DROPZONE & SHARED CLIPBOARD)
        ======================================================== */}
        <div className="nb-card nb-card-pink" style={{ padding: '24px' }}>
          
          {/* Top Card Bar */}
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

          {/* Interactive Dropzone */}
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

          {/* Transfer Progress Bar (when active) */}
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

          {/* Send File Button */}
          <button
            onClick={handleSendFile}
            disabled={isTransferring}
            className="nb-btn nb-btn-dark"
            style={{ width: '100%', padding: '14px', marginBottom: '18px' }}
          >
            {isTransferring ? '⏳ در حال فرستادن...' : '🚀 ارسال فایل با حداکثر سرعت'}
          </button>

          {/* Shared Clipboard Sub-box */}
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

      {/* ========================================================
          BOTTOM DOCK BAR (From reference image nav)
      ======================================================== */}
      <div style={{
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'center'
      }}>
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

            {/* Real QR Code SVG */}
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
