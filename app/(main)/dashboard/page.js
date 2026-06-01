'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function DashboardPage() {
  const [kpiAlunos, setKpiAlunos] = useState('—');
  const user = getUser ? getUser() : null;

  useEffect(() => {
    apiGet('alunos/count')
      .then(d => setKpiAlunos(d?.total ?? '—'))
      .catch(() => setKpiAlunos('-'));
  }, []);

  const proximasSessoes = [
    { turma: 'Ballet Iniciados',       data: '2026-06-05', hora: '18:00', estado: 'Agendada' },
    { turma: 'Hip Hop Teens',          data: '2026-06-05', hora: '19:30', estado: 'Agendada' },
    { turma: 'Contemporâneo Adultos',  data: '2026-06-06', hora: '18:00', estado: 'Cancelada' },
  ];

  return (
    <>
      <div className="page-hdr">
        <div className="page-hdr-row">
          <div>
            <div className="page-eyebrow">Visão Geral</div>
            <div className="page-title">Dashboard</div>
            <div className="page-sub">Bem-vindo ao portal da Ent&apos;Artes</div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon-wrap teal"><i className="fa-solid fa-user-graduate" /></div>
            <div className="stat-val">{kpiAlunos}</div>
            <div className="stat-lbl">Total de alunos</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card gold">
            <div className="stat-icon-wrap gold"><i className="fa-solid fa-users" /></div>
            <div className="stat-val">—</div>
            <div className="stat-lbl">Turmas ativas</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card neutral">
            <div className="stat-icon-wrap grey"><i className="fa-solid fa-bell" /></div>
            <div className="stat-val">—</div>
            <div className="stat-lbl">Notificações por ler</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-hdr">
              <div>
                <div className="card-title">Próximas sessões</div>
                <div className="card-sub">Calendário rápido</div>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr><th>Turma</th><th>Data</th><th>Hora</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {proximasSessoes.map((s, i) => (
                    <tr key={i}>
                      <td>{s.turma}</td>
                      <td>{s.data}</td>
                      <td>{s.hora}</td>
                      <td>{s.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Ações rápidas</div>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a className="btn btn-outline-secondary w-100" href="/sessoes">
                <i className="fa-solid fa-plus me-2" />Criar sessão
              </a>
              <a className="btn btn-outline-secondary w-100" href="/eventos">
                <i className="fa-solid fa-bullhorn me-2" />Publicar evento
              </a>
              <a className="btn btn-outline-secondary w-100" href="/notificacoes">
                <i className="fa-solid fa-bell me-2" />Ver notificações
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
