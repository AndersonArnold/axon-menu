import { Store } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="mb-6">
        <Store size={56} className="text-gray-300 mx-auto" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Loja não encontrada</h1>
      <p className="mt-2 text-gray-500 text-sm max-w-xs">
        O cardápio que você tentou acessar não existe ou está inativo. Verifique
        o endereço e tente novamente.
      </p>
      <Link
        href="/"
        className="mt-8 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
