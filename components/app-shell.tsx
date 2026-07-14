'use client';

import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: '#000000' }}>
      <Sidebar />
      <div className="flex flex-col flex-1" style={{ marginLeft: 240 }}>
        <TopBar />
        <main className="flex-1 px-8 pb-10" style={{ paddingTop: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
