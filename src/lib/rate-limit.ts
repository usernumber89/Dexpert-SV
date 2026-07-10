// ⚠️ In-memory ratelimit: resets on every server restart/deploy.
// For production serverless (Vercel), install @upstash/ratelimit + @upstash/redis
// and swap the implementation below.
//
// Usage with Upstash:
//   import { Ratelimit } from "@upstash/ratelimit";
//   import { Redis } from "@upstash/redis";
//   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, "60 s") });
//   const { success } = await ratelimit.limit(key);
//   if (!success) return rateLimitResponse();

const rateMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count++;
  return true;
}

export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${endpoint}:${identifier}`;
}

export function rateLimitResponse() {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: { "Content-Type": "application/json" },
  });
}
