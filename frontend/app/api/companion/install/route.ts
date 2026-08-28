import { NextResponse } from 'next/server';
import { installerEngine } from '@/lib/companion/installer';
import { validateAppIds } from '@/lib/companion/validator';

export async function POST(req: Request) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: 'Companion API is disabled on Vercel' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { appIds } = body;

    if (!appIds || !Array.isArray(appIds)) {
      return NextResponse.json({ error: 'Invalid appIds' }, { status: 400 });
    }

    const validIds = validateAppIds(appIds);
    if (validIds.length === 0) {
      return NextResponse.json({ error: 'No valid app IDs provided' }, { status: 400 });
    }

    const jobId = `job_${Date.now()}`;
    const job = installerEngine.startJob(jobId, validIds);

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      total: job.total
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
