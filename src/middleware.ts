import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORREÇÃO FINAL: A Cloudflare exige 'experimental-edge' neste ambiente
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Lógica de subdomínio para identificar a lanchonete
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // Evita loops em arquivos do sistema e imagens
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redireciona internamente para a rota dinâmica do lojista
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}