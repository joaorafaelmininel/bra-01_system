import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { createClient } from '@/lib/supabase/server'
import { Barlow_Condensed, Barlow, JetBrains_Mono } from 'next/font/google'
import TopbarNav from './TopbarNav'
import SidebarNav from './SidebarNav'

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

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const initials = user.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
      style={{ background: '#0D1117', color: '#E8EDF5', fontFamily: 'var(--font-body), sans-serif', fontSize: 14, minHeight: '100vh' }}
    >
      {/* ── TOPBAR ── */}
      <header style={{
        height: 56, background: '#131920',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ width: 4, height: 32, borderRadius: 1, background: '#009C3B' }} />
            <div style={{ width: 4, height: 32, borderRadius: 1, background: '#FFDF00', margin: '0 2px' }} />
            <div style={{ width: 4, height: 32, borderRadius: 1, background: '#002776' }} />
            <div style={{ width: 4, height: 32, borderRadius: 1, background: '#FFFFFF', marginLeft: 2 }} />
          </div>
          <div style={{ marginLeft: 8 }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 17, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
              BRA-01 Heavy USAR
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: '#5A6478', textTransform: 'uppercase', marginTop: 2 }}>
              Sistema de Gestão da Equipe
            </div>
          </div>
        </div>

        {/* Top nav — client component */}
        <TopbarNav />

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
        </div>
      </header>

      {/* ── SUB-BANNER ── */}
      <div style={{
        background: '#004B87', padding: '8px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
          BRA-01 Heavy USAR Team · INSARAG IEC Preparation
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['CBMMG','Minas Gerais'],['CBMPR','Paraná'],['CBPMESP','São Paulo']].map(([sigla, estado]) => (
            <div key={sigla} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 2, background: 'rgba(255,255,255,0.15)', color: 'white', letterSpacing: '0.06em' }}>{sigla}</span>
              <span>{estado}</span>
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
          display: 'flex', flexDirection: 'column', paddingTop: 20,
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

          {/* Sidebar nav — client component */}
          <SidebarNav />

          {/* Logout */}
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <form action={logout}>
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 10px', borderRadius: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5A6478', fontSize: 13, fontWeight: 500,
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
