import { companionEvents } from '@/lib/companion/events';
import { WingetEvent } from '@/lib/companion/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const listener = (event: WingetEvent) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      companionEvents.on('*', listener);

      const interval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
      }, 15000);

      controller.enqueue(new TextEncoder().encode(`data: {"type":"connected"}\n\n`));

      cleanup = () => {
        companionEvents.off('*', listener);
        clearInterval(interval);
      };
    },
    cancel() {
      cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
