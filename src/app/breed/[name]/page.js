// src/app/breed/[name]/page.js
import { Suspense } from "react";
import Header from "../../header";
import BreedClient from "./breed-client";
import Link from "next/link";
import { findBreed } from "../../directory";

export const maxDuration = 60;

async function BreedLoader({ params, searchParams }) {
    const { name } = await params;
    const { type } = await searchParams;

    let breedName = name;
    try {
        breedName = decodeURIComponent(name);
    } catch {
        /* already decoded */
    }

    const match = findBreed(breedName, type);
    if (!match) {
        return (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center">
                <p className="text-slate-600 mb-3">
                    No match found. Check your spelling. If it's correct,
                    it's not available yet.
                </p>
                <Link href="/" className="font-semibold text-indigo-600">
                    ← Back home
                </Link>
            </div>
        );
    }
    return <BreedClient breedName={match.breed} animalType={match.type} />;
}

export default function BreedPage({ params, searchParams }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Header />
            <main className="max-w-5xl mx-auto p-4 md:p-8">
                <Suspense
                    fallback={
                        <div>
                            <div className="h-6 w-32 bg-slate-200 rounded-lg mb-4 animate-pulse" />
                            <div className="h-96 bg-white border border-slate-200 rounded-2xl animate-pulse" />
                        </div>
                    }
                >
                    <BreedLoader params={params} searchParams={searchParams} />
                </Suspense>
            </main>
        </div>
    );
}
