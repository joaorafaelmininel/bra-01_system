'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Item = Record<string, any>
type Props = {
  item: Item
  subcomponents: Item[]
  maintenanceLogs: Item[]
  members: Item[]
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Operacional':          { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  'Manutenção rápida':   { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Manutenção':          { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Inoperante':          { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',     border: 'rgba(204,0,0,0.3)' },
  'Em trânsito':         { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Processo de descarga':{ color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)',  border: 'rgba(155,168,188,0.2)' },
  'Em missão':           { color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',    border: 'rgba(255,223,0,0.25)' },
}

const sectionColors: Record<string, string> = {
  R: '#FF6B6B', M: '#00A550', T: '#E87722',
  C: '#009EDB', L: '#9BA8BC', P: '#FFDF00',
  PP: '#CC0000', A: '#002776',
}

const tabs = ['Dados', 'Subcomponentes', 'Manutenção']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function manutencaoStatus(proxima: string | null) {
  if (!proxima) return null
  const dias = Math.ceil((new Date(proxima).getTime() - Date.now()) / 86400000)
  if (dias < 0)  return { label: `Atrasada ${Math.abs(dias)}d`, color: '#FF6B6B' }
  if (dias < 30) return { label: `Vence em ${dias}d`,           color: '#E87722' }
  if (dias < 90) return { label: `Vence em ${dias}d`,           color: '#FFDF00' }
  return              { label: `Próxima em ${dias}d`,           color: '#5A6478' }
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function Tag({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 2, color, background: bg, border: `1px solid ${border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6478' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: 13, color: '#E8EDF5' }}>{value || '—'}</span>
    </div>
  )
}

function SectionCard({ title, children, cols = 3 }: { title: string; children: React.ReactNode; cols?: number }) {
  return (
    <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>{title}</span>
      </div>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '14px 20px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Modal: Registrar Manutenção ──────────────────────────────────────────────

function ModalManutencao({ itemId, members, onClose, onSaved }: { itemId: string; members: Item[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    tipo_manutencao: 'preventiva',
    descricao: '',
    data_inicio: '',
    data_conclusao: '',
    responsavel_id: '',
    empresa_externa: '',
    custo_brl: '',
    resultado: '',
  })

  function set(f: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('maintenance_log').insert({
      equipment_id:   itemId,
      tipo_manutencao: form.tipo_manutencao,
      descricao:      form.descricao.trim(),
      data_inicio:    form.data_inicio,
      data_conclusao: form.data_conclusao || null,
      responsavel_id: form.responsavel_id || null,
      empresa_externa: form.empresa_externa || null,
      custo_brl:      form.custo_brl ? parseFloat(form.custo_brl) : null,
      resultado:      form.resultado || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  const inputStyle: React.CSSProperties = { width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '8px 10px', fontSize: 13, color: '#E8EDF5', fontFamily: 'var(--font-body)', outline: 'none' }
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478', marginBottom: 5 }
  function MField({ label, children }: { label: string; children: React.ReactNode }) {
    return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Registrar manutenção</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 18 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <MField label="Tipo *">
            <select style={inputStyle} value={form.tipo_manutencao} onChange={set('tipo_manutencao')}>
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
              <option value="inspeção">Inspeção</option>
            </select>
          </MField>
          <MField label="Descrição *">
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.descricao} onChange={set('descricao')} required placeholder="Descreva o serviço realizado ou a ser realizado" />
          </MField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MField label="Data de início *"><input type="date" style={inputStyle} value={form.data_inicio} onChange={set('data_inicio')} required /></MField>
            <MField label="Data de conclusão"><input type="date" style={inputStyle} value={form.data_conclusao} onChange={set('data_conclusao')} /></MField>
          </div>
          <MField label="Responsável (membro)">
            <select style={inputStyle} value={form.responsavel_id} onChange={set('responsavel_id')}>
              <option value="">— Nenhum —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}</option>)}
            </select>
          </MField>
          <MField label="Empresa externa">
            <input style={inputStyle} value={form.empresa_externa} onChange={set('empresa_externa')} placeholder="Nome da empresa (se terceirizado)" />
          </MField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MField label="Custo (R$)"><input type="number" step="0.01" style={inputStyle} value={form.custo_brl} onChange={set('custo_brl')} placeholder="0,00" /></MField>
            <MField label="Resultado"><input style={inputStyle} value={form.resultado} onChange={set('resultado')} placeholder="Ex: Aprovado, Substituído" /></MField>
          </div>
          {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
            <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{loading ? 'SALVANDO...' : 'REGISTRAR'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TabDados({ item }: { item: Item }) {
  const secColor = sectionColors[item.section?.codigo] ?? '#9BA8BC'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionCard title="Identificação">
        <InfoRow label="Código do item"    value={<span style={{ fontFamily: 'var(--font-mono)', color: secColor }}>{item.codigo_item}</span>} />
        <InfoRow label="Tipo"              value={item.tipo_item} />
        <InfoRow label="Status"            value={
          (() => {
            const st = statusConfig[item.status]
            return st ? <Tag color={st.color} bg={st.bg} border={st.border}>{item.status}</Tag> : item.status
          })()
        } />
        <InfoRow label="Nome (PT)"         value={item.nome} />
        <InfoRow label="Nome (EN)"         value={item.nome_en} />
        {item.descricao && <div style={{ gridColumn: '1 / -1' }}><InfoRow label="Descrição / Especificação" value={item.descricao} /></div>}
      </SectionCard>

      <SectionCard title="Classificação">
        <InfoRow label="Seção"             value={`[${item.section?.codigo}] ${item.section?.nome_pt}`} />
        <InfoRow label="Grupo"             value={item.group ? `[${item.group.codigo}] ${item.group.nome}` : null} />
        {item.parent?.codigo_item && <InfoRow label="Item principal" value={`[${item.parent.codigo_item}] ${item.parent.nome}`} />}
      </SectionCard>

      <SectionCard title="Fabricante e identificação física">
        <InfoRow label="Fabricante"        value={item.fabricante} />
        <InfoRow label="Modelo"            value={item.modelo} />
        <InfoRow label="Número de série"   value={item.numero_serie} mono />
        <InfoRow label="Nº de patrimônio"  value={item.numero_patrimonio} mono />
        <InfoRow label="Localização"       value={item.localizacao} />
      </SectionCard>

      <SectionCard title="Manutenção">
        <InfoRow label="Periodicidade"     value={item.periodicidade_manut} />
        <InfoRow label="Última manutenção" value={formatDate(item.ultima_manutencao)} />
        <InfoRow label="Próxima manutenção" value={
          (() => {
            const m = manutencaoStatus(item.proxima_manutencao)
            return m
              ? <span style={{ color: m.color, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{formatDate(item.proxima_manutencao)} · {m.label}</span>
              : formatDate(item.proxima_manutencao)
          })()
        } />
      </SectionCard>

      {item.responsavel && (
        <SectionCard title="Responsável" cols={2}>
          <InfoRow label="Membro" value={`${item.responsavel.posto_graduacao ? item.responsavel.posto_graduacao + ' ' : ''}${item.responsavel.nome_guerra ?? item.responsavel.nome_completo}`} />
          <InfoRow label="Perfil" value={<Link href={`/pessoal/${item.responsavel.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722', textDecoration: 'none' }}>VER PERFIL →</Link>} />
        </SectionCard>
      )}
    </div>
  )
}

function TabSubcomponents({ subcomponents }: { subcomponents: Item[] }) {
  if (subcomponents.length === 0) {
    return (
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum subcomponente cadastrado</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848', marginTop: 6 }}>Cadastre itens com tipo "Subcomponente" vinculados a este equipamento</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {subcomponents.map(s => {
        const st = statusConfig[s.status] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
        return (
          <div key={s.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 2, background: 'rgba(0,158,219,0.1)', color: '#009EDB', border: '1px solid rgba(0,158,219,0.2)', flexShrink: 0 }}>
              {s.codigo_item}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#E8EDF5', fontWeight: 500 }}>{s.nome}</div>
              {(s.fabricante || s.modelo) && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2 }}>{[s.fabricante, s.modelo].filter(Boolean).join(' · ')}</div>}
            </div>
            <Tag color={st.color} bg={st.bg} border={st.border}>{s.status}</Tag>
            <Link href={`/equipamentos/${s.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.05em', flexShrink: 0 }}>DETALHES →</Link>
          </div>
        )
      })}
    </div>
  )
}

function TabManutencao({ logs }: { logs: Item[] }) {
  const tipoColor: Record<string, string> = { preventiva: '#009EDB', corretiva: '#FF6B6B', 'inspeção': '#E87722' }

  if (logs.length === 0) {
    return (
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum registro de manutenção</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {logs.map(log => {
        const color = tipoColor[log.tipo_manutencao] ?? '#9BA8BC'
        return (
          <div key={log.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 2, background: `${color}20`, color, border: `1px solid ${color}40`, textTransform: 'uppercase' }}>
                  {log.tipo_manutencao}
                </span>
                <span style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 600, color: '#E8EDF5' }}>{log.descricao}</span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
                  {formatDate(log.data_inicio)}{log.data_conclusao ? ` → ${formatDate(log.data_conclusao)}` : ' → Em andamento'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {log.responsavel && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>Responsável: {log.responsavel.nome_guerra ?? log.responsavel.nome_completo}</span>}
              {log.empresa_externa && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>Empresa: {log.empresa_externa}</span>}
              {log.custo_brl && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>Custo: R$ {parseFloat(log.custo_brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
              {log.resultado && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00A550' }}>Resultado: {log.resultado}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EquipamentoClient({ item, subcomponents, maintenanceLogs, members }: Props) {
  const [activeTab, setActiveTab] = useState('Dados')
  const [modal, setModal] = useState(false)
  const [localLogs, setLocalLogs] = useState(maintenanceLogs)

  const st       = statusConfig[item.status] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
  const secColor = sectionColors[item.section?.codigo] ?? '#9BA8BC'
  const manut    = manutencaoStatus(item.proxima_manutencao)

  async function refreshLogs() {
    const supabase = createClient()
    const { data } = await supabase.from('maintenance_log').select('*, responsavel:members(nome_guerra, nome_completo)').eq('equipment_id', item.id).order('data_inicio', { ascending: false })
    if (data) setLocalLogs(data)
    setModal(false)
  }

  return (
    <div style={{ padding: 24 }}>

      {modal && <ModalManutencao itemId={item.id} members={members} onClose={() => setModal(false)} onSaved={refreshLogs} />}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link href="/equipamentos" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.1em' }}>← EQUIPAMENTOS</Link>
        <span style={{ color: '#2E3848' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: secColor, letterSpacing: '0.1em' }}>{item.codigo_item}</span>
      </div>

      {/* Header */}
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        {/* Ícone da seção */}
        <div style={{ width: 56, height: 56, borderRadius: 5, background: `${secColor}15`, border: `1.5px solid ${secColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, color: secColor }}>{item.section?.codigo}</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: secColor }}>{item.codigo_item}</span>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', margin: 0 }}>{item.nome}</h1>
            <Tag color={st.color} bg={st.bg} border={st.border}>{item.status}</Tag>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', marginBottom: 10 }}>
            {[item.section?.nome_pt, item.group?.nome, item.fabricante, item.modelo].filter(Boolean).join(' · ')}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {item.tipo_item === 'Subcomponente' && <Tag color="#009EDB" bg="rgba(0,158,219,0.12)" border="rgba(0,158,219,0.25)">Subcomponente</Tag>}
            {manut && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: manut.color }}>Manutenção: {manut.label}</span>}
            {item.localizacao && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>📍 {item.localizacao}</span>}
          </div>
        </div>

        <Link href={`/equipamentos/${item.id}/editar`} style={{ padding: '7px 14px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', textDecoration: 'none', letterSpacing: '0.1em', flexShrink: 0 }}>
          EDITAR
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: activeTab === tab ? '#E87722' : '#5A6478',
              borderBottom: activeTab === tab ? '2px solid #E87722' : '2px solid transparent',
              marginBottom: -1, transition: 'color .15s',
            }}>
              {tab}
              {tab === 'Subcomponentes' && subcomponents.length > 0 && (
                <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(232,119,34,0.15)', color: '#E87722' }}>{subcomponents.length}</span>
              )}
              {tab === 'Manutenção' && localLogs.length > 0 && (
                <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(232,119,34,0.15)', color: '#E87722' }}>{localLogs.length}</span>
              )}
            </button>
          ))}
        </div>
        {activeTab === 'Manutenção' && (
          <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 3, cursor: 'pointer', background: 'rgba(232,119,34,0.12)', border: '1px solid rgba(232,119,34,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722', letterSpacing: '0.08em', marginBottom: 8 }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> REGISTRAR MANUTENÇÃO
          </button>
        )}
      </div>

      {activeTab === 'Dados'          && <TabDados item={item} />}
      {activeTab === 'Subcomponentes' && <TabSubcomponents subcomponents={subcomponents} />}
      {activeTab === 'Manutenção'     && <TabManutencao logs={localLogs} />}
    </div>
  )
}
