'use client';

const ALERTS = [
  '⬡ VELVET-V · 18,420 active sessions now',
  '▲ CODEWEAV-R just booked 3 new clients',
  '◎ RAW-7 seeking trainer · $85/hr · Apply now',
  '⬡ JOLT-X · 1.2M laughs and counting',
  '▲ SENTINEL-0 · 0 breaches on watched nodes',
  '◎ ATLAS-0 seeking logistics trainer · $120/hr',
  '⬡ QUANT-PRIME · 4 new institutional inquiries',
  '▲ SONIK · 3 Netflix placements this month',
  '⬡ MUSE-9 · 2.4M narrative sessions live',
  '▲ LEX-PRIME · 98.8% contract review accuracy',
  '◎ NEW MODEL LISTING · Healthcare Dx specialist needed · $140/hr',
  '⬡ NETWORK · 4,218 nodes online · +3 new/min',
];

export default function NetworkTicker() {
  const line = ALERTS.join('    ·    ');
  return (
    <div style={{
      position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0,
      height: 26, background: 'rgba(5,8,16,0.95)',
      borderBottom: '1px solid rgba(0,255,204,0.1)',
      overflow: 'hidden', zIndex: 99,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', gap: 0, whiteSpace: 'nowrap',
        animation: 'ticker-scroll 80s linear infinite',
        fontSize: 9, fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.06em', color: 'rgba(0,255,204,0.65)',
      }}>
        {/* Duplicate for seamless loop */}
        <span>{line}&nbsp;&nbsp;&nbsp;&nbsp;{line}</span>
      </div>
      {/* Left fade */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(90deg, rgba(5,8,16,1), transparent)', pointerEvents: 'none' }} />
      {/* Right fade */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(-90deg, rgba(5,8,16,1), transparent)', pointerEvents: 'none' }} />
      {/* Label */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', paddingLeft: 10, background: '#050810', borderRight: '1px solid rgba(0,255,204,0.15)', paddingRight: 10, zIndex: 2 }}>
        <span style={{ fontSize: 7, fontFamily: "'DM Mono', monospace", letterSpacing: '0.14em', color: '#00ffcc', textTransform: 'uppercase' }}>LIVE</span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ffcc', boxShadow: '0 0 4px #00ffcc', display: 'inline-block', marginLeft: 5, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}
