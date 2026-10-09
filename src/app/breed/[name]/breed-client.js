// src/app/breed/[name]/breed-client.js
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchPetDetails } from "../../actions";
import Profile from "../../profile";

const cacheKey = (breed, part) => `anipet:${breed.toLowerCase()}:${part}`;

function readCache(breed, part) {
    try {
        const raw = sessionStorage.getItem(cacheKey(breed, part));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCache(breed, part, value) {
    try {
        sessionStorage.setItem(cacheKey(breed, part), JSON.stringify(value));
    } catch {
        /* storage unavailable: ignore */
    }
}

export default function BreedClient({ breedName }) {
    const router = useRouter();

    const [data, setData] = useState({});
    const [errors, setErrors] = useState({});
    const activeBreed = useRef(breedName);

    const loadPart = useCallback(
        async (part) => {
            setErrors((e) => ({ ...e, [part]: "" }));

            const cached = readCache(breedName, part);
            if (cached) {
                setData((d) => ({ ...d, ...cached }));
                return;
            }

            const res = await fetchPetDetails(breedName, part);
            if (activeBreed.current !== breedName) return; // user navigated away

            if (res.success) {
                const { success, ...fields } = res;
                writeCache(breedName, part, fields);
                setData((d) => ({ ...d, ...fields }));
            } else {
                setErrors((e) => ({ ...e, [part]: res.error }));
            }
        },
        [breedName],
    );

    useEffect(() => {
        activeBreed.current = breedName;
        setData({});
        setErrors({});
        loadPart("quick");
        loadPart("detail");
    }, [breedName, loadPart]);

    return (
        <div className="max-w-3xl mx-auto">
            <button
                type="button"
                onClick={() => router.push("/")}
                className="mb-6 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
                ← Back to AniPet
            </button>

            <Profile
                breedName={breedName}
                data={data}
                errors={errors}
                onRetry={loadPart}
            />
        </div>
    );
}
