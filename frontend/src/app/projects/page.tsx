"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  Project,
} from "@/lib/projects";
import { logout } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateProject(editingId, name, description);
      } else {
        await createProject(name, description);
      }
      setName("");
      setDescription("");
      setEditingId(null);
      await loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save project");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(project: Project) {
    setName(project.name);
    setDescription(project.description || "");
    setEditingId(project.id);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await deleteProject(id);
    await loadProjects();
  }

  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects & Categories</h1>
              <p className="text-zinc-500 text-sm mt-1">Manage work categories for your team</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full" />
              {editingId ? "Edit Project" : "Add New Project"}
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Project name (e.g. Client A)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-sm"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 transition-colors px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Saving..." : editingId ? "Update" : "+ Add Project"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setDescription("");
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-3">
            {projects.length === 0 && (
              <p className="text-zinc-500">No projects yet. Add one above.</p>
            )}
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 flex justify-between items-center hover:border-zinc-700 transition-all"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-sm text-zinc-500 mt-0.5">{project.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-950/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}