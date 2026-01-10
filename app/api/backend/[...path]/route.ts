import { NextRequest, NextResponse } from "next/server";

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL || process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;

if (!FUNCTIONS_BASE_URL) {
  throw new Error(
    "Missing FUNCTIONS_BASE_URL. Set it to your Firebase Functions base (e.g. http://127.0.0.1:5001/<project>/<region>/<api>)."
  );
}

const buildTargetUrl = (request: NextRequest, pathSegments: string[]) => {
  const normalizedBase = FUNCTIONS_BASE_URL.endsWith("/")
    ? FUNCTIONS_BASE_URL.slice(0, -1)
    : FUNCTIONS_BASE_URL;

  const joinedPath = pathSegments.map(encodeURIComponent).join("/");
  const target = new URL(`${normalizedBase}/${joinedPath}`);

  // Preserve query params
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  return target;
};

const handler = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(request, path);

  // Forward most headers; drop hop-by-hop and ones we want Next to manage.
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  // Only forward body for methods that can have one.
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, init);

  // Stream response back as-is.
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
