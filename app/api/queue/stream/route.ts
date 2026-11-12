import { NextRequest } from "next/server";
import { QueueService } from "@/services/queueService";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const doctorId = searchParams.get("doctorId") || undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state immediately
      try {
        const initialState = await QueueService.getQueueState(doctorId);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`)
        );
      } catch (err) {
        console.warn("SSE initial fetch error:", err);
      }

      // Interval timer to poll and send updates or keepalive
      const interval = setInterval(async () => {
        try {
          const freshState = await QueueService.getQueueState(doctorId);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(freshState)}\n\n`)
          );
        } catch {
          // Send ping keepalive if fetch fails
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }
      }, 5000);

      // Clean up when request closes
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
