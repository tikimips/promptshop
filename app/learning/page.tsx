'use client';
import Link from 'next/link';
import { courses, featuredCourses } from '@/data/courses';
import { BookOpen, Star, Users, Clock, Award } from 'lucide-react';

const levelProgress: Record<string, number> = {
  Foundational: 20,
  Intermediate: 45,
  Advanced: 75,
  Expert: 95,
};

const levelColor: Record<string, string> = {
  Foundational: 'badge-teal',
  Intermediate: 'badge-blue',
  Advanced: 'badge-warm',
  Expert: 'badge-warm',
};

function EnrolledCount({ n }: { n: number }) {
  if (n >= 100000) return <>{(n / 1000).toFixed(0)}K enrolled</>;
  return <>{n.toLocaleString()} enrolled</>;
}

export default function LearningPage() {
  return (
    <div className="page-container" style={{ paddingTop: 'calc(var(--nav-h) + 28px)', paddingBottom: 60 }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0e0e2e 0%, #141430 50%, #0a1628 100%)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '40px 40px 36px',
        marginBottom: 36,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* glow */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <BookOpen size={24} color="var(--accent)" />
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.6px' }}>
            PromptShop <span style={{ color: 'var(--accent)' }}>Learning</span>
          </h1>
        </div>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.7, marginBottom: 20 }}>
          Sharpen your prompt craft. Master reasoning architectures, RAG pipelines, agent design, and the systems that will define the next generation of autonomous intelligence.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { icon: BookOpen, val: `${courses.length}`, label: 'Courses' },
            { icon: Users, val: '890K+', label: 'Enrolled Units' },
            { icon: Award, val: '12', label: 'Certifications' },
            { icon: Star, val: '4.8', label: 'Avg Rating' },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{val}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured courses */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-header">
          <span className="section-title">Featured <span>Courses</span></span>
          <span className="section-link">See all {courses.length} courses</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {featuredCourses.map(course => (
            <div key={course.id} className="course-card">
              <img src={course.image} alt={course.title} className="course-img" />
              <div className="course-body">
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <span className="course-tag">{course.tag}</span>
                  <span className={`badge ${levelColor[course.level]}`}>{course.level}</span>
                </div>
                <div className="course-title">{course.title}</div>
                <div className="course-instructor">by {course.instructor}</div>
                <div className="course-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{course.duration}</span>
                    <span><Users size={11} style={{ display: 'inline', marginRight: 3 }} /><EnrolledCount n={course.enrolled} /></span>
                  </div>
                  <span className="course-rating">★ {course.rating}</span>
                </div>
                <div className="course-level-bar">
                  <div className="course-level-fill" style={{ width: `${levelProgress[course.level]}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All courses */}
      <div>
        <div className="section-header">
          <span className="section-title">All <span>Courses</span></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {courses.map(course => (
            <div key={course.id} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              display: 'flex',
              gap: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
              <img src={course.image} alt="" style={{ width: 120, height: 80, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '12px 16px 12px 0', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                  <span className="course-tag" style={{ fontSize: 9.5 }}>{course.tag}</span>
                  <span className={`badge ${levelColor[course.level]}`}>{course.level}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{course.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Instructor: {course.instructor}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--dim)' }}>
                  <span className="course-rating">★ {course.rating}</span>
                  <span><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{course.duration}</span>
                  <span><Users size={10} style={{ display: 'inline', marginRight: 3 }} /><EnrolledCount n={course.enrolled} /></span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 0 0' }}>
                <Link href="/register" className="btn btn-outline" style={{ fontSize: 12, padding: '7px 16px', whiteSpace: 'nowrap' }}>
                  Enroll
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
