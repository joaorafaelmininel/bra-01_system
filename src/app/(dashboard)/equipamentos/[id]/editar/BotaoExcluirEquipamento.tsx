'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function BotaoExcluirEquipamento({ equipamentoId, codigoItem, nome }: { equipamentoId: string; codigoItem: string; nome: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('equipment').delete().eq('id', equipamentoId)
    if (error) {
      alert('Erro ao excluir: ' + error.message)
      setLoading(false)
      return
    }
    router.push('/equipamentos')
    router.refresh()
  }

  if (confirmando) {
    return (
      <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 5, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, color: '#FF6B6B' }}>
            Confirmar exclusão
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', marginTop: 3 }}>
            Esta ação é irreversível. O item <strong>[{codigoItem}] {nome}</strong> e seu histórico de manutenção serão removidos permanentemente.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            style={{ padding: '7px 14px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', letterSpacing: '0.1em' }}
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{ padding: '7px 16px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: '#CC0000', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
          >
            {loading ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-start' }}>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, cursor: 'pointer', background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.25)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF6B6B', letterSpacing: '0.1em' }}
      >
        <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        EXCLUIR EQUIPAMENTO
      </button>
    </div>
  )
}
