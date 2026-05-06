import { register } from '@/app/(auth)/login/actions'
import { Barlow_Condensed, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cond',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

const ERROR_MESSAGES: Record<string, string> = {
  '1':              'Erro ao criar conta. Tente novamente.',
  'missing_fields': 'Preencha todos os campos.',
  'weak_password':  'A senha deve ter no mínimo 8 caracteres.',
  'already_exists': 'Este e-mail já está cadastrado.',
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const errorMsg   = searchParams.error ? (ERROR_MESSAGES[searchParams.error] ?? 'Erro desconhecido.') : null
  const successMsg = searchParams.success ? 'Conta criada com sucesso! Verifique seu e-mail para confirmar.' : null

  return (
    <div
      className={`${barlowCondensed.variable} ${jetbrainsMono.variable}`}
      style={{
        minHeight: '100vh',
        background: '#0D1117',
        display: 'flex',
        fontFamily: 'var(--font-mono), monospace',
      }}
    >
      {/* Coluna esquerda — identidade */}
      <div style={{
        width: '45%', flexShrink: 0,
        background: 'linear-gradient(160deg, #00306B 0%, #0D1117 70%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        padding: '60px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow decorativo */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,158,219,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Flag bars */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 32 }}>
          <div style={{ width: 5, height: 40, borderRadius: 2, background: '#009C3B' }} />
          <div style={{ width: 5, height: 40, borderRadius: 2, background: '#FFDF00' }} />
          <div style={{ width: 5, height: 40, borderRadius: 2, background: '#002776' }} />
          <div style={{ width: 5, height: 40, borderRadius: 2, background: '#FFFFFF' }} />
        </div>

        <div style={{ fontFamily: 'var(--font-cond)', fontSize: 32, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>
          BRA-01<br />Heavy USAR
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5A6478', marginBottom: 40 }}>
          Sistema de Gestão da Equipe
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'INSARAG', sub: 'IEC Heavy Classification' },
            { label: 'BRA-01',  sub: 'SP · MG · PR' },
            { label: 'CBMMG / CBMPR / CBPMESP', sub: 'Corpos de Bombeiros' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 3, height: 20, borderRadius: 1, background: '#009EDB', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 700, color: '#9BA8BC', letterSpacing: '0.08em' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2E3848', letterSpacing: '0.08em' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna direita — formulário */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 24, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: 6 }}>
              Criar Conta
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6478', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Acesso como membro da equipe
            </div>
          </div>

          {/* Alerta de erro */}
          {errorMsg && (
            <div style={{
              marginBottom: 20, padding: '10px 14px', borderRadius: 4,
              background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF6B6B',
              letterSpacing: '0.04em',
            }}>
              {errorMsg}
            </div>
          )}

          {/* Sucesso */}
          {successMsg && (
            <div style={{
              marginBottom: 20, padding: '10px 14px', borderRadius: 4,
              background: 'rgba(0,165,80,0.12)', border: '1px solid rgba(0,165,80,0.3)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00A550',
              letterSpacing: '0.04em',
            }}>
              {successMsg}
            </div>
          )}

          {/* Formulário */}
          {!successMsg && (
            <form action={register} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Nome de exibição */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478' }}>
                  Nome de guerra / Identificação
                </label>
                <input
                  name="display_name"
                  type="text"
                  required
                  placeholder="Ex: MININEL"
                  autoComplete="name"
                  style={{
                    background: '#131920', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '10px 14px',
                    fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E8EDF5',
                    outline: 'none', width: '100%',
                    transition: 'border-color .15s',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478' }}>
                  E-mail institucional
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="usuario@bombeiros.gov.br"
                  autoComplete="email"
                  style={{
                    background: '#131920', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '10px 14px',
                    fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E8EDF5',
                    outline: 'none', width: '100%',
                  }}
                />
              </div>

              {/* Senha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6478' }}>
                  Senha
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  style={{
                    background: '#131920', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '10px 14px',
                    fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E8EDF5',
                    outline: 'none', width: '100%',
                  }}
                />
              </div>

              {/* Role info */}
              <div style={{
                padding: '8px 12px', borderRadius: 3,
                background: 'rgba(0,158,219,0.08)', border: '1px solid rgba(0,158,219,0.2)',
                fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5A6478',
                letterSpacing: '0.06em', lineHeight: 1.6,
              }}>
                Conta criada com acesso <span style={{ color: '#009EDB' }}>team_member</span> — visualização de todos os módulos + edição do próprio perfil.
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  marginTop: 4,
                  padding: '11px 0', borderRadius: 4,
                  background: '#009EDB', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-cond)', fontSize: 14, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff',
                  transition: 'background .15s',
                }}
              >
                Criar conta
              </button>
            </form>
          )}

          {/* Link para login */}
          <div style={{ marginTop: 28, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2E3848' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: '#009EDB', textDecoration: 'none', letterSpacing: '0.06em' }}>
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
