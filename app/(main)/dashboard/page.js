'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { getUser } from '@/lib/auth';

function formatDT(dt) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

function BadgeEstado({ estado }) {
  const e = String(estado || '').toUpperCase();
  if (e === 'PAGO')      return <span className="badge text-bg-success">Pago</span>;
  if (e === 'PENDENTE')  return <span className="badge text-bg-warning">Pendente</span>;
  if (e === 'AGENDADA')  return <span className="badge text-bg-primary">Agendada</span>;
  if (e === 'TERMINADA') return <span className="badge text-bg-success">Terminada</span>;
  if (e === 'CANCELADA' || e === 'CANCELADO') return <span className="badge text-bg-danger">Cancelado</span>;
  return <span className="badge text-bg-secondary">{estado || '-'}</span>;
}

async function safeGet(endpoint, fallback = []) {
  try { return await apiGet(endpoint); } catch { return fallback; }
}

export default function DashboardPage() {
  const user = getUser();
  const role = user?.perfil || '';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isEEorAluno = role === 'ENCARREGADO' || role === 'ALUNO';

  const [kpis, setKpis] = useState({ alunos: '—', turmas: '—', sessoes: '—', coachings: '—', pagPendentes: '—', valorPendente: '—', stockBaixo: '—' });
  const [proximas, setProximas] = useState([]);
  const [coachingsDash, setCoachingsDash] = useState([]);
  const [pagamentosDash, setPagamentosDash] = useState([]);
  const [eventosDash, setEventosDash] = useState([]);

  useEffect(() => {
    async function load() {
      const [alunosCount, turmas, sessoes, coachings, eventos, pagamentos] = await Promise.all([
        safeGet('alunos/count', { total: 0 }),
        safeGet('turmas', []),
        safeGet('sessoes', []),
        safeGet('sessoes/abertas', []),
        safeGet('eventos', []),
        isAdmin ? safeGet('pagamentos', []) : isEEorAluno ? safeGet('pagamentos/meus', []) : Promise.resolve([]),
      ]);

      const pendentes = pagamentos.filter(p => String(p.estado || '').toUpperCase() === 'PENDENTE');
      const totalPendente = pendentes.reduce((acc, p) => acc + Number(p.valor || 0), 0);

      setKpis({
        alunos: alunosCount?.total ?? 0,
        turmas: turmas.filter(t => t.ativa !== false).length,
        sessoes: sessoes.filter(s => !s.foiDada && !s.inscricaoAberta).length,
        coachings: coachings.length,
        pagPendentes: pendentes.length,
        valorPendente: `€${totalPendente.toFixed(2)}`,
        stockBaixo: '—',
      });

      setProximas(sessoes.filter(s => !s.foiDada).sort((a, b) => new Date(a.inicio) - new Date(b.inicio)).slice(0, 6));
      setCoachingsDash(coachings.slice(0, 5));
      setPagamentosDash(pendentes.slice(0, 6));
      setEventosDash(eventos.filter(e => new Date(e.dataInicio) >= new Date()).sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio)).slice(0, 5));
    }
    load();
  }, []);

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

      {/* KPIs */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'fa-user-graduate', val: kpis.alunos,       lbl: 'Total de alunos',        color: 'teal' },
          { icon: 'fa-users',         val: kpis.turmas,        lbl: 'Turmas ativas',           color: 'gold' },
          { icon: 'fa-chalkboard',    val: kpis.sessoes,       lbl: 'Aulas por dar',           color: 'teal' },
          { icon: 'fa-person-running',val: kpis.coachings,     lbl: 'Coachings abertos',       color: 'gold' },
          { icon: 'fa-euro-sign',     val: kpis.pagPendentes,  lbl: 'Pagamentos pendentes',    color: 'red'  },
          { icon: 'fa-coins',         val: kpis.valorPendente, lbl: 'Valor em dívida',         color: 'red'  },
        ].map((k, i) => (
          <div key={i} className="col-md-4 col-lg-2">
            <div className="stat-card">
              <div className={`stat-icon-wrap ${k.color}`}><i className={`fa-solid ${k.icon}`} /></div>
              <div className="stat-val">{k.val}</div>
              <div className="stat-lbl">{k.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        {/* Próximas aulas */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Próximas Aulas</div></div>
            <div className="table-wrap">
              <table className="table table-sm mb-0">
                <thead><tr><th>Turma</th><th>Início</th><th>Professor</th><th>Estado</th></tr></thead>
                <tbody>
                  {proximas.length === 0
                    ? <tr><td colSpan={4} className="text-center small-muted">Sem próximas aulas.</td></tr>
                    : proximas.map(s => (
                      <tr key={s.id}>
                        <td>{s.turmaNome || (s.inscricaoAberta ? 'Coaching' : '-')}</td>
                        <td>{formatDT(s.inicio)}</td>
                        <td>{s.professorNome || '-'}</td>
                        <td><BadgeEstado estado={s.estado} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coachings abertos */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Coachings Abertos</div></div>
            <div className="table-wrap">
              <table className="table table-sm mb-0">
                <thead><tr><th>Início</th><th>Sumário</th><th>Preço</th><th>Estado</th></tr></thead>
                <tbody>
                  {coachingsDash.length === 0
                    ? <tr><td colSpan={4} className="text-center small-muted">Sem coachings abertos.</td></tr>
                    : coachingsDash.map(c => (
                      <tr key={c.id}>
                        <td>{formatDT(c.inicio)}</td>
                        <td>{c.sumario || '-'}</td>
                        <td>€{Number(c.precoCoaching || 0).toFixed(2)}</td>
                        <td><BadgeEstado estado={c.estado} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Pagamentos pendentes */}
        {(isAdmin || isEEorAluno) && (
          <div className="col-lg-6">
            <div className="card">
              <div className="card-hdr"><div className="card-title">Pagamentos Pendentes</div></div>
              <div className="table-wrap">
                <table className="table table-sm mb-0">
                  <thead><tr><th>Aluno</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr></thead>
                  <tbody>
                    {pagamentosDash.length === 0
                      ? <tr><td colSpan={4} className="text-center small-muted">Sem pagamentos pendentes.</td></tr>
                      : pagamentosDash.map((p, i) => (
                        <tr key={i}>
                          <td>{p.nomeAluno || '-'}</td>
                          <td>{p.tipo || '-'}</td>
                          <td>{p.descricao || p.referencia || '-'}</td>
                          <td>€{Number(p.valor || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Próximos eventos */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Próximos Eventos</div></div>
            <div className="table-wrap">
              <table className="table table-sm mb-0">
                <thead><tr><th>Título</th><th>Data</th><th>Local</th></tr></thead>
                <tbody>
                  {eventosDash.length === 0
                    ? <tr><td colSpan={3} className="text-center small-muted">Sem próximos eventos.</td></tr>
                    : eventosDash.map(e => (
                      <tr key={e.id}>
                        <td>{e.titulo}</td>
                        <td>{formatDT(e.dataInicio)}</td>
                        <td>{e.local || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Ações Rápidas</div></div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a className="btn btn-outline-secondary w-100" href="/sessoes"><i className="fa-solid fa-plus me-2" />Criar aula</a>
              <a className="btn btn-outline-secondary w-100" href="/eventos"><i className="fa-solid fa-bullhorn me-2" />Publicar evento</a>
              <a className="btn btn-outline-secondary w-100" href="/notificacoes"><i className="fa-solid fa-bell me-2" />Ver notificações</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
