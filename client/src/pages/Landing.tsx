import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingScene from '../components/LandingScene';

const API = import.meta.env.VITE_SOCKET_URL

function slugify(s: string): string {
  if (!s) return '';
  
  return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
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
        setLoading(false);
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

        .live-dot { animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .squiggle::after {
          content:'';
          position:absolute; bottom:-4px; left:0; right:0; height:4px;
          background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='4'%3E%3Cpath d='M0 2 Q10 0 20 2 Q30 4 40 2' stroke='%23f4804a' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x center;
        }

        .feat-card:hover { transform: translateY(-3px); }
        .feat-card { transition: transform 0.18s; }

        .cta-btn:hover  { background: #2d7ab5 !important; transform: translateY(-1px); }
        .cta-btn:active { transform: translateY(0); }
        .cta-btn { transition: all 0.18s; }
      `}</style>
      
      <div
        className="relative w-screen min-h-screen overflow-x-hidden flex flex-col"
        style={{ background: dark
                ? 'linear-gradient(180deg,#0b0c1a 0%,#111428 50%,#0d1a22 100%)'
                : 'linear-gradient(180deg,#c8e8fb 0%,#dff0fb 45%,#edf7f5 100%)'
              }}
      >
        
        <LandingScene dark={dark} />
        {/* ── Nav ── */}
        <nav className="relative z-10 flex items-center justify-between px-8 pt-6 max-w-5xl mx-auto w-full">
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:30, fontWeight:700, color:dark ? '#47a2fd' : '#2c3e50', display:'flex', alignItems:'center', gap:6 }}>
            drawee
            <span style={{ width:10, height:10, borderRadius:'50%', background:'#f4804a', display:'inline-block', marginBottom:2 }} />
            <button onClick={() => setDark(!dark)} 
              style={{ background:dark ? '#c8e8fb' : '#0b0c1a', border: dark ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid rgba(44,62,80,0.2)', borderRadius: 8, cursor:'pointer', fontSize:22, lineHeight:1, padding:'2px 6px' }}>
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <main className="relative z-10 flex flex-col items-center text-center px-5 mt-12 flex-1">

          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)', border: dark ? '2px dashed rgba(140,120,220,0.4)' : '2px dashed rgba(123,189,232,0.6)', color: dark ? '#8899b8' : '#4a6278', fontSize:12, fontWeight:600, letterSpacing:'0.3px' }}>
            <span className="live-dot inline-block w-2 h-2 rounded-full shrink-0" style={{ background:'#5ab97a' }} />
            no sign-up &nbsp;·&nbsp; just draw
          </div>

          {/* title */}
          <h1 style={{ fontFamily:"'Caveat',cursive", fontSize:'clamp(48px,9vw,80px)', fontWeight:700, color: dark ? '#e8e4d8' : '#2c3e50', lineHeight:1.1, marginBottom:16 }}>
            draw together,<br />
            <span className="squiggle" style={{ color: dark ? '#9d8fe8' : '#3a8fcc', position:'relative', display:'inline-block' }}>right now</span>
          </h1>

          <p className="max-w-md mb-8 font-medium" style={{ fontSize:16, color: dark ? '#7a8fa8' : '#4a6278', lineHeight:1.65, fontFamily:"'Nunito',sans-serif" }}>
            A shared canvas for you and your friends. No accounts, no fuss —
            just a room and your imagination.
          </p>

          {/* ── Glass Card ── */}
          <div className="w-full max-w-sm rounded-3xl p-7"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.82)', backdropFilter:'blur(10px)', border: dark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(255,255,255,0.9)', boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(100,160,210,0.15)' }}>

            {/* tabs */}
            <div className="flex gap-1 rounded-xl p-1 mb-5" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(184,218,245,0.3)' }}>
              {(['create','join'] as const).map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setInput(''); setError(''); }}
                  className="flex-1 py-2 rounded-lg capitalize transition-all"
                  style={mode === m
                    ? { background: dark ? 'rgba(255,255,255,0.12)' : 'white', color: dark ? '#e8e4d8' : '#2c3e50', boxShadow:'0 2px 8px rgba(100,160,210,0.2)', fontFamily:"'Caveat',cursive", fontSize:18, fontWeight:600, border:'none', cursor:'pointer' }
                    : { color: dark ? '#6a7a8a' : '#4a6278', fontFamily:"'Caveat',cursive", fontSize:18, background:'transparent', border:'none', cursor:'pointer' }
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
                style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(223,240,251,0.4)', border: dark ? '2px solid rgba(140,120,220,0.25)' : '2px solid rgba(123,189,232,0.4)', color: dark ? '#c8d4e4' : '#2c3e50', fontFamily:"'Nunito',sans-serif", fontWeight:500, boxSizing:'border-box' }}
                onFocus={e => { e.target.style.borderColor='#7bbde8'; e.target.style.background='rgba(223,240,251,0.6)'; }}
                onBlur={e  => { e.target.style.borderColor='rgba(123,189,232,0.4)'; e.target.style.background='rgba(223,240,251,0.4)'; }}
              />
            </div>

            {error && <p className="text-xs mb-2 text-left" style={{ color:'#e85454' }}>{error}</p>}

            {/* submit */}
            <button
              className="cta-btn w-full py-3 rounded-xl font-bold"
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: dark ? '#5b4fa8' : '#3a8fcc', color:'white', fontFamily:"'Caveat',cursive", fontSize:22, letterSpacing:'0.3px', boxShadow:`0 6px 14px 3px ${dark ? 'rgba(150, 83, 177, 0.541)' : 'rgba(58, 143, 204, 0.562)'}`, border:'none', cursor:'pointer' }}
            >
              {loading ? 'hang on...' : mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>

            <p className="text-center mt-3" style={{ fontSize:12, color: dark ? 'rgba(138,154,180,0.55)' : 'rgba(74,98,120,0.55)', fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>
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
              { icon:'🤖', label:'AI describes',  sub:`Use /describe to ask AI to describe your drawings`, bg:'rgba(74, 77, 244, 0.2)'  }
            ].map(f => (
              <div key={f.label} className="feat-card flex items-center gap-3 rounded-2xl px-5 py-4"
                style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)', border: dark ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(255,255,255,0.9)', flex:'1 1 180px', maxWidth:220 }}>
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background:f.bg }}>
                  {f.icon}
                </div>
                <div>
                  <span className="block" style={{ fontFamily:"'Caveat',cursive", fontSize:17, fontWeight:600, color: dark ? '#c8d4e4' : '#2c3e50' }}>{f.label}</span>
                  <span className="block" style={{ fontSize:12, color: dark ? '#5a6a7a' : '#4a6278', fontWeight:500, fontFamily:"'Nunito',sans-serif" }}>{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="relative z-10 text-center pb-4"
          style={{ fontFamily:"'Caveat',cursive", fontSize:16, color: dark ? 'rgba(138,154,180,0.4)' : 'rgba(74,98,120,0.5)' }}>
          made with ☁️ &amp; crayons
        </footer>
      </div>
    </>
  );
}