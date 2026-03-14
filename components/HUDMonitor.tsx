'use client';
import { useEffect, useRef, useState } from 'react';

const SECTORS = [
  { name: 'Content Gen',    base: 847,  growth: 2.4,  color: '#00ffcc' },
  { name: 'Software Eng',   base: 1203, growth: 1.8,  color: '#9b5de5' },
  { name: 'UI/UX Design',   base: 391,  growth: 3.1,  color: '#f72585' },
  { name: 'Data Science',   base: 622,  growth: 2.9,  color: '#00ffcc' },
  { name: 'Cybersecurity',  base: 289,  growth: 4.2,  color: '#f72585' },
  { name: 'Healthcare Dx',  base: 174,  growth: 1.2,  color: '#9b5de5' },
];

export default function HUDMonitor() {
  const [nodes, setNodes] = useState(4218);
  const [throughput, setThroughput] = useState(78);
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [bars, setBars] = useState(SECTORS.map(s => s.base));
  const [pingSector, setPingSector] = useState<number | null>(null);
  const frameRef = useRef(0);

  // Live-update node count + throughput
  useEffect(() => {
    const iv = setInterval(() => {
      setNodes(n => n + Math.floor(Math.random() * 3));
      setThroughput(t => Math.min(99, Math.max(40, t + (Math.random() - 0.48) * 4)));
      setBars(prev => prev.map((v, i) => v + Math.floor(Math.random() * SECTORS[i].growth)));
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  function startScan() {
    if (scanning) return;
    setScanning(true);
    setScanPct(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 2 + Math.random() * 3;
      setScanPct(Math.min(100, p));
      if (p >= 100) { clearInterval(iv); setTimeout(() => { setScanning(false); setScanPct(0); }, 800); }
    }, 60);
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid rgba(0,255,204,0.15)',
      borderRadius: 4,
      marginBottom: 12,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Mono', monospace",
    }}>
      {/* Corner brackets */}
      {[['top:0;left:0;borderWidth:1.5px 0 0 1.5px',''],['bottom:0;right:0;borderWidth:0 1.5px 1.5px 0','']].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 10, height: 10,
          borderStyle: 'solid',
          borderColor: 'rgba(0,255,204,0.5)',
          ...(i === 0 ? { top: 0, left: 0, borderWidth: '1.5px 0 0 1.5px' } : { bottom: 0, right: 0, borderWidth: '0 1.5px 1.5px 0' }),
          pointerEvents: 'none', zIndex: 2,
        }} />
      ))}

      {/* Header */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(0,255,204,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,255,204,0.6)' }}>NETWORK MONITOR</span>
        <span style={{ fontSize: 8, color: '#9b5de5', letterSpacing: '0.08em' }}>● LIVE</span>
      </div>

      {/* Node count */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(0,255,204,0.06)' }}>
        <div style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 2 }}>NODES ONLINE</div>
        <div style={{ fontSize: 28, fontWeight: 500, color: '#00ffcc', letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {nodes.toLocaleString()}
        </div>
        <div style={{ fontSize: 8, color: 'var(--muted)', marginTop: 2 }}>
          +{Math.floor(throughput / 10)} new / min
        </div>
      </div>

      {/* Throughput bar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(0,255,204,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.08em' }}>NET THROUGHPUT</span>
          <span style={{ fontSize: 8, color: '#00ffcc' }}>{Math.round(throughput)}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${throughput}%`,
            background: 'linear-gradient(90deg, #00ffcc, #9b5de5)',
            transition: 'width 1.5s ease',
            boxShadow: '0 0 8px rgba(0,255,204,0.4)',
          }} />
        </div>
      </div>

      {/* Sector growth bars */}
      <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid rgba(0,255,204,0.06)' }}>
        <div style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 6 }}>SECTOR GROWTH</div>
        {SECTORS.map((s, i) => {
          const maxVal = Math.max(...bars);
          const pct = (bars[i] / maxVal) * 100;
          const isPinged = pingSector === i;
          return (
            <div key={i}
              onClick={() => { setPingSector(i); setTimeout(() => setPingSector(null), 600); }}
              style={{ marginBottom: 5, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 7.5, color: isPinged ? s.color : 'var(--muted)', transition: 'color 0.2s', letterSpacing: '0.06em' }}>{s.name.toUpperCase()}</span>
                <span style={{ fontSize: 7.5, color: s.color, opacity: 0.8 }}>{bars[i].toLocaleString()}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 1,
                  width: `${pct}%`,
                  background: s.color,
                  opacity: isPinged ? 1 : 0.7,
                  boxShadow: isPinged ? `0 0 8px ${s.color}` : 'none',
                  transition: 'width 1.5s ease, box-shadow 0.2s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scan button */}
      <div style={{ padding: '10px 14px' }}>
        {scanning ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 8, color: '#00ffcc', letterSpacing: '0.08em' }}>SCANNING...</span>
              <span style={{ fontSize: 8, color: '#00ffcc' }}>{Math.round(scanPct)}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <div style={{ height: '100%', borderRadius: 1, width: `${scanPct}%`, background: 'linear-gradient(90deg, #9b5de5, #00ffcc)', boxShadow: '0 0 10px rgba(0,255,204,0.5)', transition: 'width 0.08s linear' }} />
            </div>
          </div>
        ) : (
          <button onClick={startScan} style={{
            width: '100%', padding: '7px', background: 'rgba(0,255,204,0.06)',
            border: '1px solid rgba(0,255,204,0.25)', borderRadius: 2,
            color: '#00ffcc', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
            fontFamily: "'DM Mono', monospace", cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,204,0.12)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(0,255,204,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,204,0.06)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            ⟳ Scan Network
          </button>
        )}
      </div>
    </div>
  );
}
