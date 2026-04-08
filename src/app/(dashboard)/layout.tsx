import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { createClient } from '@/lib/supabase/server'
import { Barlow_Condensed, Barlow, JetBrains_Mono } from 'next/font/google'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cond',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const navItems = [
  { label: 'Painel de Gestão',              href: '/' },
  { label: 'Efetivo',                        href: '/pessoal' },
  { label: 'Equipamentos',                   href: '/equipamentos' },
  { label: 'Capacitação/Especializações',    href: '/treinamento' },
  { label: 'Organograma',                    href: '/organograma' },
  { label: 'Missões',                        href: '/missoes' },
  { label: 'Relatórios IEC',                 href: '/relatorios' },
]

const sidebarItems = [
  {
    label: 'Painel de Gestão', href: '/',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
  },
  {
    label: 'Efetivo', href: '/pessoal',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  },
  {
    label: 'Equipamentos', href: '/equipamentos',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />,
  },
  {
    label: 'Capacitação/Especializações', href: '/treinamento',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  },
  {
    label: 'Organograma', href: '/organograma',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  },
  {
    label: 'Missões', href: '/missoes',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />,
  },
  {
    label: 'Relatórios IEC', href: '/relatorios',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const initials = user.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`} style={{
      background: '#0D1117',
      color: '#E8EDF5',
      fontFamily: 'var(--font-body), sans-serif',
      fontSize: '14px',
      minHeight: '100vh',
    }}>

        {/* ── TOPBAR ── */}
        <header style={{
          height: 56,
          background: '#131920',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 4, height: 32, borderRadius: 1, background: '#009C3B' }} />
              <div style={{ width: 4, height: 32, borderRadius: 1, background: '#FFDF00', margin: '0 2px' }} />
              <div style={{ width: 4, height: 32, borderRadius: 1, background: '#002776' }} />
              <div style={{ width: 4, height: 32, borderRadius: 1, background: '#FFFFFF', margin: '0 2px' }} />
            </div>
            <div style={{ marginLeft: 8 }}>
              <div style={{
                fontFamily: 'var(--font-cond), sans-serif',
                fontSize: 17, fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#fff', lineHeight: 1,
              }}>BRA-01 Heavy USAR</div>
              <div style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 9, letterSpacing: '0.18em',
                color: '#5A6478', textTransform: 'uppercase', marginTop: 2,
              }}>Sistema de Gestão da Equipe</div>
            </div>
          </div>

          {/* Top nav */}
          <style>{`
            .topbar-link { padding: 0 14px; height: 56px; display: flex; align-items: center; font-family: var(--font-cond), sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6478; text-decoration: none; transition: color .15s; border-bottom: 2px solid transparent; }
            .topbar-link:hover { color: #9BA8BC; }
          `}</style>
          <nav style={{ display: 'flex', gap: 1 }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="topbar-link">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 3,
              background: 'rgba(232,119,34,0.15)',
              border: '1px solid rgba(232,119,34,0.3)',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', textTransform: 'uppercase', letterSpacing: '0.1em' }}>IEC Prep</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: '#E87722' }}>— dias</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00A550' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A550' }} />
              Online
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#004B87', border: '1.5px solid #009EDB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, color: '#fff',
            }}>{initials}</div>
            <style>{`
              .btn-sair {
                display: flex; align-items: center; gap: 6px;
                padding: 6px 12px; border-radius: 3px; cursor: pointer;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                font-family: var(--font-mono); font-size: 10px;
                letter-spacing: 0.1em; color: #5A6478;
                transition: all .15s;
              }
              .btn-sair:hover {
                background: rgba(204,0,0,0.12);
                border-color: rgba(204,0,0,0.3);
                color: #FF6B6B;
              }
            `}</style>
            <form action={logout}>
              <button type="submit" title="Sair do sistema" className="btn-sair">
                <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                SAIR
              </button>
            </form>
          </div>
        </header>

        {/* ── SUB-BANNER ── */}
        <div style={{
          background: '#004B87',
          padding: '8px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}>BRA-01 Heavy USAR Team · INSARAG IEC Preparation</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['CBMMG · Minas Gerais', 'CBMPR · Paraná', 'CBPMESP · São Paulo'].map((corp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                <span style={{
                  fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700,
                  padding: '1px 7px', borderRadius: 2,
                  background: 'rgba(255,255,255,0.15)', color: 'white',
                  letterSpacing: '0.06em',
                }}>{corp.split(' · ')[0]}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{corp.split(' · ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 88px)' }}>

          {/* ── SIDEBAR ── */}
          <aside style={{
            background: '#131920',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
            paddingTop: 20,
          }}>
            {/* User card */}
            <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#1F2A3C', border: '2px solid #004B87',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-cond)', fontSize: 20, fontWeight: 700,
                color: '#009EDB', marginBottom: 10,
              }}>{initials}</div>
              <div style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
                {user.email?.split('@')[0]}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 3 }}>
                {user.email}
              </div>
            </div>

            {/* Nav */}
            <div style={{ padding: '0 12px', flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#2E3848', padding: '8px 4px 4px',
              }}>Navegação</div>

              {sidebarItems.map(item => (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 4,
                  color: '#9BA8BC', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', border: '1px solid transparent',
                  transition: 'background .12s, color .12s',
                  marginBottom: 1,
                }}>
                  <svg style={{ width: 16, height: 16, opacity: 0.7, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <form action={logout}>
                <button type="submit" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', borderRadius: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#5A6478', fontSize: 13, fontWeight: 500,
                  transition: 'color .12s',
                }}>
                  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sair
                </button>
              </form>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main style={{ overflowY: 'auto', background: '#0D1117' }}>
            {children}
          </main>
        </div>
    </div>
  )
}
