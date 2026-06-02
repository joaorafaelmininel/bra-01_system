'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Member = Record<string, any>
type Props = { members: Member[] }

const TIPO_OPTS = ['Operação real', 'Exercício', 'Treinamento']
const FASE_OPTS = [
  'Desmobilizado',
  'Monitoramento',
  'Em prontidão',
  'Em mobilização',
  'Desdobrado',
  'Missão concluída',
]

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

function SectionTitle({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 2, background: 'rgba(232,119,34,0.12)', color: '#E87722', border: '1px solid rgba(232,119,34,0.3)' }}>{num}</span>
      <span style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

export default function NovaMissaoForm({ members }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: '', codigo: '', tipo: 'Exercício', fase: 'Desmobilizado',
    pais: 'Brasil', cidade: '', descricao: '',
    data_ativacao: '', data_retorno: '',
    lider_id: '',
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
    const { data, error: err } = await supabase.from('missions').insert({
      nome:          form.nome.trim(),
      codigo:        form.codigo.trim() || null,
      tipo:          form.tipo,
      fase:          form.fase,
      pais:          form.pais.trim() || null,
      cidade:        form.cidade.trim() || null,
      descricao:     form.descricao.trim() || null,
      data_ativacao: form.data_ativacao || null,
      data_retorno:  form.data_retorno || null,
      lider_id:      form.lider_id || null,
    }).select('id').single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/missoes/${data.id}`)
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 20 }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '6px 10px', cursor: 'pointer', color: '#9BA8BC', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>← VOLTAR</button>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Nova missão</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Operação · Exercício · Treinamento BRA-01</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 01 Identificação */}
        <div style={sectionStyle}>
          <SectionTitle num="01">Identificação</SectionTitle>
          <Field label="Nome da missão" required>
            <input style={inputStyle} value={form.nome} onChange={set('nome')} required placeholder="Ex: Exercício INSARAG 2026 · Terremoto Haiti" />
          </Field>
          <div style={{ ...grid3, marginTop: 14 }}>
            <Field label="Código" hint="Ex: BRA-01-2026-001">
              <input style={inputStyle} value={form.codigo} onChange={set('codigo')} placeholder="BRA-01-AAAA-NNN" />
            </Field>
            <Field label="Tipo" required>
              <select style={inputStyle} value={form.tipo} onChange={set('tipo')}>
                {TIPO_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Fase" required>
              <select style={inputStyle} value={form.fase} onChange={set('fase')}>
                {FASE_OPTS.map(f => <option key={f}>{f}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Descrição / Contexto">
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.descricao} onChange={set('descricao')} placeholder="Contexto operacional, objetivos, características do evento..." />
            </Field>
          </div>
        </div>

        {/* 02 Localização e datas */}
        <div style={sectionStyle}>
          <SectionTitle num="02">Localização e datas</SectionTitle>
          <div style={grid2}>
            <Field label="País">
              <input style={inputStyle} value={form.pais} onChange={set('pais')} placeholder="País da operação" />
            </Field>
            <Field label="Cidade">
              <input style={inputStyle} value={form.cidade} onChange={set('cidade')} placeholder="Cidade ou região" />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Data de ativação" hint="Saída da base">
              <input type="datetime-local" style={inputStyle} value={form.data_ativacao} onChange={set('data_ativacao')} />
            </Field>
            <Field label="Data de retorno" hint="Chegada na base">
              <input type="datetime-local" style={inputStyle} value={form.data_retorno} onChange={set('data_retorno')} />
            </Field>
          </div>
        </div>

        {/* 03 Liderança */}
        <div style={sectionStyle}>
          <SectionTitle num="03">Liderança</SectionTitle>
          <Field label="Líder da missão (Team Leader)">
            <select style={inputStyle} value={form.lider_id} onChange={set('lider_id')}>
              <option value="">— Definir depois —</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}
                </option>
              ))}
            </select>
          </Field>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', marginTop: 8 }}>
            Os participantes, equipamentos e checklist de deploy são adicionados na página da missão após o cadastro.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B' }}>
            ERRO: {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
            {loading ? 'SALVANDO...' : 'CRIAR MISSÃO'}
          </button>
        </div>
      </form>
    </div>
  )
}
