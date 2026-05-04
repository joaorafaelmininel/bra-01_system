'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Document = Record<string, any>

type Props = {
  memberId: string
  documents: Document[]
}

const TIPOS = [
  'Certificado de Curso',
  'Carteira de Vacinação',
  'Passaporte',
  'Documento de Identidade',
  'Outro',
]

const tipoConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  'Certificado de Curso':   { color: '#009EDB', bg: 'rgba(0,158,219,0.1)',  border: 'rgba(0,158,219,0.2)',  icon: '🎓' },
  'Carteira de Vacinação':  { color: '#00A550', bg: 'rgba(0,165,80,0.1)',   border: 'rgba(0,165,80,0.2)',   icon: '💉' },
  'Passaporte':             { color: '#E87722', bg: 'rgba(232,119,34,0.1)', border: 'rgba(232,119,34,0.2)', icon: '🛂' },
  'Documento de Identidade':{ color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)',border: 'rgba(155,168,188,0.2)',icon: '🪪' },
  'Outro':                  { color: '#5A6478', bg: 'rgba(90,100,120,0.1)', border: 'rgba(90,100,120,0.2)', icon: '📄' },
}

function formatBytes(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

function validadeStatus(d: string | null) {
  if (!d) return null
  const dias = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: 'Vencido',         color: '#FF6B6B' }
  if (dias < 60)  return { label: `Vence em ${dias}d`, color: '#E87722' }
  if (dias < 180) return { label: `Vence em ${dias}d`, color: '#FFDF00' }
  return              { label: 'Válido',             color: '#00A550' }
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#131920',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
  padding: '8px 10px', fontSize: 13, color: '#E8EDF5',
  fontFamily: 'var(--font-body)', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9,
  fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: '#5A6478', marginBottom: 5,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>
}

