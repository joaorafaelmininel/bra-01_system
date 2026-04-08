'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Item    = Record<string, any>
type Section = Record<string, any>
type Group   = Record<string, any>
type Member  = Record<string, any>

type Props = {
  item: Item
  sections: Section[]
  groups: Group[]
  members: Member[]
  parentItems: Item[]
}

const STATUS_OPTS = ['Operacional','Manutenção rápida','Manutenção','Inoperante','Em trânsito','Processo de descarga','Em missão']
const PERIOD_OPTS = ['Mensal','Trimestral','Semestral','Anual','Sob demanda']
const TIPO_OPTS   = ['Principal','Subcomponente']

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


// ─── Botão de exclusão ────────────────────────────────────────────────────────

function BotaoExcluir({ equipamentoId, codigoItem, nome }: { equipamentoId: string; codigoItem: string; nome: string }) {
  const router = useRouter()
  const [loadingDel, setLoadingDel] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function handleDelete() {
    setLoadingDel(true)
    const supabase = createClient()
    const { error } = await supabase.from('equipment').delete().eq('id', equipamentoId)
    if (error) { alert('Erro ao excluir: ' + error.message); setLoadingDel(false); return }
    router.push('/equipamentos')
    router.refresh()
  }

  if (confirmando) return (
    <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 5, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, color: '#FF6B6B' }}>Confirmar exclusão</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', marginTop: 3 }}>
          Esta ação é irreversível. O item <strong>[{codigoItem}] {nome}</strong> e seu histórico de manutenção serão removidos permanentemente.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button type="button" onClick={() => setConfirmando(false)} style={{ padding: '7px 14px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', letterSpacing: '0.1em' }}>CANCELAR</button>
        <button type="button" onClick={handleDelete} disabled={loadingDel} style={{ padding: '7px 16px', borderRadius: 3, cursor: loadingDel ? 'not-allowed' : 'pointer', background: '#CC0000', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{loadingDel ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}</button>
      </div>
    </div>
  )

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button type="button" onClick={() => setConfirmando(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, cursor: 'pointer', background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.25)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF6B6B', letterSpacing: '0.1em' }}>
        <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        EXCLUIR EQUIPAMENTO
      </button>
    </div>
  )
}

