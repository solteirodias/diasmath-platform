import { DB } from "./storage.js";
import { hashText, uid } from "./utils.js";

export function currentUser() {
  const session = DB.session.get();
  if (!session) return null;
  return DB.users.all().find(user => user.id === session.userId) || null;
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
  const users = DB.users.all();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some(user => user.email === normalizedEmail)) {
    throw new Error("Este e-mail já está cadastrado.");
  }
  const user = {
    id: uid("user"),
    name: name.trim(),
    email: normalizedEmail,
    school: school.trim(),
    city: city.trim(),
    passwordHash: await hashText(password),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  DB.users.save(users);
  DB.session.set({ userId: user.id, createdAt: new Date().toISOString() });
  return user;
}
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashText(password);
  const user = DB.users.all().find(item => item.email === normalizedEmail && item.passwordHash === passwordHash);
  if (!user) throw new Error("E-mail ou senha inválidos.");
  DB.session.set({ userId: user.id, createdAt: new Date().toISOString() });
  return user;
}
export function logoutUser() {
  DB.session.clear();
  location.href = "index.html";
}
