'use client'

import { useState, useMemo, useCallback } from 'react'
import type { } from 'jspdf'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UsarFunction = Record<string, any>
type Designation  = Record<string, any>
type Member       = Record<string, any>

type Props = {
  functions: UsarFunction[]
  designations: Designation[]
  members: Member[]
}

const componenteConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'Management':       { label: 'Management',       color: '#009EDB', bg: 'rgba(0,158,219,0.08)',   border: 'rgba(0,158,219,0.2)' },
  'Technical Search': { label: 'Technical Search', color: '#E87722', bg: 'rgba(232,119,34,0.08)',  border: 'rgba(232,119,34,0.2)' },
  'Rescue':           { label: 'Rescue',           color: '#FF6B6B', bg: 'rgba(204,0,0,0.08)',     border: 'rgba(204,0,0,0.2)' },
  'Medical':          { label: 'Medical',          color: '#00A550', bg: 'rgba(0,165,80,0.08)',    border: 'rgba(0,165,80,0.2)' },
  'Logistics':        { label: 'Logistics',        color: '#9BA8BC', bg: 'rgba(155,168,188,0.06)', border: 'rgba(155,168,188,0.15)' },
}
const COMPONENTE_ORDER = ['Management','Technical Search','Rescue','Medical','Logistics']
const statusDot: Record<string,string> = { ok:'#00A550', doc:'#FFDF00', inapto:'#E87722', inativo:'#FF6B6B', vazio:'#2E3848' }

function passaporteOk(v:string|null){if(!v)return false;return Math.ceil((new Date(v).getTime()-Date.now())/86400000)>180}
function memberStatus(m:any){if(!m)return 'vazio';if(m.status_operacional!=='Ativo')return 'inativo';if(m.aptidao_operacional!=='Apto')return 'inapto';if(!passaporteOk(m.passaporte_validade))return 'doc';return 'ok'}

