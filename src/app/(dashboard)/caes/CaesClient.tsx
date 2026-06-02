'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useEstado } from '@/lib/EstadoContext'

type Dog = Record<string, any>
type Props = { dogs: Dog[] }

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Ativo':       { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  'Em formação': { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Recuperação': { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Aposentado':  { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)',  border: 'rgba(155,168,188,0.2)' },
}

const especialidadeColors: Record<string, string> = {
  'Busca em escombros': '#FF6B6B',
  'Busca em área':      '#00A550',
  'Cadáver':            '#9BA8BC',
}

const estadoBadgeColors: Record<string, { color: string; bg: string; border: string }> = {
  CBPMESP: { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.3)' },
  CBMMG:   { color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.3)' },
  CBMPR:   { color: '#00A550', bg: 'rgba(0,165,80,0.12)',   border: 'rgba(0,165,80,0.3)' },
}

function idadeAnos(nasc: string | null) {
  if (!nasc) return null
  const diff = Date.now() - new Date(nasc).getTime()
  return Math.floor(diff / (365.25 * 86400000))
}

function vencimento(data: string | null): { label: string; color: string } | null {
  if (!data) return null
  const dias = Math.ceil((new Date(data).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: `Vencida ${Math.abs(dias)}d`, color: '#FF6B6B' }
  if (dias < 30)  return { label: `Vence ${dias}d`, color: '#E87722' }
  if (dias < 90)  return { label: `${dias}d`, color: '#FFDF00' }
  return { label: `${dias}d`, color: '#5A6478' }
}

function Stats({ dogs }: { dogs: Dog[] }) {
  const total = dogs.length
  const ativos = dogs.filter(d => d.status_operacional === 'Ativo').length
  const aptos  = dogs.filter(d => d.aptidao_operacional === 'Apto').length
  const alertas = dogs.filter(d => {
    const v1 = vencimento(d.certificacao_validade)
    const v2 = vencimento(d.proxima_vacina_raiva)
    return (v1 && ['#FF6B6B', '#E87722'].includes(v1.color)) || (v2 && ['#FF6B6B', '#E87722'].includes(v2.color))
  }).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[
        { label: 'Total de cães',  val: total,  color: '#009EDB', border: '#009EDB' },
        { label: 'Ativos',         val: ativos, color: '#00A550', border: '#00A550' },
        { label: 'Aptos operação', val: aptos,  color: '#00A550', border: '#00A550' },
        { label: 'Alertas (cert./vacina)', val: alertas, color: alertas > 0 ? '#FF6B6B' : '#5A6478', border: alertas > 0 ? '#CC0000' : 'rgba(255,255,255,0.07)' },
      ].map(c => (
        <div key={c.label} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderTop: `3px solid ${c.border}`, borderRadius: 5, padding: '12px 14px' }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val}</div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478', marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function CaesClient({ dogs }: Props) {
  const { estado } = useEstado()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Todos')

  const statusOpts = ['Todos', ...Object.keys(statusConfig)]

  const byEstado = useMemo(() =>
    estado === 'Todos' ? dogs : dogs.filter(d => d.proprietario === estado),
    [dogs, estado]
  )

  const filtered = useMemo(() => byEstado.filter(d => {
    const q = search.toLowerCase()
    const cond = d.condutor?.nome_guerra ?? d.condutor?.nome_completo ?? ''
    const matchSearch = !q ||
      d.nome?.toLowerCase().includes(q) ||
      (d.raca?.toLowerCase().includes(q) ?? false) ||
      (d.especialidade?.toLowerCase().includes(q) ?? false) ||
      cond.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'Todos' || d.status_operacional === filterStatus
    return matchSearch && matchStatus
  }), [byEstado, search, filterStatus])

  const selectStyle: React.CSSProperties = {
    background: '#131920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
    padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800, color: '#E8EDF5', letterSpacing: '0.02em', margin: 0 }}>
              Cães de Busca e Resgate
            </h1>
            {estado !== 'Todos' && estadoBadgeColors[estado] && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 2, color: estadoBadgeColors[estado].color, background: estadoBadgeColors[estado].bg, border: `1px solid ${estadoBadgeColors[estado].border}`, letterSpacing: '0.08em' }}>
                {estado}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>
            BINÔMIOS CINOTÉCNICOS · CACHE BRA-01
          </div>
        </div>
        <Link href="/caes/novo" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, background: '#E87722', color: '#fff', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo cão
        </Link>
      </div>

      <Stats dogs={byEstado} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, raça, especialidade, condutor..." style={{ ...selectStyle, paddingLeft: 32, width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, color: '#E8EDF5' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          {statusOpts.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
          {filtered.length} {filtered.length === 1 ? 'cão' : 'cães'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
          {byEstado.length === 0
            ? estado !== 'Todos' ? `Nenhum cão registrado para ${estado}.` : 'Nenhum cão cadastrado. Clique em "+ Novo cão" para começar.'
            : 'Nenhum cão encontrado com os filtros atuais.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map(d => {
            const st = statusConfig[d.status_operacional] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
            const espColor = especialidadeColors[d.especialidade] ?? '#9BA8BC'
            const idade = idadeAnos(d.data_nascimento)
            const cond = d.condutor ? (d.condutor.nome_guerra ?? d.condutor.nome_completo?.split(' ')[0]) : null
            const vcert = vencimento(d.certificacao_validade)
            const vvac  = vencimento(d.proxima_vacina_raiva)
            return (
              <Link key={d.id} href={`/caes/${d.id}`} style={{ textDecoration: 'none', background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${espColor}`, borderRadius: 5, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, transition: 'background .15s' }}
                onMouseEnter={ev => { ev.currentTarget.style.background = '#131920' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = '#0D1117' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `${espColor}20`, border: `1.5px solid ${espColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {d.foto_url
                        ? <img src={d.foto_url} alt={d.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 800, color: espColor }}>{d.nome?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 700, color: '#E8EDF5', lineHeight: 1.1 }}>{d.nome}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2 }}>
                        {[d.raca, idade != null ? `${idade}a` : null, d.sexo].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 7px', borderRadius: 2, color: st.color, background: st.bg, border: `1px solid ${st.border}`, letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>{d.status_operacional}</span>
                </div>

                {d.especialidade && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: espColor, fontWeight: 600 }}>
                    {d.especialidade}{d.nivel_certificacao ? ` · ${d.nivel_certificacao}` : ''}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC' }}>
                    {cond ? `Cond. ${cond}` : '— sem condutor —'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {vcert && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: vcert.color }} title="Certificação">C:{vcert.label}</span>}
                    {vvac && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: vvac.color }} title="Vacina antirrábica">V:{vvac.label}</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
