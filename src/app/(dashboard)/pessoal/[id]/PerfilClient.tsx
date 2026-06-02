'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Member = Record<string, any>
type Qualification = Record<string, any>
type Vaccine = Record<string, any>
type Language = Record<string, any>
type UsarFunction = Record<string, any>
type VaccineCatalogItem = Record<string, any>
type UsarFunctionItem = Record<string, any>

type Props = {
  member: Member
  qualifications: Qualification[]
  vaccines: Vaccine[]
  languages: Language[]
  functions: UsarFunction[]
  vaccineCatalog: VaccineCatalogItem[]
  usarFunctionsCatalog: UsarFunctionItem[]
}

// ─── Configs visuais ──────────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  Ativo:     { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  Licença:   { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  Afastado:  { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  Reserva:   { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)',  border: 'rgba(155,168,188,0.2)' },
  Desligado: { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',     border: 'rgba(204,0,0,0.3)' },
}
const componenteConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Management':       { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.25)' },
  'Technical Search': { color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.25)' },
  'Rescue':           { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.25)' },
  'Medical':          { color: '#00A550', bg: 'rgba(0,165,80,0.12)',   border: 'rgba(0,165,80,0.25)' },
  'Logistics':        { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)', border: 'rgba(155,168,188,0.2)' },
}

const tabs = ['Dados', 'Qualificações', 'Vacinas', 'Idiomas', 'Funções USAR']

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}
function passaporteInfo(validade: string | null) {
  if (!validade) return { label: 'Sem passaporte', color: '#5A6478' }
  const dias = Math.ceil((new Date(validade).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: `Vencido há ${Math.abs(dias)}d`, color: '#FF6B6B' }
  if (dias < 180) return { label: `Vence em ${dias} dias`,         color: '#E87722' }
  return               { label: `Válido até ${formatDate(validade)}`, color: '#00A550' }
}

// ─── UI primitives ────────────────────────────────────────────────────────────

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontFamily: 'var(--font-cond)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>{title}</span>
      </div>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px 20px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Modal base ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 3, padding: '8px 10px', fontSize: 13, color: '#E8EDF5',
  fontFamily: 'var(--font-body)', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9,
  fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: '#5A6478', marginBottom: 5,
}
function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>
}

// ─── Modal: Nova Qualificação ──────────────────────────────────────────────────

