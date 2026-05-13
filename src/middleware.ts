import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// FORÇA O USO DO EDGE RUNTIME (Resolve o erro da Cloudflare)
export const config = {
  runtime: 'edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Lógica para extrair o subdomínio (ex: lanchonete.axonmenu.com)
  const currentHost = hostname.replace(`.localhost:3000`, '').replace(`.axon-menu.pages.dev`, '');

  // Evita loops em arquivos estáticos
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Reescreve a URL para a rota dinâmica /[slug]
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}