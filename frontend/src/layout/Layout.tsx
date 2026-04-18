/**
 * Layout Component
 *
 * Wraps all pages with shared header, footer, and layout structure.
 */

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const isStandaloneRoute =
    pathname === '/' ||
    pathname === '/create' ||
    pathname === '/login' ||
    pathname === '/logging' ||
    pathname.startsWith('/vote/');

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
