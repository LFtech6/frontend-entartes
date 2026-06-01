'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

const EMPTY_FORM = { nome: '', professorUtilizadorId: '', tipoAulaId: '' };

export default function TurmasPage() {
  const [turmas, setTurmas]           = useState([]);
  const [professores, setProfessores] = useState([]);
  const [tipos, setTipos]             = useState([]);
  const [alunos, setAlunos]           = useState([]);
  const [search, setSearch]           = useState('');
  const [msg, setMsg]                 = useState({ text: '', type: '' });
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [detalhe, setDetalhe]         = useState(null); // { turmaId, nome, alunos }
  const [selectAluno, setSelectAluno] = useState('');

  function flash(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  }

  async function carregar() {
    try {
      const [t, p, tp, a] = await Promise.all([
        apiGet('turmas'), apiGet('utilizadores/professores'),
        apiGet('config/tipo-aula'), apiGet('alunos'),
      ]);
      setTurmas(t); setProfessores(p); setTipos(tp); setAlunos(a);
    } catch (e) { flash(e.message, 'danger'); }
  }

  useEffect(() => { carregar(); }, []);

  async function criarTurma(e) {
    e.preventDefault();
    try {
      await apiPost('turmas', {
        nome: form.nome,
        professorUtilizadorId: form.professorUtilizadorId ? +form.professorUtilizadorId : null,
        tipoAulaId: form.tipoAulaId ? +form.tipoAulaId : null,
      });
      setShowModal(false); setForm(EMPTY_FORM);
      await carregar(); flash('Turma criada.', 'success');
    } catch (e) { flash(e.message, 'danger'); }
  }

  async function abrirDetalhe(turma) {
    try {
      const alunosTurma = await apiGet(`turmas/${turma.id}/alunos`);
      setDetalhe({ turmaId: turma.id, nome: turma.nome, alunos: alunosTurma });
    } catch (e) { flash(e.message, 'danger'); }
  }

  async function adicionarAluno() {
    if (!detalhe || !selectAluno) return;
    try {
      await apiPost(`turmas/${detalhe.turmaId}/alunos`, { alunoId: +selectAluno });
      const updated = await apiGet(`turmas/${detalhe.turmaId}/alunos`);
      setDetalhe(d => ({ ...d, alunos: updated }));
      setSelectAluno('');
    } catch (e) { flash(e.message, 'danger'); }
  }

  async function removerAluno(alunoId) {
    if (!detalhe) return;
    try {
      await apiDelete(`turmas/${detalhe.turmaId}/alunos/${alunoId}`);
      setDetalhe(d => ({ ...d, alunos: d.alunos.filter(a => a.alunoId !== alunoId) }));
    } catch (e) { flash(e.message, 'danger'); }
  }

  const filtered = turmas.filter(t => {
    const q = search.toLowerCase();
    return !q || `${t.nome} ${t.professorNome || ''} ${t.tipoAulaNome || ''}`.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="page-hdr">
        <div className="page-hdr-row">
          <div>
            <div className="page-eyebrow">Gestão</div>
            <div className="page-title">Turmas</div>
            <div className="page-sub">Organização de turmas e alunos</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-plus me-1" /> Nova Turma
          </button>
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-hdr">
          <input className="form-control" style={{ maxWidth: 280 }} placeholder="Pesquisar turma…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="table mb-0">
            <thead>
              <tr><th>#</th><th>Nome</th><th>Professor</th><th>Tipo de Aula</th><th>Ativa</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center small-muted">Sem turmas.</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.nome}</td>
                  <td>{t.professorNome || '-'}</td>
                  <td>{t.tipoAulaNome || '-'}</td>
                  <td>{t.ativa ? 'Sim' : 'Não'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => abrirDetalhe(t)}>
                      Alunos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalhe turma */}
      {detalhe && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Alunos da Turma: {detalhe.nome}</div>
            <button className="btn btn-sm btn-secondary" onClick={() => setDetalhe(null)}>Fechar</button>
          </div>
          <div className="card-body-pad">
            <div className="d-flex gap-2 mb-3">
              <select className="form-select" style={{ maxWidth: 260 }} value={selectAluno}
                onChange={e => setSelectAluno(e.target.value)}>
                <option value="">Selecionar aluno…</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <button className="btn btn-primary" onClick={adicionarAluno}>Adicionar</button>
            </div>
            <table className="table mb-0">
              <thead><tr><th>#</th><th>Nome</th><th></th></tr></thead>
              <tbody>
                {(detalhe.alunos || []).length === 0 ? (
                  <tr><td colSpan={3} className="text-center small-muted">Sem alunos nesta turma.</td></tr>
                ) : (detalhe.alunos || []).map(a => (
                  <tr key={a.alunoId}>
                    <td>{a.alunoId}</td>
                    <td>{a.nomeAluno || '-'}</td>
                    <td>
                      <button className="action-btn del" onClick={() => removerAluno(a.alunoId)}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal nova turma */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nova Turma</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={criarTurma}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome *</label>
                    <input className="form-control" required value={form.nome}
                      onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Professor</label>
                    <select className="form-select" value={form.professorUtilizadorId}
                      onChange={e => setForm(f => ({ ...f, professorUtilizadorId: e.target.value }))}>
                      <option value="">Selecionar professor</option>
                      {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Aula</label>
                    <select className="form-select" value={form.tipoAulaId}
                      onChange={e => setForm(f => ({ ...f, tipoAulaId: e.target.value }))}>
                      <option value="">Selecionar tipo</option>
                      {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
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
