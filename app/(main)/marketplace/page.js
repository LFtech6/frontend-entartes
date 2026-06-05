'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPatch } from '@/lib/api';
import { getUser, getToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5166/api';

export default function MarketplacePage() {
  const [anuncios, setAnuncios] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [showAnuncioModal, setShowAnuncioModal] = useState(false);
  const [msg, setMsg] = useState(null);
  const [anuncioForm, setAnuncioForm] = useState({ titulo: '', descricao: '', categoria: '', tamanho: '', precoAluguer: 0, caucao: 0 });

  const user = getUser();
  const role = user?.perfil || '';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const canPost = role === 'ENCARREGADO' || role === 'ALUNO' || isAdmin;

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  }

  const carregar = useCallback(async () => {
    try {
      const data = await apiGet('marketplace');
      setAnuncios(data);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar marketplace.', 'danger');
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtered = anuncios.filter(a =>
    !pesquisa || (a.titulo || '').toLowerCase().includes(pesquisa.toLowerCase())
  );

  async function aprovar(id) {
    try {
      await apiPatch(`marketplace/anuncios/${id}/aprovar`, {});
      showMsg('Anúncio aprovado.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao aprovar.', 'danger');
    }
  }

  async function submitAnuncio(e) {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/marketplace/anuncios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...anuncioForm, precoAluguer: Number(anuncioForm.precoAluguer), caucao: Number(anuncioForm.caucao) }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setShowAnuncioModal(false);
      setAnuncioForm({ titulo: '', descricao: '', categoria: '', tamanho: '', precoAluguer: 0, caucao: 0 });
      showMsg('Anúncio submetido. Aguarda aprovação da direção.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao criar anúncio.', 'danger');
    }
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Comunidade</div>
          <div className="page-title">Marketplace</div>
          <div className="page-sub">Troca e aluguer entre encarregados</div>
        </div>
        {canPost && (
          <button className="btn btn-primary" onClick={() => setShowAnuncioModal(true)}>
            <i className="fa-solid fa-plus me-2" />Novo Anúncio
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-body-pad">
          <input className="form-control" placeholder="Pesquisar anúncios..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} style={{ maxWidth: 300 }} />
        </div>
      </div>

      <div className="row g-3">
        {filtered.length === 0 && (
          <div className="col-12">
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--border)', marginBottom: 12 }}><i className="fa-solid fa-store" /></div>
              <div className="small-muted">Sem anúncios aprovados no momento.</div>
            </div>
          </div>
        )}
        {filtered.map(a => (
          <div key={a.id} className="col-md-6 col-lg-4">
            <div className="card p-3 h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="mb-0">{a.titulo}</h6>
                <span className="badge text-bg-success">Aprovado</span>
              </div>
              {a.categoria && <div className="small-muted mb-1">{a.categoria}{a.tamanho ? ' • ' + a.tamanho : ''}</div>}
              {a.descricao && <div className="small mb-2">{a.descricao}</div>}
              <div className="small"><b>Preço aluguer:</b> €{Number(a.precoAluguer || 0).toFixed(2)}</div>
              {a.caucao > 0 && <div className="small"><b>Caução:</b> €{Number(a.caucao).toFixed(2)}</div>}
              {isAdmin && (
                <div className="mt-3">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => aprovar(a.id)}>
                    <i className="fa-solid fa-check me-1" />Reaprovar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAnuncioModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Anúncio</h5>
                <button type="button" className="btn-close" onClick={() => setShowAnuncioModal(false)} />
              </div>
              <form onSubmit={submitAnuncio}>
                <div className="modal-body">
                  <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>O anúncio fica pendente até ser aprovado pela direção.</div>
                  <div className="mb-3"><label className="form-label">Título *</label><input className="form-control" required value={anuncioForm.titulo} onChange={e => setAnuncioForm(f => ({ ...f, titulo: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Descrição</label><textarea className="form-control" rows={2} value={anuncioForm.descricao} onChange={e => setAnuncioForm(f => ({ ...f, descricao: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Categoria</label><input className="form-control" value={anuncioForm.categoria} onChange={e => setAnuncioForm(f => ({ ...f, categoria: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Tamanho</label><input className="form-control" value={anuncioForm.tamanho} onChange={e => setAnuncioForm(f => ({ ...f, tamanho: e.target.value }))} /></div>
                  <div className="row">
                    <div className="col mb-3"><label className="form-label">Preço Aluguer (€)</label><input type="number" step="0.01" className="form-control" min={0} value={anuncioForm.precoAluguer} onChange={e => setAnuncioForm(f => ({ ...f, precoAluguer: e.target.value }))} /></div>
                    <div className="col mb-3"><label className="form-label">Caução (€)</label><input type="number" step="0.01" className="form-control" min={0} value={anuncioForm.caucao} onChange={e => setAnuncioForm(f => ({ ...f, caucao: e.target.value }))} /></div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAnuncioModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Submeter</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
