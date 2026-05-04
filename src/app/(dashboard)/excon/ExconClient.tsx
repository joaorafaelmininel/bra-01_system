'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Props = {
  exconMembers: any[]
  activities: any[]
  members: any[]
}

const TABS = ['Composição', 'Atividades']

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Pendente':     { color: '#5A6478', bg: 'rgba(90,100,120,0.1)',   border: 'rgba(90,100,120,0.2)' },
  'Em andamento': { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Concluída':    { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.25)' },
  'Cancelada':    { color: '#CC0000', bg: 'rgba(204,0,0,0.1)',      border: 'rgba(204,0,0,0.25)' },
}

const prioConfig: Record<string, { color: string }> = {
  'Baixa':   { color: '#5A6478' },
  'Normal':  { color: '#9BA8BC' },
  'Alta':    { color: '#E87722' },
  'Crítica': { color: '#FF6B6B' },
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function prazoStatus(prazo: string | null) {
  if (!prazo) return null
  const dias = Math.ceil((new Date(prazo).getTime() - Date.now()) / 86400000)
  if (dias < 0)  return { label: `Atrasada ${Math.abs(dias)}d`, color: '#FF6B6B' }
  if (dias < 7)  return { label: `${dias}d restantes`, color: '#E87722' }
  if (dias < 30) return { label: `${dias}d restantes`, color: '#FFDF00' }
  return { label: formatDate(prazo), color: '#5A6478' }
}

function Tag({ children, color, bg, border }: any) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 2, color, background: bg, border: `1px solid ${border}`, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>{children}</span>
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '8px 10px', fontSize: 13, color: '#E8EDF5', fontFamily: 'var(--font-body)', outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#5A6478', marginBottom: 5 }
function MField({ label, children }: any) { return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div> }

// ─── Modal: Adicionar membro EXCON ────────────────────────────────────────────
function ModalMembroExcon({ members, currentIds, onClose, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const available = members.filter((m: any) => !currentIds.includes(m.id))
  const [form, setForm] = useState({ member_id: available[0]?.id ?? '', funcao_excon: '', descricao: '', data_inicio: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('excon_members').insert({
      member_id: form.member_id, funcao_excon: form.funcao_excon.trim(),
      descricao: form.descricao.trim() || null, data_inicio: form.data_inicio || null, ativo: true,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, width: '100%', maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#fff' }}>Adicionar ao EXCON</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 20 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <MField label="Membro *">
            <select style={inputStyle} value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))}>
              {available.map((m: any) => <option key={m.id} value={m.id}>{m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}</option>)}
            </select>
          </MField>
          <MField label="Função no EXCON *">
            <input style={inputStyle} value={form.funcao_excon} onChange={e => setForm(p => ({ ...p, funcao_excon: e.target.value }))} required placeholder="Ex: Coordenador, Apoio Técnico, Relator" />
          </MField>
          <MField label="Descrição">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Responsabilidades e atribuições no EXCON" />
          </MField>
          <MField label="Data de início">
            <input type="date" style={inputStyle} value={form.data_inicio} onChange={e => setForm(p => ({ ...p, data_inicio: e.target.value }))} />
          </MField>
          {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
            <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{loading ? 'SALVANDO...' : 'ADICIONAR'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal: Nova atividade ────────────────────────────────────────────────────
function ModalAtividade({ exconMembers, members, onClose, onSaved }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [form, setForm] = useState({
    member_id: '', excon_member_id: '', titulo: '', descricao: '',
    categoria: 'Administrativo', prioridade: 'Normal', status: 'Pendente',
    data_inicio: '', prazo: '', observacoes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    if (!form.prazo) { setError('Prazo é obrigatório'); setLoading(false); return }
    const supabase = createClient()
    const { error: err } = await supabase.from('excon_activities').insert({
      member_id: form.member_id || null,
      excon_member_id: form.excon_member_id || null,
      titulo: form.titulo.trim(), descricao: form.descricao.trim() || null,
      categoria: form.categoria, prioridade: form.prioridade, status: form.status,
      data_inicio: form.data_inicio || null, prazo: form.prazo,
      observacoes: form.observacoes.trim() || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#fff' }}>Nova atividade EXCON</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 20 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <MField label="Título *">
            <input style={inputStyle} value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required placeholder="Título da atividade" />
          </MField>
          <MField label="Membro responsável">
            <select style={inputStyle} value={form.member_id} onChange={e => setForm(p => ({ ...p, member_id: e.target.value }))}>
              <option value="">— Selecione —</option>
              {members.map((m: any) => <option key={m.id} value={m.id}>{m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}</option>)}
            </select>
          </MField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <MField label="Categoria">
              <select style={inputStyle} value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}>
                {['Administrativo','Operacional','Treinamento','Documentação','Inspeção','Reunião','Outro'].map(c => <option key={c}>{c}</option>)}
              </select>
            </MField>
            <MField label="Prioridade">
              <select style={inputStyle} value={form.prioridade} onChange={e => setForm(p => ({ ...p, prioridade: e.target.value }))}>
                {['Baixa','Normal','Alta','Crítica'].map(p => <option key={p}>{p}</option>)}
              </select>
            </MField>
            <MField label="Status">
              <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {['Pendente','Em andamento','Concluída','Cancelada'].map(s => <option key={s}>{s}</option>)}
              </select>
            </MField>
          </div>
          <MField label="Descrição">
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Detalhe da atividade, procedimentos e requisitos" />
          </MField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MField label="Data de início"><input type="date" style={inputStyle} value={form.data_inicio} onChange={e => setForm(p => ({ ...p, data_inicio: e.target.value }))} /></MField>
            <MField label="Prazo *"><input type="date" style={inputStyle} value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: e.target.value }))} required /></MField>
          </div>
          <MField label="Observações">
            <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
          </MField>
          {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
            <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{loading ? 'SALVANDO...' : 'CRIAR ATIVIDADE'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExconClient({ exconMembers, activities, members }: Props) {
  const [activeTab, setActiveTab]       = useState('Composição')
  const [modal, setModal]               = useState<string | null>(null)
  const [localMembers, setLocalMembers] = useState(exconMembers)
  const [localActs, setLocalActs]       = useState(activities)
  const [filterStatus, setFilterStatus] = useState('Todos')

  const pendentes  = localActs.filter(a => a.status === 'Pendente').length
  const andamento  = localActs.filter(a => a.status === 'Em andamento').length
  const concluidas = localActs.filter(a => a.status === 'Concluída').length
  const atrasadas  = localActs.filter(a => {
    if (!a.prazo || a.status === 'Concluída' || a.status === 'Cancelada') return false
    return new Date(a.prazo) < new Date()
  }).length

  const filteredActs = localActs.filter(a =>
    filterStatus === 'Todos' || a.status === filterStatus
  )

  async function refreshMembers() {
    const supabase = createClient()
    const { data } = await supabase.from('excon_members').select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao, instituicao, componente_primario)').eq('ativo', true).order('created_at')
    if (data) setLocalMembers(data)
    setModal(null)
  }

  async function refreshActivities() {
    const supabase = createClient()
    const { data } = await supabase.from('excon_activities').select('*, member:members(id, nome_guerra, nome_completo, posto_graduacao)').order('prazo', { ascending: true })
    if (data) setLocalActs(data)
    setModal(null)
  }

  async function updateActivityStatus(id: string, status: string) {
    const supabase = createClient()
    const update: any = { status }
    if (status === 'Concluída') update.data_conclusao = new Date().toISOString().slice(0, 10)
    await supabase.from('excon_activities').update(update).eq('id', id)
    setLocalActs(prev => prev.map(a => a.id === id ? { ...a, ...update } : a))
  }

  const selectStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', outline: 'none', cursor: 'pointer' }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {modal === 'membro'    && <ModalMembroExcon members={members} currentIds={localMembers.map(m => m.member_id)} onClose={() => setModal(null)} onSaved={refreshMembers} />}
      {modal === 'atividade' && <ModalAtividade exconMembers={localMembers} members={members} onClose={() => setModal(null)} onSaved={refreshActivities} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#fff' }}>EXCON — IEC</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>EXERCISE CONTROL · INSARAG IEC PREPARATION · BRA-01</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setModal('atividade')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, background: 'rgba(0,158,219,0.12)', border: '1px solid rgba(0,158,219,0.25)', fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#009EDB', cursor: 'pointer' }}>
            + Nova atividade
          </button>
          <button onClick={() => setModal('membro')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#fff', cursor: 'pointer' }}>
            + Adicionar membro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {[
          { label: 'Membros EXCON',  val: localMembers.length, color: '#009EDB', border: '#009EDB' },
          { label: 'Pendentes',      val: pendentes,  color: '#5A6478', border: 'rgba(255,255,255,0.07)' },
          { label: 'Em andamento',   val: andamento,  color: '#009EDB', border: '#009EDB' },
          { label: 'Concluídas',     val: concluidas, color: '#00A550', border: '#00A550' },
          { label: 'Atrasadas',      val: atrasadas,  color: atrasadas > 0 ? '#FF6B6B' : '#5A6478', border: atrasadas > 0 ? '#CC0000' : 'rgba(255,255,255,0.07)' },
        ].map(c => (
          <div key={c.label} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderTop: `3px solid ${c.border}`, borderRadius: 5, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val}</div>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#5A6478', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: activeTab === tab ? '#009EDB' : '#5A6478', borderBottom: activeTab === tab ? '2px solid #009EDB' : '2px solid transparent', marginBottom: -1 }}>
            {tab}
            {tab === 'Composição' && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(0,158,219,0.15)', color: '#009EDB' }}>{localMembers.length}</span>}
            {tab === 'Atividades' && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(0,158,219,0.15)', color: '#009EDB' }}>{localActs.length}</span>}
          </button>
        ))}
      </div>

      {/* Composição */}
      {activeTab === 'Composição' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {localMembers.length === 0 ? (
            <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum membro no EXCON. Clique em "+ Adicionar membro" para começar.</div>
            </div>
          ) : localMembers.map(em => (
            <div key={em.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1F2A3C', border: '1.5px solid #004B87', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#009EDB', flexShrink: 0 }}>
                {(em.member?.nome_guerra ?? em.member?.nome_completo ?? '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, color: '#E8EDF5' }}>
                  {em.member?.posto_graduacao ? `${em.member.posto_graduacao} ` : ''}{em.member?.nome_guerra ?? em.member?.nome_completo}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722', marginTop: 2 }}>{em.funcao_excon}</div>
                {em.descricao && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 4 }}>{em.descricao}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{em.member?.instituicao}</div>
                {em.data_inicio && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', marginTop: 2 }}>Desde {formatDate(em.data_inicio)}</div>}
                <Link href={`/pessoal/${em.member?.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', textDecoration: 'none', marginTop: 4, display: 'block' }}>PERFIL →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Atividades */}
      {activeTab === 'Atividades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
              {['Todos', 'Pendente', 'Em andamento', 'Concluída', 'Cancelada'].map(s => <option key={s}>{s}</option>)}
            </select>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{filteredActs.length} atividades</span>
          </div>

          {filteredActs.length === 0 ? (
            <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhuma atividade encontrada.</div>
            </div>
          ) : filteredActs.map(act => {
            const st   = statusConfig[act.status]  ?? statusConfig['Pendente']
            const prio = prioConfig[act.prioridade] ?? prioConfig['Normal']
            const ps   = prazoStatus(act.prazo)
            const name = act.member ? `${act.member.posto_graduacao ? act.member.posto_graduacao+' ' : ''}${act.member.nome_guerra ?? act.member.nome_completo?.split(' ')[0]}` : null

            return (
              <div key={act.id} style={{ background: '#131920', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `3px solid ${prio.color}`, borderRadius: 5, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag color={st.color} bg={st.bg} border={st.border}>{act.status}</Tag>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: prio.color, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{act.prioridade}</span>
                      {act.categoria && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478' }}>{act.categoria}</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, color: '#E8EDF5' }}>{act.titulo}</div>
                    {act.descricao && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 4 }}>{act.descricao}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {name && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC' }}>{name}</div>}
                    {ps && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: ps.color, marginTop: 4 }}>⏱ {ps.label}</div>}
                  </div>
                </div>
                {act.status !== 'Concluída' && act.status !== 'Cancelada' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {act.status === 'Pendente' && (
                      <button onClick={() => updateActivityStatus(act.id, 'Em andamento')} style={{ padding: '4px 10px', borderRadius: 3, cursor: 'pointer', background: 'rgba(0,158,219,0.12)', border: '1px solid rgba(0,158,219,0.25)', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#009EDB', letterSpacing: '0.08em' }}>INICIAR</button>
                    )}
                    <button onClick={() => updateActivityStatus(act.id, 'Concluída')} style={{ padding: '4px 10px', borderRadius: 3, cursor: 'pointer', background: 'rgba(0,165,80,0.12)', border: '1px solid rgba(0,165,80,0.25)', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#00A550', letterSpacing: '0.08em' }}>CONCLUIR</button>
                    <button onClick={() => updateActivityStatus(act.id, 'Cancelada')} style={{ padding: '4px 10px', borderRadius: 3, cursor: 'pointer', background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.2)', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#FF6B6B', letterSpacing: '0.08em' }}>CANCELAR</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
