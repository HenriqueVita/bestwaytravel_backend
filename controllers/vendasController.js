import db from '../db/index.js';

export async function getAllVendas(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT v.*, 
        o.id AS orcamento_id,
        o.nome_cliente, 
        o.produto 
      FROM vendas v
      LEFT JOIN orcamentos o ON o.venda_id = v.id
      ORDER BY v.data_venda DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getVendaById(req, res) {
  try {
    const result = await db.query('SELECT * FROM vendas WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Venda não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createVenda(req, res) {
  const { orcamento_id, cliente_id, valor_final, data_venda, observacoes } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO vendas (orcamento_id, cliente_id, valor_final, data_venda, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orcamento_id, cliente_id, valor_final, data_venda, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateVenda(req, res) {
  const { orcamento_id, cliente_id, valor_final, data_venda, observacoes } = req.body;
  try {
    const result = await db.query(
      'UPDATE vendas SET orcamento_id=$1, cliente_id=$2, valor_final=$3, data_venda=$4, observacoes=$5 WHERE id=$6 RETURNING *',
      [orcamento_id, cliente_id, valor_final, data_venda, observacoes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Venda não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteVenda(req, res) {
  try {
    await db.query('DELETE FROM vendas WHERE id=$1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function confirmarVendaOrcamento(req, res) {
  const { orcamentoId } = req.params;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Buscar orçamento
    const { rows: orcRows } = await client.query(
      'SELECT * FROM orcamentos WHERE id = $1',
      [orcamentoId]
    );
    if (!orcRows.length) throw new Error('Orçamento não encontrado');
    const orc = orcRows[0];
    if (orc.status === 'vendido') throw new Error('Orçamento já foi vendido');

    // Criar venda
    const { rows: vendaRows } = await client.query(
      `INSERT INTO vendas (
        cliente_nome, fornecedor, reserva_loc, data_venda, data_viagem, produto,
        valor, taxa, valor_total, percentual_comissao, incentivo, desconto, valor_comissao,
        forma_pagamento, data_pagamento, data_recebimento_comissao
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *`,
      [
        orc.cliente_nome,
        orc.fornecedor,
        orc.reserva_loc,
        orc.data_venda,
        orc.data_viagem,
        orc.produto,
        orc.valor,
        orc.taxa,
        orc.valor_total,
        orc.percentual_comissao,
        orc.incentivo,
        orc.desconto,
        orc.valor_comissao,
        orc.forma_pagamento,
        orc.data_pagamento,
        orc.data_recebimento_comissao
      ]
    );
    const venda = vendaRows[0];

    // Lançamento de receita
    await client.query(
      `INSERT INTO lancamentos (tipo, descricao, categoria, valor, data_vencimento, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'receita',
        `Venda: ${orc.produto} - ${orc.cliente_nome}`,
        'Vendas',
        orc.valor_total,
        orc.forma_pagamento === 'Faturado' ? orc.data_pagamento : orc.data_recebimento_comissao,
        'pendente'
      ]
    );

    // Lançamento de despesa (comissão)
    await client.query(
      `INSERT INTO lancamentos (tipo, descricao, categoria, valor, data_vencimento, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'despesa',
        `Comissão sobre venda #${venda.id}`,
        'Comissões',
        orc.valor_comissao,
        orc.forma_pagamento === 'Faturado' ? orc.data_pagamento : orc.data_recebimento_comissao,
        'pendente'
      ]
    );

    // Atualizar orçamento
    await client.query(
      'UPDATE orcamentos SET status = $1, venda_id = $2 WHERE id = $3',
      ['vendido', venda.id, orcamentoId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Venda confirmada', venda });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
}