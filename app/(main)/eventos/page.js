'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { getUser } from '@/lib/auth';

function formatDT(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ titulo: '', local: '', descricao: '', dataInicio: '', dataFim: '', publico: true });

  const user = getUser();
  const perfil = user?.perfil || '';
  const isAdmin = perfil === 'ADMIN' || perfil === 'SUPER_ADMIN' || perfil === 'PROFESSOR';

  function showMsg(text, type = 'info') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  }

  const carregar = useCallback(async () => {
    try {
      const data = await apiGet('eventos');
      setEventos(data);
    } catch (err) {
      showMsg(err.message || 'Erro ao carregar eventos.', 'danger');
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function eliminar(id) {
    if (!confirm('Tens a certeza que queres eliminar este evento?')) return;
    try {
      await apiDelete(`eventos/${id}`);
      showMsg('Evento eliminado.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao eliminar evento.', 'danger');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiPost('eventos', {
        titulo: form.titulo,
        local: form.local || null,
        descricao: form.descricao || null,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: form.dataFim ? new Date(form.dataFim).toISOString() : null,
        publico: form.publico,
      });
      setShowModal(false);
      setForm({ titulo: '', local: '', descricao: '', dataInicio: '', dataFim: '', publico: true });
      showMsg('Evento criado com sucesso.', 'success');
      carregar();
    } catch (err) {
      showMsg(err.message || 'Erro ao criar evento.', 'danger');
    }
  }

  const filtered = eventos.filter(e => {
    const q = pesquisa.trim().toLowerCase();
    return !q || (e.titulo || '').toLowerCase().includes(q) || (e.local || '').toLowerCase().includes(q);
  });

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Comunidade</div>
          <div className="page-title">Eventos</div>
          <div className="page-sub">Espetáculos e eventos da escola</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-plus me-2" />Novo Evento
          </button>
        )}
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body-pad">
          <input className="form-control" placeholder="Pesquisar eventos..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
        </div>
      </div>

      <div className="row g-3">
        {filtered.length === 0 && (
          <div className="col-12">
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--border)', marginBottom: 12 }}>
                <i className="fa-solid fa-bullhorn" />
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Sem eventos para mostrar.</div>
            </div>
          </div>
        )}
        {filtered.map(e => {
          const inicio = formatDT(e.dataInicio);
          const fim = e.dataFim ? formatDT(e.dataFim) : null;
          const dateStr = fim ? `${inicio} → ${fim}` : inicio;
          return (
            <div key={e.id} className="col-md-6 col-lg-4">
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 22px 14px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--dark)', lineHeight: 1.3 }}>{e.titulo}</div>
                    <span className="badge" style={{ flexShrink: 0, background: e.publico ? 'var(--teal-pale)' : 'var(--bg)', color: e.publico ? 'var(--teal)' : 'var(--muted)', border: `1px solid ${e.publico ? 'rgba(26,124,114,0.2)' : 'var(--border)'}` }}>
                      {e.publico ? 'Público' : 'Privado'}
                    </span>
                  </div>
                  {e.descricao && <div style={{ fontSize: '0.8rem', color: 'var(--mid)', marginBottom: 10, lineHeight: 1.5 }}>{e.descricao}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {inicio && <span><i className="fa-solid fa-clock me-2" style={{ color: 'var(--teal)', width: 14 }} />{dateStr}</span>}
                    {e.local && <span><i className="fa-solid fa-location-dot me-2" style={{ color: 'var(--teal)', width: 14 }} />{e.local}</span>}
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ padding: '10px 22px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(e.id)}>
                      <i className="fa-solid fa-trash me-1" />Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Novo Evento</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Título *</label><input className="form-control" required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Local</label><input className="form-control" value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Início *</label><input type="datetime-local" className="form-control" required value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Fim</label><input type="datetime-local" className="form-control" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} /></div>
                  <div className="mb-3"><label className="form-label">Descrição</label><textarea className="form-control" rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="evtPublico" checked={form.publico} onChange={e => setForm(f => ({ ...f, publico: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="evtPublico">Evento público</label>
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
