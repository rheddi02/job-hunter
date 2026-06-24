import type { ConnectionOptions } from 'bullmq'

function parseRedisUrl(url: string): ConnectionOptions {
  const u = new URL(url)
  const isTls = url.startsWith('rediss://')
  const base = {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 6379,
    maxRetriesPerRequest: null,
  }
  if (u.password && isTls) return { ...base, password: u.password, tls: {} }
  if (u.password) return { ...base, password: u.password }
  if (isTls) return { ...base, tls: {} }
  return base
}

export const redisConnection: ConnectionOptions = parseRedisUrl(
  process.env.REDIS_URL ?? 'redis://localhost:6379',
)
