'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { getUser } from '@/lib/auth';

const HOUR_PX = 60;
const START_H = 8;
const END_H = 22;
const TOTAL_H = (END_H - START_H) * HOUR_PX;
const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_FULL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const TYPE_PALETTE = [
  { key: 'ballet',     bg: '#eaf5f4', border: '#1a7c72', text: '#155f57' },
  { key: 'hip hop',    bg: '#fdf6e3', border: '#d4a22a', text: '#8a6010' },
  { key: 'jazz',       bg: '#f0ebf8', border: '#7c5cbf', text: '#5a3fa0' },
  { key: 'contempor',  bg: '#e8f0fe', border: '#3b6fd4', text: '#1e419a' },
  { key: 'acrob',      bg: '#fdecea', border: '#c0392b', text: '#922b21' },
  { key: 'zumba',      bg: '#fff3e0', border: '#e67e22', text: '#a04000' },
  { key: 'musculação', bg: '#f3f9e8', border: '#5d9e1f', text: '#3a6612' },
];
const DEFAULT_COLOR = { bg: '#f4f6f8', border: '#8a9490', text: '#4a5450' };

function colorFor(tipo) {
  if (!tipo) return DEFAULT_COLOR;
  const lower = tipo.toLowerCase();
  return TYPE_PALETTE.find(p => lower.includes(p.key)) || DEFAULT_COLOR;
}

function fmt2(n) { return String(n).padStart(2, '0'); }
function fmtTime(d) { return `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}`; }
function fmtDate(d) { return `${fmt2(d.getDate())}/${fmt2(d.getMonth() + 1)}`; }

