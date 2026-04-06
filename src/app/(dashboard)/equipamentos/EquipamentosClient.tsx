'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Equipment = Record<string, any>
type Section = Record<string, any>

type Props = {
  equipment: Equipment[]
  sections: Section[]
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'Operacional':         { label: 'Operacional',        color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  'Manutenção rápida':  { label: 'Manut. rápida',       color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Manutenção':         { label: 'Manutenção',           color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Inoperante':         { label: 'Inoperante',           color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.3)' },
  'Em trânsito':        { label: 'Em trânsito',          color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.25)' },
  'Processo de descarga':{ label: 'Descarga',            color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)', border: 'rgba(155,168,188,0.2)' },
  'Em missão':          { label: 'Em missão',            color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',   border: 'rgba(255,223,0,0.25)' },
}

const sectionColors: Record<string, string> = {
  R: '#FF6B6B', M: '#00A550', T: '#E87722',
  C: '#009EDB', L: '#9BA8BC', P: '#FFDF00',
  PP: '#CC0000', A: '#002776',
}

function manutencaoStatus(proxima: string | null) {
  if (!proxima) return null
  const dias = Math.ceil((new Date(proxima).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: `Atrasada ${Math.abs(dias)}d`, color: '#FF6B6B' }
  if (dias < 30)  return { label: `Vence em ${dias}d`,           color: '#E87722' }
  if (dias < 90)  return { label: `${dias}d`,                    color: '#FFDF00' }
  return               { label: `${dias}d`,                      color: '#5A6478' }
}

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 7px', borderRadius: 2, color, background: bg, border: `1px solid ${border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

// ─── Breakdown por seção ──────────────────────────────────────────────────────

function SectionBreakdown({ equipment, sections, filter, onFilter }: {
  equipment: Equipment[]; sections: Section[]; filter: string; onFilter: (s: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {sections.map(sec => {
        const count = equipment.filter(e => e.section?.codigo === sec.codigo).length
        const color = sectionColors[sec.codigo] ?? '#9BA8BC'
        const active = filter === sec.codigo
        return (
          <button key={sec.codigo} onClick={() => onFilter(active ? 'Todos' : sec.codigo)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 3, cursor: 'pointer',
            background: active ? `${color}20` : 'transparent',
            border: `1px solid ${active ? color : 'rgba(255,255,255,0.07)'}`,
            color: active ? color : '#5A6478',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            transition: 'all .15s',
          }}>
            <span style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700 }}>{sec.codigo}</span>
            <span>{sec.nome_pt}</span>
            <span style={{ fontWeight: 700, color: active ? color : '#9BA8BC' }}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats({ equipment }: { equipment: Equipment[] }) {
  const total       = equipment.length
  const operacional = equipment.filter(e => e.status === 'Operacional').length
  const manutencao  = equipment.filter(e => ['Manutenção', 'Manutenção rápida'].includes(e.status)).length
  const critico     = equipment.filter(e => {
    if (!e.proxima_manutencao) return false
    return Math.ceil((new Date(e.proxima_manutencao).getTime() - Date.now()) / 86400000) < 30
  }).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[
        { label: 'Total de itens',       val: total,       color: '#009EDB', border: '#009EDB' },
        { label: 'Operacionais',         val: operacional, color: '#00A550', border: '#00A550' },
        { label: 'Em manutenção',        val: manutencao,  color: '#E87722', border: '#E87722' },
        { label: 'Manutenção crítica',   val: critico,     color: critico > 0 ? '#FF6B6B' : '#5A6478', border: critico > 0 ? '#CC0000' : 'rgba(255,255,255,0.07)' },
      ].map(c => (
        <div key={c.label} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderTop: `3px solid ${c.border}`, borderRadius: 5, padding: '12px 14px' }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val}</div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478', marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EquipamentosClient({ equipment, sections }: Props) {
  const [search, setSearch]     = useState('')
  const [filterSec, setFilterSec] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')

  const statusOpts = ['Todos', ...Object.keys(statusConfig)]

  const filtered = useMemo(() => equipment.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      e.nome.toLowerCase().includes(q) ||
      e.codigo_item.toLowerCase().includes(q) ||
      (e.fabricante?.toLowerCase().includes(q) ?? false) ||
      (e.modelo?.toLowerCase().includes(q) ?? false)
    const matchSec    = filterSec    === 'Todos' || e.section?.codigo === filterSec
    const matchStatus = filterStatus === 'Todos' || e.status === filterStatus
    return matchSearch && matchSec && matchStatus
  }), [equipment, search, filterSec, filterStatus])

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
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Equipamentos</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>CACHE BRA-01 · PADRÃO INSARAG/FEMA</div>
        </div>
        <Link href="/equipamentos/novo" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 3,
          background: '#E87722', color: '#fff',
          fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo item
        </Link>
      </div>

      {/* Stats */}
      <Stats equipment={equipment} />

      {/* Seções */}
      <SectionBreakdown equipment={equipment} sections={sections} filter={filterSec} onFilter={setFilterSec} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar código, nome, fabricante, modelo..."
            style={{ ...selectStyle, paddingLeft: 32, width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, color: '#E8EDF5' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          {statusOpts.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#131920', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Código', 'Item', 'Seção / Grupo', 'Status', 'Responsável', 'Próx. Manutenção', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6478' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
                  {equipment.length === 0 ? 'Nenhum equipamento cadastrado. Clique em "+ Novo item" para começar.' : 'Nenhum item encontrado.'}
                </td>
              </tr>
            ) : filtered.map(e => {
              const st    = statusConfig[e.status] ?? { label: e.status, color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
              const manut = manutencaoStatus(e.proxima_manutencao)
              const secColor = sectionColors[e.section?.codigo] ?? '#9BA8BC'
              const responsavel = e.responsavel
                ? (e.responsavel.nome_guerra ?? e.responsavel.nome_completo?.split(' ')[0])
                : null

              return (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0D1117', transition: 'background .1s' }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = '#131920')}
                  onMouseLeave={ev => (ev.currentTarget.style.background = '#0D1117')}
                >
                  {/* Código */}
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 2, background: `${secColor}15`, color: secColor, border: `1px solid ${secColor}40` }}>
                      {e.codigo_item}
                    </span>
                  </td>

                  {/* Item */}
                  <td style={{ padding: '10px 14px', maxWidth: 300 }}>
                    <div style={{ color: '#E8EDF5', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nome}</div>
                    {(e.fabricante || e.modelo) && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 1 }}>
                        {[e.fabricante, e.modelo].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </td>

                  {/* Seção / Grupo */}
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: secColor, fontWeight: 600 }}>{e.section?.codigo} — {e.section?.nome_pt}</div>
                    {e.group && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 1 }}>{e.group.nome}</div>}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 14px' }}>
                    <Tag color={st.color} bg={st.bg} border={st.border}>{st.label}</Tag>
                  </td>

                  {/* Responsável */}
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC' }}>
                      {responsavel ?? '—'}
                    </span>
                  </td>

                  {/* Manutenção */}
                  <td style={{ padding: '10px 14px' }}>
                    {manut ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: manut.color }}>{manut.label}</span>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848' }}>—</span>
                    )}
                  </td>

                  {/* Ação */}
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <Link href={`/equipamentos/${e.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color .15s' }}
                      onMouseEnter={ev => (ev.currentTarget.style.color = '#E87722')}
                      onMouseLeave={ev => (ev.currentTarget.style.color = '#5A6478')}
                    >
                      DETALHES →
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
