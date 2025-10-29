'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Information from '../information/page';

export default function Navbar() {
  const pathname = usePathname();

  const linkClasses = (href: string) =>
    `text-emerald-300 hover:text-emerald-400 ${
      pathname === href ? 'font-bold underline underline-offset-4' : ''
    }`;

  return (
    <header className="bg-black shadow-md h-24 z-10 relative">
      <div className="max-w-6xl mx-auto px-4 h-full flex justify-between items-center">
        {/* Logo image */}
        <Link href="/">
          <img
            src="/image/Logo_and_DeOpt_designed.PNG.png"
            alt="DeOpt logo"
            className="h-40 w-auto object-contain hover:opacity-80 transition"
          />
        </Link>

        {/* Navigation links */}
        <nav className="space-x-6">
          <Link href="/" className={linkClasses('/')}>
            Home
          </Link>
          <Link href="/create-option" className={linkClasses('/create-option')}>
            Create Option
          </Link>
          <Link href="/create-futur" className={linkClasses('/create-futur')}>
            Create Futur
          </Link>
          <Link href="/dashboard" className={linkClasses('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/information" className={linkClasses('/information')}>
            Information
          </Link>
          <Link href="/fees" className={linkClasses('/fees')}>
            Fees
          </Link>
        </nav>
      </div>
    </header>
  );
}
