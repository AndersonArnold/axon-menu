"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Lojista, Categoria, Produto } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase-config";
import { DEMO_LOJISTA, DEMO_CATEGORIAS, DEMO_PRODUTOS } from "@/lib/mock-data";
import AuthGate from "./AuthGate";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import StoreSettingsPanel from "./StoreSettingsPanel";
import StoreProfilePanel from "./StoreProfilePanel";
import CaixaPanel from "./CaixaPanel";
import { OrderPrint } from "@/components/OrderPrint"; // <-- NOVO: Importar Componente
import { LayoutGrid, Package, Settings, ShieldCheck, Store, Landmark, Printer } from "lucide-react"; // <-- NOVO: Importar Ícone Printer

type Tab = "categorias" | "produtos" | "loja" | "perfil" | "caixa";

export default function AdminPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>("categorias");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lojista, setLojista] = useState<Lojista | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // NOVO: Estado para teste de impressão (em um sistema real, você passaria o pedido selecionado)
  const [pedidoTeste, setPedidoTeste] = useState<any>(null);

  const isDemo = slug === "demo" || !isSupabaseConfigured();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemo) {
        setLojista(DEMO_LOJISTA);
        setCategorias([...DEMO_CATEGORIAS]);
        setProdutos([...DEMO_PRODUTOS]);
      } else {
        const [lojRes, catRes, prodRes] = await Promise.all([
          supabase.from("lojistas").select("*").eq("slug", slug).single(),
          supabase.from("categorias").select("*").eq("lojista_id", (await supabase.from("lojistas").select("id").eq("slug", slug).single()).data?.id ?? "").order("ordem"),
          supabase.from("produtos").select("*").order("ordem"),
        ]);
        if (lojRes.data) {
          const l = lojRes.data as Lojista;
          setLojista(l);
          setCategorias((catRes.data as Categoria[]) ?? []);
          setProdutos(((prodRes.data as Produto[]) ?? []).filter((p) => p.lojista_id === l.id));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [slug, isDemo]);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  // NOVO: Função para disparar a impressão
  const imprimirTeste = () => {
    // Criamos um objeto de pedido fictício apenas para testar o layout
    setPedidoTeste({
      id: "TESTE-123",
      lojista_nome: lojista?.nome,
      total: 50.00,
      metodo_pagamento: "Dinheiro",
      endereco: "Endereço de Teste, 123",
      itens: [
        { quantidade: 2, nome: "Hambúrguer de Teste", preco: 25.00, obs: "Sem cebola" }
      ]
    });
    
    // Pequeno delay para o React renderizar o componente invisível antes de abrir a janela de impressão
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (!authenticated) {
    return <AuthGate onSuccess={() => setAuthenticated(true)} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "perfil", label: "Perfil da Loja", icon: <Store size={16} /> },
    { id: "categorias", label: "Categorias", icon: <LayoutGrid size={16} /> },
    { id: "produtos", label: "Produtos", icon: <Package size={16} /> },
    { id: "loja", label: "Configurações", icon: <Settings size={16} /> },
    { id: "caixa", label: "Caixa", icon: <Landmark size={16} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#070b12" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)",
          borderBottom: "1px solid #1e293b",
          padding: "0 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 500, lineHeight: 1 }}>Painel Admin</p>
              <p style={{ fontSize: 15, color: "#f1f5f9", fontWeight: 700, lineHeight: 1.2 }}>
                {lojista?.nome ?? slug.toUpperCase()}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* NOVO: Botão de Imprimir Teste no Header para fácil acesso */}
            <button
              onClick={imprimirTeste}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "#f97316",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginRight: 10
              }}
            >
              <Printer size={14} /> Imprimir Teste
            </button>

            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: tab === t.id ? "#6366f1" : "transparent",
                  background: tab === t.id ? "rgba(99,102,241,0.15)" : "transparent",
                  color: tab === t.id ? "#a5b4fc" : "#64748b",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {loading ? (
          <AdminSkeleton />
        ) : (
          <>
            {/* NOVO: Componente Invisível que só aparece na Impressão */}
            <OrderPrint order={pedidoTeste} />

            {tab === "categorias" && (
              <CategoriesPanel
                categorias={categorias}
                setCategorias={setCategorias}
                lojista={lojista!}
                saving={saving}
                setSaving={setSaving}
                isDemo={isDemo}
              />
            )}
            {/* ... restante dos painéis ... */}
            {tab === "produtos" && (
              <ProductsPanel
                produtos={produtos}
                setProdutos={setProdutos}
                categorias={categorias}
                lojista={lojista!}
                saving={saving}
                setSaving={setSaving}
                isDemo={isDemo}
              />
            )}
            {tab === "perfil" && (
              <StoreProfilePanel
                lojista={lojista!}
                setLojista={setLojista}
                saving={saving}
                setSaving={setSaving}
                isDemo={isDemo}
              />
            )}
            {tab === "loja" && (
              <StoreSettingsPanel
                lojista={lojista!}
                setLojista={setLojista}
                saving={saving}
                setSaving={setSaving}
                isDemo={isDemo}
              />
            )}
            {tab === "caixa" && (
              <CaixaPanel
                lojista={lojista!}
                isDemo={isDemo}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
      ))}
    </div>
  );
}