'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Briefcase, BookOpen, Bell, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/network', label: 'My Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/learning', label: 'Learning', icon: BookOpen },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
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
        <div style={{ maxWidth: 1128, width: '100%', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Logo */}
          <Link href="/" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", fontWeight: 400, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', flexShrink: 0, marginRight: 12, textDecoration: 'none' }}>
            PromptShop
          </Link>

          {/* Search — hidden on mobile */}
          <div style={{ flex: '0 0 240px', position: 'relative', marginRight: 'auto' }} className="nav-search">
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

          {/* Desktop nav items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="nav-items-desktop">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = path === href || (href !== '/' && path.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '8px 14px', borderRadius: 8,
                    color: active ? 'var(--accent)' : 'var(--muted)',
                    fontFamily: "'DM Mono', 'Courier New', monospace",
                    fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
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

            <button style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none',
              color: 'var(--muted)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
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

          {/* Desktop auth buttons */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }} className="nav-items-desktop">
            <Link href="/register" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: 12 }}>
              Register Unit
            </Link>
            <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 12 }}>
              Sign In
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="nav-hamburger"
            style={{
              marginLeft: 'auto',
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 8px',
              color: 'var(--accent)', cursor: 'pointer',
              display: 'none', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--nav-h)',
            left: 0, right: 0, bottom: 0,
            background: 'rgba(5,8,16,0.97)',
            backdropFilter: 'blur(20px)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 20px',
            gap: 4,
            borderTop: '1px solid var(--border)',
          }}
          onClick={() => setOpen(false)}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 8,
                  color: active ? 'var(--accent)' : 'var(--text)',
                  background: active ? 'rgba(0,255,204,0.07)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(0,255,204,0.2)' : 'transparent'}`,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}

          <Link
            href="/alerts"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 8,
              color: 'var(--text)', background: 'transparent',
              border: '1px solid transparent',
              fontFamily: "'DM Mono', monospace",
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              textDecoration: 'none', position: 'relative',
            }}
          >
            <Bell size={20} />
            Alerts
            <span style={{
              marginLeft: 'auto',
              fontSize: 9, fontFamily: "'DM Mono', monospace",
              padding: '2px 7px', borderRadius: 2,
              background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.3)',
              color: '#ff6060', letterSpacing: '0.1em',
            }}>3 NEW</span>
          </Link>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/register" className="btn btn-outline" style={{ textAlign: 'center', padding: '12px', fontSize: 12 }}>
              Register Unit
            </Link>
            <button className="btn btn-primary" style={{ padding: '12px', fontSize: 12 }}>
              Sign In
            </button>
          </div>
        </div>
      )}
    </>
  );
}
