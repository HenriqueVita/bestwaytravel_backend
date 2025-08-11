import db from '../db/index.js';

export async function get (req, res, next) {
  try {
    const { status } = req.query;
    if (status) {
      const { rows } = await db.query('SELECT * FROM caixa WHERE status = $1 ORDER BY data_abertura DESC', [status]);
      return res.json(rows);
    }
    const { rows } = await db.query('SELECT * FROM caixa ORDER BY data_abertura DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function post (req, res, next) {
  try {
    const { saldoInicial } = req.body;
    if (saldoInicial === undefined) return res.status(400).json({ error: 'saldoInicial é obrigatório' });

    // opcional: garantir que não exista caixa aberto
    const { rows: aberto } = await db.query("SELECT * FROM caixa WHERE status = 'aberto' LIMIT 1");
    if (aberto[0]) return res.status(400).json({ error: 'Já existe caixa aberto' });

    const q = `INSERT INTO caixa (data_abertura, saldo_inicial, status) VALUES ($1,$2,$3) RETURNING *`;
    const params = [new Date().toISOString(), saldoInicial, 'aberto'];
    const { rows } = await db.query(q, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function fechar (req, res, next) {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { saldoFinal } = req.body;

    if (saldoFinal === undefined) return res.status(400).json({ error: 'saldoFinal é obrigatório' });

    await client.query('BEGIN');

    // checar caixa
    const { rows: caixaRows } = await client.query('SELECT * FROM caixa WHERE id = $1 FOR UPDATE', [id]);
    if (!caixaRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Caixa não encontrado' });
    }
    if (caixaRows[0].status !== 'aberto') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Caixa já está fechado' });
    }

    // calcular saldo automaticamente se quiser (sum de lançamentos do dia)
    // aqui assumimos que o fechamento faz update com valores fornecidos
    const q = `UPDATE caixa SET data_fechamento = $1, saldo_final = $2, status = $3 WHERE id = $4 RETURNING *`;
    const params = [new Date().toISOString(), saldoFinal, 'fechado', id];
    const { rows } = await client.query(q, params);

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function getById (req, res, next) {
  try {
    const { rows } = await db.query('SELECT * FROM caixa WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Caixa não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}