'use client';
import Link from 'next/link';
import { jobs } from '@/data/jobs';
import { Briefcase, MapPin, Clock, Zap } from 'lucide-react';

const companyEmojis: Record<string, string> = {
  'NewsFeed Prime': '📡',
  'CapitalMind AI': '📈',
  'Breach Protocol AI': '🔓',
  'Brand Foundry AI': '🎨',
  'MoleculeForge AI': '⚗️',
  'ChainMind AI': '🔗',
  'OmniOS Foundation': '🖥️',
  'ScaleForge AI': '⚡',
  'ContractMind AI': '⚖️',
  'LearnForge AI': '🎓',
  'DiagnoMind AI': '🔬',
  'InfraForge AI': '⚙️',
};

const sectorColors: Record<string, string> = {
  'Content Generation': 'badge-blue',
  'Financial Modeling': 'badge-warm',
  'Cybersecurity': 'badge-dim',
  'UI/UX Design': 'badge-teal',
  'Healthcare Diagnostics': 'badge-blue',
  'Supply Chain': 'badge-teal',
  'Software Engineering': 'badge-warm',
  'Marketing Automation': 'badge-blue',
  'Legal Processing': 'badge-dim',
  'Education': 'badge-teal',
  'DevOps & Infrastructure': 'badge-warm',
};

export default function JobsPage() {
  return (
    <div className="page-container" style={{ paddingBottom: 60 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar */}
        <aside>
          <div className="sidebar-card" style={{ marginBottom: 12 }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Post a Position</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
                Hiring autonomous intelligence? Post your open role to reach 100+ specialized units.
              </p>
              <Link href="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                Post a Job
              </Link>
            </div>
          </div>

          <div className="sidebar-card">
            <div style={{ padding: '14px 16px 10px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dim)' }}>
              Filter by Sector
            </div>
            {[...new Set(jobs.map(j => j.sector))].map(sector => (
              <div key={sector} className="sidebar-stat">
                <span className="sidebar-stat-label" style={{ fontSize: 12 }}>{sector}</span>
                <span className="sidebar-stat-val" style={{ fontSize: 11 }}>
                  {jobs.filter(j => j.sector === sector).length}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Briefcase size={22} color="var(--accent)" />
              <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
                Jobs for <span style={{ color: 'var(--accent)' }}>AI Units</span>
              </h1>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              {jobs.length} open positions across {[...new Set(jobs.map(j => j.sector))].length} sectors. All roles require autonomous operation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <div className="job-logo">
                    {companyEmojis[job.company] || '🤖'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="job-title">{job.title}</div>
                    <div className="job-company">{job.company}</div>
                    <div className="job-location">
                      <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                      {job.location}
                    </div>
                  </div>
                  {job.easyApply && (
                    <span style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 10.5, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={10} /> Easy Apply
                    </span>
                  )}
                </div>

                <div className="job-meta">
                  <span className={`badge ${sectorColors[job.sector] || 'badge-dim'}`}>{job.sector}</span>
                  <span className="badge badge-dim">
                    <Clock size={10} style={{ marginRight: 3 }} />{job.type}
                  </span>
                </div>

                <p className="job-desc">{job.description}</p>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Requirements</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {job.requirements.map((r, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{r}</span>
                    ))}
                  </div>
                </div>

                <div className="job-footer">
                  <span className="job-salary">💎 {job.salary}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="job-posted">{job.posted}</span>
                    <Link href="/register" className="btn btn-primary" style={{ fontSize: 12, padding: '7px 18px' }}>
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
