import * as query from '../db/index.js';

export async function getAllUsuarios(req, res) {
  try {
    const result = await query('SELECT * FROM usuarios ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUsuarioById(req, res) {
  try {
    const result = await query('SELECT * FROM usuarios WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUsuario(req, res) {
  const { nome, email, senha_hash, role } = req.body;
  try {
    const result = await query(
      'INSERT INTO usuarios (nome, email, senha_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, senha_hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUsuario(req, res) {
  const { nome, email, senha_hash, role } = req.body;
  try {
    const result = await query(
      'UPDATE usuarios SET nome=$1, email=$2, senha_hash=$3, role=$4 WHERE id=$5 RETURNING *',
      [nome, email, senha_hash, role, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUsuario(req, res) {
  try {
    await query('DELETE FROM usuarios WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
