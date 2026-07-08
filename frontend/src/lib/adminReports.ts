import api from "./api";
import { Report } from "./reports";

export interface ReportFilters {
  user_id?: number;
  project_id?: number;
  week_start?: string;
  week_end?: string;
}

export async function getAllReports(filters: ReportFilters = {}): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters.user_id) params.append("user_id", String(filters.user_id));
  if (filters.project_id) params.append("project_id", String(filters.project_id));
  if (filters.week_start) params.append("week_start", filters.week_start);
  if (filters.week_end) params.append("week_end", filters.week_end);

  const res = await api.get(`/reports/?${params.toString()}`);
  return res.data;
}