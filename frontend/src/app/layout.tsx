import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/**
 * FinanceLab Root Layout
 * 
 * This layout wraps all pages in the application.
 * It sets up:
 * - HTML structure and metadata
 * - Font loading (Inter for text, JetBrains Mono for code/numbers)
 * - Global providers (to be added: theme, auth)
 */

// Load Inter font for UI text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Load JetBrains Mono for financial data and code
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

/**
 * Global metadata for SEO and social sharing
 */
export const metadata: Metadata = {
  title: {
    default: 'FinanceLab - Professional Financial Analysis',
    template: '%s | FinanceLab',
  },
  description:
    'A professional financial analysis platform for stock research, portfolio tracking, and investment simulation. Built for serious investors.',
  keywords: [
    'finance',
    'stocks',
    'investment',
    'portfolio',
    'analysis',
    'trading',
    'market data',
  ],
  authors: [{ name: 'FinanceLab' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'FinanceLab',
    title: 'FinanceLab - Professional Financial Analysis',
    description:
      'A professional financial analysis platform for stock research and portfolio tracking.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinanceLab - Professional Financial Analysis',
    description:
      'A professional financial analysis platform for stock research and portfolio tracking.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