export default function EditarEquipamentoForm({ item, sections, groups, members, parentItems }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    section_id:          item.section_id ?? sections[0]?.id ?? '',
    group_id:            item.group_id ?? '',
    parent_id:           item.parent_id ?? '',
    codigo_item:         item.codigo_item ?? '',
    tipo_item:           item.tipo_item ?? 'Principal',
    nome:                item.nome ?? '',
    nome_en:             item.nome_en ?? '',
    descricao:           item.descricao ?? '',
    fabricante:          item.fabricante ?? '',
    modelo:              item.modelo ?? '',
    numero_serie:        item.numero_serie ?? '',
    numero_patrimonio:   item.numero_patrimonio ?? '',
    status:              item.status ?? 'Operacional',
    localizacao:         item.localizacao ?? '',
    membro_responsavel:  item.membro_responsavel ?? '',
    periodicidade_manut: item.periodicidade_manut ?? '',
    ultima_manutencao:   item.ultima_manutencao ?? '',
    proxima_manutencao:  item.proxima_manutencao ?? '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }
  }

  const filteredGroups = useMemo(() =>
    groups.filter(g => g.section_id === form.section_id),
    [groups, form.section_id]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase
      .from('equipment')
      .update({
        section_id:          form.section_id,
        group_id:            form.group_id || null,
        parent_id:           form.parent_id || null,
        codigo_item:         form.codigo_item.trim().toUpperCase(),
        tipo_item:           form.tipo_item,
        nome:                form.nome.trim(),
        nome_en:             form.nome_en.trim() || null,
        descricao:           form.descricao.trim() || null,
        fabricante:          form.fabricante.trim() || null,
        modelo:              form.modelo.trim() || null,
        numero_serie:        form.numero_serie.trim() || null,
        numero_patrimonio:   form.numero_patrimonio.trim() || null,
        status:              form.status,
        localizacao:         form.localizacao.trim() || null,
        membro_responsavel:  form.membro_responsavel || null,
        periodicidade_manut: form.periodicidade_manut || null,
        ultima_manutencao:   form.ultima_manutencao || null,
        proxima_manutencao:  form.proxima_manutencao || null,
      })
      .eq('id', item.id)

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/equipamentos/${item.id}`)
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const grid4: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 20 }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '6px 10px', cursor: 'pointer', color: '#9BA8BC', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>
          ← VOLTAR
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Editar equipamento</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
            {item.codigo_item} · {item.nome}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 01 Identificação */}
        <div style={sectionStyle}>
          <SectionTitle num="01">Identificação</SectionTitle>
          <div style={grid3}>
            <Field label="Tipo de item" required>
              <select style={inputStyle} value={form.tipo_item} onChange={e => setForm(p => ({ ...p, tipo_item: e.target.value, parent_id: '' }))}>
                {TIPO_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Código do item" required>
              <input style={inputStyle} value={form.codigo_item} onChange={set('codigo_item')} required />
            </Field>
            <Field label="Status" required>
              <select style={inputStyle} value={form.status} onChange={set('status')}>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {form.tipo_item === 'Subcomponente' && (
            <div style={{ marginTop: 14 }}>
              <Field label="Item principal (pai)">
                <select style={inputStyle} value={form.parent_id} onChange={set('parent_id')}>
                  <option value="">— Selecione o item principal —</option>
                  {parentItems.map(p => <option key={p.id} value={p.id}>[{p.codigo_item}] {p.nome}</option>)}
                </select>
              </Field>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <Field label="Nome (PT)" required>
              <input style={inputStyle} value={form.nome} onChange={set('nome')} required />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Nome (EN)">
              <input style={inputStyle} value={form.nome_en} onChange={set('nome_en')} />
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Descrição / Especificação técnica">
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.descricao} onChange={set('descricao')} />
            </Field>
          </div>
        </div>

        {/* 02 Classificação */}
        <div style={sectionStyle}>
          <SectionTitle num="02">Classificação do cache</SectionTitle>
          <div style={grid2}>
            <Field label="Seção" required>
              <select style={inputStyle} value={form.section_id} onChange={e => setForm(p => ({ ...p, section_id: e.target.value, group_id: '' }))}>
                {sections.map(s => <option key={s.id} value={s.id}>[{s.codigo}] {s.nome_pt}</option>)}
              </select>
            </Field>
            <Field label="Grupo">
              <select style={inputStyle} value={form.group_id} onChange={set('group_id')}>
                <option value="">— Sem grupo —</option>
                {filteredGroups.map(g => <option key={g.id} value={g.id}>[{g.codigo}] {g.nome}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* 03 Fabricante */}
        <div style={sectionStyle}>
          <SectionTitle num="03">Fabricante e identificação física</SectionTitle>
          <div style={grid3}>
            <Field label="Fabricante">
              <input style={inputStyle} value={form.fabricante} onChange={set('fabricante')} />
            </Field>
            <Field label="Modelo">
              <input style={inputStyle} value={form.modelo} onChange={set('modelo')} />
            </Field>
            <Field label="Número de série">
              <input style={inputStyle} value={form.numero_serie} onChange={set('numero_serie')} />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Número de patrimônio">
              <input style={inputStyle} value={form.numero_patrimonio} onChange={set('numero_patrimonio')} />
            </Field>
            <Field label="Localização atual">
              <input style={inputStyle} value={form.localizacao} onChange={set('localizacao')} />
            </Field>
          </div>
        </div>

        {/* 04 Responsável e manutenção */}
        <div style={sectionStyle}>
          <SectionTitle num="04">Responsável e manutenção</SectionTitle>
          <div style={grid2}>
            <Field label="Membro responsável">
              <select style={inputStyle} value={form.membro_responsavel} onChange={set('membro_responsavel')}>
                <option value="">— Sem responsável —</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}</option>)}
              </select>
            </Field>
            <Field label="Periodicidade de manutenção">
              <select style={inputStyle} value={form.periodicidade_manut} onChange={set('periodicidade_manut')}>
                <option value="">— Não definida —</option>
                {PERIOD_OPTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Última manutenção">
              <input type="date" style={inputStyle} value={form.ultima_manutencao} onChange={set('ultima_manutencao')} />
            </Field>
            <Field label="Próxima manutenção">
              <input type="date" style={inputStyle} value={form.proxima_manutencao} onChange={set('proxima_manutencao')} />
            </Field>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B' }}>
            ERRO: {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button type="button" onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', letterSpacing: '0.1em' }}>
            CANCELAR
          </button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
            {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </div>
      </form>

      <BotaoExcluir equipamentoId={item.id} codigoItem={item.codigo_item} nome={item.nome} />
    </div>
  )
}
