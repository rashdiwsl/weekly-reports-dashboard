import api from "./api";

export interface Project {
  id: number;
  name: string;
  description: string | null;
}

export async function getProjects(): Promise<Project[]> {
  const res = await api.get("/projects/");
  return res.data;
}