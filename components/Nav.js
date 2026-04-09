'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: '/', label: 'Create Partner Page' },
    { href: '/asset-generator', label: 'Asset Generator' },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-1">
          <span className="mr-6 text-sm font-semibold text-gray-900">Rho Partner Tools</span>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        {session && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="text-xs text-gray-400 underline hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
