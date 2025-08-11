import db from '../db/index.js';

export async function getAllOrcamentos(req, res) {
  try {
    const result = await db.query('SELECT * FROM orcamentos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrcamentoById(req, res) {
  try {
    const result = await db.query('SELECT * FROM orcamentos WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createOrcamento(req, res) {
  try {
    const body = req.body;

    // validações básicas
    if (!body.nomeCliente && !body.nome_cliente) return res.status(400).json({ error: 'nomeCliente é obrigatório' });
    if (body.valor === undefined && body.valor === null) return res.status(400).json({ error: 'valor é obrigatório' });
    if (!body.dataOrcamento && !body.data_orcamento && !body.dataOrcamento) return res.status(400).json({ error: 'dataOrcamento é obrigatória' });
    if (!body.produto) return res.status(400).json({ error: 'produto é obrigatório' });
    if (!body.formaPagamento && !body.forma_pagamento) return res.status(400).json({ error: 'formaPagamento é obrigatório' });

    // cálculos
    const {
      valorTotal,
      valorComissao,
      valor,
      taxa,
      percentualComissao,
      incentivo,
      desconto
    } = calcularCampos({
      valor: body.valor,
      taxa: body.taxa,
      percentualComissao: body.percentualComissao ?? body.percentual_comissao,
      incentivo: body.incentivo,
      desconto: body.desconto
    });

    const q = `
      INSERT INTO orcamentos
      (nome_cliente, fornecedor, loc_reserva, data_orcamento, data_viagem,
       produto, valor, taxa, valor_total, percentual_comissao, incentivo, desconto, valor_comissao,
       forma_pagamento, data_pagamento, data_recebimento_comissao, observacoes)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `;

    const params = [
      body.nomeCliente || body.nome_cliente,
      body.fornecedor || null,
      body.locReserva || body.loc_reserva || null,
      body.dataOrcamento || body.data_orcamento || new Date().toISOString(),
      body.dataViagem || body.data_viagem || null,
      body.produto,
      valor,
      taxa,
      valorTotal,
      percentualComissao,
      incentivo,
      desconto,
      valorComissao,
      body.forma_pagamento,
      body.dataPagamento || body.data_pagamento || null,
      body.dataRecebimentoComissao || body.data_recebimento_comissao || null,
      body.observacoes || null
    ];

    const { rows } = await db.query(q, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    throw(err);
  }
}

export async function updateOrcamento(req, res) {
   try {
    const id = req.params.id;
    const body = req.body;

    // construir dynamic update — mas força recálculo se campos monetários mudarem
    const allowed = [
      'nomeCliente','nome_cliente','fornecedor','locReserva','loc_reserva',
      'dataVenda','data_venda','dataViagem','data_viagem','produto',
      'valor','taxa','percentualComissao','percentual_comissao','incentivo','desconto',
      'formaPagamento','forma_pagamento','dataPagamento','data_pagamento','dataRecebimentoComissao','data_recebimento_comissao',
      'observacoes'
    ];

    const fields = [];
    const params = [];
    let idx = 1;

    // mapear campos simples (sem cálculos)
    for (const key of allowed) {
      if (body[key] !== undefined) {
        let col = key;
        // normalizar nomes para colunas do DB
        if (key === 'nomeCliente' || key === 'nome_cliente') col = 'nome_cliente';
        if (key === 'locReserva' || key === 'loc_reserva') col = 'loc_reserva';
        if (key === 'dataVenda' || key === 'data_venda') col = 'data_venda';
        if (key === 'dataViagem' || key === 'data_viagem') col = 'data_viagem';
        if (key === 'percentualComissao' || key === 'percentual_comissao') col = 'percentual_comissao';
        if (key === 'formaPagamento' || key === 'forma_pagamento') col = 'forma_pagamento';
        if (key === 'dataPagamento' || key === 'data_pagamento') col = 'data_pagamento';
        if (key === 'dataRecebimentoComissao' || key === 'data_recebimento_comissao') col = 'data_recebimento_comissao';

        fields.push(`${col} = $${idx}`);
        params.push(body[key]);
        idx++;
      }
    }

    // Se valor/taxa/percentual/incentivo/desconto foram passados — recalcule e atualize os campos relacionados
    const precisaRecalcular = ['valor','taxa','percentualComissao','percentual_comissao','incentivo','desconto'].some(k => body[k] !== undefined);

    if (precisaRecalcular) {
      // vamos obter o valor atual do registro (para usar valores não enviados)
      const { rows: existingRows } = await db.query('SELECT * FROM orcamentos WHERE id = $1', [id]);
      if (!existingRows[0]) return res.status(404).json({ error: 'Orçamento não encontrado' });
      const existing = existingRows[0];

      const v = body.valor !== undefined ? Number(body.valor) : Number(existing.valor);
      const t = body.taxa !== undefined ? Number(body.taxa) : Number(existing.taxa);
      const perc = body.percentualComissao !== undefined ? Number(body.percentualComissao) : (body.percentual_comissao !== undefined ? Number(body.percentual_comissao) : Number(existing.percentual_comissao));
      const incentivo = body.incentivo !== undefined ? Number(body.incentivo) : Number(existing.incentivo || 0);
      const desconto = body.desconto !== undefined ? Number(body.desconto) : Number(existing.desconto || 0);

      const valorTotal = parseFloat((v + t).toFixed(2));
      const valorComissao = parseFloat(((perc / 100) * v + incentivo - desconto).toFixed(2));

      fields.push(`valor_total = $${idx}`); params.push(valorTotal); idx++;
      fields.push(`valor_comissao = $${idx}`); params.push(valorComissao); idx++;
      // atualizar também valor e taxa caso vieram
      if (body.valor !== undefined) { /* valor já no fields se veio */ }
      if (body.taxa !== undefined) { /* taxa já no fields se veio */ }
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    params.push(id);
    const q = `UPDATE orcamentos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const { rows } = await db.query(q, params);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrcamento(req, res) {
  try {
    const { rows } = await db.query('DELETE FROM orcamentos WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json({ message: 'Orçamento deletado', orcamento: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function confirmarVendaOrcamento(req, res) {
  const { id } = req.params;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1 - Obter dados do orçamento
    const { rows: orcRows } = await client.query(
      'SELECT * FROM orcamentos WHERE id = $1',
      [id]
    );

    if (!orcRows.length) {
      throw new Error('Orçamento não encontrado');
    }

    const orc = orcRows[0];

    if (orc.status === 'vendido') {
      throw new Error('Este orçamento já foi convertido em venda.');
    }

    // 2 - Criar registro na tabela vendas
    const { rows: vendaRows } = await client.query(
      `INSERT INTO vendas (
        cliente_nome, fornecedor, reserva_loc, data_venda,
        data_viagem, produto, valor, taxa, valor_total,
        percentual_comissao, incentivo, desconto, valor_comissao,
        forma_pagamento, data_pagamento, data_recebimento_comissao
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      ) RETURNING *`,
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

    // 3 - Criar lançamentos no módulo financeiro
    // Receita da venda
    await client.query(
      `INSERT INTO lancamentos (
        tipo, descricao, categoria, valor, data_vencimento, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'receita',
        `Venda: ${orc.produto} - ${orc.cliente_nome}`,
        'Vendas',
        orc.valor_total,
        orc.forma_pagamento === 'Faturado' ? orc.data_pagamento : orc.data_recebimento_comissao,
        'pendente'
      ]
    );

    // Comissão a pagar ao vendedor
    await client.query(
      `INSERT INTO lancamentos (
        tipo, descricao, categoria, valor, data_vencimento, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'despesa',
        `Comissão sobre venda #${venda.id}`,
        'Comissões',
        orc.valor_comissao,
        orc.forma_pagamento === 'Faturado' ? orc.data_pagamento : orc.data_recebimento_comissao,
        'pendente'
      ]
    );

    // 4 - Atualizar orçamento como "vendido"
    await client.query(
      'UPDATE orcamentos SET status = $1, venda_id = $2 WHERE id = $3',
      ['vendido', venda.id, id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Orçamento convertido em venda com sucesso',
      venda
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
}

export async function confirmarPagamentoOrcamento(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'UPDATE orcamentos SET status = $1, data_pagamento = $2 WHERE id = $3 RETURNING *',
      ['pago', new Date().toISOString(), id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// helper: calcula valorTotal e valorComissao
function calcularCampos(body) {
  const valor = Number(body.valor || 0);
  const taxa = Number(body.taxa || 0);
  const percentualComissao = Number(body.percentualComissao || body.percentual_comissao || 0);
  const incentivo = Number(body.incentivo || 0);
  const desconto = Number(body.desconto || 0);

  const valorTotal = parseFloat((valor + taxa).toFixed(2));
  const valorComissao = parseFloat(((percentualComissao / 100) * valor + incentivo - desconto).toFixed(2));

  return { valorTotal, valorComissao, valor, taxa, percentualComissao, incentivo, desconto };
}
