import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SUHUL HOSPITAL DRUG INFORMATION SYSTEM',
  description: 'SUHUL HOSPITAL Drug Information System for medication visibility, stock status tracking, and safe pharmacy operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
