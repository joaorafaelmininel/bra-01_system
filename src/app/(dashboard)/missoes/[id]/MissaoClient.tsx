'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Mission = Record<string, any>
type Props = {
  mission: Mission
  participants: any[]
  equipment: any[]
  checklist: any[]
  members: any[]
  equipmentCatalog: any[]
  usarFunctions: any[]
}

const faseConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Desmobilizado':    { color: '#5A6478', bg: 'rgba(90,100,120,0.15)',  border: 'rgba(90,100,120,0.3)' },
  'Monitoramento':    { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Em prontidão':     { color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',    border: 'rgba(255,223,0,0.25)' },
  'Em mobilização':   { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Desdobrado':       { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',     border: 'rgba(204,0,0,0.3)' },
  'Missão concluída': { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.25)' },
}

const sectionColors: Record<string, string> = {
  R: '#FF6B6B', M: '#00A550', T: '#E87722', C: '#009EDB', L: '#9BA8BC', P: '#FFDF00', PP: '#CC0000', A: '#002776',
}

const componenteConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Management':       { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.25)' },
  'Technical Search': { color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.25)' },
  'Rescue':           { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.25)' },
  'Medical':          { color: '#00A550', bg: 'rgba(0,165,80,0.12)',   border: 'rgba(0,165,80,0.25)' },
  'Logistics':        { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)', border: 'rgba(155,168,188,0.2)' },
}

