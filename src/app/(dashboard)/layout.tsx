import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { createClient } from '@/lib/supabase/server'
import { Barlow_Condensed, Barlow, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import EstadoSelector from '@/lib/EstadoSelector'
import { EstadoProvider } from '@/lib/EstadoContext'
import { RoleProvider } from '@/lib/RoleContext'

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
  { label: 'Painel de Gestão', href: '/' },
  { label: 'Efetivo',          href: '/pessoal' },
  { label: 'Equipamentos',     href: '/equipamentos' },
  { label: 'Caixas de Logística',     href: '/caixas' },
  { label: 'Cães de Busca e Resgate', href: '/caes' },
  { label: 'Capacitação',      href: '/treinamento' },
  { label: 'Organograma',      href: '/organograma' },
  { label: 'Missões',          href: '/missoes' },
  { label: 'EXCON — IEC',     href: '/excon' },
  { label: 'Relatórios IEC',  href: '/relatorios' },
]

const sidebarItems = [
  { label: 'Painel de Gestão', href: '/',            icon: 'home'    },
  { label: 'Efetivo',          href: '/pessoal',      icon: 'users'   },
  { label: 'Equipamentos',     href: '/equipamentos', icon: 'tool'    },
  { label: 'Caixas de Logística',      href: '/caixas',       icon: 'box',  sub: true },
  { label: 'Cães de Busca e Resgate',  href: '/caes',         icon: 'dog',  sub: true },
  { label: 'Capacitação',      href: '/treinamento',  icon: 'book'    },
  { label: 'Organograma',      href: '/organograma',  icon: 'org'     },
  { label: 'Missões',          href: '/missoes',      icon: 'flag'    },
  { label: 'EXCON — IEC',     href: '/excon',        icon: 'shield'  },
  { label: 'Relatórios IEC',  href: '/relatorios',   icon: 'chart'   },
  { label: 'Meu Perfil',       href: '/meu-perfil',   icon: 'profile' },
]

const roleConfig: Record<string, { label: string; color: string }> = {
  admin:        { label: 'Admin',  color: '#FF6B6B' },
  team_manager: { label: 'Gestor', color: '#E87722' },
  logistics:    { label: 'Log.',   color: '#FFDF00' },
  team_member:  { label: 'Membro', color: '#009EDB' },
}

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 as const }
  const props = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, viewBox: '0 0 24 24', style: s }
  switch (name) {
    case 'home':    return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
    case 'users':   return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    case 'tool':    return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
    case 'book':    return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
    case 'org':     return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
    case 'flag':    return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
    case 'shield':  return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
    case 'chart':   return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    case 'box':     return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
    case 'dog':     return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 2L9.5 5.5M18 2L14.5 5.5M9.5 5.5C8 5.5 7 7 7 8.5V12C7 14.5 9 16.5 12 16.5s5-2 5-4.5V8.5C17 7 16 5.5 14.5 5.5H9.5zM10 10v.01M14 10v.01M11 13c.3.5 1.7.5 2 0M12 16.5V20M9.5 20h5" /></svg>
    case 'profile': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    default:        return <svg {...props}><circle cx="12" cy="12" r="4" /></svg>
  }
}

