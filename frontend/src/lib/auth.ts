import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "team_member" | "manager";
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  const { access_token } = res.data;
  localStorage.setItem("access_token", access_token);
  return access_token;
}

export async function register(name: string, email: string, password: string, role: string) {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data;
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get("/auth/me");
  return res.data;
}

export function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "/login";
}