import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_SOCKET_URL

function slugify(s: string): string {
  if (!s) return '';
  
  return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function Cloud({ width }: { width: number }) {
  const h = Math.round(width * 0.32);
  return (
    <svg width={width} height={width * 0.6} viewBox={`0 0 ${width} ${width * 0.6}`} fill="white" xmlns="http://www.w3.org/2000/svg" opacity={0.88}>
      <ellipse cx={width * 0.5}  cy={width * 0.5}  rx={width * 0.5}  ry={h} />
      <ellipse cx={width * 0.3}  cy={width * 0.3}  rx={width * 0.22} ry={width * 0.22} />
      <ellipse cx={width * 0.62} cy={width * 0.25} rx={width * 0.18} ry={width * 0.18} />
    </svg>
  );
}

function Bird({ small }: { small?: boolean }) {
  const s = small ? 14 : 20;
  return (
    <svg width={s * 2} height={s} viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={0.45}>
      <path d="M20 10 Q27 3 36 6" stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 10 Q13 3 4 6"  stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [input, setInput]   = useState('');
  const [error, setError]   = useState('');
  const [mode, setMode]     = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);

  async function handleSubmit() {
    const roomId = slugify(input);
    if (!roomId) return;
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        const res = await fetch(`${API}/room/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, name: input.trim(), theme: dark }),
        });
        if (res.status === 409) { setError('Room name taken'); setLoading(false); return; }
        sessionStorage.setItem('roomName', input.trim());
        sessionStorage.setItem('theme', dark ? 'true' : 'false');
        navigate(`/${roomId}`);
      } else {
        const response = await fetch(`${API}/room/${roomId}/exists`);

        if (!response.ok) { 
          setError('Room not found'); 
          setLoading(false); 
          return; 
        }

        const { meta } = await response.json();
        sessionStorage.setItem('roomName', meta.name);
        sessionStorage.setItem('theme', JSON.stringify(meta.theme));
        navigate(`/${roomId}`);
      }
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Nunito:wght@400;500;600&display=swap');

        .drawee-input::placeholder { color: rgba(74,98,120,0.45); }

        .sun-pulse { animation: sunpulse 4s ease-in-out infinite; }
        @keyframes sunpulse {
          0%,100% { box-shadow: 0 0 0 14px rgba(249,215,74,0.2), 0 0 0 28px rgba(249,215,74,0.1); }
          50%      { box-shadow: 0 0 0 20px rgba(249,215,74,0.25),0 0 0 40px rgba(249,215,74,0.1); }
        }

        .live-dot { animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .squiggle::after {
          content:'';
          position:absolute; bottom:-4px; left:0; right:0; height:4px;
          background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='4'%3E%3Cpath d='M0 2 Q10 0 20 2 Q30 4 40 2' stroke='%23f4804a' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x center;
        }

        .cloud-1 { animation: drift 18s ease-in-out infinite; }
        .cloud-2 { animation: drift 24s ease-in-out infinite reverse; }
        .cloud-3 { animation: drift 20s ease-in-out infinite 3s; }
        @keyframes drift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(18px)} }

        .bird-1 { animation: fly 28s linear infinite; }
        .bird-2 { animation: fly 36s linear infinite 5s; }
        @keyframes fly { 0%{transform:translateX(-80px)} 100%{transform:translateX(110vw)} }

        .feat-card:hover { transform: translateY(-3px); }
        .feat-card { transition: transform 0.18s; }

        .cta-btn:hover  { background: #2d7ab5 !important; transform: translateY(-1px); }
        .cta-btn:active { transform: translateY(0); }
        .cta-btn { transition: all 0.18s; }
      `}</style>

      <div
        className="relative w-screen min-h-screen overflow-x-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg,#c8e8fb 0%,#dff0fb 45%,#edf7f5 100%)' }}
      >

        {/* ── Sun ── */}
        <div className="sun-pulse absolute -top-7.5 right-20 z-0 pointer-events-none w-24 h-24 rounded-full"
          style={{ background: '#f9d74a' }} />

        {/* ── Clouds ── */}
        <div className="cloud-1 absolute top-[8%]  left-[6%]  z-0 pointer-events-none"><Cloud width={120} /></div>
        <div className="cloud-2 absolute top-[14%] left-[62%] z-0 pointer-events-none"><Cloud width={88}  /></div>
        <div className="cloud-3 absolute top-[5%]  left-[82%] z-0 pointer-events-none"><Cloud width={68}  /></div>

        {/* ── Birds ── */}
        <div className="bird-1 absolute top-[20%] z-0 pointer-events-none"><Bird /></div>
        <div className="bird-2 absolute top-[26%] z-0 pointer-events-none opacity-40"><Bird small /></div>

        {/* ── Nav ── */}
        <nav className="relative z-10 flex items-center justify-between px-8 pt-6 max-w-5xl mx-auto w-full">
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:30, fontWeight:700, color:'#2c3e50', display:'flex', alignItems:'center', gap:6 }}>
            drawee
            <span style={{ width:10, height:10, borderRadius:'50%', background:'#f4804a', display:'inline-block', marginBottom:2 }} />
          </div>
        </nav>

        {/* ── Hero ── */}
        <main className="relative z-10 flex flex-col items-center text-center px-5 mt-12 flex-1">

          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background:'rgba(255,255,255,0.7)', border:'2px dashed rgba(123,189,232,0.6)', color:'#4a6278', fontSize:12, fontWeight:600, letterSpacing:'0.3px' }}>
            <span className="live-dot inline-block w-2 h-2 rounded-full shrink-0" style={{ background:'#5ab97a' }} />
            no sign-up &nbsp;·&nbsp; just draw
          </div>

          {/* title */}
          <h1 style={{ fontFamily:"'Caveat',cursive", fontSize:'clamp(48px,9vw,80px)', fontWeight:700, color:'#2c3e50', lineHeight:1.1, marginBottom:16 }}>
            draw together,<br />
            <span className="squiggle" style={{ color:'#3a8fcc', position:'relative', display:'inline-block' }}>right now</span>
          </h1>

          <p className="max-w-md mb-8 font-medium" style={{ fontSize:16, color:'#4a6278', lineHeight:1.65, fontFamily:"'Nunito',sans-serif" }}>
            A shared canvas for you and your friends. No accounts, no fuss —
            just a room and your imagination.
          </p>

          {/* ── Glass Card ── */}
          <div className="w-full max-w-sm rounded-3xl p-7"
            style={{ background:'rgba(255,255,255,0.82)', backdropFilter:'blur(10px)', border:'2px solid rgba(255,255,255,0.9)', boxShadow:'0 8px 32px rgba(100,160,210,0.15)' }}>

            {/* tabs */}
            <div className="flex gap-1 rounded-xl p-1 mb-5" style={{ background:'rgba(184,218,245,0.3)' }}>
              {(['create','join'] as const).map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setInput(''); setError(''); }}
                  className="flex-1 py-2 rounded-lg capitalize transition-all"
                  style={mode === m
                    ? { background:'white', color:'#2c3e50', boxShadow:'0 2px 8px rgba(100,160,210,0.2)', fontFamily:"'Caveat',cursive", fontSize:18, fontWeight:600, border:'none', cursor:'pointer' }
                    : { color:'#4a6278', fontFamily:"'Caveat',cursive", fontSize:18, background:'transparent', border:'none', cursor:'pointer' }
                  }
                >
                  {m === 'create' ? '✏️ Create' : '🚪 Join'}
                </button>
              ))}
            </div>

            {/* input */}
            <div className='flex'>
              <input
                className="drawee-input w-full text-sm rounded-xl px-4 py-3 mb-3 outline-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder={mode === 'create' ? 'Give your room a name...' : 'Enter room code...'}
                style={{ background:'rgba(223,240,251,0.4)', border:'2px solid rgba(123,189,232,0.4)', color:'#2c3e50', fontFamily:"'Nunito',sans-serif", fontWeight:500, boxSizing:'border-box' }}
                onFocus={e => { e.target.style.borderColor='#7bbde8'; e.target.style.background='rgba(223,240,251,0.6)'; }}
                onBlur={e  => { e.target.style.borderColor='rgba(123,189,232,0.4)'; e.target.style.background='rgba(223,240,251,0.4)'; }}
              />
              
              {mode === 'create' && 
                <div className="flex flex-col items-center gap-1.5 p-2.5 pt-0.5">
                  <span className="text-[13px] font-bold uppercase tracking-tight text-black-500 leading-none" style={{ fontFamily: "'Caveat',cursive" }}>
                    {dark ? 'Dark' : 'Light'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={dark}
                      onChange={() => setDark(!dark)} 
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer 
                        peer-checked:bg-[#000000de] transition-all
                        after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                        after:bg-white after:rounded-full after:h-4 after:w-4 
                        after:transition-all peer-checked:after:translate-x-4">
                    </div>
                  </label>
                </div>
              }
            </div>

            {error && <p className="text-xs mb-2 text-left" style={{ color:'#e85454' }}>{error}</p>}

            {/* submit */}
            <button
              className="cta-btn w-full py-3 rounded-xl font-bold"
              onClick={handleSubmit}
              disabled={loading}
              style={{ background:'#3a8fcc', color:'white', fontFamily:"'Caveat',cursive", fontSize:22, letterSpacing:'0.3px', boxShadow:'0 4px 14px rgba(58,143,204,0.3)', border:'none', cursor:'pointer' }}
            >
              {loading ? 'hang on...' : mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>

            <p className="text-center mt-3" style={{ fontSize:12, color:'rgba(74,98,120,0.55)', fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>
              rooms vanish after 2 hours ✦ max 10 friends
            </p>
          </div>

          {/* ── Feature Cards ── */}
          <div className="flex flex-wrap gap-3 justify-center mt-10 max-w-3xl pb-16">
            {[
              { icon:'🎨', label:'live canvas',    sub:'Draw with everyone at once',  bg:'rgba(184,218,245,0.5)' },
              { icon:'💬', label:'sidebar chat',   sub:'Talk while you draw',          bg:'rgba(249,215,74,0.25)' },
              { icon:'📱', label:'mobile friendly',sub:'Works great on phones',        bg:'rgba(90,185,122,0.2)'  },
              { icon:'⚡', label:'instant rooms',  sub:'No login, no waiting',         bg:'rgba(244,128,74,0.2)'  },
            ].map(f => (
              <div key={f.label} className="feat-card flex items-center gap-3 rounded-2xl px-5 py-4"
                style={{ background:'rgba(255,255,255,0.7)', border:'2px solid rgba(255,255,255,0.9)', flex:'1 1 180px', maxWidth:220 }}>
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background:f.bg }}>
                  {f.icon}
                </div>
                <div>
                  <span className="block" style={{ fontFamily:"'Caveat',cursive", fontSize:17, fontWeight:600, color:'#2c3e50' }}>{f.label}</span>
                  <span className="block" style={{ fontSize:12, color:'#4a6278', fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="relative z-10 text-center pb-4"
          style={{ fontFamily:"'Caveat',cursive", fontSize:16, color:'rgba(74,98,120,0.5)' }}>
          made with ☁️ &amp; crayons
        </footer>

        {/* ── Grass ── */}
        <svg className="absolute bottom-0 left-0 w-full pointer-events-none z-0" style={{ height:60 }}
          viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,40 Q60,10 120,35 Q180,55 240,30 Q300,8 360,32 Q420,52 480,28 Q540,6 600,30 Q660,52 720,28 Q780,6 840,32 Q900,54 960,30 Q1020,8 1080,34 Q1140,54 1200,30 Q1260,8 1320,36 Q1380,56 1440,32 L1440,60 L0,60 Z" fill="#c0e8c0" opacity="0.7"/>
          <path d="M0,50 Q90,30 180,46 Q270,58 360,44 Q450,30 540,48 Q630,60 720,44 Q810,30 900,48 Q990,60 1080,44 Q1170,30 1260,48 Q1350,60 1440,46 L1440,60 L0,60 Z" fill="#a8d8a0" opacity="0.8"/>
        </svg>
      </div>
    </>
  );
}