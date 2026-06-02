// src/lib/generateLogisticaPDF.ts
// Geradores de PDF para o módulo de logística do BRA-01:
//   1. generatePackingList(box, itens, ctx)     → packing list por caixa (padrão IATA)
//   2. generateCargoManifest(boxes, ctx)         → manifesto de carga consolidado
//   3. generateConsolidatedReport(data, ctx)     → relatório consolidado de logística
// Dependência: jspdf (já instalada). Não usa jspdf-autotable — tabela desenhada à mão.

import jsPDF from 'jspdf'

// ─── Tipos ──────────────────────────────────────────────────────────────────
type RGB = [number, number, number]

export type PdfContext = {
  estado?: string          // 'CBMMG' | 'CBMPR' | 'CBPMESP' | 'Todos' | undefined
  origem?: string          // local de origem da carga
  destino?: string         // local de destino
  responsavel?: string     // nome do responsável pelo embarque
  missao?: string          // nome/código da missão (opcional)
}

type Equip = Record<string, any>
type Box = Record<string, any>
type Dog = Record<string, any>

// ─── Paleta institucional ─────────────────────────────────────────────────────
const C = {
  ink:    [18, 24, 32] as RGB,
  muted:  [90, 100, 120] as RGB,
  border: [180, 190, 205] as RGB,
  light:  [238, 242, 248] as RGB,
  sp:     [0, 158, 219] as RGB,   // CBPMESP
  mg:     [232, 119, 34] as RGB,  // CBMMG
  pr:     [0, 165, 80] as RGB,    // CBMPR
  white:  [255, 255, 255] as RGB,
  danger: [204, 0, 0] as RGB,
}

function estadoColor(estado?: string): RGB {
  if (estado === 'CBPMESP') return C.sp
  if (estado === 'CBMMG')   return C.mg
  if (estado === 'CBMPR')   return C.pr
  return C.ink
}

function estadoLabel(estado?: string): string {
  if (!estado || estado === 'Todos') return 'BRA-01 · CONSOLIDADO'
  return estado
}

// ─── Coluna de tabela ──────────────────────────────────────────────────────────
type Col = {
  header: string
  key: string
  width: number               // proporção (somatório livre, normalizado)
  align?: 'left' | 'right' | 'center'
  fmt?: (v: any, row: any) => string
}

// ════════════════════════════════════════════════════════════════════════════
// Builder reutilizável
// ════════════════════════════════════════════════════════════════════════════
class PdfBuilder {
  d: jsPDF
  PW: number; PH: number
  ML = 14; MR = 14; MT = 16; MB = 14
  y: number
  accent: RGB
  pageNum = 1

  constructor(orientation: 'portrait' | 'landscape', accent: RGB) {
    this.d = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
    this.PW = this.d.internal.pageSize.getWidth()
    this.PH = this.d.internal.pageSize.getHeight()
    this.accent = accent
    this.y = this.MT
  }

  F(r: RGB) { this.d.setFillColor(r[0], r[1], r[2]) }
  D(r: RGB, w = 0.3) { this.d.setDrawColor(r[0], r[1], r[2]); this.d.setLineWidth(w) }
  T(r: RGB) { this.d.setTextColor(r[0], r[1], r[2]) }
  font(s: 'normal' | 'bold', sz: number) { this.d.setFont('helvetica', s); this.d.setFontSize(sz) }

  hoje() { return new Date().toLocaleDateString('pt-BR') }

  // Cabeçalho institucional
  header(titulo: string, subtitulo: string, ctx: PdfContext) {
    const d = this.d
    this.F(this.accent); d.rect(this.ML, this.MT, 3, 13, 'F')
    this.font('bold', 16); this.T(C.ink)
    d.text(titulo, this.ML + 6, this.MT + 6)
    this.font('normal', 8.5); this.T(C.muted)
    d.text(subtitulo, this.ML + 6, this.MT + 11.5)

    // bloco direito
    const rx = this.PW - this.MR
    this.font('bold', 9); this.T(this.accent)
    d.text(estadoLabel(ctx.estado), rx, this.MT + 4, { align: 'right' })
    this.font('normal', 7.5); this.T(C.muted)
    d.text(`Emitido em ${this.hoje()}`, rx, this.MT + 9, { align: 'right' })
    d.text('BRA-01 Heavy USAR Team', rx, this.MT + 13, { align: 'right' })

    this.y = this.MT + 17
    this.D(this.accent, 0.6); d.line(this.ML, this.y, this.PW - this.MR, this.y)
    this.y += 6
  }

