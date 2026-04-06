'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Member = {
  id: string
  nome_completo: string
  nome_guerra: string | null
  foto_url: string | null
  posto_graduacao: string | null
  instituicao: string
  estado_base: string
  componente_primario: string
  componente_secundario: string | null
  status_operacional: string
  aptidao_operacional: string
  tipo_membro: string
  email_pessoal: string
  passaporte_validade: string | null
}

type Props = { members: Member[] }

// ─── Configs visuais ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Ativo:      { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  Licença:    { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  Afastado:   { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  Reserva:    { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)', border: 'rgba(155,168,188,0.2)' },
  Desligado:  { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.3)' },
}

const componenteConfig: Record<string, { abbr: string; color: string; bg: string; border: string }> = {
  'Management':      { abbr: 'MGT', color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.25)' },
  'Technical Search':{ abbr: 'TS',  color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.25)' },
  'Rescue':          { abbr: 'RES', color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.25)' },
  'Medical':         { abbr: 'MED', color: '#00A550', bg: 'rgba(0,165,80,0.12)',   border: 'rgba(0,165,80,0.25)' },
  'Logistics':       { abbr: 'LOG', color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)' ,border: 'rgba(155,168,188,0.2)' },
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function passaporteStatus(validade: string | null) {
  if (!validade) return { label: 'Sem passaporte', color: '#5A6478' }
  const dias = Math.ceil((new Date(validade).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: 'Vencido',           color: '#FF6B6B' }
  if (dias < 180) return { label: `Vence em ${dias}d`, color: '#E87722' }
  return                 { label: 'Válido',             color: '#00A550' }
}

// ─── Tag genérica monoespaçada ─────────────────────────────────────────────────

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
      padding: '2px 7px', borderRadius: 2,
      color, background: bg, border: `1px solid ${border}`,
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>{children}</span>
  )
}

// ─── Barra de resumo por componente ───────────────────────────────────────────

