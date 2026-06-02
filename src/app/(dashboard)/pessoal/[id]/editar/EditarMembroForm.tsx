'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SEXO            = ['Masculino', 'Feminino', 'Outro']
const TIPO_MEMBRO     = ['militar', 'civil']
const POSTO_GRADUACAO = ['Soldado','Cabo','Sargento','Subtenente','Aspirante','Tenente','Capitão','Major','Tenente-Coronel','Coronel']
const INSTITUICAO     = ['CBPMESP','CBMMG','CBMPR','ABC','MIDR','Defesa Civil Nacional','Forças Armadas','SAMU','Outro']
const BASE            = ['SP Central','SP Base','MG Base','PR Base']
const COMPONENTE      = ['Management','Technical Search','Rescue','Medical','Logistics']
const STATUS_OP       = ['Ativo','Licença','Afastado','Reserva','Desligado']
const APTIDAO         = ['Apto','Inapto']
const TIPO_SANGUINEO  = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

type Member = Record<string, any>

function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#131920',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
  padding: '8px 10px', fontSize: 13, color: '#E8EDF5',
  fontFamily: 'var(--font-body)', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 9,
  fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
  color: '#5A6478', marginBottom: 6,
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#E87722' }}> *</span>}</label>
      {children}
      {hint && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function SectionTitle({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 2, background: 'rgba(0,158,219,0.12)', color: '#009EDB', border: '1px solid rgba(0,158,219,0.25)' }}>{num}</span>
      <span style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9BA8BC' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}


// ─── Botão de exclusão ────────────────────────────────────────────────────────

function BotaoExcluir({ memberId, nomeGuerra }: { memberId: string; nomeGuerra: string }) {
  const router = useRouter()
  const [loading, setLoadingDel] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function handleDelete() {
    setLoadingDel(true)
    const supabase = createClient()
    const { error } = await supabase.from('members').delete().eq('id', memberId)
    if (error) { alert('Erro ao excluir: ' + error.message); setLoadingDel(false); return }
    router.push('/pessoal')
    router.refresh()
  }

  if (confirmando) return (
    <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 5, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700, color: '#FF6B6B' }}>Confirmar exclusão</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', marginTop: 3 }}>
          Esta ação é irreversível. Todos os dados de <strong>{nomeGuerra}</strong> serão removidos permanentemente.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button type="button" onClick={() => setConfirmando(false)} style={{ padding: '7px 14px', borderRadius: 3, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9BA8BC', letterSpacing: '0.1em' }}>CANCELAR</button>
        <button type="button" onClick={handleDelete} disabled={loading} style={{ padding: '7px 16px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', background: '#CC0000', border: 'none', fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{loading ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}</button>
      </div>
    </div>
  )

  return (
    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button type="button" onClick={() => setConfirmando(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 3, cursor: 'pointer', background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.25)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FF6B6B', letterSpacing: '0.1em' }}>
        <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        EXCLUIR MEMBRO
      </button>
    </div>
  )
}

export default function EditarMembroForm({ member }: { member: Member }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome_completo:               member.nome_completo ?? '',
    cpf:                         member.cpf ?? '',
    nome_guerra:                 member.nome_guerra ?? '',
    data_nascimento:             member.data_nascimento ?? '',
    sexo:                        member.sexo ?? 'Masculino',
    peso_kg:                     member.peso_kg?.toString() ?? '',
    altura_cm:                   member.altura_cm?.toString() ?? '',
    tipo_sanguineo:              member.tipo_sanguineo ?? 'O+',
    tipo_membro:                 member.tipo_membro ?? 'militar',
    instituicao:                 member.instituicao ?? 'CBPMESP',
    estado_base:                 member.estado_base ?? 'SP Central',
    posto_graduacao:             member.posto_graduacao ?? '',
    registro_funcional:          member.registro_funcional ?? '',
    registro_geral:              member.registro_geral ?? '',
    numero_cedula:               member.numero_cedula ?? '',
    data_ingresso_instituicao:   member.data_ingresso_instituicao ?? '',
    tempo_aposentadoria_anos:    member.tempo_aposentadoria_anos?.toString() ?? '',
    cargo_funcao:                member.cargo_funcao ?? '',
    registro_profissional:       member.registro_profissional ?? '',
    tempo_servico_anos:          member.tempo_servico_anos?.toString() ?? '',
    status_operacional:          member.status_operacional ?? 'Ativo',
    aptidao_operacional:         member.aptidao_operacional ?? 'Apto',
    passaporte_numero:           member.passaporte_numero ?? '',
    passaporte_validade:         member.passaporte_validade ?? '',
    telefone_celular:            member.telefone_celular ?? '',
    telefone_funcional:          member.telefone_funcional ?? '',
    email_pessoal:               member.email_pessoal ?? '',
    email_institucional:         member.email_institucional ?? '',
    contato_emergencia_nome:     member.contato_emergencia_nome ?? '',
    contato_emergencia_telefone: member.contato_emergencia_telefone ?? '',
    contato_emergencia_relacao:  member.contato_emergencia_relacao ?? '',
    componente_primario:         member.componente_primario ?? 'Rescue',
    componente_secundario:       member.componente_secundario ?? '',
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.tagName === 'SELECT' || e.target.type === 'email' ? e.target.value : e.target.value.toUpperCase()
      if (field === 'cpf') value = formatCPF(value)
      if (['telefone_celular','telefone_funcional','contato_emergencia_telefone'].includes(field)) value = formatPhone(value)
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase
      .from('members')
      .update({
        nome_completo:               form.nome_completo.trim(),
        cpf:                         form.cpf.trim(),
        nome_guerra:                 form.nome_guerra.trim() || null,
        data_nascimento:             form.data_nascimento,
        sexo:                        form.sexo,
        peso_kg:                     parseFloat(form.peso_kg),
        altura_cm:                   parseInt(form.altura_cm),
        tipo_sanguineo:              form.tipo_sanguineo,
        tipo_membro:                 form.tipo_membro,
        instituicao:                 form.instituicao,
        estado_base:                 form.estado_base,
        posto_graduacao:             form.posto_graduacao || null,
        registro_funcional:          form.registro_funcional || null,
        registro_geral:              form.registro_geral || null,
        numero_cedula:               form.numero_cedula || null,
        data_ingresso_instituicao:   form.data_ingresso_instituicao || null,
        tempo_aposentadoria_anos:    form.tempo_aposentadoria_anos ? parseInt(form.tempo_aposentadoria_anos) : null,
        cargo_funcao:                form.cargo_funcao || null,
        registro_profissional:       form.registro_profissional || null,
        tempo_servico_anos:          form.tempo_servico_anos ? parseInt(form.tempo_servico_anos) : null,
        status_operacional:          form.status_operacional,
        aptidao_operacional:         form.aptidao_operacional,
        passaporte_numero:           form.passaporte_numero || null,
        passaporte_validade:         form.passaporte_validade || null,
        telefone_celular:            form.telefone_celular.trim(),
        telefone_funcional:          form.telefone_funcional || null,
        email_pessoal:               form.email_pessoal.trim(),
        email_institucional:         form.email_institucional || null,
        contato_emergencia_nome:     form.contato_emergencia_nome.trim(),
        contato_emergencia_telefone: form.contato_emergencia_telefone.trim(),
        contato_emergencia_relacao:  form.contato_emergencia_relacao.trim(),
        componente_primario:         form.componente_primario,
        componente_secundario:       form.componente_secundario || null,
      })
      .eq('id', member.id)

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/pessoal/${member.id}`)
    router.refresh()
  }

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }
  const grid4: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }
  const sectionStyle: React.CSSProperties = { background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '20px' }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 24px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3, padding: '6px 10px', cursor: 'pointer', color: '#9BA8BC',
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
        }}>← VOLTAR</button>
        <div>
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
            Editar membro
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
            {member.nome_guerra ?? member.nome_completo} · {member.instituicao}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 01 Dados pessoais */}
        <div style={sectionStyle}>
          <SectionTitle num="01">Dados pessoais</SectionTitle>
          <Field label="Nome completo" required>
            <input style={inputStyle} value={form.nome_completo} onChange={set('nome_completo')} required />
          </Field>
          <div style={{ ...grid3, marginTop: 14 }}>
            <Field label="CPF" required>
              <input style={inputStyle} value={form.cpf} onChange={set('cpf')} required />
            </Field>
            <Field label="Nome de guerra">
              <input style={inputStyle} value={form.nome_guerra} onChange={set('nome_guerra')} />
            </Field>
            <Field label="Data de nascimento" required>
              <input type="date" style={inputStyle} value={form.data_nascimento} onChange={set('data_nascimento')} required />
            </Field>
          </div>
          <div style={{ ...grid2, marginTop: 14 }}>
            <Field label="Sexo" required>
              <select style={inputStyle} value={form.sexo} onChange={set('sexo')}>
                {SEXO.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* 02 Dados físicos */}
        <div style={sectionStyle}>
          <SectionTitle num="02">Dados físicos e médicos</SectionTitle>
          <div style={grid3}>
            <Field label="Peso (kg)" required>
              <input type="number" step="0.1" style={inputStyle} value={form.peso_kg} onChange={set('peso_kg')} required />
            </Field>
            <Field label="Altura (cm)" required>
              <input type="number" style={inputStyle} value={form.altura_cm} onChange={set('altura_cm')} required />
            </Field>
            <Field label="Tipo sanguíneo" required>
              <select style={inputStyle} value={form.tipo_sanguineo} onChange={set('tipo_sanguineo')}>
                {TIPO_SANGUINEO.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* 03 Dados institucionais */}
        <div style={sectionStyle}>
          <SectionTitle num="03">Dados institucionais</SectionTitle>
          <div style={grid2}>
            <Field label="Tipo de membro" required>
              <select style={inputStyle} value={form.tipo_membro} onChange={set('tipo_membro')}>
                {TIPO_MEMBRO.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Instituição" required>
              <select style={inputStyle} value={form.instituicao} onChange={set('instituicao')}>
                {INSTITUICAO.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Posto / Graduação">
              <select style={inputStyle} value={form.posto_graduacao} onChange={set('posto_graduacao')}>
                <option value="">— Selecione —</option>
                {POSTO_GRADUACAO.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Base" required>
              <select style={inputStyle} value={form.estado_base} onChange={set('estado_base')}>
                {BASE.map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Registro funcional">
              <input style={inputStyle} value={form.registro_funcional} onChange={set('registro_funcional')} />
            </Field>
            <Field label="Registro geral (RG)">
              <input style={inputStyle} value={form.registro_geral} onChange={set('registro_geral')} />
            </Field>
            <Field label="Número da cédula">
              <input style={inputStyle} value={form.numero_cedula} onChange={set('numero_cedula')} />
            </Field>
            <Field label="Data de ingresso">
              <input type="date" style={inputStyle} value={form.data_ingresso_instituicao} onChange={set('data_ingresso_instituicao')} />
            </Field>
            <Field label="Tempo de serviço (anos)">
              <input type="number" min="0" style={inputStyle} value={form.tempo_servico_anos} onChange={set('tempo_servico_anos')} />
            </Field>
            <Field label="Tempo para aposentadoria (anos)">
              <input type="number" min="0" style={inputStyle} value={form.tempo_aposentadoria_anos} onChange={set('tempo_aposentadoria_anos')} />
            </Field>
            <Field label="Cargo / Função atual">
              <input style={inputStyle} value={form.cargo_funcao} onChange={set('cargo_funcao')} />
            </Field>
            <Field label="Registro profissional">
              <input style={inputStyle} value={form.registro_profissional} onChange={set('registro_profissional')} />
            </Field>
          </div>
        </div>

        {/* 04 Status + Componente */}
        <div style={sectionStyle}>
          <SectionTitle num="04">Status operacional e componente USAR</SectionTitle>
          <div style={grid4}>
            <Field label="Status operacional" required>
              <select style={inputStyle} value={form.status_operacional} onChange={set('status_operacional')}>
                {STATUS_OP.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Aptidão operacional" required>
              <select style={inputStyle} value={form.aptidao_operacional} onChange={set('aptidao_operacional')}>
                {APTIDAO.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Componente primário" required>
              <select style={inputStyle} value={form.componente_primario} onChange={set('componente_primario')}>
                {COMPONENTE.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Componente secundário">
              <select style={inputStyle} value={form.componente_secundario} onChange={set('componente_secundario')}>
                <option value="">— Nenhum —</option>
                {COMPONENTE.filter(c => c !== form.componente_primario).map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* 05 Documentos */}
        <div style={sectionStyle}>
          <SectionTitle num="05">Documentos de viagem</SectionTitle>
          <div style={grid2}>
            <Field label="Número do passaporte">
              <input style={inputStyle} value={form.passaporte_numero} onChange={set('passaporte_numero')} placeholder="Ex: SB123456" />
            </Field>
            <Field label="Validade do passaporte">
              <input type="date" style={inputStyle} value={form.passaporte_validade} onChange={set('passaporte_validade')} />
            </Field>
          </div>
        </div>

        {/* 06 Contatos */}
        <div style={sectionStyle}>
          <SectionTitle num="06">Contatos</SectionTitle>
          <div style={grid2}>
            <Field label="Telefone celular" required>
              <input style={inputStyle} value={form.telefone_celular} onChange={set('telefone_celular')} required />
            </Field>
            <Field label="Telefone funcional">
              <input style={inputStyle} value={form.telefone_funcional} onChange={set('telefone_funcional')} />
            </Field>
            <Field label="E-mail pessoal" required>
              <input type="email" style={inputStyle} value={form.email_pessoal} onChange={set('email_pessoal')} required />
            </Field>
            <Field label="E-mail institucional">
              <input type="email" style={inputStyle} value={form.email_institucional} onChange={set('email_institucional')} />
            </Field>
          </div>
        </div>

        {/* 07 Emergência */}
        <div style={sectionStyle}>
          <SectionTitle num="07">Contato de emergência</SectionTitle>
          <div style={grid3}>
            <Field label="Nome" required>
              <input style={inputStyle} value={form.contato_emergencia_nome} onChange={set('contato_emergencia_nome')} required />
            </Field>
            <Field label="Telefone" required>
              <input style={inputStyle} value={form.contato_emergencia_telefone} onChange={set('contato_emergencia_telefone')} required />
            </Field>
            <Field label="Relação" required>
              <input style={inputStyle} value={form.contato_emergencia_relacao} onChange={set('contato_emergencia_relacao')} required />
            </Field>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 3, background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B' }}>
            ERRO: {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button type="button" onClick={() => router.back()} style={{
            padding: '8px 16px', borderRadius: 3, cursor: 'pointer',
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9BA8BC', letterSpacing: '0.1em',
          }}>CANCELAR</button>
          <button type="submit" disabled={loading} style={{
            padding: '8px 20px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#5A6478' : '#E87722', border: 'none',
            fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff',
          }}>
            {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </div>
      </form>

      <BotaoExcluir memberId={member.id} nomeGuerra={member.nome_guerra ?? member.nome_completo} />
    </div>
  )
}
