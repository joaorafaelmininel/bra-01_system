// src/lib/generateOrganogramaPDF.ts
// Baseado na estrutura do GPT, adaptado para as 22 posições reais do BRA-01 Heavy USAR
// Layout: coluna Management (esquerda) + 4 seções funcionais empilhadas (direita)
// Dependência: pnpm add jspdf

import jsPDF from 'jspdf'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Member = {
  posto_graduacao?: string
  nome_guerra?: string
  nome_completo?: string
  instituicao?: string
}

type TeamFunction = {
  id: string | number
  codigo: string
  nome_pt: string
  nome_en?: string
}

type Designation = {
  function_id: string | number
  primaria?: boolean
  alternativa?: boolean
  member?: Member | null
}

type BoxNode = {
  id: string
  codigo: string
  label: string
  nameEN?: string
  memberPrimary?: string
  memberAlternate?: string
  inst?: string
  vacant?: boolean
  x: number
  y: number
  w: number
  h: number
}

// ─── Paleta BRA-01 ────────────────────────────────────────────────────────────

type RGB = [number, number, number]

const C = {
  white:       [255,255,255] as RGB,
  bg:          [252,253,254] as RGB,
  text:        [15,20,28]    as RGB,
  muted:       [100,112,128] as RGB,
  line:        [160,170,185] as RGB,
  border:      [210,215,225] as RGB,

  // Seções
  mgmt:        { h:[0,47,100] as RGB,   b:[0,75,160] as RGB,   f:[235,242,252] as RGB },
  rescue:      { h:[155,0,0]  as RGB,   b:[190,30,30] as RGB,  f:[255,243,243] as RGB },
  search:      { h:[160,55,0] as RGB,   b:[210,90,15] as RGB,  f:[255,248,240] as RGB },
  medical:     { h:[0,80,45]  as RGB,   b:[0,130,70]  as RGB,  f:[235,252,243] as RGB },
  logistics:   { h:[25,45,80] as RGB,   b:[50,85,140] as RGB,  f:[238,243,252] as RGB },

  // Vaga
  vacantF:     [255,245,245] as RGB,
  vacantB:     [190,40,40]   as RGB,
  vacantT:     [160,20,20]   as RGB,
}

// ─── Dimensões fixas (A3 landscape 420×297mm) ─────────────────────────────────

const PW = 420, PH = 297
const ML = 12, MR = 12, MT = 10, MB = 8

const HDR_H  = 16
const FOOT_H = 10

// Content area
const CX = ML
const CY = MT + HDR_H        // y = 26
const CW = PW - ML - MR      // 396mm
const CH = PH - MT - HDR_H - FOOT_H - MB  // 253mm

// Management column (left)
const MGMT_X = CX            // x = 12
const MGMT_W = 54            // width = 54mm
const MGMT_GAP = 2           // gap between mgmt cards
const MGMT_BH  = Math.floor((CH - 5 * MGMT_GAP) / 6)  // ≈ 41mm per card

// Functional sections (right)
const SEC_X   = MGMT_X + MGMT_W + 6  // x = 72
const SEC_W   = PW - MR - SEC_X       // 336mm
const SEC_HDR = 9    // section header bar height
const SEC_GAP = 2    // gap between sections
const SEC_H   = Math.floor((CH - 3 * SEC_GAP) / 4)  // ≈ 62mm per section

// Card heights inside sections
const CARD_H = SEC_H - SEC_HDR - 6  // ≈ 47mm

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(t: string, max: number) {
  if (!t) return ''
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

function mname(m?: Member | null, max = 20) {
  if (!m) return ''
  const p = (m.posto_graduacao ?? '').trim()
  const n = (m.nome_guerra ?? m.nome_completo?.split(' ')[0] ?? '').trim()
  return clamp(p ? `${p} ${n}` : n, max)
}

function today() {
  return new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })
}

// ─── Exportação principal ─────────────────────────────────────────────────────

