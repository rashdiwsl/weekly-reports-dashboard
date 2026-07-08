import api from "./api";

export interface Report {
  id: number;
  user_id: number;
  project_id: number | null;
  week_start: string;
  week_end: string;
  tasks_completed: string;
  tasks_planned: string;
  blockers: string | null;
  hours_worked: number | null;
  notes: string | null;
  status: "draft" | "submitted" | "late";
  created_at: string;
}

export interface ReportInput {
  project_id: number | null;
  week_start: string;
  week_end: string;
  tasks_completed: string;
  tasks_planned: string;
  blockers: string;
  hours_worked: number | null;
  notes: string;
}

export async function getMyReports(): Promise<Report[]> {
  const res = await api.get("/reports/me");
  return res.data;
}

export async function createReport(data: ReportInput): Promise<Report> {
  const res = await api.post("/reports/", data);
  return res.data;
}

export async function updateReport(id: number, data: Partial<ReportInput>): Promise<Report> {
  const res = await api.put(`/reports/${id}`, data);
  return res.data;
}

export async function submitReport(id: number): Promise<Report> {
  const res = await api.post(`/reports/${id}/submit`);
  return res.data;
}