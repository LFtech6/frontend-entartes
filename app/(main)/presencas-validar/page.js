'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';

function formatDate(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return String(dt).replace('T', ' ').substring(0, 16);
  return d.toLocaleString('pt-PT');
}

export default function PresencasValidarPage() {
  const [pendentes, setPendentes] = useState([]);
  const [msg, setMsg] = useState(null);

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  }

  const carregar = useCallback(async () => {
    try {
      const data = await apiGet('sessoes/pendentes-confirmacao');
      setPendentes(data);
    } catch (e) {
      showMsg('Erro a carregar confirmações pendentes.', 'danger');
      setPendentes([]);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function confirmar(sessaoId, alunoId, vai) {
    try {
      await apiPost(`sessoes/${sessaoId}/confirmar`, { alunoId, vai });
      showMsg('Confirmação registada com sucesso.', 'success');
      carregar();
    } catch (e) {
      showMsg('Erro ao registar confirmação.', 'danger');
    }
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Confirmação</div>
          <div className="page-title">Validar Presenças</div>
          <div className="page-sub">Validação de presenças pelo encarregado</div>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card">
        <div className="card-body-pad" style={{ overflowX: 'auto' }}>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Professor</th>
                <th>Início</th>
                <th>Fim</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendentes.length === 0 && (
                <tr><td colSpan={6} className="text-center small-muted">Sem sessões pendentes de confirmação.</td></tr>
              )}
              {pendentes.map(p => (
                <tr key={`${p.sessaoId}-${p.alunoId}`}>
                  <td>{p.alunoNome}</td>
                  <td>{p.turmaNome || '-'}</td>
                  <td>{p.professorNome || '-'}</td>
                  <td>{formatDate(p.dataInicio)}</td>
                  <td>{formatDate(p.dataFim)}</td>
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => confirmar(p.sessaoId, p.alunoId, true)}>
                      <i className="fa-solid fa-check me-1" />Sim
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => confirmar(p.sessaoId, p.alunoId, false)}>
                      <i className="fa-solid fa-xmark me-1" />Não
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
