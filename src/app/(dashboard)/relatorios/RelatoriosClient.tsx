'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Props = {
  members: any[]
  qualifications: any[]
  languages: any[]
  equipment: any[]
  functions: any[]
  designations: any[]
  vaccines: any[]
  vaccineCatalog: any[]
  missions: any[]
  alertsCount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function passaporteOk(validade: string | null) {
  if (!validade) return false
  return Math.ceil((new Date(validade).getTime() - Date.now()) / 86400000) > 180
}
function certOk(validade: string | null) {
  if (!validade) return true // permanente
  return new Date(validade) > new Date()
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}
function pctColor(p: number) {
  if (p >= 80) return '#00A550'
  if (p >= 50) return '#E87722'
  return '#CC0000'
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, pct, sub, color }: { label: string; pct: number; sub: string; color: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <span style={{ fontFamily:'var(--font-cond)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' as const, color:'#9BA8BC' }}>{label}</span>
        <span style={{ fontFamily:'var(--font-cond)', fontSize:20, fontWeight:800, color, lineHeight:1 }}>{pct}%</span>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:3, background:color, width:`${pct}%`, transition:'width 1s ease' }} />
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478' }}>{sub}</div>
    </div>
  )
}

// ─── Gap item ─────────────────────────────────────────────────────────────────

