-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.caixa (
  id integer NOT NULL DEFAULT nextval('caixa_id_seq'::regclass),
  data_abertura timestamp with time zone NOT NULL,
  saldo_inicial numeric NOT NULL DEFAULT 0,
  data_fechamento timestamp with time zone,
  saldo_final numeric,
  status character varying NOT NULL DEFAULT 'aberto'::character varying CHECK (status::text = ANY (ARRAY['aberto'::character varying, 'fechado'::character varying]::text[])),
  CONSTRAINT caixa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categorias (
  id integer NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  nome text NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['receita'::character varying, 'despesa'::character varying]::text[])),
  cor text,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clientes (
  id integer NOT NULL DEFAULT nextval('clientes_id_seq'::regclass),
  nome text NOT NULL,
  email text UNIQUE,
  telefone text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.destinos (
  id integer NOT NULL DEFAULT nextval('destinos_id_seq'::regclass),
  nome text NOT NULL,
  pais text,
  preco_medio numeric,
  CONSTRAINT destinos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faturas (
  id integer NOT NULL DEFAULT nextval('faturas_id_seq'::regclass),
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['receber'::character varying, 'pagar'::character varying]::text[])),
  titulo text NOT NULL,
  cliente_id integer,
  vencimento date NOT NULL,
  total numeric NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['aberta'::character varying, 'paga'::character varying, 'cancelada'::character varying]::text[])),
  criado_em timestamp without time zone DEFAULT now(),
  CONSTRAINT faturas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lancamentos (
  id integer NOT NULL DEFAULT nextval('lancamentos_id_seq'::regclass),
  data date NOT NULL,
  descricao text NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['receita'::character varying, 'despesa'::character varying]::text[])),
  categoria_id integer,
  valor numeric NOT NULL,
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pago'::character varying, 'pendente'::character varying]::text[])),
  fatura_id integer,
  criado_em timestamp without time zone DEFAULT now(),
  data_vencimento timestamp without time zone,
  categoria character varying,
  CONSTRAINT lancamentos_pkey PRIMARY KEY (id),
  CONSTRAINT lancamentos_fatura_id_fkey FOREIGN KEY (fatura_id) REFERENCES public.faturas(id)
);
CREATE TABLE public.movimentacoes_caixa (
  id integer NOT NULL DEFAULT nextval('movimentacoes_caixa_id_seq'::regclass),
  data date NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['entrada'::character varying, 'saida'::character varying]::text[])),
  origem text,
  valor numeric NOT NULL,
  referencia text,
  criado_em timestamp without time zone DEFAULT now(),
  CONSTRAINT movimentacoes_caixa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orcamentos (
  id integer NOT NULL DEFAULT nextval('orcamentos_id_seq'::regclass),
  cliente_id integer,
  destino text NOT NULL,
  data_viagem date,
  valor_estipulado numeric,
  status text DEFAULT 'pendente'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT orcamentos_pkey PRIMARY KEY (id),
  CONSTRAINT orcamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.pagamentos (
  id integer NOT NULL DEFAULT nextval('pagamentos_id_seq'::regclass),
  fatura_id integer,
  data_pagamento date,
  valor_pago numeric,
  forma_pagamento text,
  CONSTRAINT pagamentos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text,
  email text NOT NULL UNIQUE,
  senha_hash text,
  role text DEFAULT 'atendente'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vendas (
  id integer NOT NULL DEFAULT nextval('vendas_id_seq'::regclass),
  orcamento_id integer,
  cliente_id integer,
  valor_final numeric,
  data_venda date DEFAULT now(),
  observacoes text,
  CONSTRAINT vendas_pkey PRIMARY KEY (id),
  CONSTRAINT vendas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT vendas_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id)
);