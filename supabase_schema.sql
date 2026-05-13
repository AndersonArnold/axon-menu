-- =============================================================
-- Axon Menu — Schema Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- =============================================================

-- ─── Extensão para UUIDs ───────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tabela: lojistas ─────────────────────────────────────────
create table public.lojistas (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  nome          text not null,
  descricao     text,
  banner_url    text,
  logo_url      text,
  cor_primaria  text not null default '#FF5500',
  cor_secundaria text,
  telefone      text,
  endereco      text,
  taxa_entrega  numeric(10, 2) not null default 0,
  ativo         boolean not null default true,
  -- grade_horarios: JSON com a grade semanal
  -- Formato: { "segunda": { "aberto": true, "abertura": "09:00", "fechamento": "22:00" }, ... }
  grade_horarios jsonb not null default '{
    "domingo":  { "aberto": false, "abertura": "00:00", "fechamento": "00:00" },
    "segunda":  { "aberto": true,  "abertura": "09:00", "fechamento": "22:00" },
    "terca":    { "aberto": true,  "abertura": "09:00", "fechamento": "22:00" },
    "quarta":   { "aberto": true,  "abertura": "09:00", "fechamento": "22:00" },
    "quinta":   { "aberto": true,  "abertura": "09:00", "fechamento": "22:00" },
    "sexta":    { "aberto": true,  "abertura": "09:00", "fechamento": "23:00" },
    "sabado":   { "aberto": true,  "abertura": "10:00", "fechamento": "23:00" }
  }'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Tabela: categorias ───────────────────────────────────────
create table public.categorias (
  id          uuid primary key default uuid_generate_v4(),
  lojista_id  uuid not null references public.lojistas(id) on delete cascade,
  nome        text not null,
  icone_url   text,
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── Tabela: produtos ─────────────────────────────────────────
create table public.produtos (
  id           uuid primary key default uuid_generate_v4(),
  lojista_id   uuid not null references public.lojistas(id) on delete cascade,
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  nome         text not null,
  descricao    text,
  preco        numeric(10, 2) not null,
  imagem_url   text,
  disponivel   boolean not null default true,
  ordem        int not null default 0,
  created_at   timestamptz not null default now()
);

-- ─── Índices ──────────────────────────────────────────────────
create index idx_lojistas_slug   on public.lojistas (slug);
create index idx_categorias_loj  on public.categorias (lojista_id, ordem);
create index idx_produtos_cat    on public.produtos (categoria_id, ordem);
create index idx_produtos_loj    on public.produtos (lojista_id);

-- ─── RLS (Row Level Security) — leitura pública ────────────────
alter table public.lojistas   enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos   enable row level security;

-- Qualquer usuário (incluindo anônimo) pode ler lojistas ativos
create policy "lojistas_public_read" on public.lojistas
  for select using (ativo = true);

create policy "categorias_public_read" on public.categorias
  for select using (
    exists (
      select 1 from public.lojistas l
      where l.id = lojista_id and l.ativo = true
    )
  );

create policy "produtos_public_read" on public.produtos
  for select using (
    exists (
      select 1 from public.lojistas l
      where l.id = lojista_id and l.ativo = true
    )
  );

-- ─── Dados de exemplo (demo) ──────────────────────────────────
insert into public.lojistas (slug, nome, descricao, cor_primaria, telefone, endereco, taxa_entrega, grade_horarios, banner_url)
values (
  'demo',
  'MOE''S LANCHERIA',
  'Hambúrgueres artesanais e ingredientes frescos 🍔',
  '#F97316',
  '(11) 99999-0000',
  'Rua das Hambúrgueres, 42 — São Paulo, SP',
  6.99,
  '{
    "domingo":  { "aberto": false, "abertura": "00:00", "fechamento": "00:00" },
    "segunda":  { "aberto": true,  "abertura": "11:00", "fechamento": "23:00" },
    "terca":    { "aberto": true,  "abertura": "11:00", "fechamento": "23:00" },
    "quarta":   { "aberto": true,  "abertura": "11:00", "fechamento": "23:00" },
    "quinta":   { "aberto": true,  "abertura": "11:00", "fechamento": "23:00" },
    "sexta":    { "aberto": true,  "abertura": "11:00", "fechamento": "00:00" },
    "sabado":   { "aberto": true,  "abertura": "12:00", "fechamento": "00:00" }
  }'::jsonb,
  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1920&q=90'
) returning id;

-- ─── Migração: coluna taxa_entrega em bases já criadas ─────────────────────
alter table public.lojistas
  add column if not exists taxa_entrega numeric(10, 2) not null default 0;

-- ─── Migração: coluna google_maps_url em bases já criadas ───────────────────
alter table public.lojistas
  add column if not exists google_maps_url text;

-- Após inserir o lojista, use o id retornado para as categorias e produtos.
-- Substitua 'SEU-LOJISTA-ID' pelo UUID retornado acima.

-- insert into public.categorias (lojista_id, nome, ordem) values
--   ('SEU-LOJISTA-ID', 'Burgers', 1),
--   ('SEU-LOJISTA-ID', 'Bebidas', 2),
--   ('SEU-LOJISTA-ID', 'Sobremesas', 3);
