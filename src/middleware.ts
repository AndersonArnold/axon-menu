import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORREÇÃO OBRIGATÓRIA: A Cloudflare exige este termo exato
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Lógica de subdomínio do Axon Menu
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // Evita loops em arquivos de sistema
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redireciona para a rota dinâmica do lojista
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}