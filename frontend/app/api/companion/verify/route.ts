import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/companion/catalog';
import { ProcessManager } from '@/lib/companion/process-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { appIds } = body;

    // If no appIds provided, check all catalog apps
    const catalog = getCatalog();
    const catalogIds = catalog.map(a => a.wingetId);
    
    if (!appIds || !Array.isArray(appIds) || appIds.length === 0) {
      appIds = catalogIds;
    }

    // Only check IDs that exist in our catalog (security check)
    const validIds = appIds.filter((id: string) => catalogIds.includes(id));

    const results: Record<string, boolean> = {};

    // Run `winget list` once and parse the output — much faster than per-app queries
    const p = new ProcessManager();
    let output = "";
    try {
      const code = await p.spawnProcess(
        'winget',
        ['list', '--accept-source-agreements', '--disable-interactivity'],
        (data) => { output += data; },
        () => {}
      );

      if (code === 0) {
        const outputLower = output.toLowerCase();
        for (const id of validIds) {
          // winget list output includes the package ID in the table
          // Check both the exact ID and case-insensitive match
          results[id] = outputLower.includes(id.toLowerCase());
        }
      } else {
        // winget failed — mark all as not installed
        for (const id of validIds) {
          results[id] = false;
        }
      }
    } catch {
      for (const id of validIds) {
        results[id] = false;
      }
    }

    return NextResponse.json({
      success: true,
      installed: results
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
