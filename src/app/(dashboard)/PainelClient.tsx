'use client'

import { useMemo } from 'react'
import { useEstado } from '@/lib/EstadoContext'

type Member = {
  id: string
  instituicao: string
  status_operacional: string
  aptidao_operacional: string
}

type Props = {
  members: Member[]
  activeAlerts: number
}

const INST = [
  { label: 'CBPMESP', state: 'São Paulo',    color: '#009EDB' },
  { label: 'CBMMG',   state: 'Minas Gerais', color: '#E87722' },
  { label: 'CBMPR',   state: 'Paraná',       color: '#00A550' },
]

const estadoColors: Record<string, string> = {
  CBPMESP: '#009EDB', CBMMG: '#E87722', CBMPR: '#00A550',
}

export default function PainelClient({ members, activeAlerts }: Props) {
  const { estado } = useEstado()

  const byEstado = useMemo(() =>
    estado === 'Todos' ? members : members.filter(m => m.instituicao === estado),
    [members, estado]
  )

  const totalMembers  = byEstado.length
  const activeMembers = byEstado.filter(m => m.status_operacional === 'Ativo').length
  const estadoSub     = estado === 'Todos' ? 'SP · MG · PR' : estado
  const accentColor   = estado !== 'Todos' ? (estadoColors[estado] ?? '#009EDB') : '#009EDB'
  const efetivoPct    = members.length > 0 ? Math.min(Math.round((totalMembers / 60) * 100), 100) : 0
  const scoreGeral    = Math.round(efetivoPct / 3)

  const stats = [
    { val: totalMembers,  label: 'Integrantes',        sub: estadoSub,                     color: accentColor, border: accentColor },
    { val: activeMembers, label: 'Oper. ativos',        sub: 'Status ativo',                color: '#00A550',   border: '#00A550' },
    { val: 0,             label: 'Posições desc.',      sub: 'De 22 funções USAR',          color: '#CC0000',   border: '#CC0000' },
    {
      val: activeAlerts,
      label: 'Alertas',
      sub: 'PP · Equip. · Cert.',
      color:  activeAlerts > 0 ? '#E87722' : '#2E3848',
      border: activeAlerts > 0 ? '#E87722' : 'rgba(255,255,255,0.06)',
    },
  ]

  const mono  = 'var(--font-mono)'
  const cond  = 'var(--font-cond)'
  const dim   = '#2E3848'
  const muted = '#5A6478'

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

      {/* ── IEC Banner ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(105deg, #00306B 0%, #0D1117 55%)',
        border: '1px solid rgba(0,100,180,0.25)',
        borderRadius: 7, overflow: 'hidden',
        display: 'flex', alignItems: 'stretch', minWidth: 0,
      }}>

        {/* Countdown — largura fixa */}
        <div style={{
          padding: '18px 22px',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, width: 160,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
        }}>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            IEC INSARAG
          </div>
          <div style={{ fontFamily: cond, fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            —
          </div>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
            dias restantes
          </div>
        </div>

        {/* Barras — flex 1, minWidth 0 para não transbordar */}
        <div style={{ flex: 1, minWidth: 0, padding: '18px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
            Prontidão BRA-01{estado !== 'Todos' && <span style={{ color: accentColor, marginLeft: 8 }}>{estado}</span>}
          </div>

          {[
            { label: 'Efetivo',      pct: efetivoPct, color: '#009EDB' },
            { label: 'Equipamentos', pct: 0,          color: '#E87722' },
            { label: 'Capacitação',  pct: 0,          color: '#00A550' },
          ].map(bar => (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  {bar.label}
                </span>
                <span style={{ fontFamily: cond, fontSize: 12, fontWeight: 700, color: bar.pct > 0 ? bar.color : 'rgba(255,255,255,0.18)' }}>
                  {bar.pct}%
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: bar.color,
                  width: `${bar.pct}%`, transition: 'width 1.2s ease',
                  boxShadow: bar.pct > 0 ? `0 0 8px ${bar.color}50` : 'none',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Score — largura fixa */}
        <div style={{
          padding: '18px 22px',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0, width: 96,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
            Score
          </div>
          <div style={{
            fontFamily: cond, fontSize: 34, fontWeight: 800, lineHeight: 1,
            color: scoreGeral > 0 ? '#009EDB' : 'rgba(255,255,255,0.1)',
            textShadow: scoreGeral > 0 ? '0 0 12px rgba(0,158,219,0.4)' : 'none',
          }}>
            {scoreGeral}%
          </div>
          <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,0.18)' }}>geral</div>
        </div>
      </div>

      {/* ── Stat cards — 2×2 para garantir espaço ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#0F1923',
            border: '1px solid rgba(255,255,255,0.06)',
            borderTop: `2px solid ${s.border}`,
            borderRadius: 6, padding: '14px 16px',
            minWidth: 0,
          }}>
            <div style={{ fontFamily: cond, fontSize: 40, fontWeight: 800, lineHeight: 1, color: s.color, textShadow: `0 0 16px ${s.color}25` }}>
              {s.val}
            </div>
            <div style={{ fontFamily: cond, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC', marginTop: 6 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: dim, marginTop: 3 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid inferior ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 0 }}>

        {/* Distribuição / Breakdown */}
        {estado === 'Todos' ? (
          <div style={{ background: '#0F1923', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: cond, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8BC' }}>
                Distribuição por Instituição
              </span>
              <span style={{ fontFamily: mono, fontSize: 9, color: dim }}>{members.length} total</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {INST.map(inst => {
                const count = members.filter(m => m.instituicao === inst.label).length
                const pct   = members.length > 0 ? Math.round((count / members.length) * 100) : 0
                return (
                  <div key={inst.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 600, color: inst.color, letterSpacing: '0.05em', flexShrink: 0 }}>{inst.label}</span>
                        <span style={{ fontFamily: mono, fontSize: 8, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.state}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontFamily: mono, fontSize: 9, color: muted }}>{pct}%</span>
                        <span style={{ fontFamily: cond, fontSize: 18, fontWeight: 800, color: count > 0 ? inst.color : dim, lineHeight: 1 }}>{count}</span>
                      </div>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: inst.color,
                        width: `${pct}%`, transition: 'width 1s ease',
                        boxShadow: count > 0 ? `0 0 5px ${inst.color}45` : 'none',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ background: '#0F1923', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: cond, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8BC' }}>
                Efetivo {estado}
              </span>
              <span style={{ fontFamily: mono, fontSize: 9, color: accentColor }}>{totalMembers} membros</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Ativos',    val: byEstado.filter(m => m.status_operacional === 'Ativo').length,                              color: '#00A550' },
                { label: 'Afastados', val: byEstado.filter(m => ['Licença','Afastado'].includes(m.status_operacional)).length,         color: '#E87722' },
                { label: 'Aptos',     val: byEstado.filter(m => m.aptidao_operacional === 'Apto').length,                              color: accentColor },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted }}>{row.label}</span>
                    <span style={{ fontFamily: cond, fontSize: 18, fontWeight: 800, color: row.val > 0 ? row.color : dim, lineHeight: 1 }}>{row.val}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: row.color,
                      width: totalMembers > 0 ? `${Math.round((row.val / totalMembers) * 100)}%` : '0%',
                      transition: 'width .8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas */}
        <div style={{ background: '#0F1923', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', minWidth: 0 }}>
          <div style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: cond, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9BA8BC' }}>
              Alertas do sistema
            </span>
            <span style={{ fontFamily: mono, fontSize: 9, color: activeAlerts > 0 ? '#E87722' : dim }}>
              {activeAlerts} pendentes
            </span>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100 }}>
            {activeAlerts === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00A550', boxShadow: '0 0 7px #00A55060' }} />
                <span style={{ fontFamily: mono, fontSize: 9, color: '#00A550', letterSpacing: '0.06em' }}>Nenhum alerta pendente</span>
              </div>
            ) : (
              <span style={{ fontFamily: mono, fontSize: 10, color: muted, textAlign: 'center' }}>
                {activeAlerts} alertas — acesse o módulo para detalhes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: '#0F1923', border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 4, padding: '6px 14px',
        display: 'flex', gap: 20, alignItems: 'center',
        fontFamily: mono, fontSize: 9, color: dim, letterSpacing: '0.06em',
        minWidth: 0, overflow: 'hidden',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00A550', boxShadow: '0 0 4px #00A55070', display: 'inline-block' }} />
          Sistema online
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>BRA-01 Heavy USAR Team · MG · PR · SP</span>
        <span style={{ marginLeft: 'auto', flexShrink: 0 }}>v1.0.0-alpha</span>
      </div>
    </div>
  )
}
