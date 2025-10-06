import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    // API routes require x-username header
    const username = request.headers.get('x-username');
    if (!username && !pathname.includes('/api/health')) {
      return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // For page requests, check if username is provided via query param
  const username = request.nextUrl.searchParams.get('u');
  if (!username) {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Access Denied</title></head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5;">
  <div style="text-align: center;">
    <h1>403 Forbidden</h1>
    <p>This application can only be accessed through LearnWorlds.</p>
  </div>
</body>
</html>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Optional: Check referer
  const referer = request.headers.get('referer');
  if (referer && !referer.includes('learnworlds.com')) {
    // You may want to be more strict here
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|gif|webp|ico)).*)'],
};

