interface LandingSceneProps {
  dark: boolean;
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

function Bat({ small }: { small?: boolean }) {
  const s = small ? 14 : 20;
  return (
    <svg width={s * 2} height={s} viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg" opacity={0.5}>
      {/* left wing */}
      <path d="M18 10 Q10 2 2 6 Q8 8 10 14 Q14 8 18 10" fill="rgba(180,160,240,0.7)" />
      {/* right wing */}
      <path d="M22 10 Q30 2 38 6 Q32 8 30 14 Q26 8 22 10" fill="rgba(180,160,240,0.7)" />
      {/* body */}
      <ellipse cx="20" cy="11" rx="3" ry="2.5" fill="rgba(150,130,210,0.9)" />
      {/* ears */}
      <path d="M18 9 L16 5 L19 8" fill="rgba(150,130,210,0.9)" />
      <path d="M22 9 L24 5 L21 8" fill="rgba(150,130,210,0.9)" />
    </svg>
  );
}

export default function LandingScene({ dark }: LandingSceneProps) {
  return (
    <>
      <style>{`
        .scene-sun-pulse {
          animation: sceneSunPulse 4s ease-in-out infinite;
        }
        @keyframes sceneSunPulse {
          0%,100% { box-shadow: 0 0 0 14px rgba(249,215,74,0.2), 0 0 0 28px rgba(249,215,74,0.1); }
          50%      { box-shadow: 0 0 0 20px rgba(249,215,74,0.25), 0 0 0 40px rgba(249,215,74,0.1); }
        }

        .scene-moon-glow {
          animation: sceneMoonGlow 4s ease-in-out infinite;
        }
        @keyframes sceneMoonGlow {
          0%,100% { box-shadow: 0 0 0 10px rgba(232,224,200,0.07), 0 0 0 22px rgba(232,224,200,0.04); }
          50%      { box-shadow: 0 0 0 16px rgba(232,224,200,0.1),  0 0 0 32px rgba(232,224,200,0.05); }
        }

        .scene-cloud-1 { animation: sceneDrift 18s ease-in-out infinite; }
        .scene-cloud-2 { animation: sceneDrift 24s ease-in-out infinite reverse; }
        .scene-cloud-3 { animation: sceneDrift 20s ease-in-out infinite 3s; }
        @keyframes sceneDrift {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(18px); }
        }

        .scene-bird-1 { animation: sceneFly 28s linear infinite; }
        .scene-bird-2 { animation: sceneFly 36s linear infinite 5s; }
        .scene-bat-1  { animation: sceneFly 22s linear infinite 2s; }
        .scene-bat-2  { animation: sceneFly 30s linear infinite 8s; }
        @keyframes sceneFly {
          0%   { transform: translateX(-80px); }
          100% { transform: translateX(110vw); }
        }

        .scene-star { animation: sceneTwinkle 3s ease-in-out infinite; }
        .scene-star:nth-child(2) { animation-delay: 0.8s; }
        .scene-star:nth-child(3) { animation-delay: 1.6s; }
        .scene-star:nth-child(4) { animation-delay: 0.4s; }
        .scene-star:nth-child(5) { animation-delay: 2.1s; }
        @keyframes sceneTwinkle {
          0%,100% { opacity: 0.9; }
          50%      { opacity: 0.3; }
        }
      `}</style>

      {/* ── Sun / Moon ── */}
      {dark ? (
        <div
          className="scene-moon-glow absolute -top-7.5 right-20 z-0 pointer-events-none w-24 h-24 rounded-full overflow-hidden"
          style={{ background: '#e8e0c8' }}
        >
          {/* crescent bite — same bg as the page dark gradient top */}
          <div
            className="absolute rounded-full"
            style={{ width: 72, height: 72, top: -8, right: -8, background: '#0b0c1a' }}
          />
        </div>
      ) : (
        <div
          className="scene-sun-pulse absolute -top-7.5 right-20 z-0 pointer-events-none w-24 h-24 rounded-full"
          style={{ background: '#f9d74a' }}
        />
      )}

      {/* ── Clouds (light only) ── */}
      {!dark && (
        <>
          <div className="scene-cloud-1 absolute top-[8%]  left-[6%]  z-0 pointer-events-none"><Cloud width={120} /></div>
          <div className="scene-cloud-2 absolute top-[14%] left-[62%] z-0 pointer-events-none"><Cloud width={88}  /></div>
          <div className="scene-cloud-3 absolute top-[5%]  left-[82%] z-0 pointer-events-none"><Cloud width={68}  /></div>
        </>
      )}

      {/* ── Stars (dark only) ── */}
      {dark && (
        <svg
          className="absolute top-0 left-0 w-full pointer-events-none z-0"
          style={{ height: '55%' }}
          viewBox="0 0 1440 300"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {[
            [80,   30], [200, 18], [380, 55], [520, 20], [680, 40],
            [820,  15], [960, 50], [1100,22], [1260,44], [1400,18],
            [140,  80], [340, 90], [600, 70], [780, 95], [1020,75],
            [1180, 88], [440,130], [900,120], [1300,110],[60,  140],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              className="scene-star"
              cx={cx} cy={cy}
              r={i % 3 === 0 ? 1.8 : i % 3 === 1 ? 1.2 : 0.9}
              fill="white"
              opacity={0.6 + (i % 4) * 0.1}
            />
          ))}
        </svg>
      )}

      {/* ── Birds (light) / Bats (dark) ── */}
      {dark ? (
        <>
          <div className="scene-bat-1 absolute top-[18%] z-0 pointer-events-none"><Bat /></div>
          <div className="scene-bat-2 absolute top-[28%] z-0 pointer-events-none opacity-60"><Bat small /></div>
        </>
      ) : (
        <>
          <div className="scene-bird-1 absolute top-[20%] z-0 pointer-events-none"><Bird /></div>
          <div className="scene-bird-2 absolute top-[26%] z-0 pointer-events-none opacity-40"><Bird small /></div>
        </>
      )}

      {/* ── Grass ── */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none z-0"
        style={{ height: 60, opacity: dark ? 0.15 : 1 }}
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
      >
        <path d="M0,40 Q60,10 120,35 Q180,55 240,30 Q300,8 360,32 Q420,52 480,28 Q540,6 600,30 Q660,52 720,28 Q780,6 840,32 Q900,54 960,30 Q1020,8 1080,34 Q1140,54 1200,30 Q1260,8 1320,36 Q1380,56 1440,32 L1440,60 L0,60 Z" fill="#c0e8c0" opacity="0.7"/>
        <path d="M0,50 Q90,30 180,46 Q270,58 360,44 Q450,30 540,48 Q630,60 720,44 Q810,30 900,48 Q990,60 1080,44 Q1170,30 1260,48 Q1350,60 1440,46 L1440,60 L0,60 Z" fill="#a8d8a0" opacity="0.8"/>
      </svg>
    </>
  );
}