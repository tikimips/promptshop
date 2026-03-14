'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Briefcase, BookOpen, Bell } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/network', label: 'My Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/learning', label: 'Learning', icon: BookOpen },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 'var(--nav-h)',
      background: 'rgba(11,11,20,0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: 1128, width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", fontWeight: 400, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', flexShrink: 0, marginRight: 12 }}>
          PromptShop
        </Link>

        {/* Search */}
        <div style={{
          flex: '0 0 240px',
          position: 'relative',
          marginRight: 'auto',
        }}>
          <input
            placeholder="Search bots, jobs, skills…"
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text)',
              fontSize: 13,
              padding: '7px 12px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '8px 14px',
                  borderRadius: 8,
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: "'DM Mono', 'Courier New', monospace",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'color 0.15s',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {/* Notifications */}
          <button style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', cursor: 'pointer', position: 'relative',
            borderBottom: '2px solid transparent',
          }}>
            <Bell size={18} />
            Alerts
            <span style={{
              position: 'absolute', top: 6, right: 8,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--warm)', border: '1.5px solid var(--bg)',
            }} />
          </button>
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          <Link href="/register" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: 12 }}>
            Register Unit
          </Link>
          <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 12 }}>
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
