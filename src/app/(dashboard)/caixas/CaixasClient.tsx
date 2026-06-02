'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useEstado } from '@/lib/EstadoContext'
import { createClient } from '@/lib/supabase/client'
import { generateCargoManifest, generateConsolidatedReport, type PdfContext } from '@/lib/generateLogisticaPDF'

type Box = Record<string, any>
type Section = Record<string, any>

type Props = {
  boxes: Box[]
  sections: Section[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'Disponível':  { label: 'Disponível',  color: '#00A550', bg: 'rgba(0,165,80,0.12)',   border: 'rgba(0,165,80,0.3)' },
  'Em trânsito': { label: 'Em trânsito', color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.25)' },
  'Em missão':   { label: 'Em missão',   color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',   border: 'rgba(255,223,0,0.25)' },
  'Manutenção':  { label: 'Manutenção',  color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.3)' },
}

const sectionColors: Record<string, string> = {
  R: '#FF6B6B', M: '#00A550', T: '#E87722',
  C: '#009EDB', L: '#9BA8BC', P: '#FFDF00',
  PP: '#CC0000', A: '#002776',
}

const estadoBadgeColors: Record<string, { color: string; bg: string; border: string }> = {
  CBPMESP: { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.3)' },
  CBMMG:   { color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.3)' },
  CBMPR:   { color: '#00A550', bg: 'rgba(0,165,80,0.12)',   border: 'rgba(0,165,80,0.3)' },
}

function Tag({ children, color, bg, border }: {
  children: React.ReactNode; color: string; bg: string; border: string
}) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
      padding: '2px 7px', borderRadius: 2,
      color, background: bg, border: `1px solid ${border}`,
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}

function itemCount(box: Box): number {
  // supabase retorna itens como [{ count: n }]
  if (Array.isArray(box.itens)) return box.itens[0]?.count ?? 0
  return box.itens?.count ?? 0
}

function Stats({ boxes }: { boxes: Box[] }) {
  const total       = boxes.length
  const disponivel  = boxes.filter(b => b.status === 'Disponível').length
  const emMissao    = boxes.filter(b => ['Em missão', 'Em trânsito'].includes(b.status)).length
  const totalItens  = boxes.reduce((acc, b) => acc + itemCount(b), 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {[
        { label: 'Total de caixas',   val: total,      color: '#009EDB', border: '#009EDB' },
        { label: 'Disponíveis',       val: disponivel, color: '#00A550', border: '#00A550' },
        { label: 'Em trânsito/missão',val: emMissao,   color: '#FFDF00', border: '#FFDF00' },
        { label: 'Itens acondicionados', val: totalItens, color: '#9BA8BC', border: 'rgba(255,255,255,0.07)' },
      ].map(c => (
        <div key={c.label} style={{
          background: '#131920', border: '1px solid rgba(255,255,255,0.07)',
          borderTop: `3px solid ${c.border}`, borderRadius: 5, padding: '12px 14px',
        }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.val}</div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478', marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Modal de contexto de embarque ──────────────────────────────────────────
function ModalContexto({ tipo, onClose, onConfirm }: {
  tipo: 'manifest' | 'report'
  onClose: () => void
  onConfirm: (ctx: { origem: string; destino: string; missao: string; responsavel: string }) => void
}) {
  const [f, setF] = useState({ origem: '', destino: '', missao: '', responsavel: '' })
  const [busy, setBusy] = useState(false)
  const inp: React.CSSProperties = { width: '100%', background: '#131920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '8px 10px', fontSize: 13, color: '#E8EDF5', fontFamily: 'var(--font-body)', outline: 'none' }
  const lbl: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478', marginBottom: 6 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, width: '100%', maxWidth: 460 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 16, fontWeight: 700, color: '#E8EDF5', letterSpacing: '0.04em' }}>
            {tipo === 'manifest' ? 'Gerar Cargo Manifest' : 'Gerar Relatório Consolidado'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A6478', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', margin: 0, lineHeight: 1.5 }}>
            Dados opcionais para o cabeçalho do documento. Pode deixar em branco.
          </p>
          {tipo === 'manifest' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Origem</label><input style={inp} value={f.origem} onChange={e => setF({ ...f, origem: e.target.value })} placeholder="Ex: Guarulhos/GRU" /></div>
              <div><label style={lbl}>Destino</label><input style={inp} value={f.destino} onChange={e => setF({ ...f, destino: e.target.value })} placeholder="Ex: zona afetada" /></div>
            </div>
          )}
          <div><label style={lbl}>Missão / Operação</label><input style={inp} value={f.missao} onChange={e => setF({ ...f, missao: e.target.value })} placeholder="Ex: Deploy INSARAG 2026" /></div>
          <div><label style={lbl}>Responsável</label><input style={inp} value={f.responsavel} onChange={e => setF({ ...f, responsavel: e.target.value })} placeholder="Nome do responsável" /></div>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 3, background: 'none', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.1em' }}>CANCELAR</button>
          <button onClick={async () => { setBusy(true); await onConfirm(f) }} disabled={busy} style={{ padding: '7px 16px', borderRadius: 3, background: busy ? '#5A6478' : '#E87722', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', cursor: busy ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {busy ? 'Gerando...' : 'Gerar PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CaixasClient({ boxes }: Props) {
  const { estado } = useEstado()

  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [pdfModal, setPdfModal]         = useState<'manifest' | 'report' | null>(null)

  // Carrega peso líquido e contagem de itens por caixa (respeitando o estado)
  async function carregarAgregadosCaixas(boxIds: string[]) {
    const supabase = createClient()
    const { data: itens } = await supabase
      .from('equipment')
      .select('caixa_id, peso_kg')
      .in('caixa_id', boxIds)
    const mapa: Record<string, { count: number; peso: number }> = {}
    ;(itens ?? []).forEach(it => {
      const k = it.caixa_id as string
      if (!mapa[k]) mapa[k] = { count: 0, peso: 0 }
      mapa[k].count += 1
      mapa[k].peso += Number(it.peso_kg) || 0
    })
    return mapa
  }

  async function handleManifest(ctx: { origem: string; destino: string; missao: string; responsavel: string }) {
    const alvo = byEstado
    const ids = alvo.map(b => b.id)
    const agg = ids.length ? await carregarAgregadosCaixas(ids) : {}
    const enriched = alvo.map(b => ({
      ...b,
      _itemCount: agg[b.id]?.count ?? 0,
      _pesoLiquido: agg[b.id]?.peso ?? 0,
    }))
    const pdfCtx: PdfContext = { estado, ...ctx }
    generateCargoManifest(enriched, pdfCtx)
    setPdfModal(null)
  }

  async function handleReport(ctx: { origem: string; destino: string; missao: string; responsavel: string }) {
    const supabase = createClient()
    const alvo = byEstado
    const boxIds = alvo.map(b => b.id)
    const agg = boxIds.length ? await carregarAgregadosCaixas(boxIds) : {}
    const boxesEnriched = alvo.map(b => ({ ...b, _itemCount: agg[b.id]?.count ?? 0, _pesoLiquido: agg[b.id]?.peso ?? 0 }))

    // equipamentos e cães do mesmo conjunto
    let eqQuery = supabase.from('equipment')
      .select('codigo_item, nome, status, peso_kg, caixa_id, proprietario, section:cache_sections(codigo, nome_pt), caixa:logistics_boxes(codigo)')
      .is('parent_id', null)
    let dogQuery = supabase.from('search_dogs')
      .select('nome, raca, especialidade, nivel_certificacao, status_operacional, proprietario, condutor:members(nome_guerra, nome_completo)')
    if (estado !== 'Todos') {
      eqQuery = eqQuery.eq('proprietario', estado)
      dogQuery = dogQuery.eq('proprietario', estado)
    }
    const [{ data: equipment }, { data: dogs }] = await Promise.all([eqQuery, dogQuery])

    const eqEnriched = (equipment ?? []).map(e => ({ ...e, _caixaCodigo: (e as any).caixa?.codigo ?? null }))

    generateConsolidatedReport(
      { boxes: boxesEnriched, equipment: eqEnriched, dogs: dogs ?? [] },
      { estado, ...ctx }
    )
    setPdfModal(null)
  }

  const statusOpts = ['Todos', ...Object.keys(statusConfig)]

  const byEstado = useMemo(() =>
    estado === 'Todos'
      ? boxes
      : boxes.filter(b => b.proprietario === estado),
    [boxes, estado]
  )

  const filtered = useMemo(() => byEstado.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      b.nome?.toLowerCase().includes(q) ||
      b.codigo?.toLowerCase().includes(q) ||
      (b.localizacao?.toLowerCase().includes(q) ?? false) ||
      (b.tipo?.toLowerCase().includes(q) ?? false)
    const matchStatus = filterStatus === 'Todos' || b.status === filterStatus
    return matchSearch && matchStatus
  }), [byEstado, search, filterStatus])

  const selectStyle: React.CSSProperties = {
    background: '#131920', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '6px 10px',
    fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC',
    outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {pdfModal && (
        <ModalContexto
          tipo={pdfModal}
          onClose={() => setPdfModal(null)}
          onConfirm={pdfModal === 'manifest' ? handleManifest : handleReport}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800, color: '#E8EDF5', letterSpacing: '0.02em', margin: 0 }}>
              Caixas de Logística
            </h1>
            {estado !== 'Todos' && estadoBadgeColors[estado] && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                padding: '3px 9px', borderRadius: 2,
                color: estadoBadgeColors[estado].color,
                background: estadoBadgeColors[estado].bg,
                border: `1px solid ${estadoBadgeColors[estado].border}`,
                letterSpacing: '0.08em',
              }}>
                {estado}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>
            REPOSITÓRIOS DE ACONDICIONAMENTO · CACHE BRA-01
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPdfModal('report')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3,
            background: 'rgba(0,158,219,0.12)', border: '1px solid rgba(0,158,219,0.25)', color: '#009EDB',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer',
          }}>
            ⬇ RELATÓRIO
          </button>
          <button onClick={() => setPdfModal('manifest')} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3,
            background: 'rgba(0,165,80,0.12)', border: '1px solid rgba(0,165,80,0.25)', color: '#00A550',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer',
          }}>
            ⬇ CARGO MANIFEST
          </button>
          <Link href="/caixas/novo" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 3,
            background: '#E87722', color: '#fff',
            fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none',
          }}>
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova caixa
          </Link>
        </div>
      </div>

      <Stats boxes={byEstado} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#5A6478' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar código, nome, tipo, localização..."
            style={{ ...selectStyle, paddingLeft: 32, width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, color: '#E8EDF5' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          {statusOpts.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
          {filtered.length} {filtered.length === 1 ? 'caixa' : 'caixas'}
        </span>
      </div>

      {/* Grade de caixas */}
      {filtered.length === 0 ? (
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '40px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A6478' }}>
          {byEstado.length === 0
            ? estado !== 'Todos'
              ? `Nenhuma caixa registrada para ${estado}.`
              : 'Nenhuma caixa cadastrada. Clique em "+ Nova caixa" para começar.'
            : 'Nenhuma caixa encontrada com os filtros atuais.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(b => {
            const st = statusConfig[b.status] ?? { label: b.status, color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
            const secColor = sectionColors[b.section?.codigo] ?? '#9BA8BC'
            const n = itemCount(b)
            return (
              <Link key={b.id} href={`/caixas/${b.id}`} style={{
                textDecoration: 'none',
                background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${b.cor_etiqueta || secColor}`,
                borderRadius: 5, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'border-color .15s, background .15s',
              }}
                onMouseEnter={ev => { ev.currentTarget.style.background = '#131920' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = '#0D1117' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 2,
                      background: `${secColor}15`, color: secColor, border: `1px solid ${secColor}40`,
                    }}>
                      {b.codigo}
                    </span>
                  </div>
                  <Tag color={st.color} bg={st.bg} border={st.border}>{st.label}</Tag>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-cond)', fontSize: 17, fontWeight: 700, color: '#E8EDF5', lineHeight: 1.1 }}>
                    {b.nome}
                  </div>
                  {b.tipo && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 3 }}>
                      {b.tipo}{b.section ? ` · ${b.section.codigo} ${b.section.nome_pt}` : ''}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478' }}>
                    {b.localizacao || '— sem localização —'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: n > 0 ? '#009EDB' : '#2E3848' }}>
                    {n} {n === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
