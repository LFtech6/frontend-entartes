'use client';
import { useState, useEffect } from 'react';
import { getUser } from '@/lib/auth';

const SEED = [
  { id: 1, aluno: 'Maria Silva', desc: 'Mensalidade Fevereiro', valor: 25.00, venc: '2026-02-10', estado: 'PENDENTE' },
  { id: 2, aluno: 'João Costa',  desc: 'Aluguer Traje',         valor: 12.50, venc: '2026-02-05', estado: 'PAGO'     },
  { id: 3, aluno: 'Inês Rocha',  desc: 'Mensalidade Março',     valor: 25.00, venc: '2026-03-10', estado: 'PENDENTE' },
];

function loadPays() { try { return JSON.parse(localStorage.getItem('pagamentos') || '[]'); } catch { return []; } }
function savePays(arr) { localStorage.setItem('pagamentos', JSON.stringify(arr)); }

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ aluno: '', desc: '', valor: 0, venc: '', estado: 'PENDENTE' });
  const [msg, setMsg] = useState(null);

  const user = getUser();
  const role = user?.perfil || '';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2200);
  }

  useEffect(() => {
    let stored = loadPays();
    if (!stored.length) { stored = SEED; savePays(stored); }
    setPagamentos(stored);
  }, []);

  const filtered = pagamentos
    .filter(p => isAdmin || role === 'ENCARREGADO')
    .filter(p => !filtro || p.estado === filtro)
    .filter(p => !pesquisa || ((p.aluno || '') + ' ' + (p.desc || '')).toLowerCase().includes(pesquisa.toLowerCase()))
    .sort((a, b) => a.id - b.id);

  function update(id, changes) {
    const updated = pagamentos.map(p => p.id === id ? { ...p, ...changes } : p);
    setPagamentos(updated);
    savePays(updated);
  }

  function pagar(id) {
    update(id, { estado: 'PAGO' });
    showMsg('Pagamento efetuado (mock).', 'success');
  }

  function marcarPago(id) {
    if (!isAdmin) return;
    update(id, { estado: 'PAGO' });
    showMsg('Marcado como pago.', 'success');
  }

  function remover(id) {
    if (!isAdmin) return;
    if (!confirm('Remover pagamento?')) return;
    const updated = pagamentos.filter(p => p.id !== id);
    setPagamentos(updated);
    savePays(updated);
    showMsg('Pagamento removido.', 'success');
  }

  function submitForm(e) {
    e.preventDefault();
    if (!isAdmin) return;
    const novo = { ...form, id: Math.max(0, ...pagamentos.map(x => x.id)) + 1, valor: Number(form.valor) };
    const updated = [novo, ...pagamentos];
    setPagamentos(updated);
    savePays(updated);
    setShowModal(false);
    setForm({ aluno: '', desc: '', valor: 0, venc: '', estado: 'PENDENTE' });
    showMsg('Pagamento criado.', 'success');
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Financeiro</div>
          <div className="page-title">Pagamentos</div>
          <div className="page-sub">Mensalidades e faturas</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-plus me-2" />Novo Pagamento
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-body-pad" style={{ display: 'flex', gap: 12 }}>
          <input className="form-control" placeholder="Pesquisar..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} style={{ maxWidth: 260 }} />
          <select className="form-select" style={{ maxWidth: 160 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Todos os estados</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body-pad" style={{ overflowX: 'auto' }}>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>#</th><th>Aluno</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center small-muted">Sem registos.</td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.aluno}</td>
                  <td>{p.desc}</td>
                  <td>€{Number(p.valor).toFixed(2)}</td>
                  <td>{p.venc}</td>
                  <td><span className={`badge ${p.estado === 'PAGO' ? 'text-bg-success' : 'text-bg-warning'}`}>{p.estado === 'PAGO' ? 'Pago' : 'Pendente'}</span></td>
                  <td className="text-nowrap">
                    {role === 'ENCARREGADO' && p.estado === 'PENDENTE' && (
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => pagar(p.id)}>
                        <i className="fa-solid fa-credit-card me-1" />Pagar
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button className="btn btn-sm btn-outline-success me-2" onClick={() => marcarPago(p.id)}>
                          <i className="fa-solid fa-check" /> Marcar pago
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remover(p.id)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Pagamento</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={submitForm}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Aluno *</label><input className="form-control" required value={form.aluno} onChange={e => setForm(f => ({ ...f, aluno: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Descrição *</label><input className="form-control" required value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Valor (€)</label><input type="number" step="0.01" className="form-control" min={0} value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Vencimento</label><input type="date" className="form-control" value={form.venc} onChange={e => setForm(f => ({ ...f, venc: e.target.value }))} /></div>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
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
