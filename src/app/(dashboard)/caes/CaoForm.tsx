'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/lib/RoleContext'

type Member = Record<string, any>
type Dog = Record<string, any>
type Props = {
  members: Member[]
  dog?: Dog            // presente = modo edição
}

const SEXO_OPTS = ['Macho', 'Fêmea']
const ESPECIALIDADE_OPTS = ['Busca em escombros', 'Busca em área', 'Cadáver']
const NIVEL_OPTS = ['IRO', 'Nacional', 'Em formação', 'Outro']
const STATUS_OPTS = ['Ativo', 'Em formação', 'Recuperação', 'Aposentado']
const APTIDAO_OPTS = ['Apto', 'Condicional', 'Inapto']
const PROPRIETARIO_OPTS = ['CBPMESP', 'CBMMG', 'CBMPR', 'Governo Federal', 'BRA-01']

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#131920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
  padding: '8px 10px', fontSize: 13, color: '#E8EDF5', fontFamily: 'var(--font-body)', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
  letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478', marginBottom: 6,
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#E87722' }}> *</span>}</label>
      {children}
      {hint && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function SectionTitle({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 2, background: 'rgba(232,119,34,0.12)', color: '#E87722', border: '1px solid rgba(232,119,34,0.3)' }}>{num}</span>
      <span style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

export default function CaoForm({ members, dog }: Props) {
  const router = useRouter()
  const { isManager } = useRole()
  const isEdit = !!dog
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: dog?.nome ?? '',
    raca: dog?.raca ?? '',
    sexo: dog?.sexo ?? '',
    data_nascimento: dog?.data_nascimento ?? '',
    microchip: dog?.microchip ?? '',
    proprietario: dog?.proprietario ?? '',
    especialidade: dog?.especialidade ?? '',
    nivel_certificacao: dog?.nivel_certificacao ?? '',
    certificacao_validade: dog?.certificacao_validade ?? '',
    condutor_id: dog?.condutor_id ?? '',
    ultima_vacina_raiva: dog?.ultima_vacina_raiva ?? '',
    proxima_vacina_raiva: dog?.proxima_vacina_raiva ?? '',
    ultimo_check_vet: dog?.ultimo_check_vet ?? '',
    proximo_check_vet: dog?.proximo_check_vet ?? '',
    status_operacional: dog?.status_operacional ?? 'Ativo',
    aptidao_operacional: dog?.aptidao_operacional ?? '',
    peso_kg: dog?.peso_kg?.toString() ?? '',
    foto_url: dog?.foto_url ?? '',
    observacao: dog?.observacao ?? '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() }))
  }

  function payload() {
    return {
      nome: form.nome.trim(),
      raca: form.raca.trim() || null,
      sexo: form.sexo || null,
      data_nascimento: form.data_nascimento || null,
      microchip: form.microchip.trim() || null,
      proprietario: form.proprietario || null,
      especialidade: form.especialidade || null,
      nivel_certificacao: form.nivel_certificacao || null,
      certificacao_validade: form.certificacao_validade || null,
      condutor_id: form.condutor_id || null,
      ultima_vacina_raiva: form.ultima_vacina_raiva || null,
      proxima_vacina_raiva: form.proxima_vacina_raiva || null,
      ultimo_check_vet: form.ultimo_check_vet || null,
      proximo_check_vet: form.proximo_check_vet || null,
      status_operacional: form.status_operacional,
      aptidao_operacional: form.aptidao_operacional || null,
      peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : null,
      foto_url: form.foto_url.trim() || null,
      observacao: form.observacao.trim() || null,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const data = payload()
    const { error: err } = isEdit
      ? await supabase.from('search_dogs').update({ ...data, updated_at: new Date().toISOString() }).eq('id', dog!.id)
      : await supabase.from('search_dogs').insert(data)
    if (err) { setError(err.message); setLoading(false); return }
    router.push(isEdit ? `/caes/${dog!.id}` : '/caes')
    router.refresh()
  }

  async function handleDelete() {
    if (!dog) return
    if (!window.confirm(`Excluir o registro de "${dog.nome}"?`)) return
    setDeleting(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('search_dogs').delete().eq('id', dog.id)
    if (err) { setError(err.message); setDeleting(false); return }
    router.push('/caes')
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 20 }

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, color: '#E8EDF5', margin: 0 }}>
          {isEdit ? 'Editar ficha do cão' : 'Novo cão de busca e resgate'}
        </h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>
          {isEdit ? form.nome : 'BINÔMIO CINOTÉCNICO · CACHE BRA-01'}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 01 Identificação */}
        <div style={sectionStyle}>
          <SectionTitle num="01">Identificação</SectionTitle>
          <div style={grid3}>
            <Field label="Nome" required>
              <input style={inputStyle} value={form.nome} onChange={set('nome')} required placeholder="Nome do cão" />
            </Field>
            <Field label="Raça">
              <input style={inputStyle} value={form.raca} onChange={set('raca')} placeholder="Ex: Pastor Belga Malinois" />
            </Field>
            <Field label="Sexo">
              <select style={inputStyle} value={form.sexo} onChange={set('sexo')}>
                <option value="">—</option>
                {SEXO_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ ...grid3, marginTop: 14 }}>
            <Field label="Data de nascimento">
              <input type="date" style={inputStyle} value={form.data_nascimento} onChange={set('data_nascimento')} />
            </Field>
            <Field label="Microchip">
              <input style={inputStyle} value={form.microchip} onChange={set('microchip')} placeholder="Nº do microchip" />
            </Field>
            <Field label="Proprietário">
              <select style={inputStyle} value={form.proprietario} onChange={set('proprietario')}>
                <option value="">—</option>
                {PROPRIETARIO_OPTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Peso (kg)">
              <input type="number" step="0.1" style={inputStyle} value={form.peso_kg} onChange={set('peso_kg')} placeholder="Ex: 28.5" />
            </Field>
            <Field label="URL da foto" hint="Link de imagem (opcional)">
              <input style={inputStyle} value={form.foto_url} onChange={set('foto_url')} placeholder="https://..." />
            </Field>
          </div>
        </div>

        {/* 02 Especialidade e certificação */}
        <div style={sectionStyle}>
          <SectionTitle num="02">Especialidade e certificação</SectionTitle>
          <div style={grid3}>
            <Field label="Especialidade">
              <select style={inputStyle} value={form.especialidade} onChange={set('especialidade')}>
                <option value="">—</option>
                {ESPECIALIDADE_OPTS.map(e => <option key={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Nível de certificação">
              <select style={inputStyle} value={form.nivel_certificacao} onChange={set('nivel_certificacao')}>
                <option value="">—</option>
                {NIVEL_OPTS.map(n => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Validade da certificação">
              <input type="date" style={inputStyle} value={form.certificacao_validade} onChange={set('certificacao_validade')} />
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Condutor (binômio)">
              <select style={inputStyle} value={form.condutor_id} onChange={set('condutor_id')}>
                <option value="">— Sem condutor —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* 03 Saúde */}
        <div style={sectionStyle}>
          <SectionTitle num="03">Saúde e medicina veterinária</SectionTitle>
          <div style={grid2}>
            <Field label="Última vacina antirrábica">
              <input type="date" style={inputStyle} value={form.ultima_vacina_raiva} onChange={set('ultima_vacina_raiva')} />
            </Field>
            <Field label="Próxima vacina antirrábica">
              <input type="date" style={inputStyle} value={form.proxima_vacina_raiva} onChange={set('proxima_vacina_raiva')} />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Último check-up veterinário">
              <input type="date" style={inputStyle} value={form.ultimo_check_vet} onChange={set('ultimo_check_vet')} />
            </Field>
            <Field label="Próximo check-up veterinário">
              <input type="date" style={inputStyle} value={form.proximo_check_vet} onChange={set('proximo_check_vet')} />
            </Field>
          </div>
        </div>

        {/* 04 Status operacional */}
        <div style={sectionStyle}>
          <SectionTitle num="04">Status operacional</SectionTitle>
          <div style={grid2}>
            <Field label="Status operacional">
              <select style={inputStyle} value={form.status_operacional} onChange={set('status_operacional')}>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Aptidão operacional">
              <select style={inputStyle} value={form.aptidao_operacional} onChange={set('aptidao_operacional')}>
                <option value="">—</option>
                {APTIDAO_OPTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Observação">
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.observacao} onChange={set('observacao')} placeholder="Histórico, restrições, particularidades..." />
            </Field>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B' }}>
            ERRO: {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {isEdit && isManager ? (
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ padding: '8px 16px', borderRadius: 3, cursor: deleting ? 'not-allowed' : 'pointer', background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', letterSpacing: '0.1em' }}>
              {deleting ? 'EXCLUINDO...' : 'EXCLUIR'}
            </button>
          ) : <span />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', letterSpacing: '0.1em' }}>CANCELAR</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
              {loading ? 'SALVANDO...' : isEdit ? 'SALVAR' : 'CADASTRAR CÃO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