  // Bloco de metadados (origem/destino/etc.)
  metaBlock(rows: [string, string][]) {
    const d = this.d
    const colW = (this.PW - this.ML - this.MR) / 2
    const startY = this.y
    rows.forEach((r, i) => {
      const col = i % 2
      const line = Math.floor(i / 2)
      const x = this.ML + col * colW
      const yy = startY + line * 6
      this.font('bold', 7.5); this.T(C.muted)
      d.text(r[0].toUpperCase() + ':', x, yy)
      this.font('normal', 8.5); this.T(C.ink)
      d.text(r[1] || '—', x + 32, yy)
    })
    this.y = startY + Math.ceil(rows.length / 2) * 6 + 4
  }

  sectionTitle(t: string) {
    this.checkSpace(12)
    const d = this.d
    this.F(C.light); d.rect(this.ML, this.y - 1, this.PW - this.ML - this.MR, 6.5, 'F')
    this.font('bold', 9); this.T(C.ink)
    d.text(t, this.ML + 2, this.y + 3.5)
    this.y += 9
  }

  checkSpace(needed: number) {
    if (this.y + needed > this.PH - this.MB - 6) this.newPage()
  }

  newPage() {
    this.footer()
    this.d.addPage()
    this.pageNum++
    this.y = this.MT
  }

  footer() {
    const d = this.d
    const fy = this.PH - this.MB
    this.D(C.border, 0.3); d.line(this.ML, fy - 3, this.PW - this.MR, fy - 3)
    this.font('normal', 6.5); this.T(C.muted)
    d.text(`BRA-01 Heavy USAR Team · CBMMG · CBMPR · CBPMESP · INSARAG IEC`, this.ML, fy)
    d.text(`Página ${this.pageNum}`, this.PW - this.MR, fy, { align: 'right' })
  }

  // Tabela paginada genérica
  table(cols: Col[], rows: any[], opts?: { totalRow?: (string | number)[]; emptyMsg?: string }) {
    const d = this.d
    const tableW = this.PW - this.ML - this.MR
    const totalUnits = cols.reduce((a, c) => a + c.width, 0)
    const widths = cols.map(c => (c.width / totalUnits) * tableW)

    const drawHead = () => {
      this.F(this.accent); d.rect(this.ML, this.y, tableW, 6.5, 'F')
      this.font('bold', 7.5); this.T(C.white)
      let x = this.ML
      cols.forEach((c, i) => {
        const align = c.align ?? 'left'
        const tx = align === 'right' ? x + widths[i] - 1.5 : align === 'center' ? x + widths[i] / 2 : x + 1.5
        d.text(c.header, tx, this.y + 4.3, { align })
        x += widths[i]
      })
      this.y += 6.5
    }

    drawHead()

    if (rows.length === 0) {
      this.font('normal', 8); this.T(C.muted)
      d.text(opts?.emptyMsg ?? 'Sem registros.', this.ML + 2, this.y + 5)
      this.y += 9
      return
    }

    rows.forEach((row, ri) => {
      if (this.y + 6 > this.PH - this.MB - 6) {
        this.newPage()
        drawHead()
      }
      if (ri % 2 === 1) { this.F(C.light); d.rect(this.ML, this.y, tableW, 5.6, 'F') }
      this.font('normal', 7.5); this.T(C.ink)
      let x = this.ML
      cols.forEach((c, i) => {
        const raw = c.fmt ? c.fmt(row[c.key], row) : (row[c.key] ?? '—')
        const align = c.align ?? 'left'
        const maxW = widths[i] - 3
        let text = String(raw ?? '—')
        // trunca se exceder
        while (d.getTextWidth(text) > maxW && text.length > 1) text = text.slice(0, -1)
        if (text !== String(raw ?? '—')) text = text.slice(0, -1) + '…'
        const tx = align === 'right' ? x + widths[i] - 1.5 : align === 'center' ? x + widths[i] / 2 : x + 1.5
        d.text(text, tx, this.y + 3.8, { align })
        x += widths[i]
      })
      this.y += 5.6
    })

    // borda externa
    this.D(C.border, 0.3); d.rect(this.ML, this.y - rows.length * 5.6 - 6.5, tableW, rows.length * 5.6 + 6.5)

    if (opts?.totalRow) {
      this.F(C.ink); d.rect(this.ML, this.y, tableW, 6, 'F')
      this.font('bold', 7.5); this.T(C.white)
      let x = this.ML
      cols.forEach((c, i) => {
        const v = opts.totalRow![i]
        if (v !== undefined && v !== '') {
          const align = c.align ?? 'left'
          const tx = align === 'right' ? x + widths[i] - 1.5 : align === 'center' ? x + widths[i] / 2 : x + 1.5
          d.text(String(v), tx, this.y + 4, { align })
        }
        x += widths[i]
      })
      this.y += 6
    }
    this.y += 6
  }

