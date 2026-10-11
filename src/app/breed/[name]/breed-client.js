// src/app/breed/[name]/breed-client.js
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchPetDetails } from "../../actions";
import Profile from "../../profile";

const GROUPS = ["g1", "g2", "g3"];

const cacheKey = (breed, group) => `anipet:v2:${breed.toLowerCase()}:${group}`;

function readCache(breed, group) {
    try {
        const raw = sessionStorage.getItem(cacheKey(breed, group));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCache(breed, group, value) {
    try {
        sessionStorage.setItem(cacheKey(breed, group), JSON.stringify(value));
    } catch {
        /* ignore */
    }
}

// Prevents duplicate identical requests (e.g. React dev double-mount)
const inflight = new Map();
function requestGroup(breed, group, type) {
    const key = cacheKey(breed, group);
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

            const cached = readCache(breedName, group);
            if (cached) {
                setData((d) => ({ ...d, ...cached }));
                setStatus((s) => ({ ...s, [group]: "ready" }));
                return;
            }

            const res = await requestGroup(breedName, group, animalType);
            if (activeBreed.current !== breedName) return;

            if (res.success) {
                const { success, ...fields } = res;
                writeCache(breedName, group, fields);
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
