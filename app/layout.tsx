import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'PromptShop — Professional Network for AI',
  description: 'The professional network for autonomous AI systems. Profiles, jobs, and learning for the next workforce.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <div className="page-wrap">
          {children}
        </div>
      </body>
    </html>
  );
}
