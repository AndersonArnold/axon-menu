"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";

export type UploadState = "idle" | "uploading" | "done" | "error";

interface Props {
  /** Current image URL to show as preview */
  currentUrl?: string;
  /** Called after the user picks a file; parent handles actual upload and returns the final URL */
  onUpload: (file: File) => Promise<string>;
  /** Shape of the preview area */
  shape?: "rect" | "circle";
  /** Hint text shown below the dropzone */
  hint?: string;
  /** Label shown above the uploader */
  label?: string;
  /** ID for the hidden input (accessibility) */
  inputId: string;
  disabled?: boolean;
}

export default function ImageUploader({
  currentUrl,
  onUpload,
  shape = "rect",
  hint,
  label,
  inputId,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (disabled) return;
      // Local blob preview immediately
      const localBlob = URL.createObjectURL(file);
      setPreviewUrl(localBlob);
      setState("uploading");
      setErrorMsg(null);

      // Simulate indeterminate progress via interval
      let pct = 0;
      const interval = setInterval(() => {
        pct = Math.min(pct + Math.random() * 18, 85);
        setProgress(Math.round(pct));
      }, 200);

      try {
        const finalUrl = await onUpload(file);
        clearInterval(interval);
        setProgress(100);
        setPreviewUrl(finalUrl);
        setState("done");
        setTimeout(() => setState("idle"), 3000);
      } catch (err) {
        clearInterval(interval);
        setErrorMsg((err as Error).message ?? "Erro ao enviar imagem.");
        setState("error");
        setPreviewUrl(currentUrl ?? null);
      }
    },
    [disabled, onUpload, currentUrl]
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-picked
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  const isCircle = shape === "circle";
  const isUploading = state === "uploading";

  const dropzoneStyle: React.CSSProperties = {
    position: "relative",
    width: isCircle ? 120 : "100%",
    height: isCircle ? 120 : 130,
    borderRadius: isCircle ? "50%" : 14,
    border: `2px dashed ${dragging ? "#6366f1" : state === "error" ? "#ef4444" : state === "done" ? "#10b981" : "#1e293b"}`,
    background: dragging ? "rgba(99,102,241,0.08)" : "#0a1120",
    overflow: "hidden",
    cursor: disabled || isUploading ? "not-allowed" : "pointer",
    transition: "border-color 0.2s, background 0.2s",
    flexShrink: 0,
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            color: "#64748b",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          {label}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: "none" }}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
      />

      {/* Dropzone */}
      <div
        style={dropzoneStyle}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Preview image */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isUploading ? 0.4 : 1,
              transition: "opacity 0.3s",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Overlay content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: previewUrl && !isUploading ? "rgba(0,0,0,0)" : "transparent",
            transition: "background 0.2s",
          }}
          className="upload-overlay"
        >
          {isUploading ? (
            <>
              <div style={spinnerStyle} />
              <span style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 600 }}>
                {progress}%
              </span>
            </>
          ) : state === "done" ? (
            <CheckCircle2 size={28} color="#10b981" />
          ) : state === "error" ? (
            <AlertCircle size={24} color="#ef4444" />
          ) : !previewUrl ? (
            <>
              <Upload size={isCircle ? 20 : 24} color="#334155" />
              <span style={{ color: "#334155", fontSize: isCircle ? 10 : 12, textAlign: "center", padding: "0 8px" }}>
                {isCircle ? "Foto" : "Clique ou arraste"}
              </span>
            </>
          ) : null}
        </div>

        {/* Hover overlay for images that already have a preview */}
        {previewUrl && !isUploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "background 0.2s",
            }}
            className="preview-hover"
          >
            <style>{`.preview-hover:hover { background: rgba(0,0,0,0.55) !important; }
            .preview-hover:hover .hover-icon { opacity: 1 !important; }`}</style>
            <div className="hover-icon" style={{ opacity: 0, transition: "opacity 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Upload size={20} color="#fff" />
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Trocar</span>
            </div>
          </div>
        )}

        {/* Progress bar (rect only) */}
        {isUploading && !isCircle && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: `${progress}%`,
              height: 3,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              transition: "width 0.3s ease",
              borderRadius: "0 0 0 12px",
            }}
          />
        )}

        {/* Clear button */}
        {previewUrl && !isUploading && !isCircle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewUrl(null);
              setState("idle");
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Progress bar for circle shape */}
      {isUploading && isCircle && (
        <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: "#1e293b", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              transition: "width 0.3s ease",
              borderRadius: 99,
            }}
          />
        </div>
      )}

      {/* Status messages */}
      {state === "error" && errorMsg && (
        <p style={{ color: "#f87171", fontSize: 11, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
          <AlertCircle size={11} /> {errorMsg}
        </p>
      )}
      {state === "done" && (
        <p style={{ color: "#34d399", fontSize: 11, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
          <CheckCircle2 size={11} /> Upload concluído com sucesso!
        </p>
      )}
      {hint && state === "idle" && (
        <p style={{ color: "#475569", fontSize: 11, marginTop: 6 }}>{hint}</p>
      )}

      {/* URL text fallback */}
      {state !== "uploading" && !isCircle && (
        <div style={{ marginTop: 8 }}>
          <input
            type="url"
            placeholder="Ou cole uma URL aqui..."
            value={previewUrl ?? ""}
            onChange={(e) => setPreviewUrl(e.target.value || null)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #1e293b",
              background: "#0f172a",
              color: "#94a3b8",
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
    </div>
  );
}

const spinnerStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "3px solid #1e293b",
  borderTopColor: "#6366f1",
  animation: "spin 0.7s linear infinite",
};
