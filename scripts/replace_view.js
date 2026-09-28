import fs from 'fs';

const filePath = '/Users/arshiamajidi/Desktop/Idea/build/day01-localbeam/src/App.jsx';
const content = fs.readFileSync(filePath, 'utf-8');

const startMarker = "{viewMode === 'desktop' && (";
const startIndex = content.indexOf(startMarker);

const endMarker = "      {/* ========================================================\n          SCREEN 3: MOBILE APP PREVIEW FRAME";
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found! startIndex:", startIndex, "endIndex:", endIndex);
  process.exit(1);
}

// Find the closing "      )}" right before endMarker
const sub = content.substring(startIndex, endIndex);
const lastClosingParen = sub.lastIndexOf(")}");

if (lastClosingParen === -1) {
  console.error("Closing paren not found!");
  process.exit(1);
}

const replaceEnd = startIndex + lastClosingParen + 2;

const newDesktopView = `{viewMode === 'desktop' && (
        <div className="w-full flex flex-col gap-6" style={{ minHeight: '80vh', paddingBottom: '40px' }}>
          
          {/* Top Brand Header */}
          <header className="w-full bg-primary-container border-[2.5px] border-on-background rounded-3xl p-4 sm:p-5 shadow-brutal flex justify-between items-center flex-wrap gap-4">
            {/* Logo & Branding */}
            <div 
              onClick={() => navigateToView('guide')}
              className="flex items-center gap-3 cursor-pointer"
              title={lang === 'fa' ? 'بازگشت به صفحه اول' : 'Back to Home'}
            >
              <div className="w-11 h-11 bg-secondary-container rounded-full border-[2.5px] border-on-background flex items-center justify-center shadow-brutal-sm">
                <span className="material-symbols-outlined text-on-background text-2xl font-bold">flare</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-on-background uppercase">LOCALBEAM</span>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed border-[2px] border-on-background rounded-full px-2.5 py-0.5 text-xs font-bold font-mono">
                    P2P LAN v0.2
                  </span>
                </div>
                <span className="text-xs font-semibold text-on-background/80 hidden sm:block">
                  {lang === 'fa' ? 'AirDrop تحت وب روی شبکه محلی • انتقال فایل بدون ۱ بایت اینترنت' : 'Local Wi-Fi AirDrop for Web • 0 bytes internet'}
                </span>
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Back to Home Button */}
              <button
                onClick={() => navigateToView('guide')}
                className="bg-secondary-container text-on-background border-[2.5px] border-on-background font-bold text-xs sm:text-sm rounded-full px-4 py-1.5 shadow-brutal-sm flex items-center gap-1.5 btn-brutal"
              >
                <span>🏠</span>
                <span>{lang === 'fa' ? 'صفحه اصلی' : 'Home'}</span>
              </button>

              {/* Status Badge */}
              <div className="flex items-center gap-2 bg-surface-container-lowest text-on-background border-[2.5px] border-on-background text-xs sm:text-sm font-bold rounded-full px-3 sm:px-4 py-1.5 shadow-brutal-sm">
                <span className={\`w-2.5 h-2.5 rounded-full \${p2pStatus === 'connected' ? 'bg-[#10b981] animate-ping' : 'bg-[#f59e0b]'}\`}></span>
                <span>Wi-Fi Direct LAN</span>
                <span className="text-on-background/40">|</span>
                <span className="font-black">{p2pStatus === 'connected' ? (lang === 'fa' ? 'متصل' : 'Connected') : (lang === 'fa' ? 'آماده جفت‌سازی' : 'Ready')}</span>
              </div>

              {/* Peer ID Chip */}
              <div className="bg-surface-container-lowest text-on-background border-[2.5px] border-on-background font-mono text-xs sm:text-sm font-bold rounded-full px-3 py-1.5 shadow-brutal-sm flex items-center gap-1.5" dir="ltr">
                <span className="material-symbols-outlined text-sm">terminal</span>
                <span>{myPeerId || 'local-host'}</span>
              </div>

              {/* PWA Install Button */}
              <button
                onClick={() => setShowInstallModal(true)}
                className="bg-surface-container-lowest text-on-background border-[2.5px] border-on-background font-bold text-xs sm:text-sm rounded-full px-3.5 py-1.5 shadow-brutal-sm flex items-center gap-1.5 btn-brutal"
              >
                <span>📥</span>
                <span>{lang === 'fa' ? 'نصب اپ' : 'Install'}</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => handleLanguageChange(lang === 'fa' ? 'en' : 'fa')}
                className="bg-secondary-container text-on-background border-[2.5px] border-on-background font-bold text-xs sm:text-sm rounded-full px-3 py-1.5 shadow-brutal-sm flex items-center gap-1 btn-brutal"
              >
                <span className="material-symbols-outlined text-base">translate</span>
                <span>{lang === 'fa' ? 'EN' : 'فا'}</span>
              </button>
            </div>
          </header>

          {/* Neo-Brutal Flow Breadcrumb Pill */}
          <div className="w-full flex items-center justify-center">
            <div className="bg-surface-container-lowest border-[2.5px] border-on-background rounded-full px-4 sm:px-6 py-2 shadow-brutal flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1 text-on-background">
                <span className="w-5 h-5 rounded-full bg-secondary-container text-on-background flex items-center justify-center text-xs border border-on-background">۱</span>
                {lang === 'fa' ? 'فایل رو انتخاب کن' : 'Pick File'}
              </span>
              <span className="text-on-background/40">➔</span>
              <span className="flex items-center gap-1 text-on-background">
                <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center text-xs border border-on-background">۲</span>
                {lang === 'fa' ? 'با گوشی کد QR رو اسکن کن' : 'Scan QR on Phone'}
              </span>
              <span className="text-on-background/40">➔</span>
              <span className="flex items-center gap-1 text-tertiary-fixed-variant">
                <span className="w-5 h-5 rounded-full bg-[#ffaec8] text-on-background flex items-center justify-center text-xs border border-on-background">۳</span>
                {lang === 'fa' ? 'دریافت با سرعت ۸۰ مگابایت بر ثانیه! ⚡' : 'Beam at 80MB/s! ⚡'}
              </span>
            </div>
          </div>

          {/* ================= HERO DROPZONE SECTION ================= */}
          <section className="w-full max-w-4xl mx-auto">
            <div className="bg-surface-container-lowest border-[3px] border-on-background rounded-3xl p-5 sm:p-8 shadow-brutal-xl relative overflow-hidden">
              
              {/* Corner Star Badges */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-secondary-container border-[2.5px] border-on-background rounded-full flex items-center justify-center shadow-brutal-sm rotate-12">
                <span className="material-symbols-outlined font-black text-xl text-on-background">bolt</span>
              </div>
              <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-tertiary-fixed border-[2.5px] border-on-background rounded-full flex items-center justify-center shadow-brutal-sm -rotate-12">
                <span className="material-symbols-outlined font-black text-xl text-on-background">offline_bolt</span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6 border-b-[2.5px] border-on-background/15 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTransferTab('files')}
                    className={\`\${transferTab === 'files' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-low text-on-background'} border-[2.5px] border-on-background font-bold text-xs sm:text-sm rounded-full px-5 py-2 shadow-brutal-sm flex items-center gap-2 btn-brutal\`}
                  >
                    <span className="material-symbols-outlined text-lg">folder_zip</span>
                    <span>{lang === 'fa' ? 'ارسال فایل یا فولدر' : 'Send Files / Folders'}</span>
                  </button>

                  <button
                    onClick={() => setTransferTab('clipboard')}
                    className={\`\${transferTab === 'clipboard' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-low text-on-background'} border-[2.5px] border-on-background font-bold text-xs sm:text-sm rounded-full px-5 py-2 shadow-brutal-sm flex items-center gap-2 btn-brutal\`}
                  >
                    <span className="material-symbols-outlined text-lg">content_paste</span>
                    <span>{lang === 'fa' ? 'تخته‌شستی / لینک' : 'Clipboard / Text'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-[#ffaec8] border-[2.5px] border-on-background rounded-full px-3 py-1 shadow-brutal-sm text-xs font-bold">
                  <span className={\`w-2.5 h-2.5 rounded-full \${p2pStatus === 'connected' ? 'bg-green-600 animate-pulse' : 'bg-black'}\`}></span>
                  <span>
                    {connectedDevice 
                      ? (lang === 'fa' ? \`ارسال به: \${connectedDevice.name}\` : \`Target: \${connectedDevice.name}\`) 
                      : (lang === 'fa' ? 'ارسال به: همه دستگاه‌های نزدیک (Broadcast)' : 'Broadcast to Nearby Peers')}
                  </span>
                </div>
              </div>

              {/* TAB 1: FILES MODE */}
              {transferTab === 'files' && (
                <div className="flex flex-col items-center justify-center">
                  {/* Dashed Drop Area */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={\`w-full border-[3px] border-dashed border-on-background rounded-2xl p-6 sm:p-10 transition-all cursor-pointer text-center flex flex-col items-center justify-center \${isDragOver ? 'bg-[#fffae8] scale-[1.01]' : 'bg-[#faf8f4] hover:bg-[#fff9e6]'}\`}
                  >
                    <input 
                      type="file" 
                      multiple 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />

                    {/* Format tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                      <span className="bg-[#ccbdff] border-[2px] border-on-background rounded-full px-3 py-0.5 text-xs font-bold shadow-brutal-sm">MP4 • 4K</span>
                      <span className="bg-[#ffd056] border-[2px] border-on-background rounded-full px-3 py-0.5 text-xs font-bold shadow-brutal-sm">ZIP • RAR</span>
                      <span className="bg-[#c4f279] border-[2px] border-on-background rounded-full px-3 py-0.5 text-xs font-bold shadow-brutal-sm">PDF • DOCX</span>
                      <span className="bg-[#ffaec8] border-[2px] border-on-background rounded-full px-3 py-0.5 text-xs font-bold shadow-brutal-sm">RAW / HEIC</span>
                    </div>

                    {/* Central Icon */}
                    <div className="relative mb-4 group">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-secondary-container border-[3px] border-on-background rounded-3xl flex items-center justify-center shadow-brutal group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-5xl sm:text-6xl text-on-background">drive_folder_upload</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-tertiary-fixed border-[2.5px] border-on-background rounded-full p-1.5 shadow-brutal-sm">
                        <span className="material-symbols-outlined text-base font-bold text-on-background">bolt</span>
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-on-background mb-2">
                      {lang === 'fa' ? 'فایل، عکس یا ویدیوت رو بنداز اینجا!' : 'Drop your files, photos, or videos here!'}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-on-background/70 max-w-lg mb-6">
                      {lang === 'fa' ? 'بدون هیچ‌گونه فشرده‌سازی، بدون محدودیت حجم فایل و بدون مصرف حتی یک کیلوبایت اینترنت' : 'No compression, no file size limit, and 0 bytes internet consumed.'}
                    </p>

                    <button 
                      type="button"
                      className="bg-secondary-container text-on-background border-[3px] border-on-background rounded-full px-8 py-3.5 text-sm sm:text-base font-black shadow-brutal flex items-center gap-3 btn-brutal"
                    >
                      <span className="material-symbols-outlined text-2xl font-black">add_circle</span>
                      <span>{lang === 'fa' ? 'انتخاب فایل‌ها (Select Files)' : 'Select Files'}</span>
                    </button>
                    <span className="mt-3 text-xs text-on-background/60 font-bold">
                      {lang === 'fa' ? 'یا پوشه کامل را بکشید و رها کنید (Drag & Drop)' : 'or drag & drop full folder directly'}
                    </span>
                  </div>

                  {/* STAGED FILES QUEUE PREVIEW */}
                  {selectedFiles.length > 0 && (
                    <div className="w-full mt-6 bg-surface-container-low border-[2.5px] border-on-background rounded-2xl p-4 shadow-brutal flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-tertiary-fixed rounded-full border border-on-background"></span>
                          {lang === 'fa' ? 'فایل‌های آماده ارسال (Staged Payloads)' : 'Staged Files'}
                        </span>
                        <span className="text-xs font-mono font-bold bg-surface-container-highest px-2.5 py-0.5 rounded border border-on-background">
                          {selectedFiles.length} {lang === 'fa' ? 'آیتم' : 'files'} • {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>

                      {/* File Items */}
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-surface-container-lowest border-[2px] border-on-background rounded-xl p-3 shadow-brutal-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 bg-[#ccbdff] border-[2px] border-on-background rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl text-on-background">
                                  {file.type?.startsWith('image/') ? 'image' : file.type?.startsWith('video/') ? 'movie' : 'folder_zip'}
                                </span>
                              </div>
                              <div className="truncate">
                                <h4 className="font-bold text-xs sm:text-sm text-on-background truncate">{file.name}</h4>
                                <p className="text-xs text-on-background/60 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Binary'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="bg-tertiary-fixed border border-on-background rounded-full px-2.5 py-0.5 text-xs font-bold">
                                {lang === 'fa' ? 'آماده' : 'Ready'}
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeSelectedFile(idx); }}
                                className="w-8 h-8 rounded-full border border-on-background hover:bg-error-container flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Transfer Progress / Send Button */}
                      {isTransferring ? (
                        <div className="mt-2 bg-surface-container-lowest border-[2px] border-on-background rounded-xl p-4 shadow-brutal-sm">
                          <div className="flex justify-between items-center mb-2 text-xs font-bold font-mono">
                            <span>{transferFileName}</span>
                            <span>{transferProgress}% • {transferSpeed} MB/s</span>
                          </div>
                          <div className="w-full h-4 bg-surface-container border-[2px] border-on-background rounded-full overflow-hidden">
                            <div className="h-full bg-secondary-container striped-bar transition-all duration-150" style={{ width: \`\${transferProgress}%\` }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3 mt-1 pt-2 border-t border-on-background/20">
                          <button
                            onClick={handleSendFileReal}
                            className="bg-on-background text-surface-container-lowest border-[2.5px] border-on-background rounded-full px-6 py-2.5 font-bold text-sm shadow-brutal flex items-center gap-2 btn-brutal"
                          >
                            <span className="material-symbols-outlined text-secondary-container">rocket_launch</span>
                            <span>{lang === 'fa' ? 'ارسال آنی به دستگاه متصل 🚀' : 'Beam to Device 🚀'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TRANSFERS HISTORY SHELF (RECEIVED & SENT) */}
                  {transfers.length > 0 && (
                    <div className="w-full mt-6 bg-surface-container-low border-[2.5px] border-on-background rounded-2xl p-4 shadow-brutal flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-on-background"></span>
                          {lang === 'fa' ? 'تاریخچه انتقال‌ها و فایل‌های دریافتی' : 'Transfer History & Received Files'}
                        </span>
                        <span className="text-xs font-mono font-bold bg-surface-container-highest px-2 py-0.5 rounded border border-on-background">
                          {transfers.length} {lang === 'fa' ? 'مورد' : 'items'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {transfers.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-surface-container-lowest border-[2px] border-on-background rounded-xl p-3 shadow-brutal-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-tertiary-fixed border border-on-background rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-xs sm:text-sm text-on-background">{item.name}</h5>
                                <p className="text-xs text-on-background/60 font-mono">{item.size} • {item.time}</p>
                              </div>
                            </div>
                            {item.isDownloadable && item.url && (
                              <a
                                href={item.url}
                                download={item.name}
                                className="bg-secondary-container text-on-background border-[2px] border-on-background rounded-full px-3.5 py-1 text-xs font-bold shadow-brutal-sm flex items-center gap-1 btn-brutal"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                                <span>{lang === 'fa' ? 'دانلود' : 'Download'}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: CLIPBOARD / TEXT SHARING */}
              {transferTab === 'clipboard' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#faf8f4] border-[2.5px] border-on-background rounded-2xl p-5 shadow-brutal">
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                      <span>{lang === 'fa' ? 'متن، یادداشت یا لینک URL را برای همگام‌سازی بنویسید:' : 'Write or paste text, note, or URL to beam:'}</span>
                    </label>

                    <textarea
                      value={clipboardText}
                      onChange={(e) => setClipboardText(e.target.value)}
                      placeholder={lang === 'fa' ? 'متن یا پیوند مورد نظر خود را بنویسید یا الصاق کنید...' : 'Type or paste text/link here...'}
                      rows="4"
                      className="w-full bg-surface-container-lowest border-[2.5px] border-on-background rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-container shadow-brutal-sm"
                    />

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <span className="text-xs text-on-background/70 font-semibold">
                        {lang === 'fa' ? 'متن به محض ارسال، در کلیپ‌بورد گوشی یا لپ‌تاپ مقصد کپی می‌شود.' : 'Text will be synced to the target device clipboard.'}
                      </span>
                      <button
                        onClick={handleSendClipboardReal}
                        className="bg-secondary-container text-on-background border-[2.5px] border-on-background rounded-full px-6 py-2 text-sm font-bold shadow-brutal btn-brutal flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">send</span>
                        <span>{lang === 'fa' ? 'ارسال فوری به کلیپ‌بورد' : 'Beam to Clipboard'}</span>
                      </button>
                    </div>

                    {incomingClipboard && (
                      <div className="mt-4 pt-3 border-t border-on-background/20 bg-surface-container-lowest p-3 rounded-xl border border-on-background">
                        <span className="text-xs font-bold text-on-background/70 block mb-1">
                          {lang === 'fa' ? 'متن دریافت‌شده از دستگاه مقابل:' : 'Received text from peer:'}
                        </span>
                        <p className="font-mono text-xs bg-surface-container p-2 rounded select-all break-all">{incomingClipboard}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* ================= INSTANT PAIRING & RADAR PEER BENTO DRAWER ================= */}
          <section className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* BOX 1: High-Contrast QR Code LAN Connector (Cols 5) */}
            <div className="md:col-span-5 bg-secondary-container border-[3px] border-on-background rounded-3xl p-6 shadow-brutal-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-surface-container-lowest border-[2px] border-on-background rounded-full px-3 py-1 text-xs font-bold shadow-brutal-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                    <span>{lang === 'fa' ? 'اتصال با یک اسکن' : '1-Scan Pairing'}</span>
                  </span>
                  <span className="bg-on-background text-surface-container-lowest text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                    Wi-Fi 5GHz
                  </span>
                </div>

                <h3 className="text-lg font-black text-on-background mb-1">
                  {lang === 'fa' ? 'دوربین گوشیت رو بگیر اینجا!' : 'Point Phone Camera Here!'}
                </h3>
                <p className="text-xs text-on-background/80 font-semibold mb-4">
                  {lang === 'fa' ? 'بدون نصب هیچ برنامه‌ای، به مرورگر گوشی متصل شو و فایل‌ها رو بگیر.' : 'Scan with iOS or Android camera to instant-pair on local Wi-Fi.'}
                </p>

                {/* Real Dynamic QR Code Box */}
                <div className="bg-surface-container-lowest border-[3px] border-on-background rounded-2xl p-4 flex flex-col items-center justify-center shadow-brutal mx-auto max-w-[220px]">
                  <QRCodeSVG 
                    value={getPairingUrl()} 
                    size={140} 
                    level="M" 
                  />
                  <span className="mt-2 font-mono text-xs font-bold text-on-background dir-ltr">
                    beam://{myPeerId || 'offline'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyPairingLink}
                className="mt-5 w-full bg-surface-container-lowest text-on-background border-[2.5px] border-on-background rounded-full py-2.5 px-4 text-xs sm:text-sm font-bold shadow-brutal flex items-center justify-center gap-2 btn-brutal"
              >
                <span className="material-symbols-outlined text-base">content_copy</span>
                <span>{copyLinkSuccess ? (lang === 'fa' ? '✓ لینک کپی شد!' : '✓ Link Copied!') : (lang === 'fa' ? 'کپی لینک شبکه محلی (LAN)' : 'Copy Local Pairing Link')}</span>
              </button>
            </div>

            {/* BOX 2: Radar & Discovered Local Devices (Cols 7) */}
            <div className="md:col-span-7 bg-surface-container-lowest border-[3px] border-on-background rounded-3xl p-6 shadow-brutal-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-tertiary-fixed border border-on-background rounded-full animate-ping"></span>
                    <h3 className="text-base sm:text-lg font-black text-on-background">
                      {lang === 'fa' ? 'رادار دستگاه‌های متصل (Peer Radar)' : 'Connected Peer Radar'}
                    </h3>
                  </div>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed border-[2px] border-on-background rounded-full px-3 py-0.5 text-xs font-bold">
                    {p2pStatus === 'connected' ? (lang === 'fa' ? '۱ دستگاه متصل' : '1 Peer Online') : (lang === 'fa' ? 'در انتظار اتصال' : 'Waiting for Peer')}
                  </span>
                </div>
                <p className="text-xs text-on-background/70 font-semibold mb-4">
                  {lang === 'fa' ? 'دستگاه‌هایی که در همین شبکه Wi-Fi این صفحه را باز کرده‌اند خودکار شناسایی می‌شوند:' : 'Devices opening this URL on the same Wi-Fi connect directly:'}
                </p>

                {/* Connected / Nearby Peers List */}
                <div className="flex flex-col gap-2.5">
                  {p2pStatus === 'connected' && connectedDevice ? (
                    <div className="bg-tertiary-fixed/30 border-[2.5px] border-on-background rounded-2xl p-3 shadow-brutal-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-lowest border-[2px] border-on-background rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl text-on-background">
                            {connectedDevice.type === 'phone' ? 'smartphone' : 'laptop_mac'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-on-background">{connectedDevice.name}</span>
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-xs px-2 py-0.2 rounded-full font-bold border border-on-background">
                              {lang === 'fa' ? 'متصل ✓' : 'Connected ✓'}
                            </span>
                          </div>
                          <div className="text-xs text-on-background/70 font-mono dir-ltr flex items-center gap-2">
                            <span>{connectedDevice.id || 'WebRTC DataChannel'}</span>
                            <span>•</span>
                            <span className="text-tertiary-fixed-variant font-bold">Ping: 1ms</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-on-background text-surface-container-lowest border-[2px] border-on-background rounded-full px-3 py-1 text-xs font-bold">
                        {lang === 'fa' ? 'فعال' : 'Active'}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-surface-container-low border-[2px] border-dashed border-on-background rounded-2xl p-4 text-center">
                      <span className="material-symbols-outlined text-3xl text-on-background/50 mb-1 animate-pulse">radar</span>
                      <p className="text-xs font-bold text-on-background/70 mb-2">
                        {lang === 'fa' ? 'هنوز دستگاهی متصل نشده است. کد QR سمت راست را با گوشی اسکن کنید.' : 'No device paired yet. Scan the QR code on the left with your phone.'}
                      </p>
                      
                      {/* Manual Peer Code Input Fallback */}
                      <form onSubmit={handleConnectManual} className="flex gap-2 max-w-sm mx-auto mt-2">
                        <input
                          type="text"
                          value={targetPeerInput}
                          onChange={(e) => setTargetPeerInput(e.target.value)}
                          placeholder={lang === 'fa' ? 'یا کد دستگاه مقابل: مثلاً beam-x4k9...' : 'Or enter peer ID: beam-x4k9...'}
                          className="flex-1 bg-surface-container-lowest border-[2px] border-on-background rounded-full px-3 py-1.5 text-xs font-mono focus:outline-none"
                          dir="ltr"
                        />
                        <button
                          type="submit"
                          disabled={!targetPeerInput.trim() || p2pStatus === 'connecting'}
                          className="bg-secondary-container text-on-background border-[2px] border-on-background rounded-full px-3 py-1.5 text-xs font-bold shadow-brutal-sm btn-brutal shrink-0"
                        >
                          {lang === 'fa' ? 'اتصال 🔗' : 'Pair 🔗'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Telemetry Bottom Bar */}
              <div className="mt-4 pt-3 border-t-[2px] border-on-background/15 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-700">lock</span>
                  <span>{lang === 'fa' ? 'رمزنگاری انتها به انتها WebRTC DataChannel (E2EE)' : 'End-to-End Encrypted WebRTC DataChannel (E2EE)'}</span>
                </span>
                <span className="font-bold bg-secondary-fixed px-2 py-0.5 rounded border border-on-background font-mono text-xs">
                  SCTP / DTLS
                </span>
              </div>
            </div>

          </section>

          {/* ================= FOOTER DOCK ================= */}
          <footer className="w-full bg-transparent border-t-[2.5px] border-on-background py-6 px-4 mt-auto">
            <div className="flex flex-wrap justify-center items-center gap-3 w-full max-w-7xl mx-auto">
              <span className="font-bold text-xs text-on-background bg-secondary-container border-[2.5px] border-on-background rounded-full px-4 py-1.5 shadow-brutal-sm">
                Mr. Builder • 30 Day App Challenge
              </span>
              <a
                className="bg-surface-container-lowest text-on-background border-[2.5px] border-on-background rounded-full px-4 py-1.5 text-xs font-bold shadow-brutal-sm hover:bg-secondary-container transition-all flex items-center gap-1.5 btn-brutal"
                href="https://github.com/mrbuilder-dev/30day-app-challenge"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-sm">code</span>
                <span>Source on GitHub</span>
              </a>
              <a
                className="bg-surface-container-lowest text-on-background border-[2.5px] border-on-background rounded-full px-4 py-1.5 text-xs font-bold shadow-brutal-sm hover:bg-secondary-container transition-all flex items-center gap-1.5 btn-brutal"
                href="https://x.com/MrBuildersai"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-sm">alternate_email</span>
                <span>Developer Twitter</span>
              </a>
              <a
                className="bg-surface-container-lowest text-on-background border-[2.5px] border-on-background rounded-full px-4 py-1.5 text-xs font-bold shadow-brutal-sm hover:bg-secondary-container transition-all flex items-center gap-1.5 btn-brutal"
                href="https://t.me/MrbuildersAI"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-sm">near_me</span>
                <span>Telegram Channel</span>
              </a>
            </div>
          </footer>

        </div>
      )}`;

const updatedContent = content.substring(0, startIndex) + newDesktopView + content.substring(replaceEnd);
fs.writeFileSync(filePath, updatedContent, 'utf-8');
console.log("Successfully replaced desktop view!");
