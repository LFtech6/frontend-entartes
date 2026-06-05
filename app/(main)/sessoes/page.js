"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

function formatDT(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}
function BadgeEstado({ estado }) {
  const map = { AGENDADA: "teal", TERMINADA: "green", CANCELADA: "red" };
  return <span className={"badge " + (map[estado] || "grey")}>{estado || "-"}</span>;
}
const EMPTY = { dataInicio: "", dataFim: "", turmaId: "", estudioId: "", maxAlunos: "", sumario: "", inscricaoAberta: false };

export default function SessoesPage() {
  const [sessoes, setSessoes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [aba, setAba] = useState("POR_DAR");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function flash(text, type = "info") { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3000); }

  async function carregar() {
    try {
      const [s, t, e] = await Promise.all([apiGet("sessoes"), apiGet("turmas"), apiGet("config/estudio")]);
      setSessoes(s); setTurmas(t); setEstudios(e);
    } catch (e) { flash(e.message, "danger"); }
  }
  useEffect(() => { carregar(); }, []);

  async function terminar(id) {
    try { await apiPatch("sessoes/" + id + "/terminar", {}); await carregar(); flash("Aula terminada.", "success"); }
    catch (e) { flash(e.message, "danger"); }
  }

  async function criarSessao(e) {
    e.preventDefault();
    try {
      await apiPost("sessoes", {
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: new Date(form.dataFim).toISOString(),
        turmaId: form.inscricaoAberta ? null : (form.turmaId ? +form.turmaId : null),
        estudioId: form.estudioId ? +form.estudioId : null,
        maxAlunos: form.maxAlunos ? +form.maxAlunos : null,
        sumario: form.sumario || null,
        inscricaoAberta: form.inscricaoAberta,
      });
      setShowModal(false); setForm(EMPTY); await carregar(); flash("Sessão criada.", "success");
    } catch (e) { flash(e.message, "danger"); }
  }

  const turmaInfo = turmas.find(t => t.id === +form.turmaId);
  const lista = sessoes.filter(s => !s.inscricaoAberta).filter(s => aba === "POR_DAR" ? !s.foiDada : s.foiDada);

  return (
    <>
      <div className="page-hdr">
        <div className="page-hdr-row">
          <div>
            <div className="page-eyebrow">Gestão</div>
            <div className="page-title">Aulas</div>
            <div className="page-sub">Sessões de aula agendadas</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><i className="fa-solid fa-plus me-1" /> Nova Aula</button>
        </div>
      </div>
      {msg.text && <div className={"alert alert-" + msg.type}>{msg.text}</div>}
      <div className="card">
        <div className="card-hdr">
          <div style={{ display: "flex", gap: 8 }}>
            <button className={"nav-link" + (aba === "POR_DAR" ? " active" : "")} onClick={() => setAba("POR_DAR")}>Por Dar</button>
            <button className={"nav-link" + (aba === "TERMINADAS" ? " active" : "")} onClick={() => setAba("TERMINADAS")}>Terminadas</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table mb-0">
            <thead><tr><th>#</th><th>Início</th><th>Fim</th><th>Turma</th><th>Tipo</th><th>Estado</th><th>Sumário</th><th>Ações</th></tr></thead>
            <tbody>
              {lista.length === 0 ? <tr><td colSpan={8} className="text-center small-muted">Sem aulas.</td></tr>
              : lista.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{formatDT(s.inicio)}</td><td>{formatDT(s.fim)}</td>
                  <td>{s.turmaNome || "-"}</td><td>{s.tipoAulaNome || "-"}</td>
                  <td><BadgeEstado estado={s.estado} /></td>
                  <td>{s.sumario || "-"}</td>
                  <td>
                    <div className="action-btns">
                      <a className="btn btn-sm btn-primary" href={"/presencas?sessaoId=" + s.id}>Presenças</a>
                      {!s.foiDada && <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => terminar(s.id)}>Terminar</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Nova Aula / Coaching</h5><button className="btn-close" onClick={() => setShowModal(false)} /></div>
            <form onSubmit={criarSessao}>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="inscAberta" checked={form.inscricaoAberta}
                      onChange={e => setForm(f => ({ ...f, inscricaoAberta: e.target.checked, turmaId: "" }))} />
                    <label className="form-check-label" htmlFor="inscAberta">Coaching / Inscrição aberta</label>
                  </div>
                </div>
                {!form.inscricaoAberta && (
                  <div className="mb-3">
                    <label className="form-label">Turma</label>
                    <select className="form-select" value={form.turmaId} onChange={e => setForm(f => ({ ...f, turmaId: e.target.value }))}>
                      <option value="">Selecionar turma</option>
                      {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                    {turmaInfo && <small className="small-muted">Tipo: {turmaInfo.tipoAulaNome || "-"}</small>}
                  </div>
                )}
                <div className="mb-3"><label className="form-label">Início *</label>
                  <input type="datetime-local" className="form-control" required value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} /></div>
                <div className="mb-3"><label className="form-label">Fim *</label>
                  <input type="datetime-local" className="form-control" required value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} /></div>
                <div className="mb-3"><label className="form-label">Estúdio</label>
                  <select className="form-select" value={form.estudioId} onChange={e => setForm(f => ({ ...f, estudioId: e.target.value }))}>
                    <option value="">Selecionar estúdio</option>
                    {estudios.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                  </select></div>
                <div className="mb-3"><label className="form-label">Max. Alunos</label>
                  <input type="number" className="form-control" value={form.maxAlunos} onChange={e => setForm(f => ({ ...f, maxAlunos: e.target.value }))} /></div>
                <div className="mb-3"><label className="form-label">Sumário</label>
                  <textarea className="form-control" rows={2} value={form.sumario} onChange={e => setForm(f => ({ ...f, sumario: e.target.value }))} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar</button>
              </div>
            </form>
          </div></div>
        </div>
      )}
    </>
  );
}
