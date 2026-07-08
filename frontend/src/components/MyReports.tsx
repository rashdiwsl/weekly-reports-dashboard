"use client";

import { useEffect, useState } from "react";
import {
  getMyReports,
  createReport,
  updateReport,
  submitReport,
  Report,
  ReportInput,
} from "@/lib/reports";
import { getProjects, Project } from "@/lib/projects";
import { logout } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const emptyForm: ReportInput = {
  project_id: null,
  week_start: "",
  week_end: "",
  tasks_completed: "",
  tasks_planned: "",
  blockers: "",
  hours_worked: null,
  notes: "",
};

export default function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ReportInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    const [reportsData, projectsData] = await Promise.all([
      getMyReports(),
      getProjects(),
    ]);
    setReports(reportsData);
    setProjects(projectsData);
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "project_id" || name === "hours_worked"
        ? value === "" ? null : Number(value)
        : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateReport(editingId, form);
      } else {
        await createReport(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save report");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(report: Report) {
    setForm({
      project_id: report.project_id,
      week_start: report.week_start,
      week_end: report.week_end,
      tasks_completed: report.tasks_completed,
      tasks_planned: report.tasks_planned,
      blockers: report.blockers || "",
      hours_worked: report.hours_worked,
      notes: report.notes || "",
    });
    setEditingId(report.id);
    setShowForm(true);
  }

  async function handleSubmitReport(id: number) {
    if (!confirm("Submit this report? You won't be able to edit it as easily afterwards.")) return;
    await submitReport(id);
    await loadData();
  }

  const inputClass =
    "w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-emerald-500 text-white";
  const labelClass = "text-sm text-zinc-400";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Weekly Reports</h1>
          <p className="text-zinc-400 text-sm">Logged in as {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 transition-colors px-4 py-2 rounded font-medium"
          >
            {showForm ? "Cancel" : "+ New Report"}
          </button>
          <button
            onClick={logout}
            className="bg-zinc-800 hover:bg-zinc-700 transition-colors px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 space-y-4"
        >
          <h2 className="text-lg font-semibold mb-2">
            {editingId ? "Edit Report" : "New Report"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Week Start</label>
              <input
                type="date"
                name="week_start"
                value={form.week_start}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Week End</label>
              <input
                type="date"
                name="week_end"
                value={form.week_end}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Project / Category</label>
            <select
              name="project_id"
              value={form.project_id ?? ""}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- None --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tasks Completed</label>
            <textarea
              name="tasks_completed"
              value={form.tasks_completed}
              onChange={handleChange}
              required
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tasks Planned (Next Week)</label>
            <textarea
              name="tasks_planned"
              value={form.tasks_planned}
              onChange={handleChange}
              required
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Blockers / Challenges</label>
            <textarea
              name="blockers"
              value={form.blockers}
              onChange={handleChange}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hours Worked (optional)</label>
              <input
                type="number"
                step="0.5"
                name="hours_worked"
                value={form.hours_worked ?? ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Notes / Links (optional)</label>
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 transition-colors px-6 py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Report" : "Save as Draft"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-300">Report History</h2>
        {reports.length === 0 && (
          <p className="text-zinc-500">No reports yet. Create your first one above.</p>
        )}
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">
                  {report.week_start} → {report.week_end}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                    report.status === "submitted"
                      ? "bg-emerald-900 text-emerald-400"
                      : report.status === "late"
                      ? "bg-red-900 text-red-400"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className="flex gap-2">
                {report.status === "draft" && (
                  <>
                    <button
                      onClick={() => handleEdit(report)}
                      className="text-sm text-zinc-400 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSubmitReport(report.id)}
                      className="text-sm bg-emerald-700 hover:bg-emerald-600 px-3 py-1 rounded"
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              <span className="text-zinc-500">Completed:</span> {report.tasks_completed}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              <span className="text-zinc-500">Planned:</span> {report.tasks_planned}
            </p>
            {report.blockers && (
              <p className="text-sm text-red-400 mt-1">
                <span className="text-zinc-500">Blockers:</span> {report.blockers}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}