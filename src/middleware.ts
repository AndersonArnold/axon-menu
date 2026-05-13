import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ESTA LINHA É A CHAVE PARA O ERRO DA CLOUDFLARE SUMIR
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}