const tabs = ['Dados', 'Participantes', 'Equipamentos', 'Checklist']

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 2, color, background: bg, border: `1px solid ${border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{children}</span>
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 3, cursor: 'pointer', background: 'rgba(232,119,34,0.12)', border: '1px solid rgba(232,119,34,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722', letterSpacing: '0.08em' }}><span style={{ fontSize: 14, lineHeight: 1 }}>+</span> {label}</button>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '8px 10px', fontSize: 13, color: '#E8EDF5', fontFamily: 'var(--font-body)', outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478', marginBottom: 5 }
function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>
}
function ModalFooter({ onClose, loading, label }: { onClose: () => void; loading: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
      <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{loading ? 'SALVANDO...' : label}</button>
    </div>
  )
}

function ModalParticipante({ missionId, members, currentIds, usarFunctions, onClose, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const available = members.filter((m: any) => !currentIds.includes(m.id))
  const [form, setForm] = useState({ member_id: available[0]?.id ?? '', function_id: '', data_embarque: '', data_retorno: '', observacao: '' })
  function set(f: string) { return (e: any) => setForm(p => ({ ...p, [f]: e.target.value })) }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('mission_members').insert({ mission_id: missionId, member_id: form.member_id, function_id: form.function_id || null, data_embarque: form.data_embarque || null, data_retorno: form.data_retorno || null, observacao: form.observacao || null })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }
  if (available.length === 0) return <Modal title="Adicionar participante" onClose={onClose}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', textAlign: 'center', padding: '20px 0' }}>Todos os membros ativos já estão na missão.</div></Modal>
  return (
    <Modal title="Adicionar participante" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <MField label="Membro *"><select style={inputStyle} value={form.member_id} onChange={set('member_id')}>{available.map((m: any) => <option key={m.id} value={m.id}>{m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}</option>)}</select></MField>
        <MField label="Função USAR na missão"><select style={inputStyle} value={form.function_id} onChange={set('function_id')}><option value="">— Não definida —</option>{usarFunctions.map((f: any) => <option key={f.id} value={f.id}>[{f.codigo}] {f.nome_pt}</option>)}</select></MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Data de embarque"><input type="date" style={inputStyle} value={form.data_embarque} onChange={set('data_embarque')} /></MField>
          <MField label="Data de retorno"><input type="date" style={inputStyle} value={form.data_retorno} onChange={set('data_retorno')} /></MField>
        </div>
        <MField label="Observação"><input style={inputStyle} value={form.observacao} onChange={set('observacao')} /></MField>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <ModalFooter onClose={onClose} loading={loading} label="ADICIONAR" />
      </form>
    </Modal>
  )
}

function ModalEquipamento({ missionId, catalog, currentIds, onClose, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const available = catalog.filter((e: any) => !currentIds.includes(e.id))
  const [form, setForm] = useState({ equipment_id: available[0]?.id ?? '', quantidade: '1', condicao_saida: 'Operacional', observacao: '' })
  function set(f: string) { return (e: any) => setForm(p => ({ ...p, [f]: e.target.value })) }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('mission_equipment').insert({ mission_id: missionId, equipment_id: form.equipment_id, quantidade: parseInt(form.quantidade), condicao_saida: form.condicao_saida || null, observacao: form.observacao || null })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }
  if (available.length === 0) return <Modal title="Adicionar equipamento" onClose={onClose}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', textAlign: 'center', padding: '20px 0' }}>Nenhum equipamento operacional disponível.</div></Modal>
  return (
    <Modal title="Adicionar equipamento" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <MField label="Equipamento *"><select style={inputStyle} value={form.equipment_id} onChange={set('equipment_id')}>{available.map((e: any) => <option key={e.id} value={e.id}>[{e.codigo_item}] {e.nome}</option>)}</select></MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Quantidade"><input type="number" min="1" style={inputStyle} value={form.quantidade} onChange={set('quantidade')} /></MField>
          <MField label="Condição de saída"><select style={inputStyle} value={form.condicao_saida} onChange={set('condicao_saida')}><option>Operacional</option><option>Manutenção rápida</option></select></MField>
        </div>
        <MField label="Observação"><input style={inputStyle} value={form.observacao} onChange={set('observacao')} /></MField>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <ModalFooter onClose={onClose} loading={loading} label="ADICIONAR" />
      </form>
    </Modal>
  )
}

function ModalChecklist({ missionId, memberId, onClose, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ item: '' })
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('deploy_checklist').insert({ mission_id: missionId, member_id: memberId, item: form.item.trim() })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }
  return (
    <Modal title="Adicionar item ao checklist" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <MField label="Item do checklist *"><input style={inputStyle} value={form.item} onChange={e => setForm({ item: e.target.value })} required placeholder="Ex: Passaporte válido · EPI completo · Vacinas em dia" /></MField>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <ModalFooter onClose={onClose} loading={loading} label="ADICIONAR" />
      </form>
    </Modal>
  )
}

function TabDados({ mission }: { mission: Mission }) {
  function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6478' }}>{label}</span><span style={{ fontSize: 13, color: '#E8EDF5' }}>{value || '—'}</span></div>
  }
  function Card({ title, children, cols = 3 }: any) {
    return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}><div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}><span style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>{title}</span></div><div style={{ padding: 16, display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '14px 20px' }}>{children}</div></div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="Identificação">
        <InfoRow label="Nome" value={mission.nome} />
        <InfoRow label="Código" value={mission.codigo} />
        <InfoRow label="Tipo" value={mission.tipo} />
        <InfoRow label="Fase" value={mission.fase} />
        {mission.descricao && <div style={{ gridColumn: '1 / -1' }}><InfoRow label="Descrição" value={mission.descricao} /></div>}
      </Card>
      <Card title="Localização e datas">
        <InfoRow label="País" value={mission.pais} />
        <InfoRow label="Cidade" value={mission.cidade} />
        <InfoRow label="Data de ativação" value={formatDate(mission.data_ativacao)} />
        <InfoRow label="Data de retorno" value={formatDate(mission.data_retorno)} />
      </Card>
      {mission.lider && (
        <Card title="Liderança" cols={2}>
          <InfoRow label="Team Leader" value={`${mission.lider.posto_graduacao ? mission.lider.posto_graduacao + ' ' : ''}${mission.lider.nome_guerra ?? mission.lider.nome_completo}`} />
          <InfoRow label="Perfil" value={<Link href={`/pessoal/${mission.lider.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722', textDecoration: 'none' }}>VER PERFIL →</Link>} />
        </Card>
      )}
    </div>
  )
}

