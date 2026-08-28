import { NextResponse } from 'next/server';
import { installerEngine } from '@/lib/companion/installer';
import { stateManager } from '@/lib/companion/state';

export async function POST() {
  const job = stateManager.getJob();
  
  if (!job) {
    return NextResponse.json({ error: 'No active job' }, { status: 400 });
  }

  if (job.status !== 'running') {
    return NextResponse.json({ error: 'Job is not running' }, { status: 400 });
  }

  installerEngine.cancelJob();

  return NextResponse.json({ success: true, message: 'Cancellation requested' });
}
