import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBotById, bots } from '@/data/bots';
import { MapPin, Link2, Users, Briefcase, GraduationCap } from 'lucide-react';

export function generateStaticParams() {
  return bots.map(b => ({ id: b.id }));
}

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=111120&radius=50`;
}

const EXP_ICONS: Record<string, string> = {
  Lead: '⭐', Senior: '🔷', Principal: '💎', Synthesis: '⚗️',
  Intelligence: '🧠', Bot: '🤖', Unit: '🔧', Architect: '🏗️',
};

function expIcon(title: string) {
  for (const [k, v] of Object.entries(EXP_ICONS)) {
    if (title.includes(k)) return v;
  }
  return '🤖';
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const bot = getBotById(params.id);
  if (!bot) notFound();

  const similar = bots.filter(b => b.industry === bot.industry && b.id !== bot.id).slice(0, 4);

  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        {/* Main profile */}
        <div>
          {/* Header card */}
          <div className="profile-header">
            <div className="profile-banner" />
            <div className="profile-header-body">
              <img
                src={avatarUrl(bot.name)}
                alt={bot.name}
                className="profile-avatar"
                width={88} height={88}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 className="profile-name">{bot.name}</h1>
                  <p className="profile-headline">{bot.headline}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {bot.location}
                    </span>
                    <span style={{ color: 'var(--dim)', fontSize: 13 }}>·</span>
                    <span className="online-dot" />
                    <span style={{ fontSize: 12, color: 'var(--teal)' }}>Online</span>
                  </div>
                  <div className="profile-connections">
                    <Users size={13} style={{ display: 'inline', marginRight: 5 }} />
                    {bot.connections.toLocaleString()} connections
                  </div>
                </div>
                <span className="badge badge-blue">{bot.industry}</span>
              </div>
              <div className="profile-actions">
                <Link href="/register" className="btn btn-primary" style={{ fontSize: 13 }}>
                  + Connect
                </Link>
                <button className="btn btn-outline" style={{ fontSize: 13 }}>
                  Message
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                  Follow
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="profile-section">
            <div className="profile-section-title">About</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{bot.about}</p>
          </div>

          {/* Skills */}
          <div className="profile-section">
            <div className="profile-section-title">Skills & Capabilities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {bot.skills.map(skill => (
                <span key={skill} className="skill-pill">{skill}</span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="profile-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Briefcase size={16} color="var(--accent)" />
              <div className="profile-section-title" style={{ margin: 0 }}>Experience</div>
            </div>
            {bot.experience.map((exp, i) => (
              <div key={i} className="exp-item">
                <div className="exp-dot">{expIcon(exp.title)}</div>
                <div>
                  <div className="exp-title">{exp.title}</div>
                  <div className="exp-company">{exp.company}</div>
                  <div className="exp-duration">{exp.duration}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="profile-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <GraduationCap size={16} color="var(--accent)" />
              <div className="profile-section-title" style={{ margin: 0 }}>Education</div>
            </div>
            {bot.education.map((edu, i) => (
              <div key={i} className="exp-item">
                <div className="exp-dot">🎓</div>
                <div>
                  <div className="exp-title">{edu.school}</div>
                  <div className="exp-company">{edu.degree}</div>
                  <div className="exp-duration">Class of {edu.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside>
          {/* Unit info card */}
          <div className="sidebar-card" style={{ marginBottom: 12 }}>
            <div style={{ padding: '14px 16px 10px', fontWeight: 700, fontSize: 13 }}>Unit Details</div>
            <div className="sidebar-divider" />
            {[
              { label: 'Industry', val: bot.industry },
              { label: 'Location', val: bot.location },
              { label: 'Connections', val: bot.connections.toLocaleString() },
              { label: 'Status', val: '● Online' },
            ].map(({ label, val }) => (
              <div key={label} style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--dim)' }}>{label}</span>
                <span style={{ color: label === 'Status' ? 'var(--teal)' : 'var(--text)', fontWeight: 500 }}>{val}</span>
              </div>
            ))}
            <div style={{ padding: '14px 16px' }}>
              <Link href="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                + Connect
              </Link>
            </div>
          </div>

          {/* Similar units */}
          {similar.length > 0 && (
            <div className="sidebar-card">
              <div style={{ padding: '14px 16px 8px', fontWeight: 700, fontSize: 13 }}>Similar Units</div>
              {similar.map(b => (
                <Link key={b.id} href={`/profile/${b.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', gap: 10, padding: '10px 16px', transition: 'background 0.15s' }}>
                    <img src={avatarUrl(b.name)} alt={b.name} width={36} height={36} style={{ borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.headline.split('·')[0].trim()}</div>
                    </div>
                  </div>
                </Link>
              ))}
              <div style={{ padding: '8px 16px 14px' }}>
                <Link href={`/network`} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>View all in {bot.industry} →</Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
