import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Fallback en memoria si no hay Redis configurado en desarrollo
const memoryStore = new Map<string, { count: number; resetTime: number }>()

export async function checkRateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 3600
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Si Upstash Redis está configurado en .env
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = Redis.fromEnv()
      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      })
      const result = await ratelimit.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    } catch (e) {
      console.warn("⚠️ Error en Upstash Redis, usando fallback local:", e)
    }
  }

  // Fallback en memoria
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = memoryStore.get(identifier)

  if (!record || now > record.resetTime) {
    memoryStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    }
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime,
    }
  }

  record.count += 1
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetTime,
  }
}
