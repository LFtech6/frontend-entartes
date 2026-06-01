'use client';
import { useState } from 'react';
import { getUser } from '@/lib/auth';

const SEED = [
  { id: 1, titulo: 'Traje Contemporâneo Preto', tipo: 'VENDA',   preco: 35.0, tamanho: 'M',  estado: 'USADO', desc: 'Pouco usado, em bom estado.', ativo: true },
  { id: 2, titulo: 'Traje Ballet Branco',       tipo: 'ALUGUER', preco: 10.0, tamanho: 'S',  estado: 'USADO', desc: 'Aluguer por semana.',         ativo: true },
  { id: 3, titulo: 'Sapatos Jazz 38',           tipo: 'VENDA',   preco: 18.0, tamanho: '38', estado: 'NOVO',  desc: 'Nunca usados.',               ativo: true },
];

export default function MarketplacePage() {
  const [anuncios, setAnuncios] = useState(SEED);
  const [pesquisa, setPesquisa] = useState('');
  const [filtro, setFiltro] = useState('');
  const [showAnuncioModal, setShowAnuncioModal] = useState(false);
  const [showContactoModal, setShowContactoModal] = useState(false);
  const [anuncioContacto, setAnuncioContacto] = useState(null);
  const [contactoMsg, setContactoMsg] = useState('');
  const [anuncioForm, setAnuncioForm] = useState({ titulo: '', tipo: 'VENDA', preco: 0, tamanho: '', estado: 'USADO', desc: '' });
  const [msg, setMsg] = useState(null);

  const user = getUser();
  const role = user?.perfil || '';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  }

  const filtered = anuncios
    .filter(a => a.ativo !== false)
    .filter(a => !filtro || a.tipo === filtro)
    .filter(a => !pesquisa || (a.titulo || '').toLowerCase().includes(pesquisa.toLowerCase()));

  function remover(id) {
    if (!isAdmin) return;
    if (!confirm('Remover anúncio?')) return;
    setAnuncios(prev => prev.filter(a => a.id !== id));
    showMsg('Anúncio removido.', 'success');
  }

  function abrirContacto(id) {
    setAnuncioContacto(anuncios.find(x => x.id === id));
    setContactoMsg('');
    setShowContactoModal(true);
  }

  function submitContacto(e) {
    e.preventDefault();
    if (!contactoMsg.trim()) { showMsg('Escreve uma mensagem.', 'danger'); return; }
    setShowContactoModal(false);
    showMsg('Mensagem enviada (mock).', 'success');
  }

  function submitAnuncio(e) {
    e.preventDefault();
    const novo = { ...anuncioForm, id: Math.max(0, ...anuncios.map(x => x.id)) + 1, preco: Number(anuncioForm.preco), ativo: true };
    setAnuncios(prev => [novo, ...prev]);
    setShowAnuncioModal(false);
    setAnuncioForm({ titulo: '', tipo: 'VENDA', preco: 0, tamanho: '', estado: 'USADO', desc: '' });
    showMsg('Anúncio publicado (mock).', 'success');
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Comunidade</div>
          <div className="page-title">Marketplace</div>
          <div className="page-sub">Troca e venda entre encarregados</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAnuncioModal(true)}>
          <i className="fa-solid fa-plus me-2" />Novo Anúncio
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-body-pad" style={{ display: 'flex', gap: 12 }}>
          <input className="form-control" placeholder="Pesquisar..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} style={{ maxWidth: 260 }} />
          <select className="form-select" style={{ maxWidth: 160 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Todos</option>
            <option value="VENDA">Venda</option>
            <option value="ALUGUER">Aluguer</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        {filtered.length === 0 && <div className="col-12"><div className="small-muted">Sem anúncios.</div></div>}
        {filtered.map(a => (
          <div key={a.id} className="col-md-6 col-lg-4">
            <div className="card p-3 h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1">{a.titulo}</h6>
                  <div className="small-muted">{a.tamanho ? 'Tamanho: ' + a.tamanho : 'Sem tamanho'} • Estado: {a.estado}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${a.tipo === 'VENDA' ? 'text-bg-primary' : 'text-bg-warning'}`}>{a.tipo === 'VENDA' ? 'Venda' : 'Aluguer'}</span>
                  {isAdmin && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remover(a.id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  )}
                </div>
              </div>
              <hr className="my-2" />
              <div className="small"><b>Preço:</b> €{Number(a.preco).toFixed(2)}</div>
              <div className="mt-2 small">{a.desc}</div>
              <div className="mt-3">
                <button className="btn btn-sm btn-outline-success" onClick={() => abrirContacto(a.id)}>
                  <i className="fa-solid fa-comment-dots me-1" />Contactar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showContactoModal && anuncioContacto && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contactar Vendedor</h5>
                <button type="button" className="btn-close" onClick={() => setShowContactoModal(false)} />
              </div>
              <form onSubmit={submitContacto}>
                <div className="modal-body">
                  <div className="mb-2"><b>Anúncio:</b> {anuncioContacto.titulo}</div>
                  <div className="mb-3"><b>Preço:</b> €{Number(anuncioContacto.preco).toFixed(2)}</div>
                  <div className="mb-3">
                    <label className="form-label">Mensagem *</label>
                    <textarea className="form-control" rows={3} required value={contactoMsg} onChange={e => setContactoMsg(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowContactoModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Enviar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                  <div className="mb-3"><label className="form-label">Título *</label><input className="form-control" required value={anuncioForm.titulo} onChange={e => setAnuncioForm(f => ({ ...f, titulo: e.target.value }))} /></div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={anuncioForm.tipo} onChange={e => setAnuncioForm(f => ({ ...f, tipo: e.target.value }))}>
                      <option value="VENDA">Venda</option>
                      <option value="ALUGUER">Aluguer</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className="form-label">Preço (€)</label><input type="number" step="0.01" className="form-control" min={0} value={anuncioForm.preco} onChange={e => setAnuncioForm(f => ({ ...f, preco: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Tamanho</label><input className="form-control" value={anuncioForm.tamanho} onChange={e => setAnuncioForm(f => ({ ...f, tamanho: e.target.value }))} /></div>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select className="form-select" value={anuncioForm.estado} onChange={e => setAnuncioForm(f => ({ ...f, estado: e.target.value }))}>
                      <option value="NOVO">Novo</option>
                      <option value="USADO">Usado</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className="form-label">Descrição</label><textarea className="form-control" rows={2} value={anuncioForm.desc} onChange={e => setAnuncioForm(f => ({ ...f, desc: e.target.value }))} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAnuncioModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Publicar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
