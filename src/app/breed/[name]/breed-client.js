// src/app/breed/[name]/breed-client.js
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchPetDetails } from "../../actions";
import Profile from "../../profile";

const GROUPS = ["g1", "g2", "g3"];

const PREFIX = "anipet:v2:";
const MAX_AGE = 90 * 24 * 60 * 60 * 1000; // 90 days

const cacheKey = (type, breed, group) =>
    `${PREFIX}${type}:${breed.toLowerCase()}:${group}`;

function readCache(type, breed, group) {
    try {
        const k = cacheKey(type, breed, group);
        const raw = localStorage.getItem(k);
        if (!raw) return null;
        const { t, v } = JSON.parse(raw);
        if (!t || !v || Date.now() - t > MAX_AGE) {
            localStorage.removeItem(k); // expired
            return null;
        }
        // Visited again: restart the 90 days
        localStorage.setItem(k, JSON.stringify({ t: Date.now(), v }));
        return v;
    } catch {
        return null;
    }
}

function writeCache(type, breed, group, value) {
    try {
        localStorage.setItem(
            cacheKey(type, breed, group),
            JSON.stringify({ t: Date.now(), v: value }),
        );
    } catch {
        /* storage full or blocked: ignore */
    }
}

// Removes expired entries for breeds the user never revisited
function purgeExpired() {
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith(PREFIX)) continue;
            try {
                const { t } = JSON.parse(localStorage.getItem(k));
                if (!t || Date.now() - t > MAX_AGE) localStorage.removeItem(k);
            } catch {
                localStorage.removeItem(k);
            }
        }
    } catch {
        /* ignore */
    }
}

// Prevents duplicate identical requests (e.g. React dev double-mount)
const inflight = new Map();
function requestGroup(breed, group, type) {
    const key = cacheKey(type, breed, group);
    if (!inflight.has(key)) {
        const p = fetchPetDetails(breed, group, type).finally(() =>
            inflight.delete(key),
        );
        inflight.set(key, p);
    }
    return inflight.get(key);
}

const initialStatus = () =>
    Object.fromEntries(GROUPS.map((g) => [g, "loading"]));

export default function BreedClient({ breedName, animalType }) {
    const router = useRouter();

    const [data, setData] = useState({});
    const [status, setStatus] = useState(initialStatus);
    const [errors, setErrors] = useState({});
    const activeBreed = useRef(breedName);

    const loadGroup = useCallback(
        async (group) => {
            setStatus((s) => ({ ...s, [group]: "loading" }));
            setErrors((e) => ({ ...e, [group]: "" }));

            const cached = readCache(animalType, breedName, group);
            if (cached) {
                setData((d) => ({ ...d, ...cached }));
                setStatus((s) => ({ ...s, [group]: "ready" }));
                return;
            }

            const res = await requestGroup(breedName, group, animalType);
            if (activeBreed.current !== breedName) return;

            if (res.success) {
                const { success, ...fields } = res;
                writeCache(animalType, breedName, group, fields);
                setData((d) => ({ ...d, ...fields }));
                setStatus((s) => ({ ...s, [group]: "ready" }));
            } else {
                setErrors((e) => ({ ...e, [group]: res.error }));
                setStatus((s) => ({ ...s, [group]: "error" }));
            }
        },
        [breedName, animalType],
    );

    useEffect(() => {
        purgeExpired();
    }, []);

    useEffect(() => {
        activeBreed.current = breedName;
        setData({});
        setErrors({});
        setStatus(initialStatus());
        GROUPS.forEach((g) => loadGroup(g));
    }, [breedName, loadGroup]);

    return (
        <div>
            <button
                type="button"
                onClick={() => router.push("/")}
                className="mb-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
                ← Back home
            </button>

            <Profile
                breedName={breedName}
                animalType={animalType}
                data={data}
                status={status}
                errors={errors}
                onRetry={loadGroup}
            />
        </div>
    );
}
