import React, { useState, useEffect } from 'react';

export default function App() {
  // --- Timer State ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState(25); // 25 or 50 mins
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem('mrbuilder_sessions') || '0', 10);
  });

  // --- Ideas State (persisted in localStorage) ---
  const [ideas, setIdeas] = useState(() => {
    const saved = localStorage.getItem('mrbuilder_ideas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 1, title: 'ابزار تمرکز عمیق و تایمر دیپ‌ورک آفلاین (Deep Work Hub)', votes: 14, category: 'بهره‌وری' },
      { id: 2, title: 'انتقال سریع فایل و متن روی شبکه محلی بدون اینترنت (Local Drop)', votes: 19, category: 'شبکه و فایل' },
      { id: 3, title: 'دفترچه دخل و خرج مینیمال و محرمانه بدون دسترسی به پیامک', votes: 11, category: 'مالی' },
      { id: 4, title: 'جعبه‌ابزار کلاینت‌ساید توسعه‌دهنده (JWT, JSON, Regex, Base64)', votes: 8, category: 'ابزار دولوپر' },
    ];
  });

  const [newIdeaText, setNewIdeaText] = useState('');

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      localStorage.setItem('mrbuilder_sessions', newSessions.toString());
      alert('جلسه تمرکز با موفقیت به پایان رسید! یک استراحت کوتاه داشته باشید ☕');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionsCompleted]);

  // Persist ideas
  useEffect(() => {
    localStorage.setItem('mrbuilder_ideas', JSON.stringify(ideas));
  }, [ideas]);

  const handleVote = (id) => {
    setIdeas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, votes: item.votes + 1 } : item
      )
    );
  };

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!newIdeaText.trim()) return;
    const newEntry = {
      id: Date.now(),
      title: newIdeaText.trim(),
      votes: 1,
      category: 'پیشنهاد کاربران',
    };
    setIdeas([newEntry, ...ideas]);
    setNewIdeaText('');
  };

  const setDuration = (mins) => {
    setIsRunning(false);
    setTimerMode(mins);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* --- HEADER --- */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)'
          }}>
            🛠️
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Mr. Builder
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              چالش ۳۰ روزه ساخت محصول در ملأ عام (#BuildInPublic)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="glow-badge">
            <span className="pulse-dot"></span>
            روز ۱ از ۳۰ • وضعیت: آنلاین
          </div>

          <a 
            href="https://t.me/MrbuildersAI" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            ✈️ تلگرام
          </a>

          <a 
            href="https://x.com/MrBuildersai" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            𝕏 توییتر
          </a>

          <a 
            href="https://github.com/mrbuilder-dev/30day-app-challenge" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            🐙 گیت‌هاب
          </a>
        </div>
      </header>

      {/* --- HERO SPRINT STATUS --- */}
      <section className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <span className="code-tag">Sprint Phase: Idea Discovery</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '8px' }}>
              فاز اول: نظرسنجی و غربالگری ایده‌ها با همراهی کاربران
            </h2>
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>Day 1</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}> / 30</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            width: '3.33%',
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
          }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>شروع: ۵ مهر ۱۴۰۵ (راه‌اندازی زیرساخت)</span>
          <span>هدف: انتشار نسخه نهایی v1.0</span>
        </div>
      </section>

      {/* --- MAIN GRID --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>

        {/* --- MODULE 1: IDEA INCUBATOR --- */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 بورد ایده‌ها و رای‌گیری
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ذخیره‌سازی لوکال</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            ایده‌های پیشنهادی از توییتر و تلگرام؛ به ایده‌ای که بیشتر می‌پسندید رای دهید:
          </p>

          {/* Idea List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', flex: 1 }}>
            {ideas.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ paddingLeft: '10px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    #{item.category}
                  </span>
                </div>

                <button
                  onClick={() => handleVote(item.id)}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🔥 {item.votes}
                </button>
              </div>
            ))}
          </div>

          {/* Add Idea Input */}
          <form onSubmit={handleAddIdea} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="پیشنهاد ایده جدید..."
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              افزودن
            </button>
          </form>
        </div>

        {/* --- MODULE 2: DEEP WORK TIMER (LIVE PROOF OF OFFLINE-FIRST) --- */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ تایمر تمرکز عمیق (Deep Work)
            </h3>
            <span className="code-tag">100% Offline</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>
            نمونه اولیه ماژول کارکرد کاملاً محلی بدون وابستگی به اینترنت
          </p>

          {/* Duration Selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => setDuration(25)}
              className={`btn ${timerMode === 25 ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: '20px' }}
            >
              ۲۵ دقیقه
            </button>
            <button
              onClick={() => setDuration(50)}
              className={`btn ${timerMode === 50 ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: '20px' }}
            >
              ۵۰ دقیقه
            </button>
          </div>

          {/* Clock Display */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '3.8rem',
            fontWeight: 700,
            letterSpacing: '2px',
            color: isRunning ? 'var(--accent-cyan)' : 'var(--text-main)',
            textShadow: isRunning ? '0 0 30px rgba(6, 182, 212, 0.4)' : 'none',
            margin: '10px 0 24px',
            transition: 'all 0.3s ease'
          }}>
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn btn-primary"
              style={{ minWidth: '110px' }}
            >
              {isRunning ? '⏸ توقف' : '▶️ شروع کار'}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(timerMode * 60);
              }}
              className="btn btn-secondary"
            >
              🔄 بازنشانی
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            تعداد جلسات تکمیل‌شده امروز: <strong style={{ color: 'var(--accent-emerald)' }}>{sessionsCompleted}</strong>
          </div>
        </div>

        {/* --- MODULE 3: DEV LOG TIMELINE --- */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📜 لاگ پیشرفت چالش
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-emerald)', marginTop: '5px' }}></div>
                <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.1)', marginTop: '4px' }}></div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  روز ۰ (امروز) • راه‌اندازی زیرساخت
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  پی‌ریزی هویت برند Mr. Builder، ساخت کانال تلگرام، اکانت X، پروفایل لینکدین و ریپازیتوری دو زبانه گیت‌هاب.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)', marginTop: '5px' }}></div>
                <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.1)', marginTop: '4px' }}></div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  روز ۱ (فردا) • ارزیابی ایده‌ها
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  بررسی نظرات و کامنت‌های کاربران در توییتر و انتخاب قطعی اولین قابلیت کاربردی برای نسخه MVP.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-dim)', marginTop: '5px' }}></div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                  روزهای ۲ تا ۵ • کدنویسی هسته محصول
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  پیاده‌سازی معماری لوکال-فرست و انتشار اولین فایل آزمایشی بتا در تلگرام.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <footer style={{
        textAlign: 'center',
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-dim)',
        fontSize: '0.85rem'
      }}>
        ساخته‌شده با ❤️ در ملأ عام (#BuildInPublic) توسط Mr. Builder • ۱۰۰٪ کلاینت‌ساید و محلی
      </footer>

    </div>
  );
}
