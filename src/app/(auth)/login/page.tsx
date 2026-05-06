import { login } from './actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const hasError = searchParams.error === '1'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0D1117;
          color: #E8EDF5;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
        }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 480px;
        }

        /* ── Lado esquerdo ── */
        .login-left {
          background: #131920;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,75,135,0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(232,119,34,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-area { position: relative; z-index: 1; }

        .brand-stripes { display: flex; gap: 3px; margin-bottom: 20px; }
        .brand-stripe  { width: 5px; height: 48px; border-radius: 2px; }

        .brand-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 36px; font-weight: 800;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #fff; line-height: 1;
        }
        .brand-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #5A6478; margin-top: 6px;
        }

        .left-content { position: relative; z-index: 1; }

        .left-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 3px;
          background: rgba(0,75,135,0.2); border: 1px solid rgba(0,75,135,0.4);
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: #009EDB; letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 24px;
        }
        .left-tag::before {
          content: ''; width: 6px; height: 6px;
          border-radius: 50%; background: #009EDB;
        }

        .left-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 48px; font-weight: 800; line-height: 1.05;
          color: #fff; margin-bottom: 20px;
        }
        .left-title span { color: #E87722; }

        .left-desc {
          font-size: 15px; color: #5A6478; line-height: 1.6;
          max-width: 420px; margin-bottom: 40px;
        }

        .left-footer { position: relative; z-index: 1; display: flex; gap: 20px; }
        .corp-badge {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 2px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); letter-spacing: 0.08em;
        }

        /* ── Lado direito ── */
        .login-right {
          background: #0D1117;
          display: flex; flex-direction: column;
          justify-content: center; padding: 48px;
        }

        .form-header { margin-bottom: 36px; }
        .form-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #5A6478; margin-bottom: 10px;
        }
        .form-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase; color: #fff;
        }
        .form-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #5A6478; margin-top: 6px;
        }

        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #5A6478; margin-bottom: 8px;
        }
        .form-input {
          width: 100%; background: #131920;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px; padding: 12px 14px;
          font-family: 'Barlow', sans-serif; font-size: 14px;
          color: #E8EDF5; outline: none; transition: border-color .15s;
        }
        .form-input:focus { border-color: #009EDB; }
        .form-input::placeholder { color: #2E3848; }

        .form-btn {
          width: 100%; padding: 13px; border-radius: 4px;
          border: none; background: #E87722; color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; transition: background .15s; margin-top: 8px;
        }
        .form-btn:hover { background: #FF8C38; }

        .form-divider {
          display: flex; align-items: center; gap: 12px; margin: 24px 0;
        }
        .form-divider::before, .form-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .form-divider span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #2E3848; letter-spacing: 0.1em;
        }

        .security-note {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 4px;
          background: rgba(0,158,219,0.06);
          border: 1px solid rgba(0,158,219,0.15); margin-top: 24px;
        }
        .security-note svg { flex-shrink: 0; color: #009EDB; }
        .security-note span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #5A6478; line-height: 1.5;
        }

        .form-footer {
          margin-top: 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #2E3848;
          text-align: center; letter-spacing: 0.06em;
        }

        .register-link {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 16px; padding: 11px;
          border-radius: 4px; border: 1px solid rgba(0,158,219,0.25);
          background: rgba(0,158,219,0.06);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #009EDB; text-decoration: none;
          transition: background .15s, border-color .15s;
        }
        .register-link:hover {
          background: rgba(0,158,219,0.12);
          border-color: rgba(0,158,219,0.4);
        }

        .error-box {
          margin-bottom: 20px; padding: 10px 14px; border-radius: 4px;
          background: rgba(204,0,0,0.12); border: 1px solid rgba(204,0,0,0.3);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #FF6B6B; letter-spacing: 0.04em;
        }
      `}</style>

      <div className="login-root">

        {/* ── LADO ESQUERDO ── */}
        <div className="login-left">
          <div className="brand-area">
            <div className="brand-stripes">
              <div className="brand-stripe" style={{ background: '#009C3B' }} />
              <div className="brand-stripe" style={{ background: '#FFDF00' }} />
              <div className="brand-stripe" style={{ background: '#002776' }} />
              <div className="brand-stripe" style={{ background: '#FFFFFF' }} />
            </div>
            <div className="brand-name">BRA-01 Heavy USAR</div>
            <div className="brand-sub">Sistema de Gestão da Equipe · INSARAG</div>
          </div>

          <div className="left-content">
            <div className="left-tag">BRA-01 Heavy USAR Team</div>
            <div className="left-title">
              Gestão integrada<br />
              da <span>equipe</span><br />
              Heavy USAR <span>BRA-01</span>
            </div>
            <div className="left-desc">
              Plataforma centralizada para gestão do efetivo, equipamentos, capacitação, missões e organograma da equipe BRA-01 Heavy USAR — preparação contínua e pronta resposta.
            </div>
          </div>

          <div className="left-footer">
            {['CBMMG', 'CBMPR', 'CBPMESP'].map(corp => (
              <span key={corp} className="corp-badge">{corp}</span>
            ))}
          </div>
        </div>

        {/* ── LADO DIREITO ── */}
        <div className="login-right">
          <div className="form-header">
            <div className="form-tag">Acesso restrito</div>
            <div className="form-title">Entrar no sistema</div>
            <div className="form-subtitle">BRA-01 Management System · v1.0</div>
          </div>

          {hasError && (
            <div className="error-box">
              E-mail ou senha incorretos. Verifique suas credenciais.
            </div>
          )}

          <form action={login}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mail institucional</label>
              <input
                id="email" name="email" type="email" required
                autoComplete="email" placeholder="seu@email.com.br"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha</label>
              <input
                id="password" name="password" type="password" required
                autoComplete="current-password" placeholder="••••••••••"
                className="form-input"
              />
            </div>

            <button type="submit" className="form-btn">
              Entrar no sistema →
            </button>
          </form>

          {/* Link para criar conta */}
          <Link href="/register" className="register-link">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            Criar conta de acesso
          </Link>

          <div className="security-note">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>
              Acesso restrito aos membros autorizados da equipe BRA-01.<br />
              Em caso de problemas, contate o administrador do sistema.
            </span>
          </div>

          <div className="form-divider">
            <span>CBPMESP · CBMMG · CBMPR</span>
          </div>

          <div className="form-footer">
            BRA-01 HEAVY USAR TEAM · INSARAG IEC PREPARATION · Sistema de Gestão
          </div>
        </div>
      </div>
    </>
  )
}
