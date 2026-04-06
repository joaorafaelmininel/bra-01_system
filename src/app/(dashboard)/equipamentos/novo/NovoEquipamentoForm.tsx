'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Section   = Record<string, any>
type Group     = Record<string, any>
type Member    = Record<string, any>
type ParentItem = Record<string, any>

type Props = {
  sections: Section[]
  groups: Group[]
  members: Member[]
  parentItems: ParentItem[]
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

// Gera o código do item baseado na seção selecionada
function generateCode(sectionCodigo: string, groupCodigo: string, tipo: string) {
  if (!sectionCodigo) return ''
  const prefix = groupCodigo || sectionCodigo
  const suffix = tipo === 'Subcomponente' ? '.01' : '.00'
  return `${prefix}-XXXX${suffix}`
}

export default function NovoEquipamentoForm({ sections, groups, members, parentItems }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    section_id:          sections[0]?.id ?? '',
    group_id:            '',
    parent_id:           '',
    codigo_item:         '',
    tipo_item:           'Principal',
    nome:                '',
    nome_en:             '',
    descricao:           '',
    fabricante:          '',
    modelo:              '',
    numero_serie:        '',
    numero_patrimonio:   '',
    status:              'Operacional',
    localizacao:         '',
    membro_responsavel:  '',
    periodicidade_manut: '',
    ultima_manutencao:   '',
    proxima_manutencao:  '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }
  }

  // Grupos filtrados pela seção selecionada
  const filteredGroups = useMemo(() =>
    groups.filter(g => g.section_id === form.section_id),
    [groups, form.section_id]
  )

  const selectedSection = sections.find(s => s.id === form.section_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.codigo_item.trim()) {
      setError('Código do item é obrigatório')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: err } = await supabase.from('equipment').insert({
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

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/equipamentos')
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 20 }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '6px 10px', cursor: 'pointer', color: '#9BA8BC', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>
          ← VOLTAR
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>Novo item de cache</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Cadastro no cache BRA-01 · Padrão INSARAG/FEMA</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 01 Identificação */}
        <div style={sectionStyle}>
          <SectionTitle num="01">Identificação</SectionTitle>
          <div style={grid2}>
            <Field label="Tipo de item" required>
              <select style={inputStyle} value={form.tipo_item} onChange={e => {
                setForm(prev => ({ ...prev, tipo_item: e.target.value, parent_id: '' }))
              }}>
                {TIPO_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Código do item" required hint="Ex: RC-0103.00 · Siga o padrão SEÇÃO-GRUPO-NNNN.VV">
              <input style={inputStyle} value={form.codigo_item} onChange={set('codigo_item')} required placeholder={`Ex: ${selectedSection?.codigo ?? 'R'}A-0101.00`} />
            </Field>
          </div>

          {form.tipo_item === 'Subcomponente' && (
            <div style={{ marginTop: 14 }}>
              <Field label="Item principal (pai)" hint="Selecione o item ao qual este subcomponente pertence">
                <select style={inputStyle} value={form.parent_id} onChange={set('parent_id')}>
                  <option value="">— Selecione o item principal —</option>
                  {parentItems.map(p => (
                    <option key={p.id} value={p.id}>[{p.codigo_item}] {p.nome}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <Field label="Nome (PT)" required>
              <input style={inputStyle} value={form.nome} onChange={set('nome')} required placeholder="Nome completo do item em português" />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Nome (EN)" hint="Nome em inglês para relatórios INSARAG">
              <input style={inputStyle} value={form.nome_en} onChange={set('nome_en')} placeholder="Item name in English" />
            </Field>
            <Field label="Status" required>
              <select style={inputStyle} value={form.status} onChange={set('status')}>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Descrição / Especificação técnica">
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.descricao} onChange={set('descricao')} placeholder="Especificações técnicas, capacidades, normas aplicáveis..." />
            </Field>
          </div>
        </div>

        {/* 02 Classificação */}
        <div style={sectionStyle}>
          <SectionTitle num="02">Classificação do cache</SectionTitle>
          <div style={grid2}>
            <Field label="Seção" required>
              <select style={inputStyle} value={form.section_id} onChange={e => {
                setForm(prev => ({ ...prev, section_id: e.target.value, group_id: '' }))
              }}>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>[{s.codigo}] {s.nome_pt}</option>
                ))}
              </select>
            </Field>
            <Field label="Grupo" hint="Subclassificação dentro da seção">
              <select style={inputStyle} value={form.group_id} onChange={set('group_id')}>
                <option value="">— Sem grupo —</option>
                {filteredGroups.map(g => (
                  <option key={g.id} value={g.id}>[{g.codigo}] {g.nome}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* 03 Fabricante e identificação física */}
        <div style={sectionStyle}>
          <SectionTitle num="03">Fabricante e identificação física</SectionTitle>
          <div style={grid3}>
            <Field label="Fabricante">
              <input style={inputStyle} value={form.fabricante} onChange={set('fabricante')} placeholder="Ex: Holmatro, Hurst" />
            </Field>
            <Field label="Modelo">
              <input style={inputStyle} value={form.modelo} onChange={set('modelo')} placeholder="Ex: GS 4250 PC" />
            </Field>
            <Field label="Número de série">
              <input style={inputStyle} value={form.numero_serie} onChange={set('numero_serie')} placeholder="S/N do fabricante" />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Número de patrimônio" hint="Número interno da corporação">
              <input style={inputStyle} value={form.numero_patrimonio} onChange={set('numero_patrimonio')} placeholder="Nº de patrimônio" />
            </Field>
            <Field label="Localização atual">
              <input style={inputStyle} value={form.localizacao} onChange={set('localizacao')} placeholder="Ex: Contêiner R · Prateleira A3" />
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
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.posto_graduacao ? `${m.posto_graduacao} ` : ''}{m.nome_guerra ?? m.nome_completo}
                  </option>
                ))}
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
          <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
            {loading ? 'SALVANDO...' : 'CADASTRAR ITEM'}
          </button>
        </div>
      </form>
    </div>
  )
}
