'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/lib/RoleContext'

type Section = Record<string, any>
type Box = Record<string, any>
type Props = { box: Box; sections: Section[] }

const STATUS_OPTS = ['Disponível', 'Em trânsito', 'Em missão', 'Manutenção']
const TIPO_OPTS   = ['Caixa rígida', 'Bolsa', 'Pallet', 'Contêiner', 'Mochila', 'Outro']
const PROPRIETARIO_OPTS = ['CBPMESP', 'CBMMG', 'CBMPR', 'Governo Federal', 'BRA-01']

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#131920',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
  padding: '8px 10px', fontSize: 13, color: '#E8EDF5',
  fontFamily: 'var(--font-body)', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9,
  fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: '#5A6478', marginBottom: 6,
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

export default function EditarCaixaForm({ box, sections }: Props) {
  const router = useRouter()
  const { isManager } = useRole()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm] = useState({
    codigo: box.codigo ?? '', nome: box.nome ?? '', descricao: box.descricao ?? '',
    tipo: box.tipo ?? '', proprietario: box.proprietario ?? '',
    section_id: box.section_id ?? '', localizacao: box.localizacao ?? '',
    peso_vazio_kg: box.peso_vazio_kg?.toString() ?? '', cor_etiqueta: box.cor_etiqueta ?? '',
    status: box.status ?? 'Disponível', observacao: box.observacao ?? '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('logistics_boxes').update({
      codigo:        form.codigo.trim().toUpperCase(),
      nome:          form.nome.trim(),
      descricao:     form.descricao.trim() || null,
      tipo:          form.tipo || null,
      proprietario:  form.proprietario || null,
      section_id:    form.section_id || null,
      localizacao:   form.localizacao.trim() || null,
      peso_vazio_kg: form.peso_vazio_kg ? parseFloat(form.peso_vazio_kg) : null,
      cor_etiqueta:  form.cor_etiqueta.trim() || null,
      status:        form.status,
      observacao:    form.observacao.trim() || null,
      updated_at:    new Date().toISOString(),
    }).eq('id', box.id)
    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/caixas/${box.id}`)
    router.refresh()
  }

  async function handleDelete() {
    if (!window.confirm('Excluir esta caixa? Os itens dentro dela serão desvinculados (não excluídos).')) return
    setDeleting(true); setError(null)
    const supabase = createClient()
    // desvincula os itens antes de excluir
    await supabase.from('equipment').update({ caixa_id: null }).eq('caixa_id', box.id)
    const { error: err } = await supabase.from('logistics_boxes').delete().eq('id', box.id)
    if (err) { setError(err.message); setDeleting(false); return }
    router.push('/caixas')
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 20 }

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, color: '#E8EDF5', margin: 0 }}>Editar caixa</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>{box.codigo}</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={sectionStyle}>
          <div style={grid2}>
            <Field label="Código" required>
              <input style={inputStyle} value={form.codigo} onChange={set('codigo')} required />
            </Field>
            <Field label="Nome" required>
              <input style={inputStyle} value={form.nome} onChange={set('nome')} required />
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Descrição">
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.descricao} onChange={set('descricao')} />
            </Field>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={grid3}>
            <Field label="Tipo">
              <select style={inputStyle} value={form.tipo} onChange={set('tipo')}>
                <option value="">— Selecione —</option>
                {TIPO_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Proprietário">
              <select style={inputStyle} value={form.proprietario} onChange={set('proprietario')}>
                <option value="">— Selecione —</option>
                {PROPRIETARIO_OPTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Seção do cache">
              <select style={inputStyle} value={form.section_id} onChange={set('section_id')}>
                <option value="">— Sem seção —</option>
                {sections.map(s => <option key={s.id} value={s.id}>[{s.codigo}] {s.nome_pt}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ ...grid3, marginTop: 14 }}>
            <Field label="Localização física">
              <input style={inputStyle} value={form.localizacao} onChange={set('localizacao')} />
            </Field>
            <Field label="Peso vazio (kg)">
              <input type="number" step="0.01" style={inputStyle} value={form.peso_vazio_kg} onChange={set('peso_vazio_kg')} />
            </Field>
            <Field label="Cor da etiqueta">
              <input style={inputStyle} value={form.cor_etiqueta} onChange={set('cor_etiqueta')} />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Status">
              <select style={inputStyle} value={form.status} onChange={set('status')}>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Observação">
              <input style={inputStyle} value={form.observacao} onChange={set('observacao')} />
            </Field>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B' }}>
            ERRO: {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {isManager ? (
            <button type="button" onClick={handleDelete} disabled={deleting} style={{ padding: '8px 16px', borderRadius: 3, cursor: deleting ? 'not-allowed' : 'pointer', background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', letterSpacing: '0.1em' }}>
              {deleting ? 'EXCLUINDO...' : 'EXCLUIR CAIXA'}
            </button>
          ) : <span />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', letterSpacing: '0.1em' }}>CANCELAR</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
              {loading ? 'SALVANDO...' : 'SALVAR'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
