'use client'

import { useEffect } from 'react'

type Fn  = Record<string, any>
type Des = Record<string, any>

const SECTIONS = [
  {
    label: 'Management',     labelPT: 'Gestão',
    color: '#003D7A',        lightBg: '#EEF4FB',
    positions: ['TL','DL','IO','LNO','SOFR','PLO'],
  },
  {
    label: 'Rescue',         labelPT: 'Resgate',
    color: '#B91C1C',        lightBg: '#FEF2F2',
    positions: ['RL','RTO','RS','SHO'],
  },
  {
    label: 'Technical Search', labelPT: 'Busca Técnica',
    color: '#C2410C',        lightBg: '#FFF7ED',
    positions: ['SL','STO','K9','SQ','HAZM','STRX'],
  },
  {
    label: 'Medical',        labelPT: 'Médico',
    color: '#065F46',        lightBg: '#ECFDF5',
    positions: ['MED','PMED'],
  },
  {
    label: 'Logistics',      labelPT: 'Logística',
    color: '#1E3A5F',        lightBg: '#F0F4FA',
    positions: ['LOG','COM','ICT','LOG2'],
  },
]

export default function OrganogramaPrint({
  functions,
  designations,
}: {
  functions: Fn[]
  designations: Des[]
}) {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 900)
    return () => clearTimeout(t)
  }, [])

  const fnMap: Record<string, Fn> = {}
  functions.forEach(f => { fnMap[f.codigo] = f })

  const total    = functions.length
  const cobertos = functions.filter(fn =>
    designations.some(d => d.function_id === fn.id && d.primaria)
  ).length
  const comAlt   = functions.filter(fn =>
    designations.some(d => d.function_id === fn.id && d.alternativa)
  ).length
  const lacunas  = total - cobertos
  const pct      = Math.round((cobertos / total) * 100)
  const hoje     = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

  function getPrimary(codigo: string) {
    const fn = fnMap[codigo]; if (!fn) return null
    return designations.find(d => d.function_id === fn.id && d.primaria)?.member ?? null
  }
  function getAlternate(codigo: string) {
    const fn = fnMap[codigo]; if (!fn) return null
    return designations.find(d => d.function_id === fn.id && d.alternativa)?.member ?? null
  }
  function memberName(m: any, short = false) {
    if (!m) return null
    const posto = m.posto_graduacao ? `${m.posto_graduacao} ` : ''
    const name  = m.nome_guerra ?? m.nome_completo?.split(' ')[0]
    return short ? name : posto + name
  }

  function PositionBox({ codigo, color, bg }: { codigo: string; color: string; bg: string }) {
    const fn  = fnMap[codigo]; if (!fn) return null
    const pri = getPrimary(codigo)
    const alt = getAlternate(codigo)
    const vaga = !pri

    return (
      <div style={{
        border: `1px solid ${vaga ? '#EF4444' : color}22`,
        borderTop: `3px solid ${vaga ? '#EF4444' : color}`,
        borderRadius: 4,
        background: vaga ? '#FFF5F5' : 'white',
        minWidth: 130,
        flex: '1 1 130px',
        maxWidth: 200,
        overflow: 'hidden',
      }}>
        {/* Código + nome da posição */}
        <div style={{
          background: vaga ? '#FEF2F2' : bg,
          padding: '5px 7px',
          borderBottom: `1px solid ${vaga ? '#FECACA' : color}18`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 8, fontWeight: 600,
            color: vaga ? '#DC2626' : color,
            background: vaga ? '#FEE2E2' : `${color}18`,
            padding: '1px 5px', borderRadius: 2,
            letterSpacing: '0.05em', flexShrink: 0,
          }}>{fn.codigo}</span>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 10, fontWeight: 700,
            color: vaga ? '#DC2626' : '#1E293B',
            lineHeight: 1.2,
          }}>{fn.nome_pt}</span>
        </div>

        {/* Membro */}
        <div style={{ padding: '5px 7px', minHeight: 36 }}>
          {vaga ? (
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8, color: '#DC2626', fontWeight: 600,
              letterSpacing: '0.05em',
            }}>— VAGA CRÍTICA</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'Barlow, sans-serif', fontSize: 8, fontWeight: 600,
                  color: '#1E293B',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{memberName(pri)}</span>
              </div>
              {alt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: 'Barlow, sans-serif', fontSize: 7,
                    color: '#64748B',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{memberName(alt, true)}</span>
                </div>
              )}
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 7,
                color: '#94A3B8', marginTop: 1,
              }}>{pri?.instituicao}</div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: white; }
        body {
          font-family: 'Barlow', sans-serif;
          color: #1E293B;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @page {
          size: A3 landscape;
          margin: 10mm 12mm;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* ── TOOLBAR (some ao imprimir) ── */}
      <div className="no-print" style={{
        background: '#0D1117', padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {['#009C3B','#FFDF00','#002776','#fff'].map(c => (
              <div key={c} style={{ width: 3, height: 24, borderRadius: 1, background: c, opacity: c === '#fff' ? 0.3 : 1 }} />
            ))}
          </div>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Organograma BRA-01 · Prévia de Impressão
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} style={{
            padding: '7px 20px', borderRadius: 3,
            background: '#E87722', border: 'none',
            fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, fontWeight: 700,
            color: 'white', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>⬇ Salvar PDF</button>
          <button onClick={() => window.close()} style={{
            padding: '7px 16px', borderRadius: 3,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
            fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13,
            color: '#9BA8BC', cursor: 'pointer', letterSpacing: '0.06em',
          }}>Fechar</button>
        </div>
      </div>

      {/* ── DOCUMENTO ── */}
      <div style={{ padding: '10mm 12mm', background: 'white', minHeight: '100vh' }}>

        {/* ── CABEÇALHO ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingBottom: 8, marginBottom: 10,
          borderBottom: '2.5px solid #0D1117',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {['#009C3B','#FFDF00','#002776','#0D1117'].map(c => (
                <div key={c} style={{ width: 5, height: 40, borderRadius: 1, background: c }} />
              ))}
            </div>
            <div>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 22, fontWeight: 800,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#0D1117', lineHeight: 1,
              }}>BRA-01 Heavy USAR</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 8, color: '#64748B',
                letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3,
              }}>CBPMESP · CBMMG · CBMPR · Sistema de Gestão da Equipe</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 16, fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#003D7A',
            }}>Organograma da Equipe</div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8, color: '#94A3B8', marginTop: 2,
            }}>22 posições INSARAG Heavy · Gerado em {hoje}</div>
            {/* Score IEC */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 22, fontWeight: 800,
                color: pct > 50 ? '#003D7A' : '#DC2626', lineHeight: 1,
              }}>{pct}%</div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#64748B' }}>Cobertura IEC Heavy</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#94A3B8' }}>{cobertos}/{total} pos. · {comAlt} c/alt · {lacunas} vagas</div>
              </div>
              <div style={{ width: 80, height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct > 50 ? '#003D7A' : '#DC2626', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── LAYOUT PRINCIPAL ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>

          {/* ── MANAGEMENT (coluna esquerda) ── */}
          {(() => {
            const sec = SECTIONS[0]
            const covered = sec.positions.filter(c => {
              const fn = fnMap[c]; return fn && designations.some(d => d.function_id === fn.id && d.primaria)
            }).length
            return (
              <div style={{
                flexShrink: 0, width: 160,
                border: `1px solid ${sec.color}30`,
                borderTop: `3px solid ${sec.color}`,
                borderRadius: 5,
                overflow: 'hidden',
              }}>
                {/* Header seção */}
                <div style={{
                  background: sec.lightBg, padding: '6px 8px',
                  borderBottom: `1px solid ${sec.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: sec.color }}>{sec.labelPT}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: `${sec.color}90` }}>{sec.label}</div>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600, color: sec.color }}>{covered}/{sec.positions.length}</div>
                </div>
                {/* Posições em coluna */}
                <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {sec.positions.map(codigo => (
                    <PositionBox key={codigo} codigo={codigo} color={sec.color} bg={sec.lightBg} />
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Seta de Management para seções */}
          <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center', flexShrink: 0 }}>
            <div style={{ width: 16, height: 1, background: '#94A3B8' }} />
            <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '5px solid #94A3B8' }} />
          </div>

          {/* ── SEÇÕES FUNCIONAIS (coluna direita) ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTIONS.slice(1).map(sec => {
              const covered = sec.positions.filter(c => {
                const fn = fnMap[c]; return fn && designations.some(d => d.function_id === fn.id && d.primaria)
              }).length
              const pctSec = Math.round((covered / sec.positions.length) * 100)

              return (
                <div key={sec.label} style={{
                  border: `1px solid ${sec.color}25`,
                  borderTop: `3px solid ${sec.color}`,
                  borderRadius: 5, overflow: 'hidden',
                }}>
                  {/* Header seção */}
                  <div style={{
                    background: sec.lightBg, padding: '6px 10px',
                    borderBottom: `1px solid ${sec.color}15`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: sec.color }}>{sec.labelPT}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: `${sec.color}80` }}>{sec.label}</div>
                    </div>
                    {/* Mini progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pctSec}%`, height: '100%', background: sec.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 600, color: sec.color, minWidth: 60 }}>
                        {pctSec}% · {covered}/{sec.positions.length}
                      </div>
                    </div>
                  </div>
                  {/* Grid de posições */}
                  <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sec.positions.map(codigo => (
                      <PositionBox key={codigo} codigo={codigo} color={sec.color} bg={sec.lightBg} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── TABELA RESUMO ── */}
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
          {SECTIONS.map(sec => {
            const cov = sec.positions.filter(c => {
              const fn = fnMap[c]; return fn && designations.some(d => d.function_id === fn.id && d.primaria)
            }).length
            const p = Math.round((cov / sec.positions.length) * 100)
            return (
              <div key={sec.label} style={{
                border: `1px solid ${sec.color}25`,
                borderLeft: `3px solid ${sec.color}`,
                borderRadius: 3, padding: '7px 10px',
                background: sec.lightBg,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 22, fontWeight: 800, color: sec.color, lineHeight: 1 }}>{p}%</div>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: sec.color }}>{sec.labelPT}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#94A3B8' }}>{cov}/{sec.positions.length} pos. · {sec.positions.length - cov} vagas</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: 8, paddingTop: 6,
          borderTop: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#94A3B8' }}>
            <div>BRA-01 Heavy USAR Team · CBPMESP · CBMMG · CBMPR · INSARAG IEC Preparation</div>
            <div>Documento gerado automaticamente pelo Sistema de Gestão BRA-01</div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#94A3B8' }}>Legenda:</span>
            {[
              { color: '#16A34A', label: 'Membro primário designado' },
              { color: '#3B82F6', label: 'Membro alternativo' },
              { color: '#DC2626', label: 'Vaga crítica' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: l.color }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#64748B' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
