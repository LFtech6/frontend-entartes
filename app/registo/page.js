'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5166/api';

function RegistoForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token  = params.get('token');

  const [convite, setConvite]   = useState(null); // { email, perfil }
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [form, setForm]         = useState({ nome: '', username: '', password: '' });
  const [educandos, setEducandos] = useState([{ nome: '', dataNascimento: '' }]);

  useEffect(() => {
    if (!token) { setError('Token inválido.'); return; }
    fetch(`${API}/utilizadores/convite/${token}`)
      .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(t)))
      .then(d => setConvite(d))
      .catch(e => setError(typeof e === 'string' ? e : 'Convite inválido.'));
  }, [token]);

  function addEducando() {
    setEducandos(e => [...e, { nome: '', dataNascimento: '' }]);
  }
  function removeEducando(i) {
    setEducandos(e => e.filter((_, idx) => idx !== i));
  }
  function updateEducando(i, field, val) {
    setEducandos(e => e.map((edu, idx) => idx === i ? { ...edu, [field]: val } : edu));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      token,
      ...form,
      educandos: convite?.perfil === 'ENCARREGADO'
        ? educandos.filter(e => e.nome)
        : null,
    };
    try {
      const res = await fetch(`${API}/utilizadores/registo-por-convite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (e) { setError(e.message); }
  }

  if (error && !convite) return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24 }}>
      <div className="alert alert-danger">{error}</div>
    </div>
  );

  if (!convite) return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24 }}>
      <p className="small-muted">A validar convite…</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: '60px auto', padding: 24 }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Criar conta</h2>
      <p className="small-muted" style={{ marginBottom: 24 }}>Email: <b>{convite.email}</b> · Perfil: <b>{convite.perfil}</b></p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Conta criada! A redirecionar…</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome completo *</label>
          <input className="form-control" required value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="mb-3">
          <label className="form-label">Username *</label>
          <input className="form-control" required value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password *</label>
          <input type="password" className="form-control" required value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>

        {convite.perfil === 'ENCARREGADO' && (
          <div className="mb-3">
            <label className="form-label">Educandos</label>
            {educandos.map((edu, i) => (
              <div key={i} className="border rounded p-3 mb-2">
                <div className="d-flex justify-content-between mb-2">
                  <strong>Educando {i + 1}</strong>
                  {educandos.length > 1 && (
                    <button type="button" className="btn btn-sm btn-outline-danger"
                      onClick={() => removeEducando(i)}>Remover</button>
                  )}
                </div>
                <input className="form-control mb-2" placeholder="Nome"
                  value={edu.nome} onChange={e => updateEducando(i, 'nome', e.target.value)} />
                <input type="date" className="form-control"
                  value={edu.dataNascimento} onChange={e => updateEducando(i, 'dataNascimento', e.target.value)} />
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addEducando}>
              + Adicionar educando
            </button>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100 mt-2">Criar Conta</button>
      </form>
    </div>
  );
}

export default function RegistoPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>A carregar…</div>}>
      <RegistoForm />
    </Suspense>
  );
}