  save(filename: string) {
    this.footer()
    this.d.save(filename)
  }
}

// ─── Helpers de formatação ──────────────────────────────────────────────────
function kg(v: any): string {
  const n = Number(v)
  return isNaN(n) || n === 0 ? '—' : n.toFixed(1)
}
function pesoItens(itens: Equip[]): number {
  return itens.reduce((a, e) => a + (Number(e.peso_kg) || 0), 0)
}
function secCodigo(e: Equip): string {
  return e.section?.codigo ?? '—'
}

// ════════════════════════════════════════════════════════════════════════════
// 1) PACKING LIST — por caixa
// ════════════════════════════════════════════════════════════════════════════
export function generatePackingList(box: Box, itens: Equip[], ctx: PdfContext = {}) {
  const accent = estadoColor(ctx.estado ?? box.proprietario)
  const b = new PdfBuilder('portrait', accent)

  b.header('PACKING LIST', 'Lista de Acondicionamento de Carga · Padrão IATA', ctx)

  const pesoLiquido = pesoItens(itens)
  const pesoBruto = pesoLiquido + (Number(box.peso_vazio_kg) || 0)

  b.metaBlock([
    ['Caixa', `${box.codigo} — ${box.nome}`],
    ['Tipo', box.tipo ?? '—'],
    ['Proprietário', box.proprietario ?? '—'],
    ['Seção do cache', box.section ? `${box.section.codigo} ${box.section.nome_pt}` : '—'],
    ['Origem', ctx.origem ?? '—'],
    ['Destino', ctx.destino ?? '—'],
    ['Peso líquido (kg)', kg(pesoLiquido)],
    ['Peso bruto (kg)', kg(pesoBruto)],
    ['Itens', String(itens.length)],
    ['Responsável', ctx.responsavel ?? '—'],
  ])

  b.sectionTitle('CONTEÚDO DA CAIXA')

  const cols: Col[] = [
    { header: '#', key: '_idx', width: 5, align: 'right' },
    { header: 'CÓDIGO', key: 'codigo_item', width: 16 },
    { header: 'DESCRIÇÃO DO ITEM', key: 'nome', width: 38 },
    { header: 'SEÇ.', key: '_sec', width: 8, align: 'center', fmt: (_v, r) => secCodigo(r) },
    { header: 'Nº SÉRIE', key: 'numero_serie', width: 16 },
    { header: 'DIMENSÕES', key: 'dimensoes', width: 14 },
    { header: 'PESO (kg)', key: 'peso_kg', width: 10, align: 'right', fmt: v => kg(v) },
  ]

  const rows = itens.map((e, i) => ({ ...e, _idx: i + 1 }))
  b.table(cols, rows, {
    emptyMsg: 'Caixa vazia — nenhum item acondicionado.',
    totalRow: ['', '', `TOTAL · ${itens.length} itens`, '', '', 'LÍQUIDO', kg(pesoLiquido)],
  })

  // Bloco DGR / assinatura
  b.checkSpace(38)
  b.font('bold', 8); b.T(C.ink)
  b.d.text('DECLARAÇÃO DE MERCADORIAS PERIGOSAS (DGR)', b.ML, b.y); b.y += 5
  b.font('normal', 7.5); b.T(C.muted)
  b.d.text('(  ) Esta carga NÃO contém mercadorias perigosas.', b.ML, b.y); b.y += 4.5
  b.d.text('(  ) Esta carga contém mercadorias perigosas, declaradas conforme IATA DGR. UN nº(s): ____________________', b.ML, b.y); b.y += 10

  const sigY = b.y
  b.D(C.border, 0.3)
  b.d.line(b.ML, sigY, b.ML + 70, sigY)
  b.d.line(b.PW - b.MR - 70, sigY, b.PW - b.MR, sigY)
  b.font('normal', 7); b.T(C.muted)
  b.d.text('Responsável pelo acondicionamento', b.ML, sigY + 4)
  b.d.text('Conferente / Visto', b.PW - b.MR - 70, sigY + 4)

  b.save(`BRA-01_PackingList_${box.codigo}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ════════════════════════════════════════════════════════════════════════════
// 2) CARGO MANIFEST — consolidado de caixas
// ════════════════════════════════════════════════════════════════════════════
export function generateCargoManifest(boxes: Box[], ctx: PdfContext = {}) {
  const accent = estadoColor(ctx.estado)
  const b = new PdfBuilder('landscape', accent)

  b.header('CARGO MANIFEST', 'Manifesto de Carga Consolidado · Padrão IATA', ctx)

  const totalItens = boxes.reduce((a, bx) => a + (bx._itemCount ?? 0), 0)
  const totalLiquido = boxes.reduce((a, bx) => a + (bx._pesoLiquido ?? 0), 0)
  const totalVazio = boxes.reduce((a, bx) => a + (Number(bx.peso_vazio_kg) || 0), 0)
  const totalBruto = totalLiquido + totalVazio

  b.metaBlock([
    ['Missão / Operação', ctx.missao ?? '—'],
    ['Conjunto', estadoLabel(ctx.estado)],
    ['Origem', ctx.origem ?? '—'],
    ['Destino', ctx.destino ?? '—'],
    ['Total de caixas', String(boxes.length)],
    ['Total de itens', String(totalItens)],
    ['Peso bruto total (kg)', kg(totalBruto)],
    ['Responsável', ctx.responsavel ?? '—'],
  ])

  b.sectionTitle('RELAÇÃO DE VOLUMES')

  const cols: Col[] = [
    { header: 'Nº', key: '_idx', width: 4, align: 'right' },
    { header: 'CÓDIGO', key: 'codigo', width: 12 },
    { header: 'DESCRIÇÃO DO VOLUME', key: 'nome', width: 26 },
    { header: 'TIPO', key: 'tipo', width: 12 },
    { header: 'SEÇÃO', key: '_sec', width: 14, fmt: (_v, r) => r.section ? `${r.section.codigo} ${r.section.nome_pt}` : '—' },
    { header: 'PROPRIET.', key: 'proprietario', width: 11 },
    { header: 'ITENS', key: '_itemCount', width: 6, align: 'right' },
    { header: 'TARA', key: 'peso_vazio_kg', width: 8, align: 'right', fmt: v => kg(v) },
    { header: 'LÍQ.(kg)', key: '_pesoLiquido', width: 9, align: 'right', fmt: v => kg(v) },
    { header: 'BRUTO(kg)', key: '_pesoBruto', width: 9, align: 'right', fmt: v => kg(v) },
  ]

  const rows = boxes.map((bx, i) => ({
    ...bx,
    _idx: i + 1,
    _pesoBruto: (bx._pesoLiquido ?? 0) + (Number(bx.peso_vazio_kg) || 0),
  }))

  b.table(cols, rows, {
    emptyMsg: 'Nenhuma caixa registrada para este conjunto.',
    totalRow: ['', '', `TOTAL · ${boxes.length} volumes`, '', '', '', String(totalItens), kg(totalVazio), kg(totalLiquido), kg(totalBruto)],
  })

  // assinaturas
  b.checkSpace(20)
  const sigY = b.y + 6
  b.D(C.border, 0.3)
  b.d.line(b.ML, sigY, b.ML + 70, sigY)
  b.d.line(b.PW / 2 - 35, sigY, b.PW / 2 + 35, sigY)
  b.d.line(b.PW - b.MR - 70, sigY, b.PW - b.MR, sigY)
  b.font('normal', 7); b.T(C.muted)
  b.d.text('Responsável pelo embarque', b.ML, sigY + 4)
  b.d.text('Team Leader / G-04 Logística', b.PW / 2 - 35, sigY + 4)
  b.d.text('Transportador / Cia. aérea', b.PW - b.MR - 70, sigY + 4)

  b.save(`BRA-01_CargoManifest_${estadoLabel(ctx.estado).replace(/[^A-Za-z0-9]/g, '')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ════════════════════════════════════════════════════════════════════════════
// 3) RELATÓRIO CONSOLIDADO DE LOGÍSTICA
// ════════════════════════════════════════════════════════════════════════════
export function generateConsolidatedReport(
  data: { boxes: Box[]; equipment: Equip[]; dogs: Dog[] },
  ctx: PdfContext = {}
) {
  const accent = estadoColor(ctx.estado)
  const b = new PdfBuilder('portrait', accent)
  const { boxes, equipment, dogs } = data

  b.header('RELATÓRIO CONSOLIDADO', 'Logística · Equipamentos · Cães de Busca e Resgate', ctx)

  // ── Resumo executivo ──
  const operacionais = equipment.filter(e => e.status === 'Operacional').length
  const semCaixa = equipment.filter(e => !e.caixa_id).length
  const caesAtivos = dogs.filter(d => d.status_operacional === 'Ativo').length
  const pesoTotal = pesoItens(equipment)

  b.sectionTitle('RESUMO EXECUTIVO')
  b.metaBlock([
    ['Caixas de logística', String(boxes.length)],
    ['Equipamentos (total)', String(equipment.length)],
    ['Operacionais', `${operacionais} de ${equipment.length}`],
    ['Itens sem caixa', String(semCaixa)],
    ['Cães cadastrados', String(dogs.length)],
    ['Cães ativos', String(caesAtivos)],
    ['Peso total equip. (kg)', kg(pesoTotal)],
    ['Conjunto', estadoLabel(ctx.estado)],
  ])

  // ── Caixas ──
  b.sectionTitle(`CAIXAS DE LOGÍSTICA (${boxes.length})`)
  b.table(
    [
      { header: 'CÓDIGO', key: 'codigo', width: 14 },
      { header: 'NOME', key: 'nome', width: 30 },
      { header: 'TIPO', key: 'tipo', width: 14 },
      { header: 'STATUS', key: 'status', width: 14 },
      { header: 'LOCALIZAÇÃO', key: 'localizacao', width: 20 },
      { header: 'ITENS', key: '_itemCount', width: 8, align: 'right' },
    ],
    boxes,
    { emptyMsg: 'Nenhuma caixa cadastrada.' }
  )

  // ── Equipamentos ──
  b.sectionTitle(`EQUIPAMENTOS (${equipment.length})`)
  b.table(
    [
      { header: 'CÓDIGO', key: 'codigo_item', width: 14 },
      { header: 'ITEM', key: 'nome', width: 34 },
      { header: 'SEÇ.', key: '_sec', width: 8, align: 'center', fmt: (_v, r) => secCodigo(r) },
      { header: 'STATUS', key: 'status', width: 16 },
      { header: 'CAIXA', key: '_caixa', width: 14, fmt: (_v, r) => r._caixaCodigo ?? '—' },
      { header: 'PESO', key: 'peso_kg', width: 8, align: 'right', fmt: v => kg(v) },
    ],
    equipment,
    { emptyMsg: 'Nenhum equipamento cadastrado.' }
  )

  // ── Cães ──
  b.sectionTitle(`CÃES DE BUSCA E RESGATE (${dogs.length})`)
  b.table(
    [
      { header: 'NOME', key: 'nome', width: 16 },
      { header: 'RAÇA', key: 'raca', width: 18 },
      { header: 'ESPECIALIDADE', key: 'especialidade', width: 22 },
      { header: 'CERT.', key: 'nivel_certificacao', width: 12 },
      { header: 'STATUS', key: 'status_operacional', width: 14 },
      { header: 'CONDUTOR', key: '_cond', width: 18, fmt: (_v, r) => r.condutor ? (r.condutor.nome_guerra ?? r.condutor.nome_completo?.split(' ')[0]) : '—' },
    ],
    dogs,
    { emptyMsg: 'Nenhum cão cadastrado.' }
  )

  b.save(`BRA-01_RelatorioLogistica_${estadoLabel(ctx.estado).replace(/[^A-Za-z0-9]/g, '')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
