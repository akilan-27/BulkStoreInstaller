import { NextResponse } from 'next/server';
import { stateManager } from '@/lib/companion/state';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  const job = stateManager.getJob();

  if (!job) {
    return NextResponse.json({ error: 'No job found' }, { status: 404 });
  }

  if (jobId && job.jobId !== jobId) {
    return NextResponse.json({ error: 'Job ID mismatch' }, { status: 404 });
  }

  let currentAppDetails = null;
  if (job.currentApp) {
    currentAppDetails = job.apps[job.currentApp];
  }

  return NextResponse.json({
    jobId: job.jobId,
    status: job.status,
    total: job.total,
    completed: job.completed,
    failed: job.failed,
    cancelled: job.cancelled,
    current: currentAppDetails ? {
      id: currentAppDetails.id,
      name: currentAppDetails.name,
      status: currentAppDetails.status,
      progress: currentAppDetails.progress
    } : null,
    queue: Object.values(job.apps).map(app => ({
      id: app.id,
      name: app.name,
      status: app.status,
      progress: app.progress,
      statusText: app.statusText,
      error: app.error
    }))
  });
}