function ModalQualificacao({ memberId, onClose, onSaved }: { memberId: string; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ codigo_curso: '', nome_curso: '', entidade_emissora: '', nivel: 'Básica', data_conclusao: '', data_validade: '', carga_horaria_h: '', observacao: '' })

  function set(f: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [f]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('qualifications').insert({
      member_id:        memberId,
      codigo_curso:     form.codigo_curso || null,
      nome_curso:       form.nome_curso.trim(),
      entidade_emissora: form.entidade_emissora.trim(),
      nivel:            form.nivel,
      data_conclusao:   form.data_conclusao,
      data_validade:    form.data_validade || null,
      carga_horaria_h:  form.carga_horaria_h ? parseInt(form.carga_horaria_h) : null,
      observacao:       form.observacao || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <Modal title="Nova qualificação" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <MField label="Código"><input style={inputStyle} value={form.codigo_curso} onChange={set('codigo_curso')} placeholder="Ex: BSAR" /></MField>
          <MField label="Nome do curso *"><input style={inputStyle} value={form.nome_curso} onChange={set('nome_curso')} required placeholder="Nome completo do curso" /></MField>
        </div>
        <MField label="Entidade emissora *"><input style={inputStyle} value={form.entidade_emissora} onChange={set('entidade_emissora')} required placeholder="Ex: INSARAG, FEMA, CBPMESP" /></MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <MField label="Nível">
            <select style={inputStyle} value={form.nivel} onChange={set('nivel')}>
              <option>Básica</option><option>Específica</option>
            </select>
          </MField>
          <MField label="Data de conclusão *"><input type="date" style={inputStyle} value={form.data_conclusao} onChange={set('data_conclusao')} required /></MField>
          <MField label="Validade"><input type="date" style={inputStyle} value={form.data_validade} onChange={set('data_validade')} /></MField>
        </div>
        <MField label="Carga horária (h)"><input type="number" min="0" style={inputStyle} value={form.carga_horaria_h} onChange={set('carga_horaria_h')} placeholder="Ex: 40" /></MField>
        <MField label="Observação"><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.observacao} onChange={set('observacao')} /></MField>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{loading ? 'SALVANDO...' : 'SALVAR'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Registrar Vacina ───────────────────────────────────────────────────

function ModalVacina({ memberId, vaccineCatalog, appliedVaccines, onClose, onSaved }: { memberId: string; vaccineCatalog: VaccineCatalogItem[]; appliedVaccines: Vaccine[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ vaccine_id: vaccineCatalog[0]?.id ?? '', data_aplicacao: '', data_vencimento: '', lote: '' })

  function set(f: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [f]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('member_vaccines').insert({
      member_id:      memberId,
      vaccine_id:     form.vaccine_id,
      data_aplicacao: form.data_aplicacao,
      data_vencimento: form.data_vencimento || null,
      lote:           form.lote || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <Modal title="Registrar vacina" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <MField label="Vacina *">
          <select style={inputStyle} value={form.vaccine_id} onChange={set('vaccine_id')}>
            {vaccineCatalog.map(v => <option key={v.id} value={v.id}>{v.nome}{v.obrigatoria ? ' ★' : ''}</option>)}
          </select>
        </MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Data de aplicação *"><input type="date" style={inputStyle} value={form.data_aplicacao} onChange={set('data_aplicacao')} required /></MField>
          <MField label="Data de vencimento"><input type="date" style={inputStyle} value={form.data_vencimento} onChange={set('data_vencimento')} /></MField>
        </div>
        <MField label="Lote"><input style={inputStyle} value={form.lote} onChange={set('lote')} placeholder="Número do lote" /></MField>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{loading ? 'SALVANDO...' : 'REGISTRAR'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Atribuir Função USAR ──────────────────────────────────────────────

function ModalFuncao({ memberId, usarFunctionsCatalog, currentFunctions, onClose, onSaved }: { memberId: string; usarFunctionsCatalog: UsarFunctionItem[]; currentFunctions: UsarFunction[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentIds = currentFunctions.map(f => f.function_id)
  const available = usarFunctionsCatalog.filter(f => !currentIds.includes(f.id))
  const [form, setForm] = useState({ function_id: available[0]?.id ?? '', primaria: false, alternativa: false, data_desde: '' })

  function set(f: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('member_usar_functions').insert({
      member_id:   memberId,
      function_id: form.function_id,
      primaria:    form.primaria,
      alternativa: form.alternativa,
      data_desde:  form.data_desde || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  if (available.length === 0) {
    return (
      <Modal title="Atribuir função USAR" onClose={onClose}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', textAlign: 'center', padding: '20px 0' }}>Todas as funções USAR já estão atribuídas a este membro.</div>
      </Modal>
    )
  }

  return (
    <Modal title="Atribuir função USAR" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <MField label="Função USAR *">
          <select style={inputStyle} value={form.function_id} onChange={set('function_id')}>
            {available.map(f => <option key={f.id} value={f.id}>[{f.codigo}] {f.nome_pt}</option>)}
          </select>
        </MField>
        <MField label="Data desde">
          <input type="date" style={inputStyle} value={form.data_desde} onChange={set('data_desde')} />
        </MField>
        <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC' }}>
            <input type="checkbox" checked={form.primaria} onChange={set('primaria')} />
            Função primária
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC' }}>
            <input type="checkbox" checked={form.alternativa} onChange={set('alternativa')} />
            Função alternativa
          </label>
        </div>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{loading ? 'SALVANDO...' : 'ATRIBUIR'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal: Adicionar Idioma ──────────────────────────────────────────────────

function ModalIdioma({ memberId, onClose, onSaved }: { memberId: string; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ idioma: '', nivel: 'Intermediário', certificado: '' })

  function set(f: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [f]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('member_languages').insert({
      member_id:   memberId,
      idioma:      form.idioma.trim(),
      nivel:       form.nivel,
      certificado: form.certificado || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <Modal title="Adicionar idioma" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <MField label="Idioma *"><input style={inputStyle} value={form.idioma} onChange={set('idioma')} required placeholder="Ex: Inglês, Espanhol, Francês" /></MField>
          <MField label="Nível *">
            <select style={inputStyle} value={form.nivel} onChange={set('nivel')}>
              <option>Básico</option><option>Intermediário</option><option>Avançado</option><option>Fluente</option>
            </select>
          </MField>
        </div>
        <MField label="Certificado"><input style={inputStyle} value={form.certificado} onChange={set('certificado')} placeholder="Ex: TOEFL 85, DELE B2" /></MField>
        {error && <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>ERRO: {error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{loading ? 'SALVANDO...' : 'ADICIONAR'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TabDados({ member }: { member: Member }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionCard title="Dados pessoais">
        <InfoRow label="Nome completo"      value={member.nome_completo} />
        <InfoRow label="Nome de guerra"     value={member.nome_guerra} />
        <InfoRow label="CPF"                value={member.cpf} mono />
        <InfoRow label="Data de nascimento" value={formatDate(member.data_nascimento)} />
        <InfoRow label="Sexo"               value={member.sexo} />
        <InfoRow label="Tipo sanguíneo"     value={member.tipo_sanguineo} />
        <InfoRow label="Peso"               value={member.peso_kg ? `${member.peso_kg} kg` : null} />
        <InfoRow label="Altura"             value={member.altura_cm ? `${member.altura_cm} cm` : null} />
      </SectionCard>
      <SectionCard title="Dados institucionais">
        <InfoRow label="Tipo de membro"     value={member.tipo_membro} />
        <InfoRow label="Instituição"        value={member.instituicao} />
        <InfoRow label="Posto / Graduação"  value={member.posto_graduacao} />
        <InfoRow label="Base"               value={member.estado_base} />
        <InfoRow label="Registro funcional" value={member.registro_funcional} mono />
        <InfoRow label="Registro geral (RG)" value={member.registro_geral} mono />
        <InfoRow label="Número da cédula"   value={member.numero_cedula} mono />
        <InfoRow label="Data de ingresso"   value={formatDate(member.data_ingresso_instituicao)} />
        <InfoRow label="Tempo de serviço"   value={member.tempo_servico_anos ? `${member.tempo_servico_anos} anos` : null} />
        <InfoRow label="Tempo p/ aposentadoria" value={member.tempo_aposentadoria_anos ? `${member.tempo_aposentadoria_anos} anos` : null} />
        <InfoRow label="Cargo / Função"     value={member.cargo_funcao} />
        <InfoRow label="Reg. profissional"  value={member.registro_profissional} mono />
      </SectionCard>
      <SectionCard title="Documentos de viagem">
        <InfoRow label="Número do passaporte" value={member.passaporte_numero} mono />
        <InfoRow label="Validade"           value={formatDate(member.passaporte_validade)} />
        <InfoRow label="Status IA"          value={member.passaporte_status_ia} />
      </SectionCard>
      <SectionCard title="Contatos">
        <InfoRow label="Telefone celular"   value={member.telefone_celular} mono />
        <InfoRow label="Telefone funcional" value={member.telefone_funcional} mono />
        <InfoRow label="E-mail pessoal"     value={member.email_pessoal} />
        <InfoRow label="E-mail institucional" value={member.email_institucional} />
      </SectionCard>
      <SectionCard title="Contato de emergência">
        <InfoRow label="Nome"               value={member.contato_emergencia_nome} />
        <InfoRow label="Telefone"           value={member.contato_emergencia_telefone} mono />
        <InfoRow label="Relação"            value={member.contato_emergencia_relacao} />
      </SectionCard>
    </div>
  )
}

function TabQualificacoes({ qualifications }: { qualifications: Qualification[] }) {
  if (qualifications.length === 0) {
    return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhuma qualificação cadastrada</div></div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {qualifications.map(q => {
        const vencido  = q.data_validade && new Date(q.data_validade) < new Date()
        const vencendo = q.data_validade && !vencido && Math.ceil((new Date(q.data_validade).getTime() - Date.now()) / 86400000) < 90
        return (
          <div key={q.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {q.codigo_curso && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 6px', borderRadius: 2, background: 'rgba(0,158,219,0.12)', color: '#009EDB', border: '1px solid rgba(0,158,219,0.2)' }}>{q.codigo_curso}</span>}
                  <span style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, color: '#E8EDF5' }}>{q.nome_curso}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{q.entidade_emissora}</span>
                  {q.carga_horaria_h && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{q.carga_horaria_h}h</span>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>Concluído: {formatDate(q.data_conclusao)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {q.data_validade ? (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', marginBottom: 2 }}>VALIDADE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: vencido ? '#FF6B6B' : vencendo ? '#E87722' : '#00A550' }}>{formatDate(q.data_validade)}</div>
                  </div>
                ) : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478' }}>PERMANENTE</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TabVacinas({ vaccines, vaccineCatalog }: { vaccines: Vaccine[]; vaccineCatalog: VaccineCatalogItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {vaccineCatalog.map(vc => {
        const aplicada = vaccines.find(v => v.vaccine_id === vc.id)
        const vencida  = aplicada?.data_vencimento && new Date(aplicada.data_vencimento) < new Date()
        const vencendo = aplicada?.data_vencimento && !vencida && Math.ceil((new Date(aplicada.data_vencimento).getTime() - Date.now()) / 86400000) < 60
        let statusColor = '#5A6478'; let statusLabel = 'Não registrada'
        if (aplicada) {
          if (vencida)   { statusColor = '#FF6B6B'; statusLabel = 'Vencida' }
          else if (vencendo) { statusColor = '#E87722'; statusLabel = `Vence em ${Math.ceil((new Date(aplicada.data_vencimento).getTime() - Date.now()) / 86400000)}d` }
          else           { statusColor = '#00A550'; statusLabel = 'Em dia' }
        }
        return (
          <div key={vc.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#E8EDF5', fontWeight: 500 }}>{vc.nome}</span>
                {vc.obrigatoria && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 5px', borderRadius: 2, background: 'rgba(204,0,0,0.12)', color: '#FF6B6B', border: '1px solid rgba(204,0,0,0.2)' }}>OBRIGATÓRIA</span>}
              </div>
              {aplicada && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2 }}>Aplicada: {formatDate(aplicada.data_aplicacao)}{aplicada.data_vencimento && ` · Vence: ${formatDate(aplicada.data_vencimento)}`}</div>}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: statusColor, flexShrink: 0 }}>{statusLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

function TabIdiomas({ languages }: { languages: Language[] }) {
  const nivelWidth: Record<string, string> = { 'Básico': '25%', 'Intermediário': '50%', 'Avançado': '75%', 'Fluente': '100%' }
  if (languages.length === 0) return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum idioma cadastrado</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {languages.map(l => (
        <div key={l.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, color: '#E8EDF5' }}>{l.idioma}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#009EDB' }}>{l.nivel}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#009EDB', borderRadius: 2, width: nivelWidth[l.nivel] ?? '25%' }} />
          </div>
          {l.certificado && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 6 }}>Certificado: {l.certificado}</div>}
        </div>
      ))}
    </div>
  )
}

function TabFuncoes({ functions }: { functions: UsarFunction[] }) {
  if (functions.length === 0) return <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 20px', textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhuma função USAR atribuída</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {functions.map(f => {
        const fn  = f.function
        const cmp = componenteConfig[fn?.componente] ?? { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)', border: 'rgba(155,168,188,0.2)' }
        return (
          <div key={f.id} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 2, color: cmp.color, background: cmp.bg, border: `1px solid ${cmp.border}` }}>{fn?.codigo}</span>
              <span style={{ fontFamily: 'var(--font-cond)', fontSize: 15, fontWeight: 700, color: '#E8EDF5' }}>{fn?.nome_pt}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{fn?.nome_en}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {f.primaria    && <Tag color="#E87722" bg="rgba(232,119,34,0.12)" border="rgba(232,119,34,0.3)">Primária</Tag>}
                {f.alternativa && <Tag color="#009EDB" bg="rgba(0,158,219,0.12)" border="rgba(0,158,219,0.25)">Alternativa</Tag>}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
              {fn?.componente}{f.data_desde && ` · Desde ${formatDate(f.data_desde)}`}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Botão "+" ────────────────────────────────────────────────────────────────

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 3, cursor: 'pointer',
      background: 'rgba(232,119,34,0.12)', border: '1px solid rgba(232,119,34,0.3)',
      fontFamily: 'var(--font-mono)', fontSize: 10, color: '#E87722',
      letterSpacing: '0.08em', transition: 'all .15s',
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> {label}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PerfilClient({ member, qualifications, vaccines, languages, functions, vaccineCatalog, usarFunctionsCatalog }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Dados')
  const [modal, setModal] = useState<string | null>(null)

  // State local para dados das abas (atualiza sem reload de página)
  const [localQuals,  setLocalQuals]  = useState(qualifications)
  const [localVacc,   setLocalVacc]   = useState(vaccines)
  const [localLangs,  setLocalLangs]  = useState(languages)
  const [localFuncs,  setLocalFuncs]  = useState(functions)

  const st  = statusConfig[member.status_operacional] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
  const cmp = componenteConfig[member.componente_primario] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
  const pp  = passaporteInfo(member.passaporte_validade)
  const apt = member.aptidao_operacional === 'Apto'

  async function refreshTab(tab: string) {
    const supabase = createClient()
    if (tab === 'qual') {
      const { data } = await supabase.from('qualifications').select('*').eq('member_id', member.id).order('data_conclusao', { ascending: false })
      if (data) setLocalQuals(data)
    } else if (tab === 'vacc') {
      const { data } = await supabase.from('member_vaccines').select('*, vaccine:vaccine_catalog(nome, periodicidade, obrigatoria)').eq('member_id', member.id)
      if (data) setLocalVacc(data)
    } else if (tab === 'lang') {
      const { data } = await supabase.from('member_languages').select('*').eq('member_id', member.id)
      if (data) setLocalLangs(data)
    } else if (tab === 'func') {
      const { data } = await supabase.from('member_usar_functions').select('*, function:usar_functions(codigo, nome_pt, nome_en, componente)').eq('member_id', member.id)
      if (data) setLocalFuncs(data)
    }
    setModal(null)
  }

  const tabActionMap: Record<string, React.ReactNode> = {
    'Qualificações': <AddButton onClick={() => setModal('qual')} label="NOVA QUALIFICAÇÃO" />,
    'Vacinas':       <AddButton onClick={() => setModal('vacc')} label="REGISTRAR VACINA" />,
    'Idiomas':       <AddButton onClick={() => setModal('lang')} label="ADICIONAR IDIOMA" />,
    'Funções USAR':  <AddButton onClick={() => setModal('func')} label="ATRIBUIR FUNÇÃO" />,
  }

  return (
    <div style={{ padding: 24 }}>

      {/* Modais */}
      {modal === 'qual' && <ModalQualificacao memberId={member.id} onClose={() => setModal(null)} onSaved={() => refreshTab('qual')} />}
      {modal === 'vacc' && <ModalVacina memberId={member.id} vaccineCatalog={vaccineCatalog} appliedVaccines={localVacc} onClose={() => setModal(null)} onSaved={() => refreshTab('vacc')} />}
      {modal === 'lang' && <ModalIdioma memberId={member.id} onClose={() => setModal(null)} onSaved={() => refreshTab('lang')} />}
      {modal === 'func' && <ModalFuncao memberId={member.id} usarFunctionsCatalog={usarFunctionsCatalog} currentFunctions={localFuncs} onClose={() => setModal(null)} onSaved={() => refreshTab('func')} />}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link href="/pessoal" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.1em' }}>← EFETIVO</Link>
        <span style={{ color: '#2E3848' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', letterSpacing: '0.1em' }}>{member.nome_guerra ?? member.nome_completo.split(' ')[0].toUpperCase()}</span>
      </div>

      {/* Header */}
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1F2A3C', border: '2px solid #004B87', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 700, color: '#009EDB', flexShrink: 0 }}>
          {initials(member.nome_completo)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', margin: 0 }}>
              {member.nome_guerra ? `${member.posto_graduacao ?? ''} ${member.nome_guerra}`.trim() : member.nome_completo}
            </h1>
            <Tag color={st.color} bg={st.bg} border={st.border}>{member.status_operacional}</Tag>
            <Tag color={apt ? '#00A550' : '#FF6B6B'} bg={apt ? 'rgba(0,165,80,0.12)' : 'rgba(204,0,0,0.12)'} border={apt ? 'rgba(0,165,80,0.3)' : 'rgba(204,0,0,0.3)'}>{member.aptidao_operacional}</Tag>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478', marginBottom: 10 }}>
            {member.nome_completo} · {member.instituicao} · {member.estado_base}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag color={cmp.color} bg={cmp.bg} border={cmp.border}>{member.componente_primario}</Tag>
            {member.componente_secundario && <Tag color="#9BA8BC" bg="rgba(155,168,188,0.1)" border="rgba(155,168,188,0.2)">{member.componente_secundario}</Tag>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: pp.color }}>Passaporte: {pp.label}</span>
            {member.tipo_sanguineo && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>{member.tipo_sanguineo}</span>}
          </div>
        </div>
        <Link href={`/pessoal/${member.id}/editar`} style={{ padding: '7px 14px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', textDecoration: 'none', letterSpacing: '0.1em', flexShrink: 0 }}>
          EDITAR
        </Link>
      </div>

      {/* Tabs header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: activeTab === tab ? '#009EDB' : '#5A6478',
              borderBottom: activeTab === tab ? '2px solid #009EDB' : '2px solid transparent',
              marginBottom: -1, transition: 'color .15s',
            }}>
              {tab}
              {tab === 'Qualificações' && localQuals.length > 0 && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(0,158,219,0.15)', color: '#009EDB' }}>{localQuals.length}</span>}
              {tab === 'Vacinas'       && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(0,158,219,0.15)', color: '#009EDB' }}>{localVacc.length}/{vaccineCatalog.length}</span>}
              {tab === 'Idiomas'       && localLangs.length > 0 && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(0,158,219,0.15)', color: '#009EDB' }}>{localLangs.length}</span>}
              {tab === 'Funções USAR'  && localFuncs.length > 0 && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '0 4px', borderRadius: 2, background: 'rgba(0,158,219,0.15)', color: '#009EDB' }}>{localFuncs.length}</span>}
            </button>
          ))}
        </div>
        {tabActionMap[activeTab] && <div style={{ paddingBottom: 8 }}>{tabActionMap[activeTab]}</div>}
      </div>

      {/* Conteúdo */}
      {activeTab === 'Dados'         && <TabDados member={member} />}
      {activeTab === 'Qualificações' && <TabQualificacoes qualifications={localQuals} />}
      {activeTab === 'Vacinas'       && <TabVacinas vaccines={localVacc} vaccineCatalog={vaccineCatalog} />}
      {activeTab === 'Idiomas'       && <TabIdiomas languages={localLangs} />}
      {activeTab === 'Funções USAR'  && <TabFuncoes functions={localFuncs} />}
    </div>
  )
}
