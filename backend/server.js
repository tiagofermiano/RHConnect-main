const express = require("express");
const session = require("express-session");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",    
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Sessão
app.use(
  session({
    secret: "segredo_rhconnectcv",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
  })
);

// Banco SQLite
const db = new sqlite3.Database(path.join(__dirname, "db", "data.db"));

// Criar tabelas se não existirem
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      telefone TEXT,
      senha TEXT,
      consentimento INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS curriculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      vaga TEXT,
      curriculo_link TEXT,
      consentimento INTEGER,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);
});

// Servir frontend
app.use(express.static(path.join(__dirname, "..", "public")));

// ---------- ROTAS DE AUTENTICAÇÃO ----------

// Criar conta
app.post("/api/auth/register", (req, res) => {
  const { nome, email, telefone, senha, consentimento } = req.body;

  db.get("SELECT id FROM usuarios WHERE email = ?", [email], (err, row) => {
    if (row) return res.status(400).json({ error: "E-mail já registrado." });

    const hash = bcrypt.hashSync(senha, 10);

    db.run(
      `INSERT INTO usuarios (nome, email, telefone, senha, consentimento)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, telefone, hash, consentimento ? 1 : 0],
      function (err2) {
        if (err2) return res.status(500).json({ error: "Erro ao registrar." });
        return res.json({ success: true });
      }
    );
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body;

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "Credenciais inválidas." });

    if (!bcrypt.compareSync(senha, user.senha)) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }

    req.session.userId = user.id;
    res.json({ success: true });
  });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

// Perfil
app.get("/api/auth/me", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Não autenticado." });

  db.get(
    "SELECT id, nome, email, telefone FROM usuarios WHERE id = ?",
    [req.session.userId],
    (err, row) => {
      if (!row) return res.status(404).json({ error: "Usuário não encontrado." });
      res.json(row);
    }
  );
});

// Editar perfil
app.put("/api/usuarios/me", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Não autenticado." });

  const { nome, telefone } = req.body;

  db.run(
    "UPDATE usuarios SET nome = ?, telefone = ? WHERE id = ?",
    [nome, telefone, req.session.userId],
    (err) => {
      if (err) return res.status(500).json({ error: "Erro ao atualizar." });
      res.json({ success: true });
    }
  );
});

// ---------- CURRÍCULOS ----------

// Listar
app.get("/api/curriculos", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Não autenticado." });

  db.all(
    "SELECT * FROM curriculos WHERE usuario_id = ? ORDER BY id DESC",
    [req.session.userId],
    (err, rows) => {
      res.json(rows || []);
    }
  );
});

// Criar novo currículo
app.post("/api/curriculos", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Não autenticado." });

  const { vaga, curriculoLink, consentimento } = req.body;

  db.run(
    `INSERT INTO curriculos (usuario_id, vaga, curriculo_link, consentimento)
     VALUES (?, ?, ?, ?)`,
    [req.session.userId, vaga, curriculoLink, consentimento ? 1 : 0],
    (err) => {
      if (err) return res.status(500).json({ error: "Erro ao cadastrar currículo." });
      res.json({ success: true });
    }
  );
});

// 404 fallback — envia index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start (usa a porta do Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
