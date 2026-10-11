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
