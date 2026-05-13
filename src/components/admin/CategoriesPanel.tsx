"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Categoria, Lojista } from "@/lib/types";
import { Plus, ChevronUp, ChevronDown, Pencil, Check, X, GripVertical } from "lucide-react";
import { cardStyle, sectionTitle, btnPrimary, btnGhost, inputStyle, demoWarning } from "./styles";

interface Props {
  categorias: Categoria[];
  setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
  lojista: Lojista;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isDemo: boolean;
}

export default function CategoriesPanel({ categorias, setCategorias, lojista, saving, setSaving, isDemo }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  function startEdit(cat: Categoria) {
    setEditingId(cat.id);
    setEditName(cat.nome);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(cat: Categoria) {
    if (!editName.trim() || saving) return;
    if (isDemo) {
      setCategorias((prev) => prev.map((c) => c.id === cat.id ? { ...c, nome: editName.trim() } : c));
      cancelEdit();
      return;
    }
    setSaving(true);
    await supabase.from("categorias").update({ nome: editName.trim() }).eq("id", cat.id);
    setCategorias((prev) => prev.map((c) => c.id === cat.id ? { ...c, nome: editName.trim() } : c));
    setSaving(false);
    cancelEdit();
  }

  async function moveCategory(index: number, dir: -1 | 1) {
    const newList = [...categorias];
    const target = index + dir;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    const updated = newList.map((c, i) => ({ ...c, ordem: i }));
    setCategorias(updated);
    if (!isDemo) {
      setSaving(true);
      await Promise.all(updated.map((c) => supabase.from("categorias").update({ ordem: c.ordem }).eq("id", c.id)));
      setSaving(false);
    }
  }

  async function addCategory() {
    if (!newName.trim() || saving) return;
    const tempId = `temp-${Date.now()}`;
    const newCat: Categoria = {
      id: tempId,
      lojista_id: lojista.id,
      nome: newName.trim(),
      ordem: categorias.length,
    };
    if (isDemo) {
      setCategorias((prev) => [...prev, newCat]);
      setNewName("");
      setAddingNew(false);
      return;
    }
    setSaving(true);
    const { data } = await supabase.from("categorias").insert({ lojista_id: lojista.id, nome: newName.trim(), ordem: categorias.length }).select().single();
    if (data) setCategorias((prev) => [...prev, data as Categoria]);
    setSaving(false);
    setNewName("");
    setAddingNew(false);
  }

  return (
    <div>
      {isDemo && demoWarning}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        {sectionTitle("Categorias")}
        <button style={btnPrimary} onClick={() => setAddingNew(true)} disabled={addingNew}>
          <Plus size={15} /> Nova Categoria
        </button>
      </div>

      {/* New category input */}
      {addingNew && (
        <div style={{ ...cardStyle, display: "flex", gap: 10, alignItems: "center", marginBottom: 12, border: "1px solid #6366f1" }}>
          <input
            autoFocus
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Nome da nova categoria..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") { setAddingNew(false); setNewName(""); } }}
          />
          <button style={btnPrimary} onClick={addCategory} disabled={saving || !newName.trim()}>
            <Check size={15} /> Salvar
          </button>
          <button style={btnGhost} onClick={() => { setAddingNew(false); setNewName(""); }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Categories list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categorias.length === 0 && (
          <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>Nenhuma categoria criada ainda.</p>
        )}
        {categorias.map((cat, i) => (
          <div key={cat.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12 }}>
            <GripVertical size={16} color="#334155" style={{ flexShrink: 0 }} />

            {editingId === cat.id ? (
              <>
                <input
                  autoFocus
                  style={{ ...inputStyle, flex: 1 }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(cat); if (e.key === "Escape") cancelEdit(); }}
                />
                <button style={btnPrimary} onClick={() => saveEdit(cat)} disabled={saving}>
                  <Check size={14} />
                </button>
                <button style={btnGhost} onClick={cancelEdit}>
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>{cat.nome}</span>
                <span style={{ fontSize: 11, color: "#475569", background: "#0f172a", padding: "2px 8px", borderRadius: 6 }}>
                  #{i + 1}
                </span>
                <button style={btnGhost} onClick={() => startEdit(cat)} title="Renomear">
                  <Pencil size={14} />
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button
                    style={{ ...btnGhost, padding: "4px 6px" }}
                    onClick={() => moveCategory(i, -1)}
                    disabled={i === 0}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    style={{ ...btnGhost, padding: "4px 6px" }}
                    onClick={() => moveCategory(i, 1)}
                    disabled={i === categorias.length - 1}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