function ModalAtribuir({fn,members,currentDesignations,onClose,onSaved}:{fn:UsarFunction;members:Member[];currentDesignations:Designation[];onClose:()=>void;onSaved:()=>void}){
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [form,setForm]=useState({member_id:'',primaria:true,alternativa:false,data_desde:''})
  const cmp=componenteConfig[fn.componente]??{color:'#9BA8BC',bg:'rgba(0,0,0,0)',border:'rgba(255,255,255,0.1)'}
  const alreadyAssigned=currentDesignations.filter(d=>d.function_id===fn.id).map(d=>d.member_id)
  const available=members.filter(m=>!alreadyAssigned.includes(m.id))
  const inputStyle:React.CSSProperties={width:'100%',background:'#0D1117',border:'1px solid rgba(255,255,255,0.1)',borderRadius:3,padding:'8px 10px',fontSize:13,color:'#E8EDF5',fontFamily:'var(--font-body)',outline:'none'}
  const labelStyle:React.CSSProperties={display:'block',fontFamily:'var(--font-mono)',fontSize:9,fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase' as const,color:'#5A6478',marginBottom:5}
  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();if(!form.member_id){setError('Selecione um membro');return}
    setLoading(true);setError(null)
    const supabase=createClient()
    const{error:err}=await supabase.from('member_usar_functions').insert({member_id:form.member_id,function_id:fn.id,primaria:form.primaria,alternativa:form.alternativa,data_desde:form.data_desde||null})
    if(err){setError(err.message);setLoading(false);return}
    onSaved()
  }
  const selectedMember=available.find(m=>m.id===form.member_id)
  const st=selectedMember?memberStatus(selectedMember):null
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#131920',border:'1px solid rgba(255,255,255,0.12)',borderRadius:6,width:'100%',maxWidth:500}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:500,padding:'2px 7px',borderRadius:2,color:cmp.color,background:cmp.bg,border:`1px solid ${cmp.border}`}}>{fn.codigo}</span>
              <span style={{fontFamily:'var(--font-cond)',fontSize:16,fontWeight:700,color:'#fff'}}>{fn.nome_pt}</span>
            </div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478'}}>{fn.nome_en} · {fn.componente}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#5A6478',fontSize:20,lineHeight:1}}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:20}}>
          {available.length===0?(
            <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#5A6478',textAlign:'center',padding:'16px 0'}}>Todos os membros já foram atribuídos a esta posição.</div>
          ):(
            <>
              <div style={{marginBottom:14}}>
                <label style={labelStyle}>Membro *</label>
                <select style={inputStyle} value={form.member_id} onChange={e=>setForm(p=>({...p,member_id:e.target.value}))}>
                  <option value="">— Selecione um membro —</option>
                  {available.map(m=><option key={m.id} value={m.id}>{m.posto_graduacao?`${m.posto_graduacao} `:''}{m.nome_guerra??m.nome_completo} · {m.instituicao}</option>)}
                </select>
              </div>
              {selectedMember&&(
                <div style={{background:'#0D1117',border:'1px solid rgba(255,255,255,0.07)',borderRadius:4,padding:'10px 14px',marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:statusDot[st??'vazio']}}/>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#9BA8BC'}}>{selectedMember.componente_primario} · {selectedMember.aptidao_operacional}</span>
                  </div>
                  {st==='doc'&&<div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#E87722'}}>⚠ Passaporte vencido/ausente</div>}
                  {st==='inapto'&&<div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#E87722'}}>⚠ Inapto operacionalmente</div>}
                </div>
              )}
              <div style={{marginBottom:14}}>
                <label style={labelStyle}>Data de atribuição</label>
                <input type="date" style={inputStyle} value={form.data_desde} onChange={e=>setForm(p=>({...p,data_desde:e.target.value}))}/>
              </div>
              <div style={{display:'flex',gap:20,marginBottom:16}}>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:11,color:'#9BA8BC'}}>
                  <input type="checkbox" checked={form.primaria} onChange={e=>setForm(p=>({...p,primaria:e.target.checked}))}/> Função primária
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:11,color:'#9BA8BC'}}>
                  <input type="checkbox" checked={form.alternativa} onChange={e=>setForm(p=>({...p,alternativa:e.target.checked}))}/> Função alternativa
                </label>
              </div>
              {fn.requer_ingles&&<div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#009EDB',marginBottom:14}}>★ Esta posição requer proficiência em inglês</div>}
            </>
          )}
          {error&&<div style={{padding:'8px 12px',borderRadius:3,background:'rgba(204,0,0,0.12)',border:'1px solid rgba(204,0,0,0.3)',fontFamily:'var(--font-mono)',fontSize:11,color:'#FF6B6B',marginBottom:12}}>ERRO: {error}</div>}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button type="button" onClick={onClose} style={{padding:'7px 14px',borderRadius:3,background:'none',border:'1px solid rgba(255,255,255,0.1)',fontFamily:'var(--font-mono)',fontSize:10,color:'#9BA8BC',cursor:'pointer',letterSpacing:'0.1em'}}>CANCELAR</button>
            {available.length>0&&<button type="submit" disabled={loading} style={{padding:'7px 18px',borderRadius:3,background:'#E87722',border:'none',fontFamily:'var(--font-cond)',fontSize:13,fontWeight:700,color:'#fff',cursor:loading?'not-allowed':'pointer',letterSpacing:'0.08em',textTransform:'uppercase' as const}}>{loading?'SALVANDO...':'ATRIBUIR'}</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

function MemberRow({designation,tipo,onRemove}:{designation:Designation;tipo:string;onRemove?:(id:string)=>void}){
  const m=designation.member;if(!m)return null
  const st=memberStatus(m);const name=m.nome_guerra??m.nome_completo?.split(' ')[0]
  return(
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0'}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:statusDot[st],flexShrink:0}}/>
      <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478',width:64,flexShrink:0}}>{tipo}</span>
      <span style={{fontSize:12,color:'#E8EDF5',flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.posto_graduacao?`${m.posto_graduacao} `:''}{name}</span>
      <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478'}}>{m.instituicao}</span>
      <Link href={`/pessoal/${m.id}`} onClick={e=>e.stopPropagation()} style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478',textDecoration:'none',flexShrink:0}}>→</Link>
      {onRemove&&<button onClick={e=>{e.stopPropagation();if(window.confirm(`Desatribuir ${name} desta posição?`))onRemove(designation.id)}} style={{background:'none',border:'none',cursor:'pointer',color:'#CC0000',fontSize:14,lineHeight:1,padding:'0 2px',flexShrink:0}} title="Desatribuir">×</button>}
    </div>
  )
}

function PositionCard({fn,designations,members,onAssign,onRemove}:{fn:UsarFunction;designations:Designation[];members:Member[];onAssign:(fn:UsarFunction)=>void;onRemove:(id:string)=>void}){
  const [expanded,setExpanded]=useState(false)
  const primary=designations.filter(d=>d.function_id===fn.id&&d.primaria)
  const alternate=designations.filter(d=>d.function_id===fn.id&&d.alternativa)
  const covered=primary.length>0;const hasAlt=alternate.length>0
  const cmp=componenteConfig[fn.componente]??{color:'#9BA8BC',bg:'rgba(0,0,0,0)',border:'rgba(255,255,255,0.1)'}
  const accentColor=!covered?'#CC0000':!hasAlt?'#FFDF00':'#00A550'
  return(
    <div style={{background:'#131920',border:`1px solid ${covered?'rgba(255,255,255,0.07)':'rgba(204,0,0,0.2)'}`,borderLeft:`3px solid ${accentColor}`,borderRadius:5,overflow:'hidden'}}>
      <div onClick={()=>setExpanded(!expanded)} style={{padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}
        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.03)')}
        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:500,padding:'2px 7px',borderRadius:2,color:cmp.color,background:cmp.bg,border:`1px solid ${cmp.border}`,letterSpacing:'0.05em',flexShrink:0}}>{fn.codigo}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'var(--font-cond)',fontSize:13,fontWeight:700,color:'#E8EDF5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{fn.nome_pt}</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478',marginTop:1}}>{fn.nome_en}</div>
        </div>
        {!covered&&<span style={{fontFamily:'var(--font-mono)',fontSize:8,padding:'2px 6px',borderRadius:2,background:'rgba(204,0,0,0.15)',color:'#FF6B6B',border:'1px solid rgba(204,0,0,0.3)',flexShrink:0,letterSpacing:'0.05em'}}>VAGA</span>}
        <svg style={{width:12,height:12,color:'#5A6478',flexShrink:0,transform:expanded?'rotate(180deg)':'none',transition:'transform .2s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </div>
      {(covered||expanded)&&(
        <div style={{padding:'0 14px 10px'}}>
          {primary.map(d=><MemberRow key={d.id} designation={d} tipo="Primário" onRemove={onRemove}/>)}
          {alternate.map(d=><MemberRow key={d.id} designation={d} tipo="Alternativo" onRemove={onRemove}/>)}
          {!covered&&<div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0'}}><div style={{width:6,height:6,borderRadius:'50%',background:'#2E3848',border:'1.5px solid #5A6478'}}/><span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#5A6478'}}>Sem designação</span></div>}
        </div>
      )}
      {expanded&&(
        <div style={{padding:'8px 14px 12px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={()=>onAssign(fn)} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:3,cursor:'pointer',background:'rgba(232,119,34,0.12)',border:'1px solid rgba(232,119,34,0.3)',fontFamily:'var(--font-mono)',fontSize:10,color:'#E87722',letterSpacing:'0.08em'}}>
            <span style={{fontSize:14,lineHeight:1}}>+</span> ATRIBUIR MEMBRO
          </button>
          {fn.requer_ingles&&<span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#009EDB'}}>★ Requer inglês</span>}
        </div>
      )}
    </div>
  )
}

function OrgStats({functions,designations}:{functions:UsarFunction[];designations:Designation[]}){
  const total=functions.length
  const cobertos=functions.filter(fn=>designations.some(d=>d.function_id===fn.id&&d.primaria)).length
  const comAlt=functions.filter(fn=>designations.some(d=>d.function_id===fn.id&&d.alternativa)).length
  const pct=Math.round((cobertos/total)*100)
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{background:'#131920',border:'1px solid rgba(255,255,255,0.07)',borderRadius:5,padding:'16px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:10}}>
          <div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase' as const,color:'#5A6478',marginBottom:4}}>Cobertura de posições · IEC Heavy</div>
            <div style={{fontFamily:'var(--font-cond)',fontSize:36,fontWeight:800,color:pct===100?'#00A550':pct>50?'#E87722':'#CC0000',lineHeight:1}}>{pct}%</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#9BA8BC'}}>{cobertos} / {total} posições cobertas</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#5A6478',marginTop:2}}>{comAlt} com alternativo · {total-cobertos} vagas</div>
          </div>
        </div>
        <div style={{height:6,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:3,background:pct===100?'#00A550':pct>50?'#E87722':'#CC0000',width:`${pct}%`,transition:'width 1s ease'}}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
        {COMPONENTE_ORDER.map(comp=>{
          const cmp=componenteConfig[comp];const fns=functions.filter(fn=>fn.componente===comp)
          const cov=fns.filter(fn=>designations.some(d=>d.function_id===fn.id&&d.primaria)).length
          const p=fns.length>0?Math.round((cov/fns.length)*100):0
          return(<div key={comp} style={{background:'#131920',border:`1px solid ${cmp.border}`,borderTop:`2px solid ${cmp.color}`,borderRadius:5,padding:'10px 12px'}}>
            <div style={{fontFamily:'var(--font-cond)',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase' as const,color:cmp.color,marginBottom:4}}>{cmp.label}</div>
            <div style={{fontFamily:'var(--font-cond)',fontSize:22,fontWeight:800,color:cmp.color,lineHeight:1}}>{p}%</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478',marginTop:2}}>{cov}/{fns.length}</div>
          </div>)
        })}
      </div>
    </div>
  )
}

export default function OrganogramaClient({functions,designations,members}:Props){
  const [filterComp,setFilterComp]=useState('Todos')
  const [showVacant,setShowVacant]=useState(false)
  const [assignModal,setAssignModal]=useState<UsarFunction|null>(null)
  const [localDesig,setLocalDesig]=useState(designations)
  const [pdfLoading,setPdfLoading]=useState(false)

  const filtered=useMemo(()=>{
    let fns=functions
    if(filterComp!=='Todos')fns=fns.filter(fn=>fn.componente===filterComp)
    if(showVacant)fns=fns.filter(fn=>!localDesig.some(d=>d.function_id===fn.id&&d.primaria))
    return fns
  },[functions,localDesig,filterComp,showVacant])

  const grouped=useMemo(()=>{
    const map:Record<string,UsarFunction[]>={}
    filtered.forEach(fn=>{if(!map[fn.componente])map[fn.componente]=[];map[fn.componente].push(fn)})
    return COMPONENTE_ORDER.filter(c=>map[c]?.length>0).map(c=>({componente:c,fns:map[c]}))
  },[filtered])

  const vacantCount=functions.filter(fn=>!localDesig.some(d=>d.function_id===fn.id&&d.primaria)).length

  async function handleExportPDF(){
    setPdfLoading(true)
    try {
      const {generateOrganogramaPDF} = await import('@/lib/generateOrganogramaPDF')
      generateOrganogramaPDF(functions, localDesig)
    } catch(e) {
      console.error('PDF error:', e)
      alert('Erro ao gerar PDF. Verifique se o pacote jspdf está instalado: pnpm add jspdf')
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleRemove(desigId:string){
    const supabase=createClient()
    await supabase.from('member_usar_functions').delete().eq('id',desigId)
    const{data}=await supabase.from('member_usar_functions').select('*, member:members(id,nome_guerra,nome_completo,posto_graduacao,instituicao,componente_primario,status_operacional,aptidao_operacional,passaporte_validade)')
    if(data)setLocalDesig(data)
  }

  async function handleAssignSaved(){
    const supabase=createClient()
    const{data}=await supabase.from('member_usar_functions').select('*, member:members(id,nome_guerra,nome_completo,posto_graduacao,instituicao,componente_primario,status_operacional,aptidao_operacional,passaporte_validade)')
    if(data)setLocalDesig(data)
    setAssignModal(null)
  }

  return(
    <div style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
      {assignModal&&<ModalAtribuir fn={assignModal} members={members} currentDesignations={localDesig} onClose={()=>setAssignModal(null)} onSaved={handleAssignSaved}/>}

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:'var(--font-cond)',fontSize:22,fontWeight:800,letterSpacing:'0.06em',textTransform:'uppercase' as const,color:'#fff'}}>Organograma</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#5A6478',marginTop:2,letterSpacing:'0.08em'}}>22 POSIÇÕES INSARAG HEAVY · BRA-01</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={handleExportPDF} disabled={pdfLoading} style={{padding:'7px 14px',borderRadius:3,background:pdfLoading?'rgba(0,0,0,0.2)':'rgba(0,158,219,0.12)',border:'1px solid rgba(0,158,219,0.25)',fontFamily:'var(--font-mono)',fontSize:10,color:'#009EDB',cursor:pdfLoading?'not-allowed':'pointer',letterSpacing:'0.1em'}}>{pdfLoading?'GERANDO...':'⬇ EXPORTAR PDF'}</button>
          <Link href="/pessoal" style={{padding:'7px 14px',borderRadius:3,border:'1px solid rgba(255,255,255,0.1)',fontFamily:'var(--font-mono)',fontSize:10,color:'#9BA8BC',textDecoration:'none',letterSpacing:'0.1em'}}>GERENCIAR EFETIVO →</Link>
        </div>
      </div>

      <OrgStats functions={functions} designations={localDesig}/>

      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <button onClick={()=>setFilterComp('Todos')} style={{padding:'5px 12px',borderRadius:3,cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:10,background:filterComp==='Todos'?'rgba(0,158,219,0.12)':'transparent',border:filterComp==='Todos'?'1px solid rgba(0,158,219,0.3)':'1px solid rgba(255,255,255,0.07)',color:filterComp==='Todos'?'#009EDB':'#5A6478'}}>Todos</button>
        {COMPONENTE_ORDER.map(comp=>{const cmp=componenteConfig[comp];const active=filterComp===comp;return<button key={comp} onClick={()=>setFilterComp(active?'Todos':comp)} style={{padding:'5px 12px',borderRadius:3,cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:10,background:active?cmp.bg:'transparent',border:active?`1px solid ${cmp.border}`:'1px solid rgba(255,255,255,0.07)',color:active?cmp.color:'#5A6478',transition:'all .15s'}}>{cmp.label}</button>})}
        <div style={{width:1,height:20,background:'rgba(255,255,255,0.07)',margin:'0 4px'}}/>
        <button onClick={()=>setShowVacant(!showVacant)} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:3,cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:10,background:showVacant?'rgba(204,0,0,0.12)':'transparent',border:showVacant?'1px solid rgba(204,0,0,0.3)':'1px solid rgba(255,255,255,0.07)',color:showVacant?'#FF6B6B':'#5A6478'}}>
          Somente vagas {vacantCount>0&&<span style={{fontFamily:'var(--font-mono)',fontSize:9,padding:'0 4px',borderRadius:2,background:'rgba(204,0,0,0.2)',color:'#FF6B6B'}}>{vacantCount}</span>}
        </button>
      </div>

      <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
        {[{color:'#00A550',label:'Completo (primário + alternativo)'},{color:'#FFDF00',label:'Parcial (sem alternativo)'},{color:'#CC0000',label:'Vaga crítica'}].map(l=>(
          <div key={l.label} style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:10,height:10,borderRadius:1,background:l.color}}/><span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#5A6478'}}>{l.label}</span></div>
        ))}
        <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'#2E3848'}}>· Clique na posição para expandir e atribuir</span>
      </div>

      {grouped.map(({componente,fns})=>{
        const cmp=componenteConfig[componente]
        return(
          <div key={componente}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:3,height:20,borderRadius:2,background:cmp.color}}/>
              <span style={{fontFamily:'var(--font-cond)',fontSize:14,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase' as const,color:cmp.color}}>{cmp.label}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#5A6478'}}>{fns.length} posições</span>
              <div style={{flex:1,height:1,background:cmp.border}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8,marginBottom:20}}>
              {fns.map(fn=><PositionCard key={fn.id} fn={fn} designations={localDesig} members={members} onAssign={setAssignModal} onRemove={handleRemove}/>)}
            </div>
          </div>
        )
      })}

      {filtered.length===0&&(
        <div style={{background:'#131920',border:'1px solid rgba(255,255,255,0.07)',borderRadius:5,padding:'40px 20px',textAlign:'center'}}>
          <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#5A6478'}}>Nenhuma posição encontrada.</div>
        </div>
      )}
    </div>
  )
}
