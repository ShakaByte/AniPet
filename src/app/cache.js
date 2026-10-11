import { Redis } from "@upstash/redis";

const TTL = 60 * 60 * 24 * 30; // 30 days

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? Redis.fromEnv()
        : null;

export const cacheKey = (animalType, breed, group) =>
    `anipet:v2:${animalType}:${breed.trim().toLowerCase()}:${group}`;

export async function cacheGet(key) {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        if (data) await redis.expire(key, TTL); // resets the 30 days on each visit
        return data ?? null;
    } catch {
        return null;
    }
}

export async function cacheSet(key, value) {
    if (!redis) return;
    try {
        await redis.set(key, value, { ex: TTL });
    } catch {}
}

const STATS_TTL = 60 * 60 * 24 * 90; // keep daily counters for 90 days

// Adds to today's counters, e.g. logStats({ hit: 1, hit_ms: 40 })
export async function logStats(counts) {
    if (!redis) return;
    try {
        const day = new Date().toISOString().slice(0, 10);
        const p = redis.pipeline();
        for (const [name, n] of Object.entries(counts)) {
            const k = `anipet:stats:${day}:${name}`;
            p.incrby(k, n);
            p.expire(k, STATS_TTL);
        }
        await p.exec();
    } catch {}
}