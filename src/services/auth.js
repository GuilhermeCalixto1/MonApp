const USERS_KEY = 'monapp:users';
const SESSION_KEY = 'monapp:session';

const DEFAULT_USER = {
  nome: 'Guilherme',
  senha: '123abc',
};

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ensureDefaultUser() {
  const users = readUsers();

  if (users.length > 0) {
    return;
  }

  localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_USER]));
}

export function login(nome, senha) {
  ensureDefaultUser();
  const users = readUsers();

  const user = users.find(
    (item) =>
      normalizeName(item.nome) === normalizeName(nome) && String(item.senha) === String(senha),
  );

  if (!user) {
    return false;
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      nome: user.nome,
      at: new Date().toISOString(),
    }),
  );

  return true;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(SESSION_KEY));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
