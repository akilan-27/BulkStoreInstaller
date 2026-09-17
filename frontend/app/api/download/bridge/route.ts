import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const downloadUrl = process.env.BRIDGE_DOWNLOAD_URL;

  if (!downloadUrl) {
    return NextResponse.json(
      { error: 'Bridge download URL is not configured on the server.' },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  // Temporary redirect (307) so the browser doesn't cache the URL indefinitely,
  // allowing us to update the environment variable for new versions.
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(downloadUrl);
  } catch {
    redirectUrl = new URL(downloadUrl, request.url);
  }

  return NextResponse.redirect(redirectUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
