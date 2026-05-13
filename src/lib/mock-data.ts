import { Lojista, Categoria, Produto } from "@/lib/types";

// ──────────────────────────────────────────────────────────────────────────────
// Demo mock data — used when Supabase is not configured or slug === "demo".
// Remove after connecting your Supabase DB.
// ──────────────────────────────────────────────────────────────────────────────

export const DEMO_LOJISTA: Lojista = {
  id: "demo-lojista-001",
  slug: "demo",
  nome: "MOE'S LANCHERIA",
  descricao: "Hambúrgueres artesanais e ingredientes frescos, do jeito que você gosta 🍔",
  banner_url:
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1920&q=90",
  logo_url: null as unknown as string,
  cor_primaria: "#F97316",
  cor_secundaria: "#1a1a2e",
  telefone: "(11) 99999-0000",
  endereco: "Rua das Hambúrgueres, 42 — São Paulo, SP",
  taxa_entrega: 6.99,
  ativo: true,
  created_at: new Date().toISOString(),
  grade_horarios: {
    domingo: { aberto: false, abertura: "00:00", fechamento: "00:00" },
    segunda: { aberto: true, abertura: "11:00", fechamento: "23:00" },
    terca:   { aberto: true, abertura: "11:00", fechamento: "23:00" },
    quarta:  { aberto: true, abertura: "11:00", fechamento: "23:00" },
    quinta:  { aberto: true, abertura: "11:00", fechamento: "23:00" },
    sexta:   { aberto: true, abertura: "11:00", fechamento: "00:00" },
    sabado:  { aberto: true, abertura: "12:00", fechamento: "00:00" },
  },
};

export const DEMO_CATEGORIAS: Categoria[] = [
  { id: "cat-1", lojista_id: "demo-lojista-001", nome: "Burgers",     icone_url: null as unknown as string, ordem: 1 },
  { id: "cat-2", lojista_id: "demo-lojista-001", nome: "Bebidas",     icone_url: null as unknown as string, ordem: 2 },
  { id: "cat-3", lojista_id: "demo-lojista-001", nome: "Combos",      icone_url: null as unknown as string, ordem: 3 },
  { id: "cat-4", lojista_id: "demo-lojista-001", nome: "Sobremesas",  icone_url: null as unknown as string, ordem: 4 },
];

export const DEMO_PRODUTOS: Produto[] = [
  // ── Burgers ────────────────────────────────────────────────────────────
  {
    id: "p-1", categoria_id: "cat-1", lojista_id: "demo-lojista-001",
    nome: "Classic Burger",
    descricao: "Blend 180g, queijo cheddar, alface, tomate, maionese artesanal",
    preco: 32.90,
    imagem_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80",
    disponivel: true, ordem: 1,
  },
  {
    id: "p-2", categoria_id: "cat-1", lojista_id: "demo-lojista-001",
    nome: "Smash Burger Duplo",
    descricao: "Dois blends de 90g smashados, bacon crispy, cheddar duplo, onion rings",
    preco: 42.90,
    imagem_url: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&q=80",
    disponivel: true, ordem: 2,
  },
  {
    id: "p-3", categoria_id: "cat-1", lojista_id: "demo-lojista-001",
    nome: "BBQ Bacon Burger",
    descricao: "Blend 200g, cheddar defumado, bacon crispy, molho barbecue artesanal",
    preco: 38.90,
    imagem_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&q=80",
    disponivel: true, ordem: 3,
  },
  {
    id: "p-4", categoria_id: "cat-1", lojista_id: "demo-lojista-001",
    nome: "Veggie Burger",
    descricao: "Hambúrguer de grão de bico, alface, tomate, molho de ervas frescas",
    preco: 28.90,
    imagem_url: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300&q=80",
    disponivel: false, ordem: 4,
  },
  // ── Bebidas ────────────────────────────────────────────────────────────
  {
    id: "p-5", categoria_id: "cat-2", lojista_id: "demo-lojista-001",
    nome: "Refrigerante Lata",
    descricao: "Coca-Cola, Guaraná ou Sprite — 350ml gelada",
    preco: 6.90,
    imagem_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80",
    disponivel: true, ordem: 1,
  },
  {
    id: "p-6", categoria_id: "cat-2", lojista_id: "demo-lojista-001",
    nome: "Milk Shake Artesanal",
    descricao: "Chocolate, Morango ou Baunilha — 500ml com chantilly",
    preco: 18.90,
    imagem_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80",
    disponivel: true, ordem: 2,
  },
  {
    id: "p-7", categoria_id: "cat-2", lojista_id: "demo-lojista-001",
    nome: "Limonada Suíça",
    descricao: "Limão siciliano, leite condensado e creme de leite — 400ml",
    preco: 14.90,
    imagem_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&q=80",
    disponivel: true, ordem: 3,
  },
  // ── Combos ────────────────────────────────────────────────────────────
  {
    id: "p-8", categoria_id: "cat-3", lojista_id: "demo-lojista-001",
    nome: "Combo Classic",
    descricao: "Classic Burger + Batata Frita (P) + Refri 350ml",
    preco: 48.90,
    imagem_url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&q=80",
    disponivel: true, ordem: 1,
  },
  {
    id: "p-9", categoria_id: "cat-3", lojista_id: "demo-lojista-001",
    nome: "Combo Smash Duplo",
    descricao: "Smash Burger Duplo + Batata Frita (G) + Milk Shake 300ml",
    preco: 64.90,
    imagem_url: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&q=80",
    disponivel: true, ordem: 2,
  },
  // ── Sobremesas ────────────────────────────────────────────────────────
  {
    id: "p-10", categoria_id: "cat-4", lojista_id: "demo-lojista-001",
    nome: "Brownie com Sorvete",
    descricao: "Brownie de chocolate quente com bola de sorvete de baunilha e calda",
    preco: 16.90,
    imagem_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80",
    disponivel: true, ordem: 1,
  },
  {
    id: "p-11", categoria_id: "cat-4", lojista_id: "demo-lojista-001",
    nome: "Cheesecake de Frutas Vermelhas",
    descricao: "Base crocante, cream cheese artesanal, calda de frutas vermelhas",
    preco: 19.90,
    imagem_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&q=80",
    disponivel: true, ordem: 2,
  },
];
