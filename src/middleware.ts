import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// RESOLVE O ERRO: Page /src/middleware provided runtime 'edge'
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Identifica o lojista pelo subdomínio
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // Evita loops infinitos em arquivos de sistema e imagens
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redireciona internamente para a pasta do lojista
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}