const TOPBAR_H  = 52
const BANNER_H  = 28
const HEADER_H  = TOPBAR_H + BANNER_H
const SIDEBAR_W = 200

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  const role        = (profile?.role ?? 'team_member') as 'admin' | 'team_manager' | 'logistics' | 'team_member'
  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'U'
  const initials    = displayName.slice(0, 2).toUpperCase()
  const roleCfg     = roleConfig[role] ?? roleConfig.team_member

  return (
    <EstadoProvider>
      <RoleProvider role={role}>
        <div
          className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
          style={{ background: '#0D1117', color: '#E8EDF5', fontFamily: 'var(--font-body), sans-serif', fontSize: '14px', minHeight: '100vh' }}
        >
          <style>{`
            * { box-sizing: border-box; }
            body { margin: 0; }
            .topbar-link {
              padding: 0 9px; height: ${TOPBAR_H}px;
              display: flex; align-items: center;
              font-family: var(--font-cond), sans-serif;
              font-size: 12px; font-weight: 600;
              letter-spacing: 0.09em; text-transform: uppercase;
              color: #5A6478; text-decoration: none;
              border-bottom: 2px solid transparent;
              transition: color .15s, border-color .15s;
              white-space: nowrap;
            }
            .topbar-link:hover { color: #9BA8BC; }
            .topbar-link.active { color: #E87722; border-bottom-color: #E87722; }
            .sidebar-link {
              display: flex; align-items: center; gap: 9px;
              padding: 7px 12px; border-radius: 4px;
              font-family: var(--font-cond), sans-serif;
              font-size: 13px; font-weight: 600;
              letter-spacing: 0.08em; text-transform: uppercase;
              color: #5A6478; text-decoration: none;
              transition: background .15s, color .15s;
              overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            }
            .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #9BA8BC; }
            .sidebar-link.active { background: rgba(232,119,34,0.12); color: #E87722; }
            input:not([type="email"]):not([type="color"]):not([type="range"]):not([type="file"]),
            textarea { text-transform: uppercase; }
            .btn-sair {
              display: flex; align-items: center; gap: 6px;
              padding: 5px 10px; border-radius: 3px; cursor: pointer;
              background: rgba(255,255,255,0.05);
              border: 1px solid rgba(255,255,255,0.1);
              font-family: var(--font-mono); font-size: 10px;
              letter-spacing: 0.1em; color: #5A6478; transition: all .15s;
            }
            .btn-sair:hover { background: rgba(204,0,0,0.12); border-color: rgba(204,0,0,0.3); color: #FF6B6B; }
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #2E3848; border-radius: 2px; }
            .topbar-nav { scrollbar-width: none; }
            .topbar-nav::-webkit-scrollbar { display: none; }
          `}</style>

          {/* ── TOPBAR ── */}
          <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', height: TOPBAR_H, padding: '0 16px', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 4, height: 28, borderRadius: 1, background: '#009C3B' }} />
                <div style={{ width: 4, height: 28, borderRadius: 1, background: '#FFDF00', margin: '0 2px' }} />
                <div style={{ width: 4, height: 28, borderRadius: 1, background: '#002776' }} />
                <div style={{ width: 4, height: 28, borderRadius: 1, background: '#FFFFFF', margin: '0 2px' }} />
              </div>
              <div style={{ marginLeft: 4 }}>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>BRA-01 Heavy USAR</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478', marginTop: 2 }}>Sistema de Gestão da Equipe</div>
              </div>
            </div>

            <nav className="topbar-nav" style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
              {navItems.map(item => (
                <Link key={item.href} href={item.href} className="topbar-link">{item.label}</Link>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 3, background: 'rgba(232,119,34,0.12)', border: '1px solid rgba(232,119,34,0.25)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#5A6478', textTransform: 'uppercase', letterSpacing: '0.1em' }}>IEC Prep</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#E87722', lineHeight: 1 }}>— dias</div>
                </div>
              </div>
              <EstadoSelector />
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00A550' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00A550' }} />
                Online
              </div>
              <Link href="/meu-perfil" title={roleCfg.label} style={{ width: 30, height: 30, borderRadius: '50%', background: '#004B87', border: `1.5px solid ${roleCfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
                {initials}
              </Link>
              <form action={logout}>
                <button type="submit" className="btn-sair">
                  <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  SAIR
                </button>
              </form>
            </div>
          </header>

          {/* ── SUBBANNER ── */}
          <div style={{ background: '#004B87', padding: '0 16px', height: BANNER_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
              BRA-01 Heavy USAR Team · INSARAG IEC Preparation
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ label: 'CBMMG', state: 'Minas Gerais' }, { label: 'CBMPR', state: 'Paraná' }, { label: 'CBPMESP', state: 'São Paulo' }].map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 2, background: 'rgba(255,255,255,0.15)', color: '#fff', letterSpacing: '0.08em' }}>{c.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{c.state}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ display: 'flex', minHeight: `calc(100vh - ${HEADER_H}px)` }}>
            <aside style={{ width: SIDEBAR_W, flexShrink: 0, background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', position: 'sticky', top: HEADER_H, height: `calc(100vh - ${HEADER_H}px)`, overflowY: 'auto', overflowX: 'hidden' }}>

              {/* User info */}
              <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <Link href="/meu-perfil" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#004B87', border: `1.5px solid ${roleCfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {initials}
                  </div>
                </Link>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#E8EDF5', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                <div style={{ marginTop: 6, display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 600, padding: '2px 7px', borderRadius: 2, color: roleCfg.color, background: `${roleCfg.color}15`, border: `1px solid ${roleCfg.color}30`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {roleCfg.label}
                </div>
              </div>

              {/* Nav */}
              <nav style={{ padding: '10px 6px', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#2E3848', padding: '0 6px', marginBottom: 6 }}>Navegação</div>
                {sidebarItems.map(item => item.sub ? (
                  <div key={item.href} style={{ display: 'flex', alignItems: 'stretch', marginBottom: 1 }}>
                    <div style={{ width: 18, flexShrink: 0, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                      <div style={{ width: 8, height: 14, borderLeft: '1px solid #2E3848', borderBottom: '1px solid #2E3848', borderBottomLeftRadius: 2 }} />
                    </div>
                    <Link href={item.href} className="sidebar-link" style={{ flex: 1, fontSize: 11, padding: '5px 8px' }}>
                      <Icon name={item.icon} size={12} />
                      {item.label}
                    </Link>
                  </div>
                ) : (
                  <Link key={item.href} href={item.href} className="sidebar-link" style={{ marginBottom: 1 }}>
                    <Icon name={item.icon} size={14} />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Sair */}
              <div style={{ padding: '10px 6px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <form action={logout}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 6px', borderRadius: 4, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5A6478' }}>
                    <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Sair
                  </button>
                </form>
              </div>
            </aside>

            <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>{children}</main>
          </div>
        </div>
      </RoleProvider>
    </EstadoProvider>
  )
}
