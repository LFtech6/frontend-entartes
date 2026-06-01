'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

const PERFIS = ['ADMIN', 'SUPER_ADMIN', 'PROFESSOR', 'ENCARREGADO', 'ALUNO'];

export default function UtilizadoresPage() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [search, setSearch]     = useState('');
  const [perfil, setPerfil]     = useState('');
  const [ativo, setAtivo]       = useState('');
  const [msg, setMsg]           = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ email: '', perfil: 'PROFESSOR' });

  async function carregar() {
    try { setUtilizadores(await apiGet('utilizadores')); }
    catch (e) { flash(e.message, 'danger'); }
  }

  useEffect(() => { carregar(); }, []);

  function flash(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  }

  async function remover(id) {
    if (!confirm('Desativar este utilizador?')) return;
    try { await apiDelete(`utilizadores/${id}`); await carregar(); flash('Utilizador desativado.', 'success'); }
    catch (e) { flash(e.message, 'danger'); }
  }

  async function enviarConvite(e) {
    e.preventDefault();
    try {
      await apiPost('utilizadores/convite', form);
      setShowModal(false);
      setForm({ email: '', perfil: 'PROFESSOR' });
      flash('Convite enviado!', 'success');
    } catch (e) { flash(e.message, 'danger'); }
  }

  const filtered = utilizadores.filter(u => {
    const q = search.toLowerCase();
    const match = !q || `${u.nome} ${u.username} ${u.email}`.toLowerCase().includes(q);
    const matchPerfil = !perfil || (u.perfil || '').toUpperCase() === perfil;
    const matchAtivo = !ativo || String(u.ativo) === ativo;
    return match && matchPerfil && matchAtivo;
  });

  return (
    <>
      <div className="page-hdr">
        <div className="page-hdr-row">
          <div>
            <div className="page-eyebrow">Administração</div>
            <div className="page-title">Utilizadores</div>
            <div className="page-sub">Gestão de acessos e perfis</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-envelope me-1" /> Enviar Convite
          </button>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-hdr" style={{ flexWrap: 'wrap', gap: 8 }}>
          <input className="form-control" style={{ maxWidth: 220 }} placeholder="Pesquisar…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ maxWidth: 160 }} value={perfil} onChange={e => setPerfil(e.target.value)}>
            <option value="">Todos os perfis</option>
            {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-select" style={{ maxWidth: 140 }} value={ativo} onChange={e => setAtivo(e.target.value)}>
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="table mb-0">
            <thead>
              <tr><th>#</th><th>Nome</th><th>Username</th><th>Email</th><th>Perfil</th><th>Estado</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center small-muted">Sem utilizadores.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nome}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{(u.perfil || '').toUpperCase()}</td>
                  <td>
                    <span className={`badge ${u.ativo ? 'green' : 'grey'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn del" title="Desativar" onClick={() => remover(u.id)}>
                        <i className="fa-solid fa-power-off" />
                      </button>
                    </div>
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
                <h5 className="modal-title">Enviar Convite</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={enviarConvite}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" required value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Perfil *</label>
                    <select className="form-select" value={form.perfil}
                      onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}>
                      {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Enviar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