function GapItem({ priority, label, detail, link }: { priority: 'critico'|'alerta'|'ok'; label: string; detail: string; link?: string }) {
  const cfg = {
    critico: { color:'#FF6B6B', bg:'rgba(204,0,0,0.1)', border:'rgba(204,0,0,0.25)', dot:'#CC0000', icon:'!' },
    alerta:  { color:'#E87722', bg:'rgba(232,119,34,0.1)', border:'rgba(232,119,34,0.25)', dot:'#E87722', icon:'⚠' },
    ok:      { color:'#00A550', bg:'rgba(0,165,80,0.08)', border:'rgba(0,165,80,0.2)', dot:'#00A550', icon:'✓' },
  }[priority]

  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', background:'#131920', border:`1px solid ${cfg.border}`, borderLeft:`3px solid ${cfg.dot}`, borderRadius:4 }}>
      <div style={{ width:20, height:20, borderRadius:'50%', background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, color:cfg.color }}>
        {cfg.icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500, color:'#E8EDF5' }}>{label}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478', marginTop:2 }}>{detail}</div>
      </div>
      {link && (
        <Link href={link} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', textDecoration:'none', flexShrink:0, letterSpacing:'0.08em' }}>VER →</Link>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RelatoriosClient({
  members, qualifications, languages, equipment,
  functions, designations, vaccines, vaccineCatalog,
  missions, alertsCount,
}: Props) {
  const [activeTab, setActiveTab] = useState('Prontidão IEC')

  // ── Cálculos de score ──────────────────────────────────────────────────────

  const activeMembers = members.filter(m => m.status_operacional === 'Ativo' && m.aptidao_operacional === 'Apto')

  // Score efetivo
  const totalMembers    = activeMembers.length
  const passaporteOkM   = activeMembers.filter(m => passaporteOk(m.passaporte_validade)).length
  const vaccinaOkM      = activeMembers.filter(m => {
    return vaccineCatalog.every(vc =>
      vaccines.some(v => v.member_id === m.id && v.vaccine_id === vc.id && (!v.data_vencimento || new Date(v.data_vencimento) > new Date()))
    )
  }).length
  const efetivoPct = totalMembers === 0 ? 0 : Math.round(
    ((passaporteOkM / Math.max(totalMembers,1)) * 40 +
     (vaccinaOkM / Math.max(totalMembers,1)) * 30 +
     (Math.min(totalMembers, 22) / 22) * 30)
  )

  // Score organograma
  const totalPositions   = functions.length
  const coveredPrimary   = functions.filter(fn => designations.some(d => d.function_id === fn.id && d.primaria)).length
  const coveredAlternate = functions.filter(fn => designations.some(d => d.function_id === fn.id && d.alternativa)).length
  const organoPct = totalPositions === 0 ? 0 : Math.round(
    (coveredPrimary / totalPositions) * 60 + (coveredAlternate / totalPositions) * 40
  )

  // Score capacitação
  const totalQuals  = qualifications.length
  const validQuals  = qualifications.filter(q => certOk(q.data_validade)).length
  const engMembers  = activeMembers.filter(m =>
    languages.some(l => l.member_id === m.id && l.idioma.toLowerCase().includes('ingl') && ['Intermediário','Avançado','Fluente'].includes(l.nivel))
  ).length
  const capacPct = totalMembers === 0 ? 0 : Math.round(
    (totalQuals > 0 ? (validQuals / totalQuals) * 50 : 0) +
    ((engMembers / Math.max(totalMembers,1)) * 50)
  )

  // Score equipamentos
  const totalEquip = equipment.length
  const opEquip    = equipment.filter(e => e.status === 'Operacional').length
  const manutOk    = equipment.filter(e => !e.proxima_manutencao || new Date(e.proxima_manutencao) > new Date()).length
  const equipPct   = totalEquip === 0 ? 0 : Math.round(
    (opEquip / totalEquip) * 60 + (manutOk / Math.max(totalEquip,1)) * 40
  )

  // Score geral ponderado
  const geralPct = Math.round(efetivoPct * 0.30 + organoPct * 0.25 + capacPct * 0.25 + equipPct * 0.20)

  // ── Gaps ──────────────────────────────────────────────────────────────────

  const gaps = useMemo(() => {
    const g: { priority: 'critico'|'alerta'|'ok'; label: string; detail: string; link?: string; category: string }[] = []

    // Efetivo
    const semPassaporte = activeMembers.filter(m => !passaporteOk(m.passaporte_validade))
    if (semPassaporte.length > 0) g.push({ priority: semPassaporte.length > 3 ? 'critico' : 'alerta', label:`${semPassaporte.length} membro${semPassaporte.length>1?'s':''} com passaporte vencido ou ausente`, detail:`${semPassaporte.slice(0,3).map(m=>m.nome_guerra??m.nome_completo.split(' ')[0]).join(', ')}${semPassaporte.length>3?'...':''}`, link:'/pessoal', category:'Efetivo' })

    if (totalMembers < 22) g.push({ priority:'alerta', label:`Efetivo abaixo do mínimo para Heavy (${totalMembers}/22)`, detail:'INSARAG recomenda mínimo de 45-67 membros para Heavy classification', link:'/pessoal', category:'Efetivo' })
    else g.push({ priority:'ok', label:`Efetivo ativo: ${totalMembers} membros`, detail:'', link:'/pessoal', category:'Efetivo' })

    // Organograma
    const vagas = functions.filter(fn => !designations.some(d => d.function_id === fn.id && d.primaria))
    if (vagas.length > 0) g.push({ priority: vagas.length > 5 ? 'critico' : 'alerta', label:`${vagas.length} posição${vagas.length>1?'s':''} INSARAG sem cobertura`, detail:vagas.map(f=>f.codigo).join(' · '), link:'/organograma', category:'Organograma' })
    else g.push({ priority:'ok', label:'Todas as posições INSARAG cobertas', detail:'', link:'/organograma', category:'Organograma' })

    const semAlternativo = functions.filter(fn =>
      designations.some(d=>d.function_id===fn.id&&d.primaria) &&
      !designations.some(d=>d.function_id===fn.id&&d.alternativa)
    )
    if (semAlternativo.length > 0) g.push({ priority:'alerta', label:`${semAlternativo.length} posição${semAlternativo.length>1?'s':''} sem membro alternativo`, detail:semAlternativo.map(f=>f.codigo).join(' · '), link:'/organograma', category:'Organograma' })

    // Capacitação
    const certsVencidas = qualifications.filter(q => q.data_validade && new Date(q.data_validade) < new Date())
    if (certsVencidas.length > 0) g.push({ priority:'alerta', label:`${certsVencidas.length} certificação${certsVencidas.length>1?'s':''} vencida${certsVencidas.length>1?'s':''}`, detail:'Certificados expirados não contam como evidência IEC', link:'/treinamento', category:'Capacitação' })

    const fnRequerIngles = functions.filter(f => f.requer_ingles)
    const semIngles = fnRequerIngles.filter(fn => {
      const des = designations.find(d => d.function_id === fn.id && d.primaria)
      if (!des) return false
      return !languages.some(l => l.member_id === des.member?.id && l.idioma.toLowerCase().includes('ingl') && ['Intermediário','Avançado','Fluente'].includes(l.nivel))
    })
    if (semIngles.length > 0) g.push({ priority:'alerta', label:`${semIngles.length} posição${semIngles.length>1?'s':''} exigindo inglês sem cobertura adequada`, detail:semIngles.map(f=>f.codigo).join(' · '), link:'/treinamento', category:'Capacitação' })

    // Equipamentos
    const inoperante = equipment.filter(e => e.status === 'Inoperante')
    if (inoperante.length > 0) g.push({ priority:'critico', label:`${inoperante.length} equipamento${inoperante.length>1?'s':''} inoperante${inoperante.length>1?'s':''}`, detail:inoperante.slice(0,3).map(e=>e.codigo_item).join(', '), link:'/equipamentos', category:'Equipamentos' })

    const manutAtrasada = equipment.filter(e => e.proxima_manutencao && new Date(e.proxima_manutencao) < new Date())
    if (manutAtrasada.length > 0) g.push({ priority:'alerta', label:`${manutAtrasada.length} item${manutAtrasada.length>1?'s':''} com manutenção atrasada`, detail:manutAtrasada.slice(0,3).map(e=>e.codigo_item).join(', '), link:'/equipamentos', category:'Equipamentos' })

    if (totalEquip === 0) g.push({ priority:'critico', label:'Nenhum equipamento cadastrado no cache', detail:'O cache BRA-01 deve estar completo para avaliação IEC', link:'/equipamentos', category:'Equipamentos' })
    else if (opEquip === totalEquip) g.push({ priority:'ok', label:`Todos os ${totalEquip} equipamentos operacionais`, detail:'', link:'/equipamentos', category:'Equipamentos' })

    return g
  }, [members, qualifications, languages, equipment, functions, designations, vaccines, vaccineCatalog])

  const criticos = gaps.filter(g => g.priority === 'critico').length
  const alertas  = gaps.filter(g => g.priority === 'alerta').length

  const TABS = ['Prontidão IEC', 'Gaps e Ações', 'Evidências']

  // ── Prontidão IEC ─────────────────────────────────────────────────────────

  function TabProntidao() {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* Score IEC principal */}
        <div style={{
          background:'linear-gradient(90deg, #004B87 0%, #1A2332 100%)',
          border:'1px solid rgba(0,75,135,0.6)', borderRadius:6, padding:'20px 24px',
          display:'flex', alignItems:'center', gap:24,
        }}>
          <div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase' as const, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>Score de Prontidão IEC</div>
            <div style={{ fontFamily:'var(--font-cond)', fontSize:64, fontWeight:800, color:geralPct>=80?'#00A550':geralPct>=50?'#E87722':'#FF6B6B', lineHeight:1 }}>{geralPct}%</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:4 }}>BRA-01 Heavy USAR · INSARAG IEC</div>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
            <ScoreBar label="Efetivo" pct={efetivoPct} sub={`${totalMembers} membros ativos · ${passaporteOkM} passaportes ok`} color={pctColor(efetivoPct)} />
            <ScoreBar label="Organograma" pct={organoPct} sub={`${coveredPrimary}/${totalPositions} posições cobertas · ${coveredAlternate} com alternativo`} color={pctColor(organoPct)} />
            <ScoreBar label="Capacitação" pct={capacPct} sub={`${validQuals}/${totalQuals} certificações válidas · ${engMembers} membros com inglês`} color={pctColor(capacPct)} />
            <ScoreBar label="Equipamentos" pct={equipPct} sub={`${opEquip}/${totalEquip} operacionais · ${equipment.length-manutOk} com manutenção atrasada`} color={pctColor(equipPct)} />
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>Ponderação</div>
            {[['Efetivo','30%'],['Organograma','25%'],['Capacitação','25%'],['Equipamentos','20%']].map(([l,p]) => (
              <div key={l} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'rgba(255,255,255,0.5)', marginBottom:3 }}>
                <span style={{ color:'rgba(255,255,255,0.3)' }}>{l}</span> · {p}
              </div>
            ))}
          </div>
        </div>

        {/* Cards por categoria */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { label:'Efetivo',       pct:efetivoPct,  link:'/pessoal',     sub:`${totalMembers} membros ativos` },
            { label:'Organograma',   pct:organoPct,   link:'/organograma', sub:`${coveredPrimary}/${totalPositions} posições` },
            { label:'Capacitação',   pct:capacPct,    link:'/treinamento', sub:`${validQuals} certs. válidas` },
            { label:'Equipamentos',  pct:equipPct,    link:'/equipamentos',sub:`${opEquip}/${totalEquip} operacionais` },
          ].map(c => {
            const color = pctColor(c.pct)
            return (
              <Link key={c.label} href={c.link} style={{ textDecoration:'none' }}>
                <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderTop:`3px solid ${color}`, borderRadius:5, padding:'14px 16px', cursor:'pointer' }}>
                  <div style={{ fontFamily:'var(--font-cond)', fontSize:36, fontWeight:800, color, lineHeight:1 }}>{c.pct}%</div>
                  <div style={{ fontFamily:'var(--font-cond)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478', marginTop:4 }}>{c.label}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#2E3848', marginTop:4 }}>{c.sub}</div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Resumo alertas */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontFamily:'var(--font-cond)', fontSize:32, fontWeight:800, color:criticos>0?'#FF6B6B':'#5A6478' }}>{criticos}</div>
            <div>
              <div style={{ fontFamily:'var(--font-cond)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478' }}>Gaps Críticos</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#2E3848' }}>Impedem a classificação IEC</div>
            </div>
          </div>
          <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontFamily:'var(--font-cond)', fontSize:32, fontWeight:800, color:alertas>0?'#E87722':'#5A6478' }}>{alertas}</div>
            <div>
              <div style={{ fontFamily:'var(--font-cond)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#5A6478' }}>Alertas</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#2E3848' }}>Pontos de atenção para o IEC</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Gaps e Ações ──────────────────────────────────────────────────────────

  function TabGaps() {
    const categories = ['Efetivo', 'Organograma', 'Capacitação', 'Equipamentos']
    const [filterCat, setFilterCat] = useState('Todos')
    const [filterPri, setFilterPri] = useState('Todos')

    const filtered = gaps.filter(g =>
      (filterCat === 'Todos' || g.category === filterCat) &&
      (filterPri === 'Todos' || g.priority === filterPri.toLowerCase())
    )

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', gap:8 }}>
          {['Todos',...categories].map(c => (
            <button key={c} onClick={()=>setFilterCat(c)} style={{ padding:'5px 12px', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:10, background:filterCat===c?'rgba(0,158,219,0.12)':'transparent', border:filterCat===c?'1px solid rgba(0,158,219,0.3)':'1px solid rgba(255,255,255,0.07)', color:filterCat===c?'#009EDB':'#5A6478' }}>{c}</button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            {(['Todos','Critico','Alerta','Ok'] as const).map(p => (
              <button key={p} onClick={()=>setFilterPri(p)} style={{ padding:'5px 12px', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:10, background:'transparent', border:'1px solid rgba(255,255,255,0.07)', color:filterPri===p?'#E8EDF5':'#5A6478' }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {filtered.length === 0 ? (
            <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, padding:'40px', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#5A6478' }}>Nenhum item encontrado.</div>
            </div>
          ) : filtered.map((g, i) => (
            <GapItem key={i} priority={g.priority} label={g.label} detail={g.detail} link={g.link} />
          ))}
        </div>
      </div>
    )
  }

  // ── Evidências ─────────────────────────────────────────────────────────────

  function TabEvidencias() {
    const evidencias = [
      {
        categoria: 'Efetivo',
        items: [
          { label:`${totalMembers} membros ativos cadastrados`, ok: totalMembers >= 22, link:'/pessoal' },
          { label:`${passaporteOkM}/${totalMembers} passaportes válidos (>180 dias)`, ok: passaporteOkM === totalMembers, link:'/pessoal' },
          { label:`${activeMembers.filter(m=>m.aptidao_operacional==='Apto').length} membros aptos operacionalmente`, ok: true, link:'/pessoal' },
        ]
      },
      {
        categoria: 'Organograma',
        items: [
          { label:`${coveredPrimary}/${totalPositions} posições INSARAG Heavy cobertas`, ok: coveredPrimary === totalPositions, link:'/organograma' },
          { label:`${coveredAlternate} posições com membro alternativo`, ok: coveredAlternate >= totalPositions * 0.5, link:'/organograma' },
          { label:`TL designado: ${designations.find(d=>d.function?.codigo==='TL'&&d.primaria)?.member?.nome_guerra ?? 'Não designado'}`, ok: designations.some(d=>d.function?.codigo==='TL'&&d.primaria), link:'/organograma' },
        ]
      },
      {
        categoria: 'Capacitação',
        items: [
          { label:`${totalQuals} qualificações registradas no sistema`, ok: totalQuals > 0, link:'/treinamento' },
          { label:`${validQuals}/${totalQuals} certificações válidas`, ok: validQuals === totalQuals, link:'/treinamento' },
          { label:`${engMembers}/${totalMembers} membros com inglês (nível suficiente)`, ok: engMembers >= Math.ceil(totalMembers*0.3), link:'/treinamento' },
        ]
      },
      {
        categoria: 'Equipamentos',
        items: [
          { label:`${totalEquip} itens cadastrados no cache`, ok: totalEquip > 0, link:'/equipamentos' },
          { label:`${opEquip}/${totalEquip} equipamentos operacionais`, ok: opEquip === totalEquip, link:'/equipamentos' },
          { label:`${equipment.filter(e=>e.ultima_manutencao).length}/${totalEquip} com histórico de manutenção`, ok: equipment.filter(e=>e.ultima_manutencao).length === totalEquip, link:'/equipamentos' },
        ]
      },
      {
        categoria: 'Missões e Exercícios',
        items: [
          { label:`${missions.length} missão${missions.length!==1?'ões':''} registrada${missions.length!==1?'s':''}`, ok: missions.length > 0, link:'/missoes' },
          { label:`${missions.filter(m=>m.tipo==='exercício').length} exercício${missions.filter(m=>m.tipo==='exercício').length!==1?'s':''} documentado${missions.filter(m=>m.tipo==='exercício').length!==1?'s':''}`, ok: missions.filter(m=>m.tipo==='exercício').length > 0, link:'/missoes' },
        ]
      },
    ]

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ background:'rgba(0,75,135,0.2)', border:'1px solid rgba(0,75,135,0.4)', borderRadius:5, padding:'12px 16px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#009EDB', marginBottom:4 }}>ℹ RELATÓRIO DE EVIDÊNCIAS IEC</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>
            Este relatório consolida as evidências disponíveis no sistema para apresentação durante a avaliação INSARAG IEC. Gerado em {formatDate(new Date().toISOString())}.
          </div>
        </div>
        {evidencias.map(cat => (
          <div key={cat.categoria} style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.07)', borderRadius:5, overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'var(--font-cond)', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#9BA8BC' }}>{cat.categoria}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478' }}>
                {cat.items.filter(i=>i.ok).length}/{cat.items.length} OK
              </span>
            </div>
            <div style={{ padding:'8px 12px', display:'flex', flexDirection:'column', gap:4 }}>
              {cat.items.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 4px' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:item.ok?'#00A550':'#CC0000', flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:13, color:item.ok?'#E8EDF5':'#9BA8BC' }}>{item.label}</span>
                  <Link href={item.link} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478', textDecoration:'none', letterSpacing:'0.08em' }}>VER →</Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:22, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase' as const, color:'#fff' }}>Relatórios IEC</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6478', marginTop:2, letterSpacing:'0.08em' }}>PRONTIDÃO · GAPS · EVIDÊNCIAS · INSARAG HEAVY CLASSIFICATION</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ fontFamily:'var(--font-cond)', fontSize:26, fontWeight:800, color:pctColor(geralPct) }}>{geralPct}%</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#5A6478' }}>Score IEC</div>
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
            {tab==='Gaps e Ações' && criticos>0 && <span style={{ marginLeft:6, fontFamily:'var(--font-mono)', fontSize:9, padding:'0 4px', borderRadius:2, background:'rgba(204,0,0,0.2)', color:'#FF6B6B' }}>{criticos}</span>}
          </button>
        ))}
      </div>

      {activeTab==='Prontidão IEC' && <TabProntidao />}
      {activeTab==='Gaps e Ações'  && <TabGaps />}
      {activeTab==='Evidências'    && <TabEvidencias />}
    </div>
  )
}