function ComponentBreakdown({ members, filter, onFilter }: { members: Member[]; filter: string; onFilter: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {Object.entries(componenteConfig).map(([key, cfg]) => {
        const count = members.filter(m => m.componente_primario === key).length
        if (count === 0) return null
        const active = filter === key
        return (
          <button key={key} onClick={() => onFilter(active ? 'Todos' : key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
            background: active ? cfg.bg : 'transparent',
            border: `1px solid ${active ? cfg.border : 'rgba(255,255,255,0.07)'}`,
            color: active ? cfg.color : '#5A6478',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            transition: 'all .15s',
          }}>
            <span style={{ fontWeight: 600 }}>{cfg.abbr}</span>
            <span>{key}</span>
            <span style={{ fontWeight: 700, color: active ? cfg.color : '#9BA8BC' }}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MembrosClient({ members }: Props) {
  const [search, setSearch]   = useState('')
  const [filterStatus, setFS] = useState('Todos')
  const [filterComp, setFC]   = useState('Todos')
  const [filterInst, setFI]   = useState('Todos')

  const statusOpts = ['Todos', ...Array.from(new Set(members.map(m => m.status_operacional)))]
  const instOpts   = ['Todos', ...Array.from(new Set(members.map(m => m.instituicao)))]

  const filtered = useMemo(() => members.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.nome_completo.toLowerCase().includes(q) || (m.nome_guerra?.toLowerCase().includes(q) ?? false) || (m.posto_graduacao?.toLowerCase().includes(q) ?? false)
    return matchSearch
      && (filterStatus === 'Todos' || m.status_operacional === filterStatus)
      && (filterComp   === 'Todos' || m.componente_primario === filterComp)
      && (filterInst   === 'Todos' || m.instituicao === filterInst)
  }), [members, search, filterStatus, filterComp, filterInst])

  const total  = members.length
  const ativos = members.filter(m => m.status_operacional === 'Ativo').length
  const aptos  = members.filter(m => m.aptidao_operacional === 'Apto').length
  const semPP  = members.filter(m => !m.passaporte_validade || new Date(m.passaporte_validade) < new Date()).length

  const selectStyle: React.CSSProperties = {
    background: '#131920', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '6px 10px',
    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC',
    outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Efetivo</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>GESTÃO DO EFETIVO BRA-01</div>
        </div>
        <Link href="/pessoal/novo" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 3,
          background: '#E87722', color: '#fff',
          fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          textDecoration: 'none', transition: 'background .15s',
        }}>
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo membro
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Total',           val: total,  color: '#009EDB', border: '#009EDB' },
          { label: 'Ativos',          val: ativos, color: '#00A550', border: '#00A550' },
          { label: 'Aptos',           val: aptos,  color: '#009EDB', border: '#009EDB' },
          { label: 'Passaporte ⚠',   val: semPP,  color: semPP > 0 ? '#FF6B6B' : '#5A6478', border: semPP > 0 ? '#CC0000' : 'rgba(255,255,255,0.07)' },
        ].map(c => (
          <div key={c.label} style={{
            background: '#131920', border: '1px solid rgba(255,255,255,0.07)',
            borderTop: `3px solid ${c.border}`,
            borderRadius: 5, padding: '12px 14px',
          }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val}</div>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nome, nome de guerra, posto..."
            style={{ ...selectStyle, paddingLeft: 32, width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, color: '#E8EDF5' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFS(e.target.value)} style={selectStyle}>
          {statusOpts.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterInst} onChange={e => setFI(e.target.value)} style={selectStyle}>
          {instOpts.map(i => <option key={i}>{i}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
          {filtered.length} {filtered.length === 1 ? 'membro' : 'membros'}
        </span>
      </div>

      {/* Componente filter chips */}
      <ComponentBreakdown members={members} filter={filterComp} onFilter={setFC} />

      {/* Tabela */}
      <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#131920', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Membro', 'Posto / Instituição', 'Componente', 'Status', 'Aptidão', 'Passaporte', ''].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 14px',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6478',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
                  Nenhum membro encontrado.
                </td>
              </tr>
            ) : filtered.map(m => {
              const st  = statusConfig[m.status_operacional]     ?? { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)', border: 'rgba(155,168,188,0.2)' }
              const cmp = componenteConfig[m.componente_primario] ?? { abbr: '?', color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
              const pp  = passaporteStatus(m.passaporte_validade)
              const apt = m.aptidao_operacional === 'Apto'
              const ini = initials(m.nome_completo)

              return (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0D1117', transition: 'background .1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#131920')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0D1117')}
                >
                  {/* Avatar + nome */}
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#1F2A3C', border: '1.5px solid #004B87',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, color: '#009EDB',
                        flexShrink: 0,
                      }}>{ini}</div>
                      <div>
                        <div style={{ color: '#E8EDF5', fontWeight: 500 }}>
                          {m.nome_guerra ?? m.nome_completo.split(' ')[0]}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 1 }}>
                          {m.nome_completo}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Posto / Instituição */}
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ color: '#9BA8BC' }}>{m.posto_graduacao ?? '—'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 1 }}>{m.instituicao}</div>
                  </td>

                  {/* Componente */}
                  <td style={{ padding: '10px 14px' }}>
                    <Tag color={cmp.color} bg={cmp.bg} border={cmp.border}>{cmp.abbr}</Tag>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 14px' }}>
                    <Tag color={st.color} bg={st.bg} border={st.border}>{m.status_operacional}</Tag>
                  </td>

                  {/* Aptidão */}
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: apt ? '#00A550' : '#CC0000' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: apt ? '#00A550' : '#FF6B6B' }}>{m.aptidao_operacional}</span>
                    </div>
                  </td>

                  {/* Passaporte */}
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: pp.color }}>{pp.label}</span>
                  </td>

                  {/* Ação */}
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <Link href={`/pessoal/${m.id}`} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478',
                      textDecoration: 'none', transition: 'color .15s',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E87722')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#5A6478')}
                    >
                      PERFIL →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
