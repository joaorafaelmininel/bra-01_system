'use client'

import Link from 'next/link'

type Dog = Record<string, any>
type Props = { dog: Dog }

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Ativo':       { color: '#00A550', bg: 'rgba(0,165,80,0.12)',    border: 'rgba(0,165,80,0.3)' },
  'Em formação': { color: '#009EDB', bg: 'rgba(0,158,219,0.12)',   border: 'rgba(0,158,219,0.25)' },
  'Recuperação': { color: '#E87722', bg: 'rgba(232,119,34,0.12)',  border: 'rgba(232,119,34,0.3)' },
  'Aposentado':  { color: '#9BA8BC', bg: 'rgba(155,168,188,0.1)',  border: 'rgba(155,168,188,0.2)' },
}

const especialidadeColors: Record<string, string> = {
  'Busca em escombros': '#FF6B6B',
  'Busca em área':      '#00A550',
  'Cadáver':            '#9BA8BC',
}

function idadeStr(nasc: string | null) {
  if (!nasc) return '—'
  const anos = Math.floor((Date.now() - new Date(nasc).getTime()) / (365.25 * 86400000))
  return `${anos} ano${anos === 1 ? '' : 's'}`
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function vencimento(data: string | null): { label: string; color: string } | null {
  if (!data) return null
  const dias = Math.ceil((new Date(data).getTime() - Date.now()) / 86400000)
  if (dias < 0)   return { label: `Vencida há ${Math.abs(dias)} dias`, color: '#FF6B6B' }
  if (dias < 30)  return { label: `Vence em ${dias} dias`, color: '#E87722' }
  if (dias < 90)  return { label: `Vence em ${dias} dias`, color: '#FFDF00' }
  return { label: `Válida (${dias} dias)`, color: '#00A550' }
}

function Row({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5A6478' }}>{label}</span>
      <span style={{ fontSize: 13, color: color ?? '#E8EDF5', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: 18 }}>
      <div style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

export default function CaoDetalheClient({ dog }: Props) {
  const st = statusConfig[dog.status_operacional] ?? { color: '#9BA8BC', bg: 'rgba(0,0,0,0)', border: 'rgba(255,255,255,0.1)' }
  const espColor = especialidadeColors[dog.especialidade] ?? '#9BA8BC'
  const cond = dog.condutor ? `${dog.condutor.posto_graduacao ? dog.condutor.posto_graduacao + ' ' : ''}${dog.condutor.nome_guerra ?? dog.condutor.nome_completo}` : null
  const vcert = vencimento(dog.certificacao_validade)
  const vvac  = vencimento(dog.proxima_vacina_raiva)
  const vvet  = vencimento(dog.proximo_check_vet)

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Link href="/caes" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', textDecoration: 'none', letterSpacing: '0.08em' }}>
        ← CÃES DE BUSCA E RESGATE
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0, background: `${espColor}20`, border: `2px solid ${espColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {dog.foto_url
              ? <img src={dog.foto_url} alt={dog.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, color: espColor }}>{dog.nome?.[0]?.toUpperCase()}</span>}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 800, color: '#E8EDF5', margin: 0, lineHeight: 1.1 }}>{dog.nome}</h1>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, padding: '3px 8px', borderRadius: 2, color: st.color, background: st.bg, border: `1px solid ${st.border}`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{dog.status_operacional}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: espColor, marginTop: 4, fontWeight: 600 }}>
              {[dog.especialidade, dog.nivel_certificacao].filter(Boolean).join(' · ') || 'Sem especialidade definida'}
            </div>
          </div>
        </div>
        <Link href={`/caes/${dog.id}/editar`} style={{ padding: '7px 14px', borderRadius: 3, background: 'rgba(0,158,219,0.12)', border: '1px solid rgba(0,158,219,0.25)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#009EDB', textDecoration: 'none', letterSpacing: '0.08em' }}>
          EDITAR FICHA
        </Link>
      </div>

      {/* Alertas de validade */}
      {[vcert, vvac, vvet].some(v => v && ['#FF6B6B', '#E87722'].includes(v.color)) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {vcert && ['#FF6B6B', '#E87722'].includes(vcert.color) && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '5px 10px', borderRadius: 3, color: vcert.color, background: `${vcert.color}15`, border: `1px solid ${vcert.color}40` }}>⚠ Certificação: {vcert.label}</span>
          )}
          {vvac && ['#FF6B6B', '#E87722'].includes(vvac.color) && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '5px 10px', borderRadius: 3, color: vvac.color, background: `${vvac.color}15`, border: `1px solid ${vvac.color}40` }}>⚠ Vacina antirrábica: {vvac.label}</span>
          )}
          {vvet && ['#FF6B6B', '#E87722'].includes(vvet.color) && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '5px 10px', borderRadius: 3, color: vvet.color, background: `${vvet.color}15`, border: `1px solid ${vvet.color}40` }}>⚠ Check-up vet.: {vvet.label}</span>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card title="Identificação">
          <Row label="Raça" value={dog.raca ?? '—'} />
          <Row label="Sexo" value={dog.sexo ?? '—'} />
          <Row label="Idade" value={idadeStr(dog.data_nascimento)} />
          <Row label="Nascimento" value={fmt(dog.data_nascimento)} />
          <Row label="Microchip" value={dog.microchip ?? '—'} />
          <Row label="Peso" value={dog.peso_kg ? `${dog.peso_kg} kg` : '—'} />
          <Row label="Proprietário" value={dog.proprietario ?? '—'} />
        </Card>

        <Card title="Operação e binômio">
          <Row label="Condutor" value={cond ?? '—'} />
          <Row label="Especialidade" value={dog.especialidade ?? '—'} />
          <Row label="Nível cert." value={dog.nivel_certificacao ?? '—'} />
          <Row label="Validade cert." value={vcert ? vcert.label : fmt(dog.certificacao_validade)} color={vcert?.color} />
          <Row label="Aptidão" value={dog.aptidao_operacional ?? '—'} color={dog.aptidao_operacional === 'Apto' ? '#00A550' : dog.aptidao_operacional === 'Inapto' ? '#FF6B6B' : undefined} />
        </Card>

        <Card title="Saúde — vacinação">
          <Row label="Última antirrábica" value={fmt(dog.ultima_vacina_raiva)} />
          <Row label="Próxima antirrábica" value={vvac ? vvac.label : fmt(dog.proxima_vacina_raiva)} color={vvac?.color} />
        </Card>

        <Card title="Saúde — check-up veterinário">
          <Row label="Último check-up" value={fmt(dog.ultimo_check_vet)} />
          <Row label="Próximo check-up" value={vvet ? vvet.label : fmt(dog.proximo_check_vet)} color={vvet?.color} />
        </Card>
      </div>

      {dog.observacao && (
        <Card title="Observações">
          <div style={{ fontSize: 13, color: '#9BA8BC', lineHeight: 1.6 }}>{dog.observacao}</div>
        </Card>
      )}
    </div>
  )
}
