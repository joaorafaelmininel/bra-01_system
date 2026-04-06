import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: activeAlerts },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status_operacional', 'Ativo'),
    supabase.from('system_alerts').select('*', { count: 'exact', head: true }).eq('resolvido', false),
  ])

  const stats = [
    { val: totalMembers ?? 0,  label: 'Integrantes',        sub: 'SP · MG · PR',         color: '#009EDB', border: '#009EDB' },
    { val: activeMembers ?? 0, label: 'Operacionalmente ativos', sub: 'Status Ativo',     color: '#00A550', border: '#00A550' },
    { val: 0,                  label: 'Posições descobertas', sub: 'De 22 funções USAR',  color: '#CC0000', border: '#CC0000' },
    { val: activeAlerts ?? 0,  label: 'Alertas pendentes',  sub: 'Passaporte · Equip. · Cert.', color: '#E87722', border: '#E87722' },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── IEC Banner ── */}
      <div style={{
        background: 'linear-gradient(90deg, #004B87 0%, #1A2332 100%)',
        border: '1px solid rgba(0,75,135,0.6)',
        borderRadius: 6, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
            Dias para o IEC INSARAG
          </div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            —
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
            BRA-01 Heavy USAR Team
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {[
            { label: 'Efetivo',       color: '#009EDB', width: `${totalMembers ? Math.min((totalMembers / 60) * 100, 100) : 0}%` },
            { label: 'Equipamentos',  color: '#E87722', width: '0%' },
            { label: 'Capacitação/Especializações',  color: '#00A550', width: '0%' },
          ].map(bar => (
            <div key={bar.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{bar.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: bar.color, fontWeight: 500 }}>{bar.width}</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: bar.color, width: bar.width, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#131920',
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: `3px solid ${s.border}`,
            borderRadius: 5, padding: '14px 16px',
            cursor: 'pointer',
            transition: 'background .2s',
          }}>
            <div style={{
              fontFamily: 'var(--font-cond)', fontSize: 38, fontWeight: 800,
              lineHeight: 1, marginBottom: 3, color: s.color,
            }}>{s.val}</div>
            <div style={{
              fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478',
            }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848', marginTop: 5 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid de cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Funções USAR */}
        <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>Funções USAR</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848' }}>22 posições Heavy</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', textAlign: 'center', padding: '16px 0' }}>
              Cadastre membros para visualizar posições atribuídas
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>Alertas do sistema</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848' }}>{activeAlerts ?? 0} pendentes</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {(activeAlerts ?? 0) === 0 ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00A550', textAlign: 'center', padding: '16px 0' }}>
                Nenhum alerta pendente
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', textAlign: 'center', padding: '16px 0' }}>
                {activeAlerts} alertas — acesse o módulo para detalhes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{
        background: '#131920', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 5, padding: '8px 16px',
        display: 'flex', gap: 24, alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848',
      }}>
        <span>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#00A550', marginRight: 6 }} />
          Sistema online
        </span>
        <span>BRA-01 Heavy USAR Team · SP · MG · PR</span>
        <span style={{ marginLeft: 'auto' }}>v1.0.0-alpha</span>
      </div>
    </div>
  )
}