function TabParticipantes({ participants }: { participants: any[] }) {
  if (participants.length === 0) return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum participante adicionado</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {participants.map(p => {
        const cmp = componenteConfig[p.member?.componente_primario] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
        return (
          <div key={p.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1F2A3C', border: '1.5px solid #004B87', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, color: '#009EDB', flexShrink: 0 }}>
              {(p.member?.nome_guerra ?? p.member?.nome_completo ?? '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#E8EDF5', fontWeight: 500 }}>{p.member?.posto_graduacao ? `${p.member.posto_graduacao} ` : ''}{p.member?.nome_guerra ?? p.member?.nome_completo}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{p.member?.instituicao}</span>
                {p.function && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722' }}>[{p.function.codigo}] {p.function.nome_pt}</span>}
              </div>
            </div>
            <Tag color={cmp.color} bg={cmp.bg} border={cmp.border}>{p.member?.componente_primario}</Tag>
            {p.data_embarque && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{new Date(p.data_embarque + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
            <Link href={`/pessoal/${p.member?.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', flexShrink: 0 }}>PERFIL →</Link>
          </div>
        )
      })}
    </div>
  )
}

function TabEquipamentos({ equipment }: { equipment: any[] }) {
  if (equipment.length === 0) return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum equipamento adicionado</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {equipment.map(e => {
        const secColor = sectionColors[e.equipment?.section?.codigo] ?? '#9BA8BC'
        return (
          <div key={e.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 2, background: `${secColor}15`, color: secColor, border: `1px solid ${secColor}40`, flexShrink: 0 }}>{e.equipment?.codigo_item}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#E8EDF5', fontWeight: 500 }}>{e.equipment?.nome}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 1 }}>{e.equipment?.section?.nome_pt}</div>
            </div>
            {e.quantidade > 1 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC' }}>×{e.quantidade}</span>}
            {e.condicao_retorno && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: e.condicao_retorno === 'Operacional' ? '#00A550' : '#E87722' }}>Retorno: {e.condicao_retorno}</span>}
            <Link href={`/equipamentos/${e.equipment?.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', flexShrink: 0 }}>DETALHES →</Link>
          </div>
        )
      })}
    </div>
  )
}

function TabChecklist({ checklist, onToggle }: { checklist: any[]; onToggle: (id: string, done: boolean) => void }) {
  const total = checklist.length
  const done  = checklist.filter(c => c.concluido).length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  if (checklist.length === 0) return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum item no checklist de deploy</div></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC' }}>Progresso de deploy</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: pct === 100 ? '#00A550' : '#E87722' }}>{done}/{total} · {pct}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: pct === 100 ? '#00A550' : '#E87722', borderRadius: 2, width: `${pct}%`, transition: 'width .5s ease' }} />
        </div>
      </div>

      {checklist.map(c => (
        <div key={c.id} style={{ background: '#131920', border: `1px solid ${c.concluido ? 'rgba(0,165,80,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 5, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all .15s' }}
          onClick={() => onToggle(c.id, !c.concluido)}>
          <div style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${c.concluido ? '#00A550' : 'rgba(255,255,255,0.2)'}`, background: c.concluido ? '#00A550' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
            {c.concluido && <svg style={{ width: 10, height: 10 }} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
          </div>
          <span style={{ fontSize: 13, color: c.concluido ? '#5A6478' : '#E8EDF5', textDecoration: c.concluido ? 'line-through' : 'none', flex: 1 }}>{c.item}</span>
          {c.concluido && c.data_conclusao && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478' }}>{new Date(c.data_conclusao).toLocaleDateString('pt-BR')}</span>}
        </div>
      ))}
    </div>
  )
}

export default function MissaoClient({ mission, participants, equipment, checklist, members, equipmentCatalog, usarFunctions }: Props) {
  const [activeTab, setActiveTab] = useState('Dados')
  const [modal, setModal] = useState<string | null>(null)
  const [localPart,  setLocalPart]  = useState(participants)
  const [localEquip, setLocalEquip] = useState(equipment)
  const [localCheck, setLocalCheck] = useState(checklist)

  const fase = faseConfig[mission.fase] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }

  async function refresh(tab: string) {
    const supabase = createClient()
    if (tab === 'part') {
      const { data } = await supabase.from('mission_members').select(`*, member:members(id, nome_guerra, nome_completo, posto_graduacao, componente_primario, instituicao), function:usar_functions(codigo, nome_pt)`).eq('mission_id', mission.id)
      if (data) setLocalPart(data)
    } else if (tab === 'equip') {
      const { data } = await supabase.from('mission_equipment').select(`*, equipment:equipment(id, codigo_item, nome, status, section:cache_sections(codigo, nome_pt))`).eq('mission_id', mission.id)
      if (data) setLocalEquip(data)
    } else if (tab === 'check') {
      const { data } = await supabase.from('deploy_checklist').select('*').eq('mission_id', mission.id).order('created_at')
      if (data) setLocalCheck(data)
    }
    setModal(null)
  }

  async function toggleChecklist(id: string, done: boolean) {
    const supabase = createClient()
    await supabase.from('deploy_checklist').update({ concluido: done, data_conclusao: done ? new Date().toISOString() : null }).eq('id', id)
    setLocalCheck(prev => prev.map(c => c.id === id ? { ...c, concluido: done, data_conclusao: done ? new Date().toISOString() : null } : c))
  }

  const tabActionMap: Record<string, React.ReactNode> = {
    'Participantes': <AddButton onClick={() => setModal('part')}  label="ADICIONAR PARTICIPANTE" />,
    'Equipamentos':  <AddButton onClick={() => setModal('equip')} label="ADICIONAR EQUIPAMENTO" />,
    'Checklist':     <AddButton onClick={() => setModal('check')} label="ADICIONAR ITEM" />,
  }

  const lider = mission.lider
  const liderName = lider ? `${lider.posto_graduacao ? lider.posto_graduacao + ' ' : ''}${lider.nome_guerra ?? lider.nome_completo}` : null
  const firstMemberId = members[0]?.id ?? ''

  return (
    <div style={{ padding: 24 }}>

      {modal === 'part'  && <ModalParticipante missionId={mission.id} members={members} currentIds={localPart.map(p => p.member_id)} usarFunctions={usarFunctions} onClose={() => setModal(null)} onSaved={() => refresh('part')} />}
      {modal === 'equip' && <ModalEquipamento  missionId={mission.id} catalog={equipmentCatalog} currentIds={localEquip.map(e => e.equipment_id)} onClose={() => setModal(null)} onSaved={() => refresh('equip')} />}
      {modal === 'check' && <ModalChecklist    missionId={mission.id} memberId={firstMemberId} onClose={() => setModal(null)} onSaved={() => refresh('check')} />}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link href="/missoes" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.1em' }}>← MISSÕES</Link>
        <span style={{ color: '#2E3848' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', letterSpacing: '0.1em' }}>{mission.codigo ?? mission.nome}</span>
      </div>

      {/* Header */}
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {mission.codigo && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', borderRadius: 2, background: 'rgba(0,158,219,0.1)', color: '#009EDB', border: '1px solid rgba(0,158,219,0.2)' }}>{mission.codigo}</span>}
              <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', margin: 0 }}>{mission.nome}</h1>
              <Tag color={fase.color} bg={fase.bg} border={fase.border}>{mission.fase}</Tag>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{mission.tipo}</span>
              {(mission.cidade || mission.pais) && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>📍 {[mission.cidade, mission.pais].filter(Boolean).join(', ')}</span>}
              {liderName && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>TL: {liderName}</span>}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{localPart.length} participante{localPart.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <Link href={`/missoes/${mission.id}/editar`} style={{ padding: '7px 14px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', textDecoration: 'none', letterSpacing: '0.1em', flexShrink: 0 }}>EDITAR</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: activeTab === tab ? '#E87722' : '#5A6478', borderBottom: activeTab === tab ? '2px solid #E87722' : '2px solid transparent', marginBottom: -1, transition: 'color .15s' }}>
              {tab}
              {tab === 'Participantes' && localPart.length > 0  && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(232,119,34,0.15)', color: '#E87722' }}>{localPart.length}</span>}
              {tab === 'Equipamentos'  && localEquip.length > 0 && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(232,119,34,0.15)', color: '#E87722' }}>{localEquip.length}</span>}
              {tab === 'Checklist'     && localCheck.length > 0 && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(232,119,34,0.15)', color: '#E87722' }}>{localCheck.filter(c => c.concluido).length}/{localCheck.length}</span>}
            </button>
          ))}
        </div>
        {tabActionMap[activeTab] && <div style={{ paddingBottom: 8 }}>{tabActionMap[activeTab]}</div>}
      </div>

      {activeTab === 'Dados'         && <TabDados mission={mission} />}
      {activeTab === 'Participantes' && <TabParticipantes participants={localPart} />}
      {activeTab === 'Equipamentos'  && <TabEquipamentos equipment={localEquip} />}
      {activeTab === 'Checklist'     && <TabChecklist checklist={localCheck} onToggle={toggleChecklist} />}
    </div>
  )
}
