// src/app/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./header";
import { DIRECTORY } from "./directory";

const ALL_TAGS = [...new Set(DIRECTORY.flatMap((a) => a.tags))].sort();
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const lettersInUse = new Set(DIRECTORY.map((a) => a.name[0].toUpperCase()));

export default function Dashboard() {
    const router = useRouter();
    const [notice, setNotice] = useState("");
    const [query, setQuery] = useState("");
    const [tag, setTag] = useState("all");
    const [openAnimal, setOpenAnimal] = useState(null);

    const q = query.trim().toLowerCase();

    const openBreed = (breed, type) => {
        const name = breed.trim();
        if (!name) return;
        const suffix = type ? `?type=${encodeURIComponent(type)}` : "";
        router.push(`/breed/${encodeURIComponent(name)}${suffix}`);
    };

    const matchesQuery = (a) =>
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.breeds.some((b) => b.toLowerCase().includes(q));

    const filtered = DIRECTORY.filter(
        (a) => (tag === "all" || a.tags.includes(tag)) && matchesQuery(a),
    );

    const visibleBreeds = (a) =>
        q && !a.name.toLowerCase().includes(q)
            ? a.breeds.filter((b) => b.toLowerCase().includes(q))
            : a.breeds;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!q) return;
        const all = filtered.flatMap((a) =>
            a.breeds.map((b) => ({ breed: b, type: a.name })),
        );
        const exact = all.find((x) => x.breed.toLowerCase() === q);
        const found = all.filter((x) => x.breed.toLowerCase().includes(q));
        if (exact) openBreed(exact.breed, exact.type);
        else if (found.length === 1) openBreed(found[0].breed, found[0].type);
        else if (found.length > 1)
            setNotice("Several matches. Pick one from the list below.");
        else
            setNotice(
                "No match found. Check your spelling. If it's correct, it's not available yet.",
            );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Header />

            <main className="max-w-3xl mx-auto p-4 md:p-8">
                <section className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-indigo-600 mb-1">
                        Every Pet, A to Z
                    </h1>
                    <p className="text-slate-500">
                        Pick an animal, choose a breed, and learn how to care
                        for it.
                    </p>
                </section>

                {/* Search + filter */}
                <form
                    onSubmit={handleSubmit}
                    className="mb-4 flex flex-col sm:flex-row gap-2"
                >
                    <input
                        type="text"
                        placeholder="Search an animal or breed..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setNotice("");
                        }}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white"
                    />
                    <select
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl bg-white shadow-sm capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Filter by category"
                    >
                        <option value="all">All categories</option>
                        {ALL_TAGS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </form>

                {notice && (
                    <p className="mb-4 text-sm text-center text-slate-600">
                        {notice}
                    </p>
                )}

                {/* A-Z jump bar */}
                <div className="flex flex-wrap gap-1 mb-5 justify-center">
                    {LETTERS.map((L) =>
                        lettersInUse.has(L) ? (
                            <a
                                key={L}
                                href={`#letter-${L}`}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                {L}
                            </a>
                        ) : (
                            <span
                                key={L}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold bg-slate-100 text-slate-300"
                            >
                                {L}
                            </span>
                        ),
                    )}
                </div>

                {/* Directory */}
                <div className="space-y-5">
                    {filtered.length === 0 && (
                        <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center">
                            <p className="text-slate-600 mb-3">
                                No match found. Check your spelling. If it's
                                correct, it's not available yet.
                            </p>
                        </div>
                    )}

                    {LETTERS.filter((L) =>
                        filtered.some((a) => a.name[0].toUpperCase() === L),
                    ).map((L) => (
                        <section
                            key={L}
                            id={`letter-${L}`}
                            className="scroll-mt-4"
                        >
                            <h2 className="text-lg font-extrabold text-indigo-600 mb-2 px-1">
                                {L}
                            </h2>
                            <div className="space-y-2">
                                {filtered
                                    .filter(
                                        (a) => a.name[0].toUpperCase() === L,
                                    )
                                    .map((a) => {
                                        const isOpen =
                                            openAnimal === a.name ||
                                            q.length > 0;
                                        return (
                                            <div
                                                key={a.name}
                                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenAnimal(
                                                            openAnimal ===
                                                                a.name
                                                                ? null
                                                                : a.name,
                                                        )
                                                    }
                                                    className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                                                >
                                                    <span className="flex items-center gap-3 flex-wrap">
                                                        <span className="font-bold text-slate-800">
                                                            {a.name}
                                                        </span>
                                                        {a.tags.map((t) => (
                                                            <span
                                                                key={t}
                                                                className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-600 capitalize"
                                                            >
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </span>
                                                    <span className="text-xl text-slate-400">
                                                        {isOpen ? "−" : "+"}
                                                    </span>
                                                </button>

                                                {isOpen && (
                                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-100">
                                                        {visibleBreeds(a).map(
                                                            (breed) => (
                                                                <button
                                                                    key={breed}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openBreed(
                                                                            breed,
                                                                            a.name,
                                                                        )
                                                                    }
                                                                    className="text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium border border-transparent hover:border-indigo-100"
                                                                >
                                                                    {breed}
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
