'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { getUser } from '@/lib/auth';

function formatDT(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

export default function CoachingsPage() {
  const [lista, setLista] = useState([]);
  const [educandos, setEducandos] = useState([]);
  const [sessaoId, setSessaoId] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState(null);
  const user = getUser();
  const perfil = user?.perfil || '';

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }

  const carregar = useCallback(async () => {
    try {
      const data = await apiGet('sessoes/abertas');
      setLista(data);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar coachings.', 'danger');
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function inscreverMe(id) {
    try {
      await apiPost(`sessoes/${id}/inscrever-me`, {});
      showMsg('Inscrição efetuada com sucesso.', 'success');
    } catch (err) {
      showMsg(err.message || 'Erro ao inscrever.', 'danger');
    }
  }

  async function abrirModalEducandos(id) {
    setSessaoId(id);
    setSelecionados([]);
    try {
      const data = await apiGet('alunos/meus-educandos');
      setEducandos(data);
      setShowModal(true);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar educandos.', 'danger');
    }
  }

  async function inscreverEducandos(e) {
    e.preventDefault();
    if (!selecionados.length) { showMsg('Seleciona pelo menos um educando.', 'warning'); return; }
    try {
      await apiPost(`sessoes/${sessaoId}/inscrever-educandos`, { alunoIds: selecionados });
      setShowModal(false);
      showMsg('Educandos inscritos com sucesso.', 'success');
    } catch (err) {
      showMsg(err.message || 'Erro ao inscrever educandos.', 'danger');
    }
  }

  function toggleEdu(id) {
    setSelecionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Sessões</div>
          <div className="page-title">Coachings</div>
          <div className="page-sub">Aulas individuais e coachings disponíveis</div>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-body-pad">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Estado</th>
                <th>Sumário</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr><td colSpan={6} className="text-center">Sem coachings disponíveis.</td></tr>
              )}
              {lista.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{formatDT(s.inicio)}</td>
                  <td>{formatDT(s.fim)}</td>
                  <td>{s.estado}</td>
                  <td>{s.sumario || '-'}</td>
                  <td>
                    {perfil === 'ALUNO' && (
                      <button className="btn btn-sm btn-primary" onClick={() => inscreverMe(s.id)}>Inscrever-me</button>
                    )}
                    {perfil === 'ENCARREGADO' && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => abrirModalEducandos(s.id)}>Inscrever educando</button>
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
                <h5 className="modal-title">Inscrever Educandos</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={inscreverEducandos}>
                <div className="modal-body">
                  {educandos.length === 0 && <div className="text-muted">Não tens educandos associados.</div>}
                  {educandos.map(e => (
                    <div key={e.id} className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id={`edu_${e.id}`}
                        checked={selecionados.includes(e.id)}
                        onChange={() => toggleEdu(e.id)} />
                      <label className="form-check-label" htmlFor={`edu_${e.id}`}>{e.nome}</label>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Inscrever</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
