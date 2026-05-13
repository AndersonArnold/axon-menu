"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadProductImage, MediaUploadError } from "@/lib/media-upload";
import type { Categoria, Lojista, Produto } from "@/lib/types";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cardStyle, sectionTitle, btnPrimary, btnGhost, btnDanger, inputStyle, demoWarning } from "./styles";
import ImageUploader from "./ImageUploader";

interface Props {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  categorias: Categoria[];
  lojista: Lojista;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isDemo: boolean;
}

const emptyForm = (): Omit<Produto, "id" | "lojista_id" | "ordem"> => ({
  categoria_id: "",
  nome: "",
  descricao: "",
  preco: 0,
  imagem_url: "",
  disponivel: true,
});

export default function ProductsPanel({ produtos, setProdutos, categorias, lojista, saving, setSaving, isDemo }: Props) {
  const [expandedCat, setExpandedCat] = useState<string | null>(categorias[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [addingToCat, setAddingToCat] = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function handleProductImageUpload(file: File): Promise<string> {
    if (isDemo) {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, imagem_url: url }));
      return url;
    }
    setUploadErr(null);
    setImgUploading(true);
    try {
      const { url } = await uploadProductImage(file, lojista.id);
      setForm((f) => ({ ...f, imagem_url: url }));
      return url;
    } catch (err) {
      const msg = err instanceof MediaUploadError ? err.message : "Erro no upload.";
      setUploadErr(msg);
      throw err;
    } finally {
      setImgUploading(false);
    }
  }

  function startEdit(p: Produto) {
    setEditingId(p.id);
    setForm({ categoria_id: p.categoria_id, nome: p.nome, descricao: p.descricao ?? "", preco: p.preco, imagem_url: p.imagem_url ?? "", disponivel: p.disponivel });
    setAddingToCat(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setAddingToCat(null);
    setForm(emptyForm());
  }

  async function toggleDisponivel(p: Produto) {
    const next = !p.disponivel;
    setProdutos((prev) => prev.map((x) => x.id === p.id ? { ...x, disponivel: next } : x));
    if (!isDemo) {
      await supabase.from("produtos").update({ disponivel: next }).eq("id", p.id);
    }
  }

  async function saveProduct() {
    if (!form.nome.trim() || !form.categoria_id || saving) return;
    setSaving(true);
    if (editingId) {
      // update
      if (!isDemo) {
        await supabase.from("produtos").update({
          nome: form.nome.trim(),
          descricao: form.descricao || null,
          preco: form.preco,
          imagem_url: form.imagem_url || null,
          disponivel: form.disponivel,
          categoria_id: form.categoria_id,
        }).eq("id", editingId);
      }
      setProdutos((prev) => prev.map((p) => p.id === editingId ? { ...p, ...form, nome: form.nome.trim() } : p));
    } else {
      // insert
      const newProd: Produto = {
        id: `temp-${Date.now()}`,
        lojista_id: lojista.id,
        ordem: produtos.filter((p) => p.categoria_id === form.categoria_id).length,
        ...form,
        nome: form.nome.trim(),
      };
      if (!isDemo) {
        const { data } = await supabase.from("produtos").insert({
          lojista_id: lojista.id,
          categoria_id: form.categoria_id,
          nome: form.nome.trim(),
          descricao: form.descricao || null,
          preco: form.preco,
          imagem_url: form.imagem_url || null,
          disponivel: form.disponivel,
          ordem: newProd.ordem,
        }).select().single();
        if (data) newProd.id = (data as Produto).id;
      }
      setProdutos((prev) => [...prev, newProd]);
    }
    setSaving(false);
    cancelEdit();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Excluir este produto?")) return;
    setProdutos((prev) => prev.filter((p) => p.id !== id));
    if (!isDemo) await supabase.from("produtos").delete().eq("id", id);
  }

  const labelStyle = { color: "#64748b", fontSize: 11, fontWeight: 600 as const, letterSpacing: "0.06em", display: "block" as const, marginBottom: 4 };

  return (
    <div>
      {isDemo && demoWarning}
      {sectionTitle("Produtos")}

      {categorias.length === 0 && (
        <p style={{ color: "#64748b", textAlign: "center", padding: "3rem" }}>Crie categorias primeiro para poder adicionar produtos.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        {categorias.map((cat) => {
          const catProducts = produtos.filter((p) => p.categoria_id === cat.id);
          const isOpen = expandedCat === cat.id;

          return (
            <div key={cat.id} style={{ border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
              {/* Category header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 18px",
                  background: "rgba(15,23,42,0.9)",
                  cursor: "pointer",
                  justifyContent: "space-between",
                }}
                onClick={() => setExpandedCat(isOpen ? null : cat.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 15 }}>{cat.nome}</span>
                  <span style={{ background: "#1e293b", color: "#64748b", fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>
                    {catProducts.length} produto{catProducts.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    style={{ ...btnPrimary, padding: "6px 12px", fontSize: 12 }}
                    onClick={(e) => { e.stopPropagation(); setAddingToCat(cat.id); setForm({ ...emptyForm(), categoria_id: cat.id }); setEditingId(null); setExpandedCat(cat.id); }}
                  >
                    <Plus size={13} /> Produto
                  </button>
                  {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </div>
              </div>

              {/* Product list */}
              {isOpen && (
                <div style={{ padding: "0 12px 12px" }}>
                  {/* Add/edit form */}
                  {(addingToCat === cat.id || (editingId && produtos.find((p) => p.id === editingId)?.categoria_id === cat.id)) && (
                    <div style={{ ...cardStyle, margin: "12px 0", border: "1px solid #6366f1" }}>
                      <p style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                        {editingId ? "✏️ Editar Produto" : "➕ Novo Produto"}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>NOME DO PRODUTO *</label>
                          <input style={inputStyle} placeholder="Ex: X-Burguer Especial" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>PREÇO (R$) *</label>
                          <input style={inputStyle} type="number" step="0.01" min="0" placeholder="0,00" value={form.preco || ""} onChange={(e) => setForm((f) => ({ ...f, preco: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        <div>
                          <label style={labelStyle}>CATEGORIA</label>
                          <select
                            style={{ ...inputStyle }}
                            value={form.categoria_id}
                            onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}
                          >
                            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>DESCRIÇÃO</label>
                          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} placeholder="Ingredientes, modo de preparo..." value={form.descricao ?? ""} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <ImageUploader
                            inputId={`prod-img-${editingId ?? addingToCat ?? "new"}`}
                            label="IMAGEM DO PRODUTO"
                            shape="rect"
                            currentUrl={form.imagem_url ?? undefined}
                            onUpload={handleProductImageUpload}
                            hint="JPEG, PNG ou WebP — máx 5 MB"
                            disabled={saving || imgUploading}
                          />
                          {uploadErr && (
                            <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>❌ {uploadErr}</p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <button style={btnPrimary} onClick={saveProduct} disabled={saving || !form.nome.trim()}>
                          <Check size={14} /> {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button style={btnGhost} onClick={cancelEdit}><X size={14} /> Cancelar</button>
                      </div>
                    </div>
                  )}

                  {catProducts.length === 0 && addingToCat !== cat.id && (
                    <p style={{ color: "#334155", textAlign: "center", padding: "1rem", fontSize: 13 }}>Nenhum produto nesta categoria.</p>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {catProducts.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          background: editingId === p.id ? "rgba(99,102,241,0.05)" : "#0f172a",
                          borderRadius: 12,
                          border: `1px solid ${editingId === p.id ? "#6366f1" : "#1e293b"}`,
                        }}
                      >
                        {p.imagem_url && (
                          <img src={p.imagem_url} alt={p.nome} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</p>
                          <p style={{ color: "#10b981", fontWeight: 700, fontSize: 13, margin: 0 }}>R$ {p.preco.toFixed(2)}</p>
                        </div>

                        {/* Stock toggle */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                          <button
                            onClick={() => toggleDisponivel(p)}
                            style={{
                              width: 44,
                              height: 24,
                              borderRadius: 12,
                              border: "none",
                              background: p.disponivel ? "#10b981" : "#334155",
                              position: "relative",
                              cursor: "pointer",
                              transition: "background 0.2s",
                              flexShrink: 0,
                            }}
                          >
                            <span style={{
                              position: "absolute",
                              top: 3,
                              left: p.disponivel ? 23 : 3,
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "#fff",
                              transition: "left 0.2s",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            }} />
                          </button>
                          <span style={{ fontSize: 10, color: p.disponivel ? "#10b981" : "#475569", fontWeight: 600 }}>
                            {p.disponivel ? "Estoque" : "Indispon."}
                          </span>
                        </div>

                        <button style={btnGhost} onClick={() => startEdit(p)} title="Editar"><Pencil size={14} /></button>
                        <button style={btnDanger} onClick={() => deleteProduct(p.id)} title="Excluir"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
