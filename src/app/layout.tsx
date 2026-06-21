import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: "Mama's Duck Order", description: 'ระบบสั่งวัตถุดิบ' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="th"><body>{children}</body></html>);
}