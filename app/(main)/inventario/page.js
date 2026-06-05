'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '@/lib/api';
import { getUser, getToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5166/api';

export default function InventarioPage() {
  const [itens, setItens] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAluguerModal, setShowAluguerModal] = useState(false);
  const [itemAluguer, setItemAluguer] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [itemForm, setItemForm] = useState({ nome: '', categoria: '', tamanho: '', quantidadeTotal: 1, quantidadeDisponivel: 1, precoAluguer: 0, localizacao: '', imagem: null });
  const [msg, setMsg] = useState(null);

  const user = getUser();
  const role = user?.perfil || '';
  const podeAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const canRent = role === 'ENCARREGADO' || role === 'ALUNO' || podeAdmin;

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  }

  const carregar = useCallback(async () => {
    try {
      const data = await apiGet('inventario');
      setItens(data);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar inventário.', 'danger');
    }
  }, []);

  useEffect(() => {
    carregar();
    if (canRent) apiGet('alunos').then(setAlunos).catch(() => {});
  }, [carregar]);

  const filtered = itens
    .filter(i => !filtroCat || i.categoria === filtroCat)
    .filter(i => !pesquisa || (i.nome + ' ' + (i.categoria || '')).toLowerCase().includes(pesquisa.toLowerCase()));

  const categorias = [...new Set(itens.map(i => i.categoria).filter(Boolean))];

  async function submitAluguer(e) {
    e.preventDefault();
    if (!alunoId) { showMsg('Seleciona um aluno.', 'warning'); return; }
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/inventario/${itemAluguer.id}/alugar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(parseInt(alunoId, 10)),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setShowAluguerModal(false);
      setAlunoId('');
      showMsg('Item alugado com sucesso.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao alugar item.', 'danger');
    }
  }

  async function submitItem(e) {
    e.preventDefault();
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('nome', itemForm.nome);
      if (itemForm.categoria) fd.append('categoria', itemForm.categoria);
      if (itemForm.tamanho) fd.append('tamanho', itemForm.tamanho);
      fd.append('quantidadeTotal', itemForm.quantidadeTotal);
      fd.append('quantidadeDisponivel', itemForm.quantidadeDisponivel);
      fd.append('precoAluguer', itemForm.precoAluguer);
      if (itemForm.localizacao) fd.append('localizacao', itemForm.localizacao);
      if (itemForm.imagem) fd.append('imagem', itemForm.imagem);

      const res = await fetch(`${API_BASE}/inventario`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setShowItemModal(false);
      setItemForm({ nome: '', categoria: '', tamanho: '', quantidadeTotal: 1, quantidadeDisponivel: 1, precoAluguer: 0, localizacao: '', imagem: null });
      showMsg('Item criado com sucesso.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao criar item.', 'danger');
    }
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Recursos</div>
          <div className="page-title">Inventário</div>
          <div className="page-sub">Figurinos e equipamento da escola</div>
        </div>
        {podeAdmin && (
          <button className="btn btn-primary" onClick={() => setShowItemModal(true)}>
            <i className="fa-solid fa-plus me-2" />Novo Item
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-body-pad" style={{ display: 'flex', gap: 12 }}>
          <input className="form-control" placeholder="Pesquisar..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} style={{ maxWidth: 260 }} />
          <select className="form-select" style={{ maxWidth: 180 }} value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-3">
        {filtered.length === 0 && <div className="col-12"><div className="small-muted">Sem itens.</div></div>}
        {filtered.map(i => {
          const disponivel = i.quantidadeDisponivel > 0;
          return (
            <div key={i.id} className="col-md-6 col-lg-4">
              <div className="card p-3 h-100">
                {i.imagemUrl && <img src={i.imagemUrl} alt={i.nome} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }} />}
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{i.nome}</h6>
                    <div className="small-muted">{i.categoria}{i.tamanho ? ' • ' + i.tamanho : ''}</div>
                  </div>
                  <span className={`badge ${disponivel ? 'text-bg-success' : 'text-bg-danger'}`}>{disponivel ? 'Disponível' : 'Indisponível'}</span>
                </div>
                <hr className="my-2" />
                <div className="small"><b>Total:</b> {i.quantidadeTotal}</div>
                <div className="small"><b>Disponível:</b> {i.quantidadeDisponivel}</div>
                <div className="small"><b>Preço aluguer:</b> €{Number(i.precoAluguer || 0).toFixed(2)}</div>
                {i.localizacao && <div className="small"><b>Localização:</b> {i.localizacao}</div>}
                {canRent && (
                  <div className="mt-3">
                    <button className={`btn btn-sm btn-outline-primary${disponivel ? '' : ' disabled'}`}
                      onClick={() => { setItemAluguer(i); setAlunoId(''); setShowAluguerModal(true); }}>
                      <i className="fa-solid fa-hand-holding-heart me-1" />Alugar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAluguerModal && itemAluguer && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Alugar: {itemAluguer.nome}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAluguerModal(false)} />
              </div>
              <form onSubmit={submitAluguer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Aluno *</label>
                    <select className="form-select" required value={alunoId} onChange={e => setAlunoId(e.target.value)}>
                      <option value="">Selecionar aluno</option>
                      {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAluguerModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Confirmar Aluguer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Item</h5>
                <button type="button" className="btn-close" onClick={() => setShowItemModal(false)} />
              </div>
              <form onSubmit={submitItem}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Nome *</label><input className="form-control" required value={itemForm.nome} onChange={e => setItemForm(f => ({ ...f, nome: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Categoria</label><input className="form-control" value={itemForm.categoria} onChange={e => setItemForm(f => ({ ...f, categoria: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Tamanho</label><input className="form-control" value={itemForm.tamanho} onChange={e => setItemForm(f => ({ ...f, tamanho: e.target.value }))} /></div>
                  <div className="row">
                    <div className="col mb-3"><label className="form-label">Qtd Total</label><input type="number" className="form-control" min={1} value={itemForm.quantidadeTotal} onChange={e => setItemForm(f => ({ ...f, quantidadeTotal: e.target.value }))} /></div>
                    <div className="col mb-3"><label className="form-label">Qtd Disponível</label><input type="number" className="form-control" min={0} value={itemForm.quantidadeDisponivel} onChange={e => setItemForm(f => ({ ...f, quantidadeDisponivel: e.target.value }))} /></div>
                  </div>
                  <div className="mb-3"><label className="form-label">Preço Aluguer (€)</label><input type="number" step="0.01" className="form-control" min={0} value={itemForm.precoAluguer} onChange={e => setItemForm(f => ({ ...f, precoAluguer: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Localização</label><input className="form-control" value={itemForm.localizacao} onChange={e => setItemForm(f => ({ ...f, localizacao: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Imagem</label><input type="file" className="form-control" accept=".jpg,.jpeg,.png,.webp" onChange={e => setItemForm(f => ({ ...f, imagem: e.target.files[0] || null }))} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Criar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
