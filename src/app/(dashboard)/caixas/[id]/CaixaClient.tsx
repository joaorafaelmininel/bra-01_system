'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/lib/RoleContext'
import { useEstado } from '@/lib/EstadoContext'
import { generatePackingList } from '@/lib/generateLogisticaPDF'

type Equipment = Record<string, any>
type Box = Record<string, any>

type Props = {
  box: Box
  itensIniciais: Equipment[]
  disponiveisIniciais: Equipment[]
}

const sectionColors: Record<string, string> = {
  R: '#FF6B6B', M: '#00A550', T: '#E87722',
  C: '#009EDB', L: '#9BA8BC', P: '#FFDF00',
  PP: '#CC0000', A: '#002776',
}

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Operacional':        { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  'Manutenção rápida': { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Manutenção':        { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Inoperante':        { color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',     border: 'rgba(204,0,0,0.3)' },
  'Em trânsito':       { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Em missão':         { color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',    border: 'rgba(255,223,0,0.25)' },
}

function secColorOf(e: Equipment) {
  return sectionColors[e.section?.codigo] ?? '#9BA8BC'
}

// ─── Modal de seleção de itens ──────────────────────────────────────────────
function ModalAdicionar({ caixaId, disponiveis, onClose, onSaved }: {
  caixaId: string
  disponiveis: Equipment[]
  onClose: () => void
  onSaved: () => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return disponiveis.filter(e =>
      !q ||
      e.nome?.toLowerCase().includes(q) ||
      e.codigo_item?.toLowerCase().includes(q) ||
      (e.section?.nome_pt?.toLowerCase().includes(q) ?? false)
    )
  }, [disponiveis, search])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (selected.size === 0) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('equipment')
      .update({ caixa_id: caixaId })
      .in('id', Array.from(selected))
    if (err) { setError(err.message); setSaving(false); return }
    onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
        width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, color: '#E8EDF5', letterSpacing: '0.04em' }}>
            Adicionar itens à caixa
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar item disponível por código ou nome..."
            style={{ width: '100%', background: '#131920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '8px 10px', fontSize: 13, color: '#E8EDF5', fontFamily: 'var(--font-body)', outline: 'none' }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '30px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
              Nenhum item disponível (sem caixa) encontrado.
            </div>
          ) : filtered.map(e => {
            const sc = secColorOf(e)
            const checked = selected.has(e.id)
            return (
              <div key={e.id} onClick={() => toggle(e.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 4, cursor: 'pointer', marginBottom: 2,
                background: checked ? 'rgba(0,158,219,0.1)' : 'transparent',
                border: `1px solid ${checked ? 'rgba(0,158,219,0.3)' : 'transparent'}`,
              }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${checked ? '#009EDB' : 'rgba(255,255,255,0.2)'}`, background: checked ? '#009EDB' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {checked && <svg style={{ width: 11, height: 11, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: sc, flexShrink: 0 }}>{e.codigo_item}</span>
                <span style={{ fontSize: 13, color: '#E8EDF5', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.nome}</span>
                {e.section && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', flexShrink: 0 }}>{e.section.codigo}</span>}
              </div>
            )
          })}
        </div>

        {error && (
          <div style={{ margin: '0 20px', padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B' }}>
            ERRO: {error}
          </div>
        )}

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
            {selected.size} selecionado{selected.size === 1 ? '' : 's'}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
            <button onClick={handleSave} disabled={saving || selected.size === 0} style={{ padding: '7px 16px', borderRadius: 3, background: saving || selected.size === 0 ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: saving || selected.size === 0 ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function CaixaClient({ box, itensIniciais, disponiveisIniciais }: Props) {
  const router = useRouter()
  const { canEdit } = useRole()
  const { estado } = useEstado()

  const [itens, setItens]             = useState<Equipment[]>(itensIniciais)
  const [disponiveis, setDisponiveis] = useState<Equipment[]>(disponiveisIniciais)
  const [modal, setModal]             = useState(false)

  function handlePackingList() {
    generatePackingList(box, itens, {
      estado: estado === 'Todos' ? box.proprietario : estado,
    })
  }

  const secColor = sectionColors[box.section?.codigo] ?? '#9BA8BC'

  async function refetch() {
    const supabase = createClient()
    const sel = 'id, codigo_item, nome, status, peso_kg, proprietario, section:cache_sections(codigo, nome_pt)'
    const [{ data: dentro }, { data: livres }] = await Promise.all([
      supabase.from('equipment').select(sel).eq('caixa_id', box.id).order('codigo_item'),
      supabase.from('equipment').select(sel).is('caixa_id', null).is('parent_id', null).order('codigo_item'),
    ])
    setItens(dentro ?? [])
    setDisponiveis(livres ?? [])
  }

  async function handleRemove(id: string, nome: string) {
    if (!window.confirm(`Remover "${nome}" desta caixa?`)) return
    const supabase = createClient()
    await supabase.from('equipment').update({ caixa_id: null }).eq('id', id)
    await refetch()
  }

  async function handleModalSaved() {
    setModal(false)
    await refetch()
  }

  const pesoTotal = useMemo(
    () => itens.reduce((acc, e) => acc + (Number(e.peso_kg) || 0), 0),
    [itens]
  )

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {modal && (
        <ModalAdicionar
          caixaId={box.id}
          disponiveis={disponiveis}
          onClose={() => setModal(false)}
          onSaved={handleModalSaved}
        />
      )}

      {/* Breadcrumb */}
      <Link href="/caixas" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.08em' }}>
        ← CAIXAS DE LOGÍSTICA
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
            padding: '4px 10px', borderRadius: 3,
            background: `${secColor}15`, color: secColor, border: `1px solid ${secColor}40`,
          }}>
            {box.codigo}
          </span>
          <div>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, color: '#E8EDF5', margin: 0, lineHeight: 1.1 }}>
              {box.nome}
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 4, letterSpacing: '0.06em' }}>
              {[box.tipo, box.section ? `${box.section.codigo} ${box.section.nome_pt}` : null, box.proprietario, box.localizacao].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handlePackingList} style={{ padding: '7px 14px', borderRadius: 3, background: 'rgba(0,165,80,0.12)', border: '1px solid rgba(0,165,80,0.25)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00A550', cursor: 'pointer', letterSpacing: '0.08em' }}>
            ⬇ PACKING LIST
          </button>
          <Link href={`/caixas/${box.id}/editar`} style={{ padding: '7px 14px', borderRadius: 3, background: 'rgba(0,158,219,0.12)', border: '1px solid rgba(0,158,219,0.25)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#009EDB', textDecoration: 'none', letterSpacing: '0.08em' }}>
            EDITAR CAIXA
          </Link>
          {canEdit && (
            <button onClick={() => setModal(true)} style={{ padding: '7px 14px', borderRadius: 3, background: '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              + Adicionar itens
            </button>
          )}
        </div>
      </div>

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Itens na caixa', val: itens.length, color: '#009EDB' },
          { label: 'Peso dos itens (kg)', val: pesoTotal.toFixed(1), color: '#E87722' },
          { label: 'Status', val: box.status, color: '#9BA8BC', small: true },
        ].map(c => (
          <div key={c.label} style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: c.small ? 18 : 30, fontWeight: 800, color: c.color, lineHeight: 1.2 }}>{c.val}</div>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {box.descricao && (
        <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '12px 14px', fontSize: 13, color: '#9BA8BC', lineHeight: 1.5 }}>
          {box.descricao}
        </div>
      )}

      {/* Conteúdo */}
      <div style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC', marginTop: 4 }}>
        Conteúdo da caixa
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#131920', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Código', 'Item', 'Seção', 'Status', 'Peso', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A6478' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
                  Caixa vazia. {canEdit ? 'Use "+ Adicionar itens" para acondicionar equipamentos.' : ''}
                </td>
              </tr>
            ) : itens.map(e => {
              const sc = secColorOf(e)
              const st = statusConfig[e.status] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0D1117' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 2, background: `${sc}15`, color: sc, border: `1px solid ${sc}40` }}>{e.codigo_item}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#E8EDF5', fontWeight: 500 }}>{e.nome}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: sc }}>{e.section?.codigo} — {e.section?.nome_pt}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '2px 7px', borderRadius: 2, color: st.color, background: st.bg, border: `1px solid ${st.border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{e.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC' }}>{e.peso_kg ? `${e.peso_kg} kg` : '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <Link href={`/equipamentos/${e.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', marginRight: 12 }}>VER →</Link>
                    {canEdit && (
                      <button onClick={() => handleRemove(e.id, e.nome)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC0000', fontSize: 14, lineHeight: 1 }} title="Remover da caixa">×</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
