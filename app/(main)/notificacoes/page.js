'use client';
import { useState, useEffect } from 'react';
import { getUser } from '@/lib/auth';

function loadNotifs() {
  try { return JSON.parse(localStorage.getItem('notifications') || '[]'); } catch { return []; }
}
function saveNotifs(arr) {
  localStorage.setItem('notifications', JSON.stringify(arr));
}

const SEED_NOTIFS = [
  { id: 1, toRole: 'ENCARREGADO', titulo: 'Novo evento', mensagem: 'Torneio de Dança — 2026-03-02 10:00', lida: false, createdAt: new Date().toISOString() },
  { id: 2, toRole: 'PROFESSOR',   titulo: 'Aula desmarcada', mensagem: 'Aluno X desmarcou a aula (motivo: doente).', lida: false, createdAt: new Date().toISOString() },
  { id: 3, toRole: 'ADMIN',       titulo: 'Pagamento pendente', mensagem: 'Mensalidade de Fevereiro em atraso.', lida: true, createdAt: new Date().toISOString() },
];

export default function NotificacoesPage() {
  const [notifs, setNotifs] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [pesquisa, setPesquisa] = useState('');
  const [msg, setMsg] = useState(null);

  const user = getUser();
  const role = user?.perfil || '';

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2000);
  }

  useEffect(() => {
    let stored = loadNotifs();
    if (!stored.length) {
      stored = SEED_NOTIFS;
      saveNotifs(stored);
    }
    setNotifs(stored);
  }, []);

  function visible(n) { return !n.toRole || n.toRole === role; }

  const filtered = notifs
    .filter(visible)
    .filter(n => {
      if (filtro === 'nao_lidas') return !n.lida;
      if (filtro === 'lidas') return !!n.lida;
      return true;
    })
    .filter(n => !pesquisa || ((n.titulo || '') + ' ' + (n.mensagem || '')).toLowerCase().includes(pesquisa.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function marcarLida(id) {
    const updated = notifs.map(n => n.id === id ? { ...n, lida: true } : n);
    setNotifs(updated);
    saveNotifs(updated);
  }

  function apagar(id) {
    if (!confirm('Apagar notificação?')) return;
    const updated = notifs.filter(n => n.id !== id);
    setNotifs(updated);
    saveNotifs(updated);
    showMsg('Notificação apagada.', 'success');
  }

  function marcarTodas() {
    const updated = notifs.map(n => visible(n) ? { ...n, lida: true } : n);
    setNotifs(updated);
    saveNotifs(updated);
    showMsg('Tudo marcado como lido.', 'success');
  }

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Avisos</div>
          <div className="page-title">Notificações</div>
          <div className="page-sub">Mensagens e alertas do sistema</div>
        </div>
        <button className="btn btn-outline-secondary" onClick={marcarTodas}>
          <i className="fa-solid fa-check-double me-2" />Marcar todas como lidas
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card mb-3">
        <div className="card-body-pad" style={{ display: 'flex', gap: 12 }}>
          <input className="form-control" placeholder="Pesquisar..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} style={{ maxWidth: 260 }} />
          <select className="form-select" style={{ maxWidth: 160 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="nao_lidas">Não lidas</option>
            <option value="lidas">Lidas</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="list-group list-group-flush">
          {filtered.length === 0 && <div className="list-group-item small-muted">Sem notificações.</div>}
          {filtered.map(n => (
            <div key={n.id} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start${n.lida ? '' : ' fw-semibold'}`}>
              <div className="me-3">
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${n.lida ? 'text-bg-secondary' : 'text-bg-primary'}`}>{n.lida ? 'Lida' : 'Nova'}</span>
                  <div>{n.titulo || 'Notificação'}</div>
                </div>
                <div className="small-muted mt-1">{n.mensagem || ''}</div>
                <div className="small-muted mt-1">{(n.createdAt || '').replace('T', ' ').substring(0, 19)}</div>
              </div>
              <div className="d-flex gap-2">
                {!n.lida && (
                  <button className="btn btn-sm btn-outline-success" onClick={() => marcarLida(n.id)}>
                    <i className="fa-solid fa-check" />
                  </button>
                )}
                <button className="btn btn-sm btn-outline-danger" onClick={() => apagar(n.id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
