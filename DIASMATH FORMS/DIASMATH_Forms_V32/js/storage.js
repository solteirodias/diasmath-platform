const PREFIX = "diasmath_v32_";
const KEYS = {
  users: PREFIX + "users",
  session: PREFIX + "session",
  forms: PREFIX + "forms",
  responses: PREFIX + "responses",
  bank: PREFIX + "bank"
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export const DB = {
  users: {
    all: () => read(KEYS.users, []),
    save: value => write(KEYS.users, value)
  },
  session: {
    get: () => read(KEYS.session, null),
    set: value => write(KEYS.session, value),
    clear: () => localStorage.removeItem(KEYS.session)
  },
  forms: {
    all: () => read(KEYS.forms, []),
    save: value => write(KEYS.forms, value)
  },
  responses: {
    all: () => read(KEYS.responses, []),
    save: value => write(KEYS.responses, value)
  },
  bank: {
    all: () => read(KEYS.bank, []),
    save: value => write(KEYS.bank, value)
  },
  backup() {
    return {
      version: 32,
      exportedAt: new Date().toISOString(),
      users: this.users.all(),
      forms: this.forms.all(),
      responses: this.responses.all(),
      bank: this.bank.all()
    };
  },
  restore(payload) {
    if (!payload || payload.version !== 32) throw new Error("Backup incompatível.");
    this.users.save(Array.isArray(payload.users) ? payload.users : []);
    this.forms.save(Array.isArray(payload.forms) ? payload.forms : []);
    this.responses.save(Array.isArray(payload.responses) ? payload.responses : []);
    this.bank.save(Array.isArray(payload.bank) ? payload.bank : []);
  }
};
