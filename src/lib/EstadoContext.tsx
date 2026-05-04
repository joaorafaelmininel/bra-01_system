'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Estado = 'Todos' | 'CBMMG' | 'CBMPR' | 'CBPMESP'

const ESTADOS_VALIDOS: Estado[] = ['Todos', 'CBMMG', 'CBMPR', 'CBPMESP']

interface EstadoContextType {
  estado: Estado
  setEstado: (e: Estado) => void
}

const EstadoContext = createContext<EstadoContextType>({
  estado: 'Todos',
  setEstado: () => {},
})

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstadoState] = useState<Estado>('Todos')

  useEffect(() => {
    const saved = localStorage.getItem('bra01_estado_filtro') as Estado | null
    if (saved && ESTADOS_VALIDOS.includes(saved)) {
      setEstadoState(saved)
    } else {
      // Valor inválido ou ausente — limpa e usa padrão
      localStorage.removeItem('bra01_estado_filtro')
    }
  }, [])

  function setEstado(e: Estado) {
    setEstadoState(e)
    localStorage.setItem('bra01_estado_filtro', e)
  }

  return (
    <EstadoContext.Provider value={{ estado, setEstado }}>
      {children}
    </EstadoContext.Provider>
  )
}

export function useEstado() {
  return useContext(EstadoContext)
}
