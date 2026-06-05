'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { getUser } from '@/lib/auth';

function formatDT(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('pt-PT', { dateStyle: 'short' });
}

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ alunoId: '', valor: '', tipo: 'MANUAL', descricao: '', mes: '', ano: '' });
  const [msg, setMsg] = useState(null);

  const user = getUser();
  const role = user?.perfil || '';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  }

  const carregar = useCallback(async () => {
    try {
      const endpoint = isAdmin ? 'pagamentos' : 'pagamentos/meus';
      const data = await apiGet(endpoint);
      setPagamentos(data);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar pagamentos.', 'danger');
    }
  }, [isAdmin]);

  useEffect(() => {
    carregar();
    if (isAdmin) apiGet('alunos').then(setAlunos).catch(() => {});
  }, [carregar, isAdmin]);

  const filtered = pagamentos
    .filter(p => !filtro || String(p.estado || '').toUpperCase() === filtro)
    .filter(p => !pesquisa || ((p.nomeAluno || '') + ' ' + (p.descricao || '') + ' ' + (p.referencia || '')).toLowerCase().includes(pesquisa.toLowerCase()));

  async function submitForm(e) {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await apiPost('pagamentos', {
        alunoId: parseInt(form.alunoId, 10),
        valor: Number(form.valor),
        tipo: form.tipo,
        descricao: form.descricao || null,
        mes: form.mes ? parseInt(form.mes, 10) : null,
        ano: form.ano ? parseInt(form.ano, 10) : null,
      });
      setShowModal(false);
      setForm({ alunoId: '', valor: '', tipo: 'MANUAL', descricao: '', mes: '', ano: '' });
      showMsg('Pagamento criado.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao criar pagamento.', 'danger');
    }
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
              <tr><th>#</th><th>Aluno</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Mês/Ano</th><th>Data</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center small-muted">Sem pagamentos.</td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nomeAluno || '-'}</td>
                  <td>{p.tipo || '-'}</td>
                  <td>{p.descricao || p.referencia || '-'}</td>
                  <td>€{Number(p.valor || 0).toFixed(2)}</td>
                  <td>{p.mes && p.ano ? `${p.mes}/${p.ano}` : '-'}</td>
                  <td>{formatDT(p.dataPagamento || p.criadoEm)}</td>
                  <td>
                    <span className={`badge ${String(p.estado || '').toUpperCase() === 'PAGO' ? 'text-bg-success' : 'text-bg-warning'}`}>
                      {p.estado || '-'}
                    </span>
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
                  <div className="mb-3">
                    <label className="form-label">Aluno *</label>
                    <select className="form-select" required value={form.alunoId} onChange={e => setForm(f => ({ ...f, alunoId: e.target.value }))}>
                      <option value="">Selecionar aluno</option>
                      {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                    </select>
                  </div>
                  <div className="mb-3"><label className="form-label">Valor (€) *</label><input type="number" step="0.01" className="form-control" required min={0.01} value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} /></div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                      <option value="MANUAL">Manual</option>
                      <option value="MENSALIDADE">Mensalidade</option>
                      <option value="COACHING">Coaching</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className="form-label">Descrição</label><input className="form-control" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
                  <div className="row">
                    <div className="col mb-3"><label className="form-label">Mês</label><input type="number" className="form-control" min={1} max={12} placeholder="1-12" value={form.mes} onChange={e => setForm(f => ({ ...f, mes: e.target.value }))} /></div>
                    <div className="col mb-3"><label className="form-label">Ano</label><input type="number" className="form-control" min={2024} placeholder="2026" value={form.ano} onChange={e => setForm(f => ({ ...f, ano: e.target.value }))} /></div>
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
