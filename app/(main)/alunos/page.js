'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

function isAdult(dateStr) {
  if (!dateStr) return false;
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 18;
}

const EMPTY_FORM = { nome: '', dataNascimento: '', email: '', telefone: '' };

export default function AlunosPage() {
  const [alunos, setAlunos]   = useState([]);
  const [search, setSearch]   = useState('');
  const [form, setForm]       = useState(EMPTY_FORM);
  const [msg, setMsg]         = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);

  async function carregar() {
    try {
      const data = await apiGet('alunos');
      setAlunos(data);
    } catch (e) {
      showMsg(e.message, 'danger');
    }
  }

  useEffect(() => { carregar(); }, []);

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiPost('alunos', { ...form, ativo: true });
      setShowModal(false);
      setForm(EMPTY_FORM);
      await carregar();
    } catch (e) {
      showMsg(e.message, 'danger');
    }
  }

  async function remover(id) {
    if (!confirm('Remover este aluno?')) return;
    try {
      await apiDelete(`alunos/${id}`);
      await carregar();
    } catch (e) {
      showMsg(e.message, 'danger');
    }
  }

  const filtered = alunos.filter(a =>
    !search || (a.nome || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-hdr">
        <div className="page-hdr-row">
          <div>
            <div className="page-eyebrow">Gestão</div>
            <div className="page-title">Alunos</div>
            <div className="page-sub">Lista de todos os alunos registados</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-plus me-1" /> Novo Aluno
          </button>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-hdr">
          <input
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Pesquisar aluno…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table className="table mb-0">
            <thead>
              <tr><th>#</th><th>Nome</th><th>Nascimento</th><th>Adulto</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center small-muted">Sem alunos.</td></tr>
              ) : filtered.map(a => {
                const nasc = (a.dataNascimento || a.nascimento || '').substring(0, 10);
                return (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.nome}</td>
                    <td>{nasc || '-'}</td>
                    <td>{nasc ? (isAdult(nasc) ? 'Sim' : 'Não') : '-'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn del" title="Remover" onClick={() => remover(a.id)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal novo aluno */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Aluno</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome *</label>
                    <input className="form-control" required value={form.nome}
                      onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data de Nascimento</label>
                    <input type="date" className="form-control" value={form.dataNascimento}
                      onChange={e => setForm(f => ({ ...f, dataNascimento: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telefone</label>
                    <input type="tel" className="form-control" value={form.telefone}
                      onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
