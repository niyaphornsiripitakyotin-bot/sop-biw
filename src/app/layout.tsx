import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: "Mama's Duck Order",
  description: 'Order System',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="th"><body>{children}</body></html>);
} 
