'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Section = Record<string, any>
type Props = { sections: Section[] }

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

export default function NovaCaixaForm({ sections }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm] = useState({
    codigo: '', nome: '', descricao: '', tipo: '', proprietario: '',
    section_id: '', localizacao: '', peso_vazio_kg: '', cor_etiqueta: '',
    status: 'Disponível', observacao: '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase() }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error: err } = await supabase.from('logistics_boxes').insert({
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
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/caixas')
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 20 }

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, color: '#E8EDF5', margin: 0 }}>Nova caixa de logística</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>
          REPOSITÓRIO DE ACONDICIONAMENTO · CACHE BRA-01
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={sectionStyle}>
          <div style={grid2}>
            <Field label="Código" required hint="Ex: BOX-R-01">
              <input style={inputStyle} value={form.codigo} onChange={set('codigo')} required placeholder="BOX-R-01" />
            </Field>
            <Field label="Nome" required>
              <input style={inputStyle} value={form.nome} onChange={set('nome')} required placeholder="Caixa de Resgate 01" />
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Descrição">
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.descricao} onChange={set('descricao')} placeholder="Conteúdo previsto, finalidade da caixa..." />
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
            <Field label="Localização física" hint="Onde a caixa está">
              <input style={inputStyle} value={form.localizacao} onChange={set('localizacao')} placeholder="Ex: Galpão A · Estante 3" />
            </Field>
            <Field label="Peso vazio (kg)">
              <input type="number" step="0.01" style={inputStyle} value={form.peso_vazio_kg} onChange={set('peso_vazio_kg')} placeholder="Ex: 4.5" />
            </Field>
            <Field label="Cor da etiqueta" hint="Hex (#009EDB) ou nome">
              <input style={inputStyle} value={form.cor_etiqueta} onChange={set('cor_etiqueta')} placeholder="#009EDB" />
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
            {loading ? 'SALVANDO...' : 'CRIAR CAIXA'}
          </button>
        </div>
      </form>
    </div>
  )
}
