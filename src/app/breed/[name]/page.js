// src/app/breed/[name]/page.js
import { Suspense } from "react";
import BreedClient from "./breed-client";

async function BreedLoader({ params }) {
    const { name } = await params;

    let breedName = name;
    try {
        breedName = decodeURIComponent(name);
    } catch {
        /* already decoded: keep as is */
    }

    return <BreedClient breedName={breedName} />;
}

export default function BreedPage({ params }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
            <Suspense
                fallback={
                    <div className="max-w-3xl mx-auto">
                        <div className="h-8 w-40 bg-slate-200 rounded-lg mb-6 animate-pulse" />
                        <div className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse" />
                    </div>
                }
            >
                <BreedLoader params={params} />
            </Suspense>
        </div>
    );
}
