import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. CONFIGURAÇÃO OBRIGATÓRIA PARA CLOUDFLARE (Edge Runtime)
export const config = {
  runtime: 'edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 2. LÓGICA DE MULTI-TENANT (Subdomínios)
  // Extrai o slug do lojista (ex: lanchonete.axonmenu.com -> lanchonete)
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // 3. SEGURANÇA: Evita loops em arquivos do Next.js e imagens
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 4. REDIRECIONAMENTO DINÂMICO
  // Manda o pedido internamente para a pasta /[slug]/...
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}