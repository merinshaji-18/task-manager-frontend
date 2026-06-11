import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token'); // Note: This requires moving token to cookies later, but for now, keep your useEffect protection.
  // Professionals use Cookies for Middleware because localStorage isn't accessible here.
  return NextResponse.next();
}