import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORREÇÃO OBRIGATÓRIA PARA O ERRO DA CLOUDFLARE
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Lógica de subdomínio: extrai 'lanchonete' de lanchonete.axonmenu.com
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // Segurança: não interfere em arquivos de sistema ou imagens
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redireciona internamente para a rota do lojista
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}