export function generateOrganogramaPDF(
  functions: TeamFunction[],
  designations: Designation[],
) {
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a3' })
  const d = doc

  // Lookup
  const fnMap: Record<string, TeamFunction> = {}
  functions.forEach(f => { fnMap[f.codigo] = f })

  function pri(cod: string): Member | null {
    const fn = fnMap[cod]; if (!fn) return null
    return designations.find(x => String(x.function_id) === String(fn.id) && x.primaria)?.member ?? null
  }
  function alt(cod: string): Member | null {
    const fn = fnMap[cod]; if (!fn) return null
    return designations.find(x => String(x.function_id) === String(fn.id) && x.alternativa)?.member ?? null
  }

  const ALL = ['TL','DL','IO','LNO','SOFR','PLO','RL','RTO','RS','SHO','SL','STO','K9','SQ','HAZM','STRX','MED','PMED','LOG','COM','ICT','LOG2']
  const covered   = ALL.filter(c => !!pri(c)).length
  const alternates = ALL.filter(c => !!alt(c)).length
  const pct       = Math.round((covered / ALL.length) * 100)
  const hoje      = today()

  // ── Draw primitives ─────────────────────────────────────────────────────────

  function F(r: RGB)                  { d.setFillColor(r[0],r[1],r[2]) }
  function D(r: RGB, w=0.25)          { d.setDrawColor(r[0],r[1],r[2]); d.setLineWidth(w) }
  function T(r: RGB)                  { d.setTextColor(r[0],r[1],r[2]) }
  function font(s:'normal'|'bold', sz:number) { d.setFont('helvetica',s); d.setFontSize(sz) }

  function txt(text: string, x:number, y:number, opts?:any) {
    d.text(text,x,y,opts)
  }

  function fit(text:string, x:number, y:number, maxW:number, opts?:any) {
    let t = text || ''
    while (t.length > 1 && d.getTextWidth(t) > maxW) t = t.slice(0,-1)
    if (t !== text && t.length > 1) t = t.slice(0,-1) + '…'
    d.text(t,x,y,opts)
  }

  function R(x:number,y:number,w:number,h:number,mode:string) {
    d.rect(x,y,w,h,mode as any)
  }

  function RR(x:number,y:number,w:number,h:number,mode:string,r=1) {
    d.roundedRect(x,y,w,h,r,r,mode as any)
  }

  function L(x1:number,y1:number,x2:number,y2:number,color=C.line,w=0.3) {
    if ([x1,y1,x2,y2].some(v => !Number.isFinite(v))) return
    D(color,w); d.line(x1,y1,x2,y2)
  }

  // ── HEADER ──────────────────────────────────────────────────────────────────

  // Background
  F([248,250,253]); R(0,0,PW,MT+HDR_H,'F')

  // Brazil flag stripes
  const stripes: RGB[] = [[0,156,59],[255,223,0],[0,39,118],[13,17,23]]
  stripes.forEach(([r,g,b],i) => { F([r,g,b]); R(ML+i*4,MT,3.2,HDR_H,'F') })

  // Brand
  font('bold',13); T(C.text)
  txt('BRA-01 HEAVY USAR', ML+20, MT+7)
  font('normal',6.5); T(C.muted)
  txt('CBPMESP · CBMMG · CBMPR · Sistema de Gestão · INSARAG', ML+20, MT+12.5)

  // IEC coverage box (top right)
  const bx=PW-MR-52, by=MT+1, bw=50, bh=HDR_H-2
  F([240,245,255]); D(C.border,0.3); RR(bx,by,bw,bh,'FD',1.5)
  font('bold',7); T(C.mgmt.h)
  txt('COBERTURA IEC HEAVY', bx+3, by+4.5)
  font('bold',16); T(pct>=70?[0,120,60]:pct>=40?[190,100,0]:[170,20,20] as RGB)
  txt(`${pct}%`, bx+bw-3, by+12, {align:'right'})
  font('normal',6); T(C.muted)
  txt(`${covered}/22 pos · ${alternates} alt · ${ALL.length-covered} vagas`, bx+3, by+bh-2.5)

  // Progress bar
  const pbx=bx+3, pby=by+14.5, pbw=bw-6
  F(C.border); RR(pbx,pby,pbw,2.5,'F',0.8)
  F(pct>=70?[0,160,80]:pct>=40?[220,130,0]:[200,40,40] as RGB)
  RR(pbx,pby,pbw*pct/100,2.5,'F',0.8)

  // Title (center-right)
  font('bold',10); T(C.mgmt.h)
  txt('ORGANOGRAMA DA EQUIPE', PW-MR-55, MT+6, {align:'right'})
  font('normal',6.5); T(C.muted)
  txt(`22 posições INSARAG Heavy · ${hoje}`, PW-MR-55, MT+11, {align:'right'})

  // Separator
  D(C.border,0.4); d.line(ML,MT+HDR_H,PW-MR,MT+HDR_H)

  // ── MANAGEMENT COLUMN ───────────────────────────────────────────────────────

  const MGMT_CODES = ['TL','DL','IO','LNO','SOFR','PLO']
  const mgmtPal = C.mgmt

  // Section label box
  F(mgmtPal.h); D(mgmtPal.h,0); R(MGMT_X,CY,MGMT_W,SEC_HDR,'F')
  font('bold',7.5); T(C.white)
  txt('MANAGEMENT', MGMT_X+MGMT_W/2, CY+6.2, {align:'center'})

  // Management cards
  MGMT_CODES.forEach((cod, i) => {
    const fn  = fnMap[cod]
    const pm  = pri(cod)
    const al  = alt(cod)
    const vaga = !pm
    const cx  = MGMT_X
    const cy  = CY + SEC_HDR + i*(MGMT_BH+MGMT_GAP)
    const cw  = MGMT_W
    const ch  = MGMT_BH

    // Card background
    F(vaga ? C.vacantF : mgmtPal.f)
    D(vaga ? C.vacantB : mgmtPal.b, 0.3)
    RR(cx,cy,cw,ch,'FD',1)

    // Left accent bar
    F(vaga ? C.vacantB : mgmtPal.h)
    R(cx,cy,3,ch,'F')

    // Code badge
    font('bold',5.5); T(C.white)
    txt(cod, cx+1.5, cy+ch/2+1.5, {angle:90, align:'center'} as any)

    // Position name
    const tx=cx+4.5, tw=cw-5.5
    font('bold',7); T(vaga?C.vacantT:mgmtPal.h)
    fit(fn?.nome_pt??cod, tx, cy+6, tw)
    font('normal',5.5); T(C.muted)
    fit(fn?.nome_en??'', tx, cy+10, tw)

    if (vaga) {
      font('bold',6.5); T(C.vacantT)
      txt('— VAGA', tx, cy+ch-4)
    } else {
      // Dot primário
      F([0,160,80]); d.circle(cx+5.8, cy+ch-9.5, 1.1, 'F')
      font('bold',6.5); T(mgmtPal.h)
      fit(mname(pm,18), cx+8.5, cy+ch-8.5, tw-4)
      font('normal',5.5); T(C.muted)
      fit(pm?.instituicao??'', cx+8.5, cy+ch-5, tw-4)

      if (al) {
        F([50,120,210]); d.circle(cx+5.8, cy+ch-2.8, 1.1, 'F')
        font('normal',5.5); T(C.muted)
        fit(mname(al,18), cx+8.5, cy+ch-1.8, tw-4)
      }
    }
  })

  // Connection: line from MGMT right edge to sections
  const mgmtMidY = CY + (CY + 6*(MGMT_BH+MGMT_GAP))/2 - 10
  L(MGMT_X+MGMT_W, CY+SEC_H/2+SEC_HDR, SEC_X, CY+SEC_H/2+SEC_HDR)

  // ── FUNCTIONAL SECTIONS ─────────────────────────────────────────────────────

  const SECS = [
    {
      label:'RESGATE',      labelEN:'Rescue',
      pal:C.rescue,
      codes:['RL','RTO','RS','SHO'],
    },
    {
      label:'BUSCA TÉCNICA', labelEN:'Technical Search',
      pal:C.search,
      codes:['SL','STO','K9','SQ','HAZM','STRX'],
    },
    {
      label:'MÉDICO',        labelEN:'Medical',
      pal:C.medical,
      codes:['MED','PMED'],
    },
    {
      label:'LOGÍSTICA',     labelEN:'Logistics',
      pal:C.logistics,
      codes:['LOG','COM','ICT','LOG2'],
    },
  ]

  SECS.forEach((sec, si) => {
    const sy   = CY + si*(SEC_H+SEC_GAP)
    const pal  = sec.pal
    const nPos = sec.codes.length

    // Coverage for this section
    const secCov = sec.codes.filter(c=>!!pri(c)).length
    const secPct = Math.round((secCov/nPos)*100)

    // Section container
    F([250,251,253]); D(pal.b,0.3)
    RR(SEC_X,sy,SEC_W,SEC_H,'FD',1.5)

    // Header bar
    F(pal.h); R(SEC_X,sy,SEC_W,SEC_HDR,'F')

    font('bold',8); T(C.white)
    txt(sec.label, SEC_X+5, sy+6.5)
    font('normal',6.5); T(C.white)
    txt(sec.labelEN, SEC_X+5+d.getTextWidth(sec.label)+3, sy+6.5)

    // Section score (right)
    font('bold',7.5); T(C.white)
    txt(`${secPct}%  ${secCov}/${nPos}`, SEC_X+SEC_W-4, sy+6.5, {align:'right'})

    // Mini progress bar in header
    const pbw2=32, pbx2=SEC_X+SEC_W-4-pbw2-20, pby2=sy+2.5
    F([255,255,255]); d.setFillColor(255,255,255); d.setGState && d.setGState
    RR(pbx2,pby2,pbw2,2.5,'F',0.8)
    F(secPct>=70?[180,255,200]:secPct>=40?[255,230,180]:[255,180,180] as RGB)
    RR(pbx2,pby2,pbw2*secPct/100,2.5,'F',0.8)

    // Cards
    const cPad = 4
    const cGap = 3
    const cW   = (SEC_W - 2*cPad - (nPos-1)*cGap) / nPos
    const cH   = CARD_H
    const cTop = sy + SEC_HDR + cPad

    // Connection spine: horizontal line at card top, vertical drops
    const spineY = cTop - 1.5
    L(SEC_X+cPad+cW/2, sy+SEC_HDR, SEC_X+cPad+cW/2, spineY, C.line, 0.25)
    if (nPos > 1) {
      const lastCX = SEC_X + cPad + (nPos-1)*(cW+cGap) + cW/2
      L(SEC_X+cPad+cW/2, spineY, lastCX, spineY, C.line, 0.25)
    }

    sec.codes.forEach((cod, ci) => {
      const fn  = fnMap[cod]
      const pm  = pri(cod)
      const al  = alt(cod)
      const vaga = !pm
      const cx  = SEC_X + cPad + ci*(cW+cGap)
      const cy  = cTop

      // Drop line
      L(cx+cW/2, spineY, cx+cW/2, cy, C.line, 0.25)

      // Card
      F(vaga ? C.vacantF : pal.f)
      D(vaga ? C.vacantB : pal.b, vaga?0.4:0.25)
      RR(cx,cy,cW,cH,'FD',1)

      // Top accent
      F(vaga ? C.vacantB : pal.h)
      R(cx,cy,cW,3.5,'F')

      // Code
      font('bold',5.5); T(C.white)
      txt(cod, cx+2, cy+2.8)

      // Position name
      const tw2 = cW-4
      font('bold',7); T(vaga?C.vacantT:pal.h)
      fit(fn?.nome_pt??cod, cx+2, cy+8, tw2)
      font('normal',5.5); T(C.muted)
      fit(fn?.nome_en??'', cx+2, cy+12, tw2)

      if (vaga) {
        font('bold',7.5); T(C.vacantT)
        txt('VAGA', cx+cW/2, cy+cH-5, {align:'center'})
        // Red bottom accent
        F(C.vacantB); R(cx,cy+cH-3.5,cW,3.5,'F')
        font('bold',6); T(C.white)
        txt('VAGA', cx+cW/2, cy+cH-1.5, {align:'center'})
      } else {
        // Primary member
        F([0,160,80]); d.circle(cx+4, cy+cH-10, 1.3, 'F')
        font('bold',6.5); T(pal.h)
        fit(mname(pm,Math.floor(cW/2)), cx+7, cy+cH-8.8, tw2-5)
        font('normal',5.5); T(C.muted)
        fit(pm?.instituicao??'', cx+7, cy+cH-5.5, tw2-5)

        if (al) {
          F([50,120,210]); d.circle(cx+4, cy+cH-3, 1.3, 'F')
          font('normal',5.5); T(C.muted)
          fit(mname(al,Math.floor(cW/2)), cx+7, cy+cH-1.8, tw2-5)
        }
      }
    })

    // Connect MGMT right to this section
    const secMidY = sy + SEC_HDR + CARD_H/2 + cPad
    L(MGMT_X+MGMT_W, secMidY, SEC_X, secMidY, C.line, 0.25)
    // Vertical spine on left of sections
    if (si === 0) {
      L(SEC_X, CY+SEC_HDR+MGMT_BH/2, SEC_X, CY+(SECS.length-1)*(SEC_H+SEC_GAP)+SEC_HDR+CARD_H/2+cPad, C.line, 0.25)
    }
  })

  // ── SUMMARY TABLE ────────────────────────────────────────────────────────────

  // Small summary at bottom of management column
  const sumY = CY + 6*(MGMT_BH+MGMT_GAP) + 2
  if (sumY + 30 < PH - MB - FOOT_H) {
    const rows = [
      ['Management',C.mgmt.h,   MGMT_CODES],
      ['Rescue',    C.rescue.h,  ['RL','RTO','RS','SHO']],
      ['T. Search', C.search.h,  ['SL','STO','K9','SQ','HAZM','STRX']],
      ['Medical',   C.medical.h, ['MED','PMED']],
      ['Logistics',C.logistics.h,['LOG','COM','ICT','LOG2']],
    ] as [string,RGB,string[]][]

    font('bold',6); T(C.muted)
    txt('RESUMO', MGMT_X+2, sumY+4)

    rows.forEach((row, i) => {
      const [label, color, codes] = row
      const ry = sumY + 6 + i*9
      const cov2 = codes.filter(c=>!!pri(c)).length
      const p2   = Math.round((cov2/codes.length)*100)

      F([248,250,253]); D(C.border,0.2); R(MGMT_X,ry,MGMT_W,8,'FD')
      F(color); R(MGMT_X,ry,2.5,8,'F')

      font('normal',5.5); T(C.text)
      txt(label, MGMT_X+4.5, ry+5.5)
      font('bold',6); T(p2===100?[0,130,60]:p2>0?color:[180,30,30] as RGB)
      txt(`${p2}%`, MGMT_X+MGMT_W-2, ry+5.5, {align:'right'})
    })
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────────

  const fy = PH - MB - 3
  D(C.border,0.3); d.line(ML,fy-5,PW-MR,fy-5)
  font('normal',6); T(C.muted)
  txt(`BRA-01 Heavy USAR Team · CBPMESP · CBMMG · CBMPR · INSARAG IEC Preparation · Gerado em ${hoje}`, ML, fy)

  // Legend
  const leg: [RGB,string][] = [
    [[0,160,80],'Membro primário'],
    [[50,120,210],'Membro alternativo'],
    [C.vacantB,'Vaga crítica'],
  ]
  let lx = PW-MR-82
  leg.forEach(([col,label]) => {
    F(col); d.circle(lx+1.5, fy-1, 1.3, 'F')
    font('normal',6); T(C.muted)
    txt(label, lx+4.5, fy)
    lx += d.getTextWidth(label)+12
  })

  // ── SAVE ────────────────────────────────────────────────────────────────────

  doc.save(`BRA-01_Organograma_${new Date().toISOString().slice(0,10)}.pdf`)
}