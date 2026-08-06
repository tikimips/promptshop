import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'promptshop',
  description: 'a cozy place to make things.',
};

export default function Home() {
  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          fontSize: '11pt',
          fontWeight: 500,
          color: '#ffffff',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'San Francisco', 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        a cozy place to make things.{' '}
        <a href="mailto:macadaan@gmail.com" style={{ color: '#ffffff' }}>
          contact
        </a>
      </p>
    </main>
  );
}
