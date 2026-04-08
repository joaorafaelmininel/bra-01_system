'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Painel de Gestão',                    href: '/' },
  { label: 'Efetivo',                   href: '/pessoal' },
  { label: 'Equipamentos',              href: '/equipamentos' },
  { label: 'Capacitação/Especializações', href: '/treinamento' },
  { label: 'Organograma',               href: '/organograma' },
  { label: 'Missões',                   href: '/missoes' },
  { label: 'Relatórios IEC',            href: '/relatorios' },
]

export default function TopbarNav() {
  const pathname = usePathname()
git
  return (
    <nav style={{ display: 'flex', gap: 1 }}>
      {navItems.map(item => {
        const active = item.href === '/'
          ? pathname === '/'
          : pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link key={item.href} href={item.href} style={{
            padding: '0 14px', height: 56,
            display: 'flex', alignItems: 'center',
            fontFamily: 'var(--font-cond), sans-serif',
            fontSize: 12, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: active ? '#009EDB' : '#5A6478',
            textDecoration: 'none',
            borderBottom: active ? '2px solid #009EDB' : '2px solid transparent',
            transition: 'color .15s',
          }}>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
