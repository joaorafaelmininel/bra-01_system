'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Member   = Record<string, any>
type Qual     = Record<string, any>
type Training = Record<string, any>
type Language = Record<string, any>
type Course   = Record<string, any>
type UsarFn   = Record<string, any>

type Props = {
  members: Member[]
  qualifications: Qual[]
  additionalTraining: Training[]
  languages: Language[]
  courseCatalog: Course[]
  usarFunctionsRequiringEnglish: UsarFn[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function validadeStatus(validade: string | null): { label: string; color: string; bg: string; border: string } {
  if (!validade) return { label: 'Permanente', color: '#009EDB', bg: 'rgba(0,158,219,0.1)', border: 'rgba(0,158,219,0.2)' }
  const dias = Math.ceil((new Date(validade).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: 'Vencida',           color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.3)' }
  if (dias < 60)  return { label: `Vence em ${dias}d`, color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.3)' }
  if (dias < 180) return { label: `Vence em ${dias}d`, color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',   border: 'rgba(255,223,0,0.25)' }
  return                  { label: 'Válida',            color: '#00A550', bg: 'rgba(0,165,80,0.1)',    border: 'rgba(0,165,80,0.25)' }
}

function nivelWidth(nivel: string) {
  return { 'Básico': '25%', 'Intermediário': '50%', 'Avançado': '75%', 'Fluente': '100%' }[nivel] ?? '25%'
}

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:500, padding:'2px 7px', borderRadius:2, color, background:bg, border:`1px solid ${border}`, letterSpacing:'0.05em', textTransform:'uppercase' as const }}>
      {children}
    </span>
  )
}

const selectStyle: React.CSSProperties = {
  background:'#131920', border:'1px solid rgba(255,255,255,0.1)', borderRadius:3,
  padding:'6px 10px', fontFamily:'var(--font-mono)', fontSize:11, color:'#9BA8BC',
  outline:'none', cursor:'pointer',
}
const inputStyle: React.CSSProperties = {
  ...selectStyle, fontFamily:'var(--font-body)', fontSize:13, color:'#E8EDF5',
}

// ─── Aba: Visão Geral ─────────────────────────────────────────────────────────