function getWeekDates(offset) {
  const now = new Date();
  const dow = now.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

export default function CalendarioPage() {
  const [sessoes, setSessoes] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const carregar = useCallback(async () => {
    const user = getUser();
    const role = user?.perfil;
    try {
      let data;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'PROFESSOR') {
        data = await apiGet('sessoes');
      } else {
        data = await apiGet('sessoes/pendentes-confirmacao');
      }
      setSessoes(data);
    } catch (e) {
      setError('Não foi possível carregar as sessões: ' + e.message);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const days = getWeekDates(weekOffset);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const sessionsForDay = (dayDate) =>
    sessoes.filter(s => {
      const sd = new Date(s.inicio);
      return sd.getFullYear() === dayDate.getFullYear()
          && sd.getMonth() === dayDate.getMonth()
          && sd.getDate() === dayDate.getDate();
    });

  const selected = sessoes.find(x => x.id === selectedId);

  function handleDesmarcar() {
    if (!selected || !motivo.trim()) { alert('Escreve um motivo para desmarcar.'); return; }
    alert('Desmarcação registada!');
    setMotivo('');
    setSelectedId(null);
  }

  const tipos = [...new Set(sessoes.map(s => s.tipoAulaNome).filter(Boolean))];

  return (
    <>
      <div className="page-hdr">
        <div>
          <div className="page-eyebrow">Agenda</div>
          <div className="page-title">Calendário</div>
          <div className="page-sub">Vista semanal de sessões</div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body-pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setWeekOffset(w => w - 1)}>‹ Anterior</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setWeekOffset(0)}>Hoje</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setWeekOffset(w => w + 1)}>Próxima ›</button>
          <span style={{ marginLeft: 8, fontWeight: 600, fontSize: '0.9rem' }}>
            {fmtDate(days[0])} — {fmtDate(days[5])} · {days[0].getFullYear()}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Calendar grid */}
        <div className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: 50, flexShrink: 0 }} />
            {days.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--teal)' : 'var(--dark)', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <div>{DAY_SHORT[i]}</div>
                  <div style={{ fontSize: '1rem' }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', position: 'relative', height: TOTAL_H }}>
            {/* time col */}
            <div style={{ width: 50, flexShrink: 0, position: 'relative', height: TOTAL_H }}>
              {Array.from({ length: END_H - START_H + 1 }, (_, i) => (
                <div key={i} style={{ position: 'absolute', top: i * HOUR_PX - 8, left: 0, width: '100%', textAlign: 'right', paddingRight: 6, fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {fmt2(START_H + i)}:00
                </div>
              ))}
            </div>

            {days.map((dayDate, colIdx) => {
              const isToday = dayDate.getTime() === today.getTime();
              return (
                <div key={colIdx} style={{ flex: 1, position: 'relative', height: TOTAL_H, borderLeft: '1px solid var(--border)', background: isToday ? 'rgba(26,124,114,0.03)' : 'transparent' }}>
                  {Array.from({ length: END_H - START_H }, (_, i) => (
                    <div key={i}>
                      <div style={{ position: 'absolute', top: i * HOUR_PX, left: 0, right: 0, borderTop: '1px solid var(--border)', opacity: 0.4 }} />
                      <div style={{ position: 'absolute', top: i * HOUR_PX + HOUR_PX / 2, left: 0, right: 0, borderTop: '1px dashed var(--border)', opacity: 0.3 }} />
                    </div>
                  ))}
                  {sessionsForDay(dayDate).map(s => {
                    const inicio = new Date(s.inicio);
                    const fim = new Date(s.fim);
                    const startMin = inicio.getHours() * 60 + inicio.getMinutes();
                    const duracao = Math.max(30, Math.round((fim - inicio) / 60000));
                    const topPx = (startMin - START_H * 60) / 60 * HOUR_PX;
                    const heightPx = duracao / 60 * HOUR_PX;
                    if (topPx < 0 || topPx >= TOTAL_H) return null;
                    const c = colorFor(s.tipoAulaNome);
                    return (
                      <div key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        style={{ position: 'absolute', top: topPx + 2, left: 2, right: 2, height: Math.max(heightPx - 4, 20), background: c.bg, borderLeft: `3px solid ${c.border}`, color: c.text, borderRadius: 4, padding: '2px 4px', cursor: 'pointer', fontSize: '0.72rem', overflow: 'hidden', outline: selectedId === s.id ? `2px solid ${c.border}` : 'none' }}>
                        <div style={{ fontWeight: 600 }}>{s.turmaNome || s.turma || '—'}</div>
                        <div>{fmtTime(inicio)} · {duracao}min</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-body-pad">
              <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 8 }}>Detalhe</div>
              {selected ? (() => {
                const inicio = new Date(selected.inicio);
                const fim = new Date(selected.fim);
                const duracao = Math.round((fim - inicio) / 60000);
                const diaSem = (inicio.getDay() + 6) % 7;
                return (
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 600 }}>{selected.turmaNome || selected.turma || '—'}</div>
                    <div><i className="fa-solid fa-tag me-1" />{selected.tipoAulaNome || '—'}</div>
                    <div><i className="fa-solid fa-calendar me-1" />{DAY_FULL[diaSem]}, {fmtDate(inicio)}</div>
                    <div><i className="fa-solid fa-clock me-1" />{fmtTime(inicio)} – {fmtTime(fim)} ({duracao} min)</div>
                    <div><i className="fa-solid fa-user me-1" />{selected.professorNome || '—'}</div>
                    {selected.estado && <div><i className="fa-solid fa-circle-dot me-1" />{selected.estado}</div>}
                    <textarea className="form-control mt-2" rows={2} placeholder="Motivo de desmarcação" value={motivo} onChange={e => setMotivo(e.target.value)} style={{ fontSize: '0.78rem' }} />
                    <button className="btn btn-sm btn-outline-danger mt-1" onClick={handleDesmarcar}>Desmarcar</button>
                  </div>
                );
              })() : <div className="small-muted">Clica numa sessão para ver detalhes.</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-body-pad">
              <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 8 }}>Legenda</div>
              {tipos.length ? tipos.map(t => {
                const c = colorFor(t);
                return (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: c.bg, border: `1.5px solid ${c.border}` }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--mid)' }}>{t}</span>
                  </div>
                );
              }) : <div className="small-muted" style={{ fontSize: '0.78rem' }}>Sem dados</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
