'use client'

import { usePathname } from 'next/navigation'
import { useEstado } from '@/lib/EstadoContext'

const ESTADOS = [
  { value: 'Todos',   label: 'Todos', color: '#9BA8BC' },
  { value: 'CBMMG',   label: 'MG',    color: '#E87722' },
  { value: 'CBMPR',   label: 'PR',    color: '#00A550' },
  { value: 'CBPMESP', label: 'SP',    color: '#009EDB' },
] as const

// Rotas onde o filtro por estado não se aplica
const ROTAS_DESABILITADAS = ['/organograma', '/missoes', '/relatorios', '/excon']

export default function EstadoSelector() {
  const { estado, setEstado } = useEstado()
  const pathname = usePathname()

  const desabilitado = ROTAS_DESABILITADAS.some(r => pathname === r || pathname.startsWith(r + '/'))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 9,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: desabilitado ? '#2E3848' : '#5A6478',
        transition: 'color .15s',
      }}>
        Vista:
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {ESTADOS.map(e => {
          const active = !desabilitado && estado === e.value
          return (
            <button
              key={e.value}
              onClick={() => !desabilitado && setEstado(e.value as any)}
              disabled={desabilitado}
              title={desabilitado ? 'Filtro por estado não disponível nesta seção' : undefined}
              style={{
                padding: '3px 8px', borderRadius: 3,
                cursor: desabilitado ? 'default' : 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
                letterSpacing: '0.08em',
                background: active ? `${e.color}20` : 'transparent',
                border: active ? `1px solid ${e.color}50` : '1px solid transparent',
                color: desabilitado ? '#2E3848' : active ? e.color : '#5A6478',
                transition: 'all .15s',
                opacity: desabilitado ? 0.4 : 1,
              }}
            >
              {e.label}
            </button>
          )
        })}
      </div>
      {desabilitado && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8,
          color: '#2E3848', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginLeft: 2,
        }}>
          N/A
        </span>
      )}
    </div>
  )
}
