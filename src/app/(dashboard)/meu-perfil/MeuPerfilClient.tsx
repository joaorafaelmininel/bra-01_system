'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  user:    { id: string; email: string }
  profile: { role: string; display_name: string }
  member:  Record<string, any> | null
}

const roleLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:        { label: 'Administrador',  color: '#FF6B6B', bg: 'rgba(204,0,0,0.12)',    border: 'rgba(204,0,0,0.3)' },
  team_manager: { label: 'Gestor',         color: '#E87722', bg: 'rgba(232,119,34,0.12)', border: 'rgba(232,119,34,0.3)' },
  logistics:    { label: 'Logística',      color: '#FFDF00', bg: 'rgba(255,223,0,0.1)',   border: 'rgba(255,223,0,0.25)' },
  team_member:  { label: 'Membro',         color: '#009EDB', bg: 'rgba(0,158,219,0.12)',  border: 'rgba(0,158,219,0.3)' },
}

const inputStyle: React.CSSProperties = {
  background: '#131920', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4, padding: '9px 12px',
  fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E8EDF5',
  outline: 'none', width: '100%',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 9,
  letterSpacing: '0.12em', textTransform: 'uppercase',
  color: '#5A6478', marginBottom: 5, display: 'block',
}

export default function MeuPerfilClient({ user, profile, member }: Props) {
  const roleCfg = roleLabels[profile.role] ?? roleLabels.team_member

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm] = useState({
    nome_completo:       member?.nome_completo       ?? '',
    nome_guerra:         member?.nome_guerra          ?? '',
    posto_graduacao:     member?.posto_graduacao      ?? '',
    instituicao:         member?.instituicao          ?? '',
    componente_primario: member?.componente_primario  ?? '',
    status_operacional:  member?.status_operacional   ?? 'Ativo',
    aptidao_operacional: member?.aptidao_operacional  ?? 'Apto',
    tipo_membro:         member?.tipo_membro          ?? 'militar',
    email_pessoal:       member?.email_pessoal        ?? user.email,
    passaporte_validade: member?.passaporte_validade  ?? '',
    estado_base:         member?.estado_base          ?? '',
  })

  function set(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const payload = {
      ...form,
      user_id:              user.id,
      passaporte_validade:  form.passaporte_validade || null,
    }

    let err
    if (member?.id) {
      const { error: e } = await supabase.from('members').update(payload).eq('id', member.id)
      err = e
    } else {
      const { error: e } = await supabase.from('members').insert(payload)
      err = e
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
            Meu Perfil
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', marginTop: 2, letterSpacing: '0.08em' }}>
            DADOS PESSOAIS E OPERACIONAIS
          </div>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          padding: '4px 12px', borderRadius: 3,
          color: roleCfg.color, background: roleCfg.bg, border: `1px solid ${roleCfg.border}`,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {roleCfg.label}
        </span>
      </div>

      {/* Card de conta */}
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478', marginBottom: 10 }}>
          Conta
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', marginBottom: 3 }}>E-MAIL</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9BA8BC' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', marginBottom: 3 }}>NOME DE EXIBIÇÃO</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9BA8BC' }}>{profile.display_name}</div>
          </div>
        </div>
      </div>

      {/* Formulário de dados operacionais */}
      <div style={{ background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>
            Dados Operacionais
          </span>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Nome completo + Nome de guerra */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome completo</label>
              <input value={form.nome_completo} onChange={e => set('nome_completo', e.target.value.toUpperCase())} style={inputStyle} placeholder="Nome completo" />
            </div>
            <div>
              <label style={labelStyle}>Nome de guerra</label>
              <input value={form.nome_guerra} onChange={e => set('nome_guerra', e.target.value.toUpperCase())} style={inputStyle} placeholder="Ex: MININEL" />
            </div>
          </div>

          {/* Posto + Instituição */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Posto / Graduação</label>
              <select value={form.posto_graduacao} onChange={e => set('posto_graduacao', e.target.value)} style={selectStyle}>
                <option value="">Selecione</option>
                {['Soldado','Cabo','Sargento','Subtenente','Aspirante','Tenente','Capitão','Major','Tenente-Coronel','Coronel'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Instituição</label>
              <select value={form.instituicao} onChange={e => set('instituicao', e.target.value)} style={selectStyle}>
                <option value="">Selecione</option>
                {['CBPMESP','CBMMG','CBMPR','ABC','MIDR','Defesa Civil Nacional','Forças Armadas','SAMU','Outro'].map(i => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Componente + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Componente USAR</label>
              <select value={form.componente_primario} onChange={e => set('componente_primario', e.target.value)} style={selectStyle}>
                <option value="">Selecione</option>
                {['Management','Technical Search','Rescue','Medical','Logistics'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status operacional</label>
              <select value={form.status_operacional} onChange={e => set('status_operacional', e.target.value)} style={selectStyle}>
                {['Ativo','Licença','Afastado','Reserva','Desligado'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Aptidão + Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Aptidão operacional</label>
              <select value={form.aptidao_operacional} onChange={e => set('aptidao_operacional', e.target.value)} style={selectStyle}>
                <option>Apto</option>
                <option>Inapto</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de membro</label>
              <select value={form.tipo_membro} onChange={e => set('tipo_membro', e.target.value)} style={selectStyle}>
                <option value="militar">Militar</option>
                <option value="civil">Civil</option>
              </select>
            </div>
          </div>

          {/* Email pessoal + Validade passaporte */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>E-mail pessoal</label>
              <input value={form.email_pessoal} onChange={e => set('email_pessoal', e.target.value)} type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Validade do passaporte</label>
              <input value={form.passaporte_validade} onChange={e => set('passaporte_validade', e.target.value)} type="date" style={inputStyle} />
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF6B6B' }}>
              {error}
            </div>
          )}
          {saved && (
            <div style={{ padding: '8px 12px', borderRadius: 3, background: 'rgba(0,165,80,0.12)', border: '1px solid rgba(0,165,80,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00A550' }}>
              Perfil salvo com sucesso.
            </div>
          )}

          {/* Botão salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '9px 24px', borderRadius: 4, cursor: saving ? 'wait' : 'pointer',
                background: saving ? '#2E3848' : '#009EDB', border: 'none',
                fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff',
                transition: 'background .15s',
              }}
            >
              {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
