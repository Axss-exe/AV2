'use client';

import { motion } from 'framer-motion';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { useATIS } from '@/lib/context';

const COLLAPSED_WIDTH = 60;
const EXPANDED_WIDTH = 240;

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useATIS();
  const sidebarWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <div className="flex min-h-screen" style={{ background: '#000000' }}>
      <Sidebar />
      <motion.div
        className="flex flex-col flex-1"
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ minWidth: 0 }}
      >
        <TopBar />
        <main className="flex-1 px-8 pb-10" style={{ paddingTop: 0 }}>
          {children}
        </main>
      </motion.div>
    </div>
  );
}
