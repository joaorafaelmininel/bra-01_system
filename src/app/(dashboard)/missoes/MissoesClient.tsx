'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Mission = Record<string, any>
type Props = { missions: Mission[] }

const faseConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Desmobilizado':    { color: '#5A6478', bg: 'rgba(90,100,120,0.15)',  border: 'rgba(90,100,120,0.3)' },
  'Monitoramento':    { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Em prontidão':     { color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',    border: 'rgba(255,223,0,0.25)' },
  'Em mobilização':   { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Desdobrado':       { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',     border: 'rgba(204,0,0,0.3)' },
  'Missão concluída': { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.25)' },
}

const tipoConfig: Record<string, { color: string }> = {
  'Operação real': { color: '#FF6B6B' },
  'Exercício':     { color: '#E87722' },
  'Treinamento':   { color: '#009EDB' },
}

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 2, color, background: bg, border: `1px solid ${border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function Stats({ missions }: { missions: Mission[] }) {
  const total      = missions.length
  const desdobrado = missions.filter(m => m.fase === 'Desdobrado').length
  const ativas     = missions.filter(m => ['Monitoramento', 'Em prontidão', 'Em mobilização'].includes(m.fase)).length
  const concluidas = missions.filter(m => m.fase === 'Missão concluída').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[
        { label: 'Total de missões',  val: total,      color: '#009EDB', border: '#009EDB' },
        { label: 'Desdobrado',        val: desdobrado, color: desdobrado > 0 ? '#FF6B6B' : '#5A6478', border: desdobrado > 0 ? '#FF6B6B' : 'rgba(255,255,255,0.07)' },
        { label: 'Em acompanhamento', val: ativas,     color: ativas > 0 ? '#E87722' : '#5A6478',     border: ativas > 0 ? '#E87722' : 'rgba(255,255,255,0.07)' },
        { label: 'Missões concluídas',val: concluidas, color: '#00A550', border: '#00A550' },
      ].map(c => (
        <div key={c.label} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderTop: `3px solid ${c.border}`, borderRadius: 5, padding: '12px 14px' }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val}</div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478', marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function MissoesClient({ missions }: Props) {
  const [search, setSearch]         = useState('')
  const [filterFase, setFilterFase] = useState('Todos')
  const [filterTipo, setFilterTipo] = useState('Todos')

  const fases = ['Todos', 'Desmobilizado', 'Monitoramento', 'Em prontidão', 'Em mobilização', 'Desdobrado', 'Missão concluída']
  const tipos = ['Todos', 'Operação real', 'Exercício', 'Treinamento']

  const filtered = useMemo(() => missions.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.nome.toLowerCase().includes(q) || (m.codigo?.toLowerCase().includes(q) ?? false) || (m.pais?.toLowerCase().includes(q) ?? false)
    return matchSearch
      && (filterFase === 'Todos' || m.fase === filterFase)
      && (filterTipo === 'Todos' || m.tipo === filterTipo)
  }), [missions, search, filterFase, filterTipo])

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
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Missões</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>OPERAÇÕES · EXERCÍCIOS · TREINAMENTOS BRA-01</div>
        </div>
        <Link href="/missoes/nova" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, background: '#E87722', color: '#fff', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova missão
        </Link>
      </div>

      <Stats missions={missions} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, código, país..." style={{ ...selectStyle, paddingLeft: 32, width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, color: '#E8EDF5' }} />
        </div>
        <select value={filterFase} onChange={e => setFilterFase(e.target.value)} style={selectStyle}>
          {fases.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={selectStyle}>
          {tipos.map(t => <option key={t}>{t}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{filtered.length} {filtered.length === 1 ? 'missão' : 'missões'}</span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
            {missions.length === 0 ? 'Nenhuma missão cadastrada. Clique em "+ Nova missão" para começar.' : 'Nenhuma missão encontrada.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(m => {
            const fase = faseConfig[m.fase] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
            const tipoColor = tipoConfig[m.tipo]?.color ?? '#9BA8BC'
            const lider = m.lider ? `${m.lider.posto_graduacao ? m.lider.posto_graduacao + ' ' : ''}${m.lider.nome_guerra ?? m.lider.nome_completo}` : null
            const membros = m.mission_members?.[0]?.count ?? 0

            return (
              <Link key={m.id} href={`/missoes/${m.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '16px 20px', transition: 'border-color .15s, background .15s', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.background = '#1A2332' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = '#131920' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        {m.codigo && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 7px', borderRadius: 2, background: 'rgba(0,158,219,0.1)', color: '#009EDB', border: '1px solid rgba(0,158,219,0.2)' }}>
                            {m.codigo}
                          </span>
                        )}
                        <span style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 700, color: '#fff' }}>{m.nome}</span>
                        <Tag color={fase.color} bg={fase.bg} border={fase.border}>{m.fase}</Tag>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: tipoColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.tipo}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        {(m.pais || m.cidade) && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
                            📍 {[m.cidade, m.pais].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {lider && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>Líder: {lider}</span>}
                        {membros > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{membros} participante{membros !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {m.data_ativacao && (
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', marginBottom: 2 }}>ATIVAÇÃO</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC' }}>{formatDate(m.data_ativacao)}</div>
                        </div>
                      )}
                      {m.data_retorno && (
                        <div style={{ marginTop: 4 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', marginBottom: 2 }}>RETORNO</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC' }}>{formatDate(m.data_retorno)}</div>
                        </div>
                      )}
                      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>VER DETALHES →</div>
                    </div>
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
