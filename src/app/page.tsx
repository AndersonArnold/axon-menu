import Link from "next/link";
import { Utensils, Zap, Shield, Globe, Upload, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Utensils size={20} className="text-orange-400" />
          <span className="font-bold text-lg tracking-tight text-slate-100">Axon Menu</span>
        </div>
        <span className="text-xs text-slate-500 bg-[#1e293b] px-3 py-1 rounded-full border border-[#334155]">
          Plataforma Multi-Tenant
        </span>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-4 py-1.5 mb-8">
          <Zap size={12} />
          <span>Edge Runtime · Supabase · Next.js 16 · Dark Mode</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter leading-[1.1] max-w-2xl text-slate-50">
          Cardápio Digital que
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500">
            {" "}Impressiona
          </span>
        </h1>

        <p className="mt-6 text-slate-400 text-lg max-w-md leading-relaxed">
          Cada lojista tem seu próprio subdomínio, identidade visual dark premium
          e cardápio — tudo em tempo real via Supabase.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/demo"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all active:scale-95 text-sm"
          >
            Ver Demo Premium →
          </Link>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl border border-[#334155] text-slate-300 font-semibold hover:bg-[#1e293b] transition-colors text-sm"
          >
            Configurar Supabase
          </a>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            {
              icon: Globe,
              title: "Multi-Tenant",
              desc: "Subdomínio único por lojista via Middleware Edge",
              color: "#F97316",
            },
            {
              icon: Upload,
              title: "Upload de Mídia",
              desc: "Imagens de produtos direto para Supabase Storage",
              color: "#8B5CF6",
            },
            {
              icon: Clock,
              title: "Status em Tempo Real",
              desc: "Aberto/Fechado automático com polling de 60s",
              color: "#22C55E",
            },
            {
              icon: Zap,
              title: "Edge Runtime",
              desc: "Carregamento instantâneo via CDN global",
              color: "#EAB308",
            },
            {
              icon: Shield,
              title: "Dark Mode Premium",
              desc: "Tema escuro #0f172a com cor primária do lojista",
              color: "#EC4899",
            },
            {
              icon: Utensils,
              title: "Skeleton Loading",
              desc: "UX premium com shimmer enquanto carrega",
              color: "#06B6D4",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 text-left hover:border-[#475569] hover:bg-[#263548] transition-all duration-200"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}18` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-700 border-t border-[#1e293b]">
        © {new Date().getFullYear()} Axon Menu — Todos os direitos reservados
      </footer>
    </div>
  );
}
