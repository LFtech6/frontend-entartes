'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

function formatDT(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

export default function PresencasPage() {
  const [sessoes, setSessoes] = useState([]);
  const [sessaoId, setSessaoId] = useState('');
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [alunoParaAdd, setAlunoParaAdd] = useState('');
  const [linhas, setLinhas] = useState([]);
  const [msg, setMsg] = useState(null);

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }

  const carregarSessoes = useCallback(async () => {
    try {
      const data = await apiGet('sessoes');
      setSessoes(data);
      if (data.length) setSessaoId(String(data[0].id));
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar sessões.', 'danger');
    }
  }, []);

  const carregarTodosAlunos = useCallback(async () => {
    try {
      const data = await apiGet('alunos');
      setTodosAlunos(data);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar alunos.', 'danger');
    }
  }, []);

  useEffect(() => {
    carregarSessoes();
    carregarTodosAlunos();
  }, [carregarSessoes, carregarTodosAlunos]);

  const carregarAlunosSessao = useCallback(async (id) => {
    if (!id) return;
    try {
      const alunosSessao = await apiGet(`sessoes/${id}/alunos`);
      let presencas = [];
      try { presencas = await apiGet(`sessoes/${id}/presencas`); } catch { presencas = []; }
      setLinhas(alunosSessao.map(a => {
        const p = presencas.find(x => x.alunoId === a.alunoId);
        return { alunoId: a.alunoId, nomeAluno: a.nomeAluno, presente: p ? !!p.presente : false };
      }));
    } catch (err) {
      setLinhas([]);
      showMsg(err.message || 'Erro ao carregar alunos da sessão.', 'danger');
    }
  }, []);

  useEffect(() => {
    if (sessaoId) carregarAlunosSessao(sessaoId);
  }, [sessaoId, carregarAlunosSessao]);

  function togglePresenca(index, checked) {
    setLinhas(prev => prev.map((l, i) => i === index ? { ...l, presente: checked } : l));
  }

  async function adicionarAluno() {
    if (!sessaoId) { showMsg('Seleciona uma sessão.', 'warning'); return; }
    if (!alunoParaAdd) { showMsg('Seleciona um aluno.', 'warning'); return; }
    try {
      await apiPost(`sessoes/${sessaoId}/alunos`, { alunoId: parseInt(alunoParaAdd, 10) });
      showMsg('Aluno adicionado à sessão.', 'success');
      carregarAlunosSessao(sessaoId);
    } catch (err) {
      showMsg(err.message || 'Erro ao adicionar aluno.', 'danger');
    }
  }

  async function removerAluno(alunoId) {
    if (!sessaoId || !confirm('Remover aluno desta sessão?')) return;
    try {
      await apiDelete(`sessoes/${sessaoId}/alunos/${alunoId}`);
      showMsg('Aluno removido da sessão.', 'success');
      carregarAlunosSessao(sessaoId);
    } catch (err) {
      showMsg(err.message || 'Erro ao remover aluno.', 'danger');
    }
  }

  async function guardarPresencas() {
    if (!sessaoId) { showMsg('Seleciona uma sessão.', 'warning'); return; }
    if (!linhas.length) { showMsg('Não há alunos nesta sessão.', 'warning'); return; }
    try {
      await apiPost(`sessoes/${sessaoId}/presencas`, linhas.map(l => ({ alunoId: l.alunoId, presente: !!l.presente })));
      showMsg('Presenças guardadas com sucesso.', 'success');
      carregarAlunosSessao(sessaoId);
    } catch (err) {
      showMsg(err.message || 'Erro ao guardar presenças.', 'danger');
    }
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Controlo</div>
          <div className="page-title">Presenças</div>
          <div className="page-sub">Registo de presenças nas aulas</div>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-body-pad">
          <div className="mb-3">
            <label className="form-label">Sessão</label>
            <select className="form-select" value={sessaoId} onChange={e => setSessaoId(e.target.value)}>
              {sessoes.map(s => (
                <option key={s.id} value={s.id}>#{s.id} - {formatDT(s.inicio)} - {s.estado ?? ''}</option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select" value={alunoParaAdd} onChange={e => setAlunoParaAdd(e.target.value)}>
              <option value="">Selecionar aluno</option>
              {todosAlunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
            <button className="btn btn-outline-secondary" onClick={adicionarAluno}>Adicionar</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body-pad">
          <table className="table table-sm">
            <thead>
              <tr><th>#</th><th>Nome</th><th className="text-center">Presente</th><th></th></tr>
            </thead>
            <tbody>
              {linhas.length === 0 && <tr><td colSpan={4} className="text-center">Sem alunos nesta sessão.</td></tr>}
              {linhas.map((l, i) => (
                <tr key={l.alunoId}>
                  <td>{l.alunoId}</td>
                  <td>{l.nomeAluno}</td>
                  <td className="text-center">
                    <input type="checkbox" className="form-check-input" checked={l.presente} onChange={e => togglePresenca(i, e.target.checked)} />
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removerAluno(l.alunoId)}>
                      <i className="fa-solid fa-trash me-1" />Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-primary mt-2" onClick={guardarPresencas}>
            <i className="fa-solid fa-floppy-disk me-2" />Guardar Presenças
          </button>
        </div>
      </div>
    </>
  );
}