function TabVisaoGeral({ members, qualifications, courseCatalog }: { members: Member[], qualifications: Qual[], courseCatalog: Course[] }) {
  const mandatories = courseCatalog.filter(c => c.obrigatorio_heavy)

  // Stats gerais
  const totalQuals    = qualifications.length
  const vencidas      = qualifications.filter(q => q.data_validade && new Date(q.data_validade) < new Date()).length
  const vencendo60    = qualifications.filter(q => {
    if (!q.data_validade) return false
    const d = Math.ceil((new Date(q.data_validade).getTime() - Date.now()) / 86400000)
    return d >= 0 && d < 60
  }).length

  // Matrix: membro × curso obrigatório
  function getMemberQual(memberId: string, courseCode: string) {
    return qualifications.find(q =>
      q.member_id === memberId &&
      (q.codigo_curso === courseCode || q.nome_curso?.toLowerCase().includes(courseCode.toLowerCase()))
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[
          { label:'Total de qualificações', val:totalQuals,  color:'#009EDB', border:'#009EDB' },
          { label:'Membros ativos',          val:members.length, color:'#00A550', border:'#00A550' },
          { label:'Certificações vencidas',  val:vencidas,   color:vencidas>0?'#FF6B6B':'#5A6478', border:vencidas>0?'#CC0000':'rgba(255,255,255,0.07)' },
          { label:'Vencendo em 60 dias',     val:vencendo60, color:vencendo60>0?'#E87722':'#5A6478', border:vencendo60>0?'#E87722':'rgba(255,255,255,0.07)' },
        ].map(c => (
          <div key={c.label} style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderTop:`3px solid ${c.border}`, borderRadius:5, padding:'12px 14px' }}>
            <div style={{ fontFamily:'var(--font-cond)', fontSize:32, fontWeight:800, color:c.color, lineHeight:1 }}>{c.val}</div>
            <div style={{ fontFamily:'var(--font-cond)', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478', marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Matriz de cobertura */}
      {mandatories.length > 0 && (
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, overflow:'hidden' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#9BA8BC' }}>Cobertura — Cursos obrigatórios INSARAG</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>{mandatories.length} cursos obrigatórios</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:'#0D1117' }}>
                  <th style={{ textAlign:'left', padding:'8px 14px', fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', letterSpacing:'0.1em', whiteSpace:'nowrap' as const, borderBottom:'1px solid rgba(255,255,255,0.07)', minWidth:180 }}>MEMBRO</th>
                  {mandatories.map(c => (
                    <th key={c.id} style={{ textAlign:'center', padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', letterSpacing:'0.08em', borderBottom:'1px solid rgba(255,255,255,0.07)', minWidth:80 }}>
                      {c.codigo}
                    </th>
                  ))}
                  <th style={{ textAlign:'center', padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const memberQuals  = qualifications.filter(q => q.member_id === m.id)
                  const covered      = mandatories.filter(c => memberQuals.some(q =>
                    q.codigo_curso === c.codigo || q.nome_curso?.toLowerCase().includes(c.nome?.toLowerCase())
                  )).length
                  const pct = mandatories.length > 0 ? Math.round((covered / mandatories.length) * 100) : 0
                  const name = m.nome_guerra ?? m.nome_completo.split(' ')[0]

                  return (
                    <tr key={m.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#131920')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                    >
                      <td style={{ padding:'8px 14px' }}>
                        <Link href={`/pessoal/${m.id}`} style={{ textDecoration:'none' }}>
                          <div style={{ fontFamily:'var(--font-cond)', fontSize:13, fontWeight:700, color:'#E8EDF5' }}>{name}</div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478' }}>{m.instituicao}</div>
                        </Link>
                      </td>
                      {mandatories.map(c => {
                        const q = memberQuals.find(q =>
                          q.codigo_curso === c.codigo || q.nome_curso?.toLowerCase().includes(c.nome?.toLowerCase())
                        )
                        const vs = q ? validadeStatus(q.data_validade) : null
                        return (
                          <td key={c.id} style={{ textAlign:'center', padding:'8px 10px' }}>
                            {q ? (
                              <div title={q.nome_curso}>
                                <div style={{ fontSize:14, marginBottom:1 }}>✓</div>
                                {q.data_validade && (
                                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:vs?.color }}>{vs?.label}</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color:'#2E3848', fontSize:16 }}>—</span>
                            )}
                          </td>
                        )
                      })}
                      <td style={{ textAlign:'center', padding:'8px 10px' }}>
                        <div style={{ fontFamily:'var(--font-cond)', fontSize:14, fontWeight:800, color:pct===100?'#00A550':pct>50?'#E87722':'#FF6B6B' }}>{pct}%</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'8px 14px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:16 }}>
            {[{c:'#00A550', l:'Válida'},{c:'#FFDF00',l:'Vence em 60–180d'},{c:'#E87722',l:'Vence em 60d'},{c:'#FF6B6B',l:'Vencida'},{c:'#2E3848',l:'Não possui'}].map(({c,l}) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:c }} />
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Aba: Qualificações ───────────────────────────────────────────────────────

function TabQualificacoes({ qualifications, members }: { qualifications: Qual[], members: Member[] }) {
  const [search, setSearch]     = useState('')
  const [filterMember, setFM]   = useState('Todos')
  const [filterValidade, setFV] = useState('Todos')

  const memberOpts = ['Todos', ...members.map(m => m.id)]

  const filtered = useMemo(() => qualifications.filter(q => {
    const txt   = search.toLowerCase()
    const match = !txt || q.nome_curso?.toLowerCase().includes(txt) || q.codigo_curso?.toLowerCase().includes(txt) || q.entidade_emissora?.toLowerCase().includes(txt)
    const mMatch = filterMember === 'Todos' || q.member_id === filterMember
    let vMatch = true
    if (filterValidade === 'Vencidas')    vMatch = q.data_validade && new Date(q.data_validade) < new Date()
    if (filterValidade === 'Vencendo')    vMatch = q.data_validade && Math.ceil((new Date(q.data_validade).getTime()-Date.now())/86400000) < 60 && Math.ceil((new Date(q.data_validade).getTime()-Date.now())/86400000) >= 0
    if (filterValidade === 'Permanentes') vMatch = !q.data_validade
    return match && mMatch && vMatch
  }), [qualifications, search, filterMember, filterValidade])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Filtros */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar curso, código, entidade..." style={{ ...inputStyle, paddingLeft:32, width:'100%' }} />
        </div>
        <select value={filterMember} onChange={e=>setFM(e.target.value)} style={selectStyle}>
          <option value="Todos">Todos os membros</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.nome_guerra ?? m.nome_completo.split(' ')[0]}</option>)}
        </select>
        <select value={filterValidade} onChange={e=>setFV(e.target.value)} style={selectStyle}>
          {['Todos','Vencidas','Vencendo','Permanentes'].map(v => <option key={v}>{v}</option>)}
        </select>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>{filtered.length} qualificações</span>
      </div>

      {/* Tabela */}
      <div style={{ border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#131920', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              {['Membro','Curso','Entidade','Conclusão','Validade','Carga'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#5A6478' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:'40px', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:11, color:'#5A6478' }}>Nenhuma qualificação encontrada.</td></tr>
            ) : filtered.map(q => {
              const vs   = validadeStatus(q.data_validade)
              const name = q.member?.nome_guerra ?? q.member?.nome_completo?.split(' ')[0] ?? '?'
              return (
                <tr key={q.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:'#0D1117' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='#131920')}
                  onMouseLeave={e=>(e.currentTarget.style.background='#0D1117')}
                >
                  <td style={{ padding:'10px 14px' }}>
                    <Link href={`/pessoal/${q.member_id}`} style={{ textDecoration:'none' }}>
                      <div style={{ color:'#E8EDF5', fontWeight:500 }}>{name}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478' }}>{q.member?.instituicao}</div>
                    </Link>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      {q.codigo_curso && (
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, padding:'1px 6px', borderRadius:2, background:'rgba(0,158,219,0.1)', color:'#009EDB', border:'1px solid rgba(0,158,219,0.2)', flexShrink:0 }}>
                          {q.codigo_curso}
                        </span>
                      )}
                      <span style={{ color:'#E8EDF5' }}>{q.nome_curso}</span>
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', marginTop:1 }}>{q.nivel}</div>
                  </td>
                  <td style={{ padding:'10px 14px', color:'#9BA8BC', fontFamily:'var(--font-mono)', fontSize:10 }}>{q.entidade_emissora}</td>
                  <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:10, color:'#9BA8BC' }}>{formatDate(q.data_conclusao)}</td>
                  <td style={{ padding:'10px 14px' }}><Tag color={vs.color} bg={vs.bg} border={vs.border}>{vs.label}</Tag></td>
                  <td style={{ padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>{q.carga_horaria_h ? `${q.carga_horaria_h}h` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Aba: Capacitação Adicional ───────────────────────────────────────────────

function TabAdicional({ additionalTraining, members }: { additionalTraining: Training[], members: Member[] }) {
  const [search, setSearch]   = useState('')
  const [filterMember, setFM] = useState('Todos')
  const [filterTipo, setFT]   = useState('Todos')

  const tipos = ['Todos', ...Array.from(new Set(additionalTraining.map(t => t.tipo).filter(Boolean)))]

  const filtered = useMemo(() => additionalTraining.filter(t => {
    const q = search.toLowerCase()
    const m = !q || t.titulo?.toLowerCase().includes(q) || t.organizador?.toLowerCase().includes(q) || t.local?.toLowerCase().includes(q)
    return m && (filterMember === 'Todos' || t.member_id === filterMember) && (filterTipo === 'Todos' || t.tipo === filterTipo)
  }), [additionalTraining, search, filterMember, filterTipo])

  const funcOpts: Record<string, { color: string; bg: string; border: string }> = {
    'exercício':  { color:'#E87722', bg:'rgba(232,119,34,0.12)', border:'rgba(232,119,34,0.3)' },
    'seminário':  { color:'#009EDB', bg:'rgba(0,158,219,0.12)', border:'rgba(0,158,219,0.25)' },
    'workshop':   { color:'#9BA8BC', bg:'rgba(155,168,188,0.1)', border:'rgba(155,168,188,0.2)' },
    'treinamento':{ color:'#00A550', bg:'rgba(0,165,80,0.12)', border:'rgba(0,165,80,0.25)' },
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar título, organizador, local..." style={{ ...inputStyle, paddingLeft:32, width:'100%' }} />
        </div>
        <select value={filterMember} onChange={e=>setFM(e.target.value)} style={selectStyle}>
          <option value="Todos">Todos os membros</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.nome_guerra ?? m.nome_completo.split(' ')[0]}</option>)}
        </select>
        <select value={filterTipo} onChange={e=>setFT(e.target.value)} style={selectStyle}>
          {tipos.map(t => <option key={t}>{t}</option>)}
        </select>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>{filtered.length} registros</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'40px', textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#5A6478' }}>Nenhuma capacitação adicional registrada.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {filtered.map(t => {
            const tipo = (t.tipo ?? '').toLowerCase()
            const cfg  = funcOpts[tipo] ?? { color:'#9BA8BC', bg:'rgba(155,168,188,0.1)', border:'rgba(155,168,188,0.2)' }
            const name = t.member?.nome_guerra ?? t.member?.nome_completo?.split(' ')[0] ?? '?'
            const duracao = t.data_fim
              ? `${formatDate(t.data_inicio)} → ${formatDate(t.data_fim)}`
              : formatDate(t.data_inicio)

            return (
              <div key={t.id} style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:14 }}>
                <Tag color={cfg.color} bg={cfg.bg} border={cfg.border}>{t.tipo ?? 'N/D'}</Tag>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-cond)', fontSize:15, fontWeight:700, color:'#E8EDF5', marginBottom:3 }}>{t.titulo}</div>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' as const }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>{duracao}</span>
                    {t.organizador && <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>Org: {t.organizador}</span>}
                    {t.local && <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>📍 {t.local}</span>}
                    {t.carga_horaria_h && <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>{t.carga_horaria_h}h</span>}
                    {t.funcao_exercicio && <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#E87722' }}>{t.funcao_exercicio}</span>}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <Link href={`/pessoal/${t.member_id}`} style={{ textDecoration:'none' }}>
                    <div style={{ fontFamily:'var(--font-cond)', fontSize:13, fontWeight:700, color:'#E8EDF5' }}>{name}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478' }}>{t.member?.instituicao}</div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Aba: Idiomas ─────────────────────────────────────────────────────────────

function TabIdiomas({ languages, members, usarFunctionsRequiringEnglish }: { languages: Language[], members: Member[], usarFunctionsRequiringEnglish: UsarFn[] }) {

  // Quais membros têm inglês em nível suficiente (Intermediário+)
  const membersWithEnglish = members.filter(m =>
    languages.some(l => l.member_id === m.id && l.idioma.toLowerCase().includes('ingl') && ['Intermediário','Avançado','Fluente'].includes(l.nivel))
  )

  const englishCoverage = members.length > 0
    ? Math.round((membersWithEnglish.length / members.length) * 100)
    : 0

  // Idiomas únicos no efetivo
  const idiomasMap: Record<string, { count: number; members: string[] }> = {}
  languages.forEach(l => {
    const idioma = l.idioma
    if (!idiomasMap[idioma]) idiomasMap[idioma] = { count: 0, members: [] }
    idiomasMap[idioma].count++
    const name = l.member?.nome_guerra ?? l.member?.nome_completo?.split(' ')[0]
    if (name) idiomasMap[idioma].members.push(name)
  })

  const nivelConfig: Record<string, { color: string; bg: string; border: string }> = {
    'Básico':        { color:'#5A6478', bg:'rgba(90,100,120,0.1)',  border:'rgba(90,100,120,0.2)' },
    'Intermediário': { color:'#009EDB', bg:'rgba(0,158,219,0.1)',   border:'rgba(0,158,219,0.2)' },
    'Avançado':      { color:'#E87722', bg:'rgba(232,119,34,0.1)',  border:'rgba(232,119,34,0.2)' },
    'Fluente':       { color:'#00A550', bg:'rgba(0,165,80,0.1)',    border:'rgba(0,165,80,0.2)' },
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Cards de resumo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderTop:`3px solid ${englishCoverage>50?'#00A550':'#CC0000'}`, borderRadius:5, padding:'14px' }}>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:32, fontWeight:800, color:englishCoverage>50?'#00A550':'#CC0000', lineHeight:1 }}>{englishCoverage}%</div>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478', marginTop:4 }}>Cobertura de inglês</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', marginTop:4 }}>{membersWithEnglish.length}/{members.length} membros · Intermediário ou superior</div>
        </div>
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderTop:'3px solid #009EDB', borderRadius:5, padding:'14px' }}>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:32, fontWeight:800, color:'#009EDB', lineHeight:1 }}>{Object.keys(idiomasMap).length}</div>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478', marginTop:4 }}>Idiomas no efetivo</div>
        </div>
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderTop:`3px solid ${usarFunctionsRequiringEnglish.length>0?'#E87722':'#00A550'}`, borderRadius:5, padding:'14px' }}>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:32, fontWeight:800, color:'#E87722', lineHeight:1 }}>{usarFunctionsRequiringEnglish.length}</div>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478', marginTop:4 }}>Posições que exigem inglês</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', marginTop:4 }}>{usarFunctionsRequiringEnglish.map(f=>f.codigo).join(' · ')}</div>
        </div>
      </div>

      {/* Membros sem inglês para posições críticas */}
      {usarFunctionsRequiringEnglish.length > 0 && (
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, overflow:'hidden' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#9BA8BC' }}>Inglês no efetivo ativo</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {members.map(m => {
              const mLangs    = languages.filter(l => l.member_id === m.id)
              const englishL  = mLangs.find(l => l.idioma.toLowerCase().includes('ingl'))
              const hasEnough = englishL && ['Intermediário','Avançado','Fluente'].includes(englishL.nivel)
              const name      = m.nome_guerra ?? m.nome_completo.split(' ')[0]
              const cfg       = englishL ? (nivelConfig[englishL.nivel] ?? nivelConfig['Básico']) : null

              return (
                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:hasEnough?'#00A550':'#CC0000', flexShrink:0 }} />
                  <Link href={`/pessoal/${m.id}`} style={{ flex:1, textDecoration:'none' }}>
                    <span style={{ color:'#E8EDF5', fontSize:13, fontWeight:500 }}>{name}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', marginLeft:8 }}>{m.instituicao}</span>
                  </Link>
                  {englishL ? (
                    <Tag color={cfg!.color} bg={cfg!.bg} border={cfg!.border}>{englishL.nivel}</Tag>
                  ) : (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#CC0000' }}>Não registrado</span>
                  )}
                  {englishL && (
                    <div style={{ width:60, height:4, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', background:cfg!.color, width:nivelWidth(englishL.nivel), borderRadius:2 }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Todos os idiomas registrados */}
      {Object.keys(idiomasMap).length > 0 && (
        <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, overflow:'hidden' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#9BA8BC' }}>Idiomas registrados no efetivo</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8, padding:12 }}>
            {Object.entries(idiomasMap).sort((a,b)=>b[1].count-a[1].count).map(([idioma, info]) => (
              <div key={idioma} style={{ background:'#0D1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:4, padding:'10px 12px' }}>
                <div style={{ fontFamily:'var(--font-cond)', fontSize:15, fontWeight:700, color:'#E8EDF5', marginBottom:4 }}>{idioma}</div>
                <div style={{ fontFamily:'var(--font-cond)', fontSize:22, fontWeight:800, color:'#009EDB', lineHeight:1 }}>{info.count}</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', marginTop:4 }}>membro{info.count!==1?'s':''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = ['Visão Geral', 'Qualificações', 'Capacitação Adicional', 'Idiomas']

export default function CapacitacaoClient({ members, qualifications, additionalTraining, languages, courseCatalog, usarFunctionsRequiringEnglish }: Props) {
  const [activeTab, setActiveTab] = useState('Visão Geral')

  // Alertas rápidos
  const vencidas   = qualifications.filter(q => q.data_validade && new Date(q.data_validade) < new Date()).length
  const vencendo   = qualifications.filter(q => {
    if (!q.data_validade) return false
    const d = Math.ceil((new Date(q.data_validade).getTime()-Date.now())/86400000)
    return d >= 0 && d < 60
  }).length

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:22, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase' as const, color:'#fff' }}>Capacitação / Especializações</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478', marginTop:2, letterSpacing:'0.08em' }}>QUALIFICAÇÕES · TREINAMENTOS · IDIOMAS · BRA-01</div>
        </div>
        {/* Alertas rápidos */}
        <div style={{ display:'flex', gap:8 }}>
          {vencidas > 0 && (
            <div style={{ padding:'6px 12px', borderRadius:3, background:'rgba(204,0,0,0.12)', border:'1px solid rgba(204,0,0,0.3)', fontFamily:'var(--font-mono)', fontSize:10, color:'#FF6B6B' }}>
              ⚠ {vencidas} cert. vencida{vencidas!==1?'s':''}
            </div>
          )}
          {vencendo > 0 && (
            <div style={{ padding:'6px 12px', borderRadius:3, background:'rgba(232,119,34,0.12)', border:'1px solid rgba(232,119,34,0.3)', fontFamily:'var(--font-mono)', fontSize:10, color:'#E87722' }}>
              ⚠ {vencendo} vencendo em 60d
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{
            padding:'8px 16px', background:'none', border:'none', cursor:'pointer',
            fontFamily:'var(--font-cond)', fontSize:12, fontWeight:600,
            letterSpacing:'0.1em', textTransform:'uppercase' as const,
            color:activeTab===tab?'#009EDB':'#5A6478',
            borderBottom:activeTab===tab?'2px solid #009EDB':'2px solid transparent',
            marginBottom:-1, transition:'color .15s',
          }}>
            {tab}
            {tab==='Qualificações' && qualifications.length>0 && <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:9, padding:'0 4px', borderRadius:2, background:'rgba(0,158,219,0.15)', color:'#009EDB' }}>{qualifications.length}</span>}
            {tab==='Capacitação Adicional' && additionalTraining.length>0 && <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:9, padding:'0 4px', borderRadius:2, background:'rgba(0,158,219,0.15)', color:'#009EDB' }}>{additionalTraining.length}</span>}
            {tab==='Idiomas' && languages.length>0 && <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:9, padding:'0 4px', borderRadius:2, background:'rgba(0,158,219,0.15)', color:'#009EDB' }}>{languages.length}</span>}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab==='Visão Geral'          && <TabVisaoGeral members={members} qualifications={qualifications} courseCatalog={courseCatalog} />}
      {activeTab==='Qualificações'         && <TabQualificacoes qualifications={qualifications} members={members} />}
      {activeTab==='Capacitação Adicional' && <TabAdicional additionalTraining={additionalTraining} members={members} />}
      {activeTab==='Idiomas'               && <TabIdiomas languages={languages} members={members} usarFunctionsRequiringEnglish={usarFunctionsRequiringEnglish} />}
    </div>
  )
}
