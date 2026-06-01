'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5166/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Credenciais inválidas.');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push(data.user.perfil === 'ENCARREGADO' ? '/calendario' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* LEFT */}
      <div className="login-left">
        <div className="blob2" />
        <div className="login-brand">
          <span className="brand-name">ent&apos;<em>artes</em></span>
          <div className="brand-sep" />
          <span className="brand-tag">escola de dança</span>
        </div>
        <div className="login-hero">
          <div className="dancer-circle">
            <svg className="dancer-svg" viewBox="0 0 100 130" fill="none">
              <circle cx="50" cy="12" r="7" stroke="white" strokeWidth="1.4" fill="none" opacity="0.85"/>
              <path d="M50 19 C48 33 44 43 40 53" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M46 29 C38 23 28 21 17 25" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M48 27 C56 20 68 13 82 15" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M40 53 C36 66 32 78 28 93" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M40 53 C48 58 62 56 78 46" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M28 93 C26 97 23 99 21 98" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
              <circle cx="82" cy="15" r="2.5" fill="#2a9d8f" opacity="0.85"/>
              <circle cx="17" cy="25" r="2" fill="#2a9d8f" opacity="0.6"/>
              <circle cx="78" cy="46" r="2" fill="#2a9d8f" opacity="0.55"/>
            </svg>
          </div>
          <h2 className="login-headline">A arte<br /><em>que te move.</em></h2>
          <p className="login-desc">Gere aulas, professores, inventário e muito mais — num só portal, pensado para a Ent&apos;Artes.</p>
        </div>
        <div className="login-quote">
          <span className="quote-mark">&ldquo;</span>
          <p className="quote-body">A dança é a linguagem mais bela, pois fala ao coração sem precisar de palavras.</p>
          <span className="quote-author">Portal Administrativo — Ent&apos;Artes</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="form-wrap">
          <div className="form-eyebrow">
            <div className="ey-line" />
            <span className="ey-text">Acesso ao portal</span>
          </div>
          <h1 className="form-title">Bem-vindo<br /><em>de volta.</em></h1>
          <p className="form-sub">Introduz as tuas credenciais para entrares na plataforma da Ent&apos;Artes.</p>

          {error && (
            <div className="alert alert-danger" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Utilizador</label>
              <input
                id="username"
                type="text"
                placeholder="ex: admin"
                required
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div className="login-field">
              <label htmlFor="password">Palavra-passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button className="btn-login" type="submit" disabled={loading}>
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />
              {loading ? 'A entrar…' : 'Iniciar Sessão'}
            </button>
          </form>
        </div>
        <div className="login-credit">Dev by TheNorthCode</div>
      </div>
    </div>
  );
}
