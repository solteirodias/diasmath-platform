import { DB } from "./storage.js";
import { hashText } from "./utils.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function apiAuth(payload) {
  const response = await fetch("/api/forms/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || "Não foi possível acessar o DIASMATH Forms.");
  }

  return data;
}

function saveAuthenticatedUser(remoteUser, passwordHash) {
  const users = DB.users.all();
  const email = normalizeEmail(remoteUser.email);
  const sameEmailUsers = users.filter((item) => normalizeEmail(item.email) === email);
  const legacyIds = [
    remoteUser.id,
    ...sameEmailUsers.map((item) => item.id),
    ...sameEmailUsers.flatMap((item) => item.legacyIds || []),
  ].filter(Boolean);

  const user = {
    ...remoteUser,
    email,
    passwordHash,
    legacyIds: Array.from(new Set(legacyIds)),
  };

  const filtered = users.filter((item) => normalizeEmail(item.email) !== email && item.id !== user.id);
  filtered.push(user);

  DB.users.save(filtered);
  DB.session.set({ userId: user.id, createdAt: new Date().toISOString() });

  return user;
}

export function currentUser() {
  const session = DB.session.get();
  if (!session) return null;
  return DB.users.all().find((user) => user.id === session.userId) || null;
}

export function requireUser() {
  const user = currentUser();
  if (!user) {
    location.href = "index.html";
    throw new Error("Sessão não encontrada.");
  }
  return user;
}

export async function registerUser({ name, email, school, city, password }) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashText(password);

  const data = await apiAuth({
    action: "register",
    name: name.trim(),
    email: normalizedEmail,
    school: school.trim(),
    city: city.trim(),
    passwordHash,
  });

  return saveAuthenticatedUser(data.user, passwordHash);
}

export async function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashText(password);

  const data = await apiAuth({
    action: "login",
    email: normalizedEmail,
    passwordHash,
  });

  return saveAuthenticatedUser(data.user, passwordHash);
}

export async function recoverPassword(email) {
  return apiAuth({ action: "recover", email: normalizeEmail(email) });
}

export async function resetPassword(email, resetCode, newPassword) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashText(newPassword);

  const data = await apiAuth({
    action: "reset",
    email: normalizedEmail,
    resetCode,
    passwordHash,
  });

  return saveAuthenticatedUser(data.user, passwordHash);
}

export async function updateRemoteProfile({ name, email, school, city }) {
  const data = await apiAuth({ action: "profile", name, email, school, city });
  return data.user;
}

export function logoutUser() {
  DB.session.clear();
  location.href = "index.html";
}
