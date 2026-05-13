// Shared TypeScript types for the multi-tenant system

export type DiasSemana =
  | "domingo"
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

export interface HorarioDia {
  aberto: boolean;
  abertura: string; // "HH:mm"
  fechamento: string; // "HH:mm"
}

export type GradeHorarios = Record<DiasSemana, HorarioDia>;

export interface Lojista {
  id: string;
  slug: string;
  nome: string;
  descricao?: string;
  banner_url?: string;
  logo_url?: string;
  cor_primaria: string; // hex, e.g. "#FF5500"
  cor_secundaria?: string;
  grade_horarios: GradeHorarios;
  telefone?: string;
  endereco?: string;
  /** Link do Google Maps para abrir a rota no cliente */
  google_maps_url?: string;
  /** Taxa fixa de entrega (somada ao pedido na modalidade entrega) */
  taxa_entrega?: number;
  ativo: boolean;
  created_at: string;
}

export interface Categoria {
  id: string;
  lojista_id: string;
  nome: string;
  icone_url?: string;
  ordem: number;
}

export interface Produto {
  id: string;
  categoria_id: string;
  lojista_id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem_url?: string;
  disponivel: boolean;
  ordem: number;
}

export type MeioPagamento = "dinheiro" | "pix" | "cartao";

export type TipoMovimento = "abertura" | "suprimento" | "sangria" | "venda" | "fechamento";

export interface MovimentoCaixa {
  id: string;
  caixa_id: string;
  lojista_id: string;
  tipo: TipoMovimento;
  meio_pagamento?: MeioPagamento;
  valor: number; // positive = entrada, negative = saída
  descricao?: string;
  created_at: string;
}

export interface Caixa {
  id: string;
  lojista_id: string;
  aberto: boolean;
  valor_abertura: number;
  valor_fechamento_sistema?: number; // sum calculated by system
  valor_fechamento_operador?: number; // typed by operator at close
  diferenca?: number;
  aberto_em: string;
  fechado_em?: string;
  created_at: string;
}
