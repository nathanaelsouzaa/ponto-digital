import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || '/data/ponto.db';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Geral',
    role TEXT NOT NULL DEFAULT 'Colaborador',
    registration TEXT NOT NULL UNIQUE,
    hiringDate TEXT,
    salary REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    employeeId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Entrada','Saída')),
    timestamp TEXT NOT NULL,
    location TEXT,
    isExtra INTEGER NOT NULL DEFAULT 0,
    extraPercentage INTEGER,
    FOREIGN KEY(employeeId) REFERENCES employees(id)
  );

  CREATE INDEX IF NOT EXISTS idx_records_employee_time ON records(employeeId, timestamp);
`);

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix='id') {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

// seed mínimo se vazio
const count = db.prepare('SELECT COUNT(*) as c FROM employees').get().c;
if (count === 0) {
  const seed = db.prepare(`INSERT INTO employees (id,name,role,department,registration,hiringDate,salary)
    VALUES (@id,@name,@role,@department,@registration,@hiringDate,@salary)`);

  seed.run({ id: 'admin', name: 'Administrador', role: 'Gestor de RH', department: 'Administração', registration: 'admin123', hiringDate: '2020-01-01', salary: 0 });
  seed.run({ id: 'emp1', name: 'João Silva', role: 'Desenvolvedor Full Stack', department: 'Engenharia', registration: '884291-0', hiringDate: '2022-01-15', salary: 5500 });
}

app.get('/health', (req, res) => res.json({ ok: true, time: nowIso() }));

app.post('/auth/login', (req, res) => {
  const { name, registration, password } = req.body || {};
  if (!name || !registration) return res.status(400).json({ error: 'name e registration são obrigatórios' });

  if (String(name).toLowerCase() === 'admin') {
    if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'senha inválida' });
    return res.json({ role: 'admin', employeeId: 'admin' });
  }

  const employee = db.prepare(
    'SELECT * FROM employees WHERE lower(name)=lower(?) AND registration=?'
  ).get(name, registration);

  if (!employee) return res.status(401).json({ error: 'Nome ou matrícula não encontrados.' });
  return res.json({ role: 'employee', employee });
});

app.get('/employees', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY name ASC').all();
  res.json(rows);
});

app.post('/employees', (req, res) => {
  const emp = req.body || {};
  if (!emp.name || !emp.registration) return res.status(400).json({ error: 'name e registration são obrigatórios' });

  const id = emp.id || randomId('emp');
  try {
    db.prepare(`INSERT INTO employees (id,name,role,department,registration,hiringDate,salary)
      VALUES (?,?,?,?,?,?,?)`).run(
      id,
      emp.name,
      emp.role || 'Colaborador',
      emp.department || 'Geral',
      emp.registration,
      emp.hiringDate || null,
      emp.salary ?? 0
    );
  } catch (e) {
    return res.status(400).json({ error: String(e?.message || e) });
  }

  const saved = db.prepare('SELECT * FROM employees WHERE id=?').get(id);
  res.status(201).json(saved);
});

app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const emp = req.body || {};

  const existing = db.prepare('SELECT * FROM employees WHERE id=?').get(id);
  if (!existing) return res.status(404).json({ error: 'employee não encontrado' });

  try {
    db.prepare(`UPDATE employees SET name=?, role=?, department=?, registration=?, hiringDate=?, salary=? WHERE id=?`).run(
      emp.name ?? existing.name,
      emp.role ?? existing.role,
      emp.department ?? existing.department,
      emp.registration ?? existing.registration,
      emp.hiringDate ?? existing.hiringDate,
      emp.salary ?? existing.salary,
      id
    );
  } catch (e) {
    return res.status(400).json({ error: String(e?.message || e) });
  }

  const saved = db.prepare('SELECT * FROM employees WHERE id=?').get(id);
  res.json(saved);
});

app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM records WHERE employeeId=?').run(id);
  const info = db.prepare('DELETE FROM employees WHERE id=?').run(id);
  res.json({ deleted: info.changes });
});

app.get('/records', (req, res) => {
  const { employeeId } = req.query;
  if (!employeeId) return res.status(400).json({ error: 'employeeId é obrigatório' });

  const rows = db.prepare(
    'SELECT * FROM records WHERE employeeId=? ORDER BY datetime(timestamp) DESC'
  ).all(employeeId);
  res.json(rows);
});

app.post('/records', (req, res) => {
  const r = req.body || {};
  if (!r.employeeId || !r.type) return res.status(400).json({ error: 'employeeId e type são obrigatórios' });

  const id = r.id || randomId('rec');
  db.prepare(`INSERT INTO records (id, employeeId, type, timestamp, location, isExtra, extraPercentage)
    VALUES (?,?,?,?,?,?,?)`).run(
    id,
    r.employeeId,
    r.type,
    r.timestamp || nowIso(),
    r.location || null,
    r.isExtra ? 1 : 0,
    r.extraPercentage ?? null
  );

  const saved = db.prepare('SELECT * FROM records WHERE id=?').get(id);
  res.status(201).json(saved);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ponto-api listening on :${PORT} db=${DB_PATH}`);
});
