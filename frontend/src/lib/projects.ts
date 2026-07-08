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

export async function createProject(name: string, description: string): Promise<Project> {
  const res = await api.post("/projects/", { name, description });
  return res.data;
}

export async function updateProject(id: number, name: string, description: string): Promise<Project> {
  const res = await api.put(`/projects/${id}`, { name, description });
  return res.data;
}

export async function deleteProject(id: number): Promise<void> {
  await api.delete(`/projects/${id}`);
}