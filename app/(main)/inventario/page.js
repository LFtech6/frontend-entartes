'use client';
import { useState } from 'react';
import { getUser } from '@/lib/auth';

const SEED = [
  { id: 1, nome: 'Traje Ballet Rosa',   categoria: 'Trajes',     tamanho: 'S',  qtdTotal: 3, qtdDisp: 2, preco: 12.5, ativo: true },
  { id: 2, nome: 'Sapatos Flamenco',    categoria: 'Sapatos',    tamanho: '36', qtdTotal: 2, qtdDisp: 1, preco: 8.0,  ativo: true },
  { id: 3, nome: 'Tiara brilhante',     categoria: 'Acessórios', tamanho: '',   qtdTotal: 5, qtdDisp: 5, preco: 3.5,  ativo: true },
];

export default function InventarioPage() {
  const [itens, setItens] = useState(SEED);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAluguerModal, setShowAluguerModal] = useState(false);
  const [itemAluguer, setItemAluguer] = useState(null);
  const [aluguerForm, setAluguerForm] = useState({ inicio: '', fim: '' });
  const [itemForm, setItemForm] = useState({ nome: '', categoria: '', tamanho: '', qtdTotal: 0, qtdDisp: 0, preco: 0 });
  const [msg, setMsg] = useState(null);

  const user = getUser();
  const role = user?.perfil || '';
  const podeAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const canRent = role === 'ENCARREGADO' || podeAdmin;

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  }

  const filtered = itens
    .filter(i => i.ativo !== false)
    .filter(i => !filtroCat || i.categoria === filtroCat)
    .filter(i => !pesquisa || (i.nome + ' ' + (i.categoria || '')).toLowerCase().includes(pesquisa.toLowerCase()));

  const categorias = [...new Set(itens.map(i => i.categoria).filter(Boolean))];

  function remover(id) {
    if (!podeAdmin) return;
    if (!confirm('Remover este item do inventário?')) return;
    setItens(prev => prev.filter(i => i.id !== id));
    showMsg('Item removido.', 'success');
  }

  function abrirAluguer(id) {
    const item = itens.find(x => x.id === id);
    if (!item) return;
    setItemAluguer(item);
    const hoje = new Date().toISOString().substring(0, 10);
    setAluguerForm({ inicio: hoje, fim: hoje });
    setShowAluguerModal(true);
  }

  function submitAluguer(e) {
    e.preventDefault();
    setShowAluguerModal(false);
    showMsg('Pedido de aluguer enviado (mock).', 'success');
  }

  function submitItem(e) {
    e.preventDefault();
    const novo = { ...itemForm, id: Math.max(0, ...itens.map(x => x.id)) + 1, ativo: true, qtdTotal: Number(itemForm.qtdTotal), qtdDisp: Number(itemForm.qtdDisp), preco: Number(itemForm.preco) };
    setItens(prev => [novo, ...prev]);
    setShowItemModal(false);
    setItemForm({ nome: '', categoria: '', tamanho: '', qtdTotal: 0, qtdDisp: 0, preco: 0 });
    showMsg('Item criado.', 'success');
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
          const disponivel = i.qtdDisp > 0;
          return (
            <div key={i.id} className="col-md-6 col-lg-4">
              <div className="card p-3 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{i.nome}</h6>
                    <div className="small-muted">{i.categoria}{i.tamanho ? ' • ' + i.tamanho : ''}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${disponivel ? 'text-bg-success' : 'text-bg-danger'}`}>{disponivel ? 'Disponível' : 'Indisponível'}</span>
                    {podeAdmin && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remover(i.id)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    )}
                  </div>
                </div>
                <hr className="my-2" />
                <div className="small"><b>Total:</b> {i.qtdTotal}</div>
                <div className="small"><b>Disponível:</b> {i.qtdDisp}</div>
                <div className="small"><b>Preço:</b> €{Number(i.preco).toFixed(2)}</div>
                {canRent && (
                  <div className="mt-3">
                    <button className={`btn btn-sm btn-outline-primary${disponivel ? '' : ' disabled'}`} onClick={() => abrirAluguer(i.id)}>
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
                <h5 className="modal-title">Pedido de Aluguer</h5>
                <button type="button" className="btn-close" onClick={() => setShowAluguerModal(false)} />
              </div>
              <form onSubmit={submitAluguer}>
                <div className="modal-body">
                  <div className="mb-2"><b>Item:</b> {itemAluguer.nome}</div>
                  <div className="mb-3"><b>Tamanho:</b> {itemAluguer.tamanho || '-'}</div>
                  <div className="mb-3"><label className="form-label">Data início</label><input type="date" className="form-control" required value={aluguerForm.inicio} onChange={e => setAluguerForm(f => ({ ...f, inicio: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Data fim</label><input type="date" className="form-control" required value={aluguerForm.fim} onChange={e => setAluguerForm(f => ({ ...f, fim: e.target.value }))} /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAluguerModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Enviar Pedido</button>
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
                    <div className="col mb-3"><label className="form-label">Qtd Total</label><input type="number" className="form-control" min={0} value={itemForm.qtdTotal} onChange={e => setItemForm(f => ({ ...f, qtdTotal: e.target.value }))} /></div>
                    <div className="col mb-3"><label className="form-label">Qtd Disponível</label><input type="number" className="form-control" min={0} value={itemForm.qtdDisp} onChange={e => setItemForm(f => ({ ...f, qtdDisp: e.target.value }))} /></div>
                  </div>
                  <div className="mb-3"><label className="form-label">Preço (€)</label><input type="number" step="0.01" className="form-control" min={0} value={itemForm.preco} onChange={e => setItemForm(f => ({ ...f, preco: e.target.value }))} /></div>
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