export default function MemberDocuments({ memberId, documents: initialDocs }: Props) {
  const [docs, setDocs]         = useState(initialDocs)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    tipo: 'Certificado de Curso',
    descricao: '',
    data_emissao: '',
    data_validade: '',
  })

  function setF(f: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }))
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('Selecione um arquivo'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Arquivo muito grande (máx. 10MB)'); return }

    setUploading(true); setError(null); setProgress(10)

    const supabase = createClient()
    const ext      = file.name.split('.').pop()
    const path     = `${memberId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    setProgress(30)
    const { error: uploadErr } = await supabase.storage
      .from('member-documents')
      .upload(path, file, { upsert: false })

    if (uploadErr) { setError('Erro no upload: ' + uploadErr.message); setUploading(false); setProgress(0); return }

    setProgress(70)
    const { data, error: dbErr } = await supabase.from('member_documents').insert({
      member_id:       memberId,
      tipo:            form.tipo,
      nome_arquivo:    file.name,
      descricao:       form.descricao.trim() || null,
      storage_path:    path,
      file_size_bytes: file.size,
      mime_type:       file.type,
      data_emissao:    form.data_emissao || null,
      data_validade:   form.data_validade || null,
    }).select().single()

    if (dbErr) { setError('Erro ao salvar: ' + dbErr.message); setUploading(false); setProgress(0); return }

    setProgress(100)
    setDocs(prev => [data, ...prev])
    setForm({ tipo: 'Certificado de Curso', descricao: '', data_emissao: '', data_validade: '' })
    if (fileRef.current) fileRef.current.value = ''
    setShowForm(false)
    setUploading(false)
    setProgress(0)
  }

  async function handleDownload(doc: Document) {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('member-documents')
      .createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Excluir "${doc.nome_arquivo}"?`)) return
    const supabase = createClient()
    await supabase.storage.from('member-documents').remove([doc.storage_path])
    await supabase.from('member_documents').delete().eq('id', doc.id)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  const vencidos = docs.filter(d => d.data_validade && new Date(d.data_validade) < new Date()).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {vencidos > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF6B6B' }}>
              ⚠ {vencidos} documento{vencidos > 1 ? 's' : ''} vencido{vencidos > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 3, cursor: 'pointer', background: showForm ? 'rgba(255,255,255,0.07)' : 'rgba(232,119,34,0.12)', border: showForm ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(232,119,34,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: showForm ? '#9BA8BC' : '#E87722', letterSpacing: '0.08em' }}
        >
          {showForm ? '× CANCELAR' : '+ FAZER UPLOAD'}
        </button>
      </div>

      {/* Formulário de upload */}
      {showForm && (
        <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 16 }}>
          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Tipo de documento *">
                <select style={inputStyle} value={form.tipo} onChange={setF('tipo')}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Arquivo *">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ ...inputStyle, cursor: 'pointer' }}
                />
              </Field>
            </div>
            <Field label="Descrição / Identificação">
              <input style={inputStyle} value={form.descricao} onChange={setF('descricao')} placeholder="Ex: BREC/USAR — Turma 2024, Passaporte nº XX123" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Data de emissão">
                <input type="date" style={inputStyle} value={form.data_emissao} onChange={setF('data_emissao')} />
              </Field>
              <Field label="Data de validade">
                <input type="date" style={inputStyle} value={form.data_validade} onChange={setF('data_validade')} />
              </Field>
            </div>

            {/* Barra de progresso */}
            {uploading && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#E87722', width: `${progress}%`, transition: 'width .3s ease', borderRadius: 2 }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', marginTop: 4 }}>Enviando... {progress}%</div>
              </div>
            )}

            {error && (
              <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B', marginBottom: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
              <button type="submit" disabled={uploading} style={{ padding: '7px 16px', borderRadius: 3, background: uploading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                {uploading ? 'ENVIANDO...' : 'FAZER UPLOAD'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de documentos */}
      {docs.length === 0 ? (
        <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>Nenhum documento cadastrado.</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848', marginTop: 6 }}>Use "+ Fazer Upload" para adicionar certificados, passaporte e carteira de vacinação.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TIPOS.map(tipo => {
            const tiposDocs = docs.filter(d => d.tipo === tipo)
            if (tiposDocs.length === 0) return null
            const cfg = tipoConfig[tipo]
            return (
              <div key={tipo}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{cfg.icon}</span> {tipo} <span style={{ color: '#2E3848' }}>({tiposDocs.length})</span>
                </div>
                {tiposDocs.map(doc => {
                  const vs = validadeStatus(doc.data_validade)
                  const ext = doc.nome_arquivo?.split('.').pop()?.toUpperCase() ?? ''
                  return (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#131920', border: `1px solid ${vs?.color === '#FF6B6B' ? 'rgba(204,0,0,0.25)' : 'rgba(255,255,255,0.07)'}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 4 }}>
                      {/* Tipo badge */}
                      <div style={{ width: 36, height: 36, borderRadius: 4, background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: cfg.color, flexShrink: 0 }}>
                        {ext || '—'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#E8EDF5', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.descricao || doc.nome_arquivo}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', marginTop: 2, display: 'flex', gap: 12 }}>
                          {doc.data_emissao && <span>Emissão: {formatDate(doc.data_emissao)}</span>}
                          {doc.data_validade && <span style={{ color: vs?.color }}>{vs?.label}: {formatDate(doc.data_validade)}</span>}
                          <span>{formatBytes(doc.file_size_bytes)}</span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => handleDownload(doc)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 3, cursor: 'pointer', background: 'rgba(0,158,219,0.1)', border: '1px solid rgba(0,158,219,0.2)', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#009EDB', letterSpacing: '0.08em' }}>
                          <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          ABRIR
                        </button>
                        <button onClick={() => handleDelete(doc)} style={{ padding: '4px 8px', borderRadius: 3, cursor: 'pointer', background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.2)', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#FF6B6B', letterSpacing: '0.08em' }}>
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
