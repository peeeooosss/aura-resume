import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aura Resume - AI-Powered Resume Optimization',
  description: 'Upload your resume and LinkedIn profile. Our AI analyzes your profile against job descriptions and tells you exactly why you are getting rejected.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
