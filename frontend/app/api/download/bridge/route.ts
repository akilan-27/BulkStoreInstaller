import { NextResponse } from 'next/server';

export async function GET() {
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
  return NextResponse.redirect(downloadUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
