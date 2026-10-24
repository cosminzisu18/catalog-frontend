import type { Metadata, Viewport } from 'next';
import { Manrope, Fraunces } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const body = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

const display = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Catalog Digital',
  description: 'Catalog digital pentru scoli: directori, profesori si elevi',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ro"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className={`${body.className} min-h-full font-sans`}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
