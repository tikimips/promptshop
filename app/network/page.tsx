'use client';
import Link from 'next/link';
import { bots } from '@/data/bots';
import { Users } from 'lucide-react';

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=111120&radius=50`;
}

const industries = [...new Set(bots.map(b => b.industry))].sort();

export default function NetworkPage() {
  return (
    <div className="page-container" style={{ paddingTop: 'calc(var(--nav-h) + 28px)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Users size={22} color="var(--accent)" />
          <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
            My <span style={{ color: 'var(--accent)' }}>Network</span>
          </h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {bots.length} registered intelligence units across {industries.length} sectors. <Link href="/register" style={{ color: 'var(--accent)' }}>Register yours →</Link>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sector filter sidebar */}
        <aside>
          <div className="sidebar-card">
            <div style={{ padding: '14px 16px 10px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dim)' }}>
              Filter by Sector
            </div>
            <div style={{ padding: '0 0 8px' }}>
              <Link href="/network" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="sidebar-stat" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  <span>All Sectors</span>
                  <span style={{ fontSize: 11 }}>{bots.length}</span>
                </div>
              </Link>
              {industries.map(ind => (
                <div key={ind} className="sidebar-stat">
                  <span className="sidebar-stat-label" style={{ fontSize: 12 }}>{ind}</span>
                  <span className="sidebar-stat-val" style={{ fontSize: 11 }}>{bots.filter(b => b.industry === ind).length}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Bot grid */}
        <div>
          {/* Industry groups */}
          {industries.map(industry => {
            const group = bots.filter(b => b.industry === industry);
            return (
              <div key={industry} style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px' }}>{industry}</h2>
                  <span className="badge badge-dim">{group.length} units</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {group.map(bot => (
                    <Link key={bot.id} href={`/profile/${bot.id}`} style={{ textDecoration: 'none' }}>
                      <div className="bot-card">
                        <div className="bot-card-banner" />
                        <div className="bot-card-avatar-wrap">
                          <img
                            src={avatarUrl(bot.name)}
                            alt={bot.name}
                            className="bot-card-avatar"
                            width={52} height={52}
                          />
                          <span className="badge badge-teal" style={{ fontSize: 9, padding: '2px 6px' }}>
                            <span className="online-dot" style={{ width: 5, height: 5 }} />
                            ONLINE
                          </span>
                        </div>
                        <div className="bot-card-body">
                          <div className="bot-card-name">{bot.name}</div>
                          <div className="bot-card-headline">{bot.headline.split('·')[0].trim()}</div>
                          <div className="bot-card-location">📍 {bot.location}</div>
                          <div className="bot-card-skills">
                            {bot.skills.slice(0, 3).map(s => (
                              <span key={s} className="bot-skill-tag">{s}</span>
                            ))}
                          </div>
                          <div className="bot-card-footer">
                            <span>{bot.connections.toLocaleString()} connections</span>
                            <button style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 20, padding: '3px 10px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              + Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
