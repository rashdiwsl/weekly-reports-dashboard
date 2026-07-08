"use client";

import { useEffect, useState } from "react";
import { getAllReports, ReportFilters } from "@/lib/adminReports";
import { getAllUsers } from "@/lib/users";
import { getProjects, Project } from "@/lib/projects";
import { Report } from "@/lib/reports";
import { User } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#ef4444"];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(true);

  async function loadStaticData() {
    const [usersData, projectsData] = await Promise.all([
      getAllUsers(),
      getProjects(),
    ]);
    setUsers(usersData);
    setProjects(projectsData);
  }

  async function loadReports() {
    setLoading(true);
    const data = await getAllReports(filters);
    setReports(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStaticData();
  }, []);

  useEffect(() => {
    loadReports();
  }, [filters]);

  function handleFilterChange(key: keyof ReportFilters, value: string) {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : key === "user_id" || key === "project_id" ? Number(value) : value,
    }));
  }

  const totalSubmitted = reports.filter((r) => r.status === "submitted").length;
  const totalPending = reports.filter((r) => r.status === "draft").length;
  const totalReports = reports.length;
  const complianceRate = totalReports > 0 ? Math.round((totalSubmitted / totalReports) * 100) : 0;
  const openBlockers = reports.filter((r) => r.blockers && r.blockers.trim() !== "").length;

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const statusByMember = users.map((u) => {
    const userReports = reports.filter((r) => r.user_id === u.id);
    return {
      name: u.name,
      submitted: userReports.filter((r) => r.status === "submitted").length,
      draft: userReports.filter((r) => r.status === "draft").length,
    };
  });

  const workloadByProject = projects.map((p) => ({
    name: p.name,
    value: reports.filter((r) => r.project_id === p.id).length,
  })).filter((p) => p.value > 0);

  const trendMap: Record<string, number> = {};
  reports.forEach((r) => {
    trendMap[r.week_start] = (trendMap[r.week_start] || 0) + 1;
  });
  const trendData = Object.entries(trendMap)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const inputClass =
    "p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-white text-sm transition-all";

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Team Dashboard
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Manager view — <span className="text-emerald-400">{user?.name}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: totalReports, color: "text-white", glow: "" },
            { label: "Compliance Rate", value: `${complianceRate}%`, color: "text-emerald-400", glow: "shadow-emerald-500/10" },
            { label: "Pending", value: totalPending, color: "text-amber-400", glow: "shadow-amber-500/10" },
            { label: "Open Blockers", value: openBlockers, color: "text-red-400", glow: "shadow-red-500/10" },
          ].map((metric, i) => (
            <div
              key={i}
              className={`bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-lg ${metric.glow}`}
            >
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-medium">{metric.label}</p>
              <p className={`text-4xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-zinc-950/50 backdrop-blur border border-zinc-800 rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">Team Member</label>
            <select className={inputClass} onChange={(e) => handleFilterChange("user_id", e.target.value)}>
              <option value="">All Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">Project</label>
            <select className={inputClass} onChange={(e) => handleFilterChange("project_id", e.target.value)}>
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">Week From</label>
            <input type="date" className={inputClass} onChange={(e) => handleFilterChange("week_start", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">Week To</label>
            <input type="date" className={inputClass} onChange={(e) => handleFilterChange("week_end", e.target.value)} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              Submission Status by Team Member
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusByMember}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: "8px" }}
                  cursor={{ fill: "#ffffff05" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="submitted" fill="#10b981" name="Submitted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="draft" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full" />
              Workload by Project
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={workloadByProject}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  label
                >
                  {workloadByProject.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
            <h3 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-pink-500 rounded-full" />
              Reports Trend Over Time
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="week" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #27272a", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed / Table */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-white rounded-full" />
            All Reports
          </h3>
          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-zinc-500">No reports match the current filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800 text-xs uppercase tracking-wide">
                    <th className="pb-3 pr-4 font-medium">Member</th>
                    <th className="pb-3 pr-4 font-medium">Project</th>
                    <th className="pb-3 pr-4 font-medium">Week</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-900/50 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-medium">{userMap[r.user_id] || "Unknown"}</td>
                      <td className="py-3 pr-4 text-zinc-400">{r.project_id ? projectMap[r.project_id] : "-"}</td>
                      <td className="py-3 pr-4 text-zinc-400">{r.week_start} → {r.week_end}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            r.status === "submitted"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : r.status === "late"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{r.hours_worked ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}