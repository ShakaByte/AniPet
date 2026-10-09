// src/app/profile.js
"use client";

import { useState, useRef, useEffect } from "react";

// "part" tells which parallel request supplies this section
const SECTIONS = [
    {
        key: "temperament",
        part: "quick",
        label: "Temperament",
        icon: "🧠",
        type: "chips",
    },
    {
        key: "dietDos",
        part: "detail",
        label: "Diet Do's",
        icon: "✅",
        type: "list",
        tone: "good",
    },
    {
        key: "dietDonts",
        part: "detail",
        label: "Diet Don'ts",
        icon: "🚫",
        type: "list",
        tone: "bad",
    },
    {
        key: "grooming",
        part: "quick",
        label: "Grooming",
        icon: "✂️",
        type: "text",
    },
    {
        key: "diseases",
        part: "detail",
        label: "Health Risks",
        icon: "🩺",
        type: "list",
        tone: "warn",
    },
    {
        key: "firstAid",
        part: "quick",
        label: "First Aid",
        icon: "🚑",
        type: "text",
    },
];

const TONES = {
    good: "bg-emerald-50 border-emerald-100 text-emerald-800",
    bad: "bg-rose-50 border-rose-100 text-rose-800",
    warn: "bg-amber-50 border-amber-100 text-amber-800",
};

const splitBy = (value, separator) =>
    String(value || "")
        .split(separator)
        .map((s) => s.trim())
        .filter(Boolean);

function SkeletonBody() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-100 rounded-xl w-full" />
            <div className="h-10 bg-slate-100 rounded-xl w-5/6" />
            <div className="h-10 bg-slate-100 rounded-xl w-4/6" />
        </div>
    );
}

function ErrorBody({ message, onRetry }) {
    return (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
            <p className="mb-3">⚠️ {message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
            >
                Try again
            </button>
        </div>
    );
}

function SectionBody({ section, value }) {
    if (section.type === "chips") {
        return (
            <div className="flex flex-wrap gap-2">
                {splitBy(value, /[•·]/).map((item, i) => (
                    <span
                        key={i}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-semibold text-sm border border-indigo-100"
                    >
                        {item}
                    </span>
                ))}
            </div>
        );
    }

    if (section.type === "list") {
        return (
            <ul className="space-y-2">
                {splitBy(value, ";").map((item, i) => (
                    <li
                        key={i}
                        className={`px-4 py-3 rounded-xl border text-sm leading-relaxed ${TONES[section.tone]}`}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <p className="text-slate-700 leading-relaxed text-[15px]">{value}</p>
    );
}

export default function Profile({
    breedName,
    data = {},
    errors = {},
    onRetry,
}) {
    const [active, setActive] = useState(0);
    const trackRef = useRef(null);
    const tabRefs = useRef([]);

    const stillLoading = SECTIONS.some((s) => !data[s.key] && !errors[s.part]);

    const goTo = (index) => {
        const el = trackRef.current;
        if (!el) return;
        const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
        el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    };

    const handleScroll = () => {
        const el = trackRef.current;
        if (!el) return;
        setActive(Math.round(el.scrollLeft / el.clientWidth));
    };

    useEffect(() => {
        tabRefs.current[active]?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }, [active]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <p className="text-xs uppercase tracking-widest opacity-80">
                    Breed Profile
                </p>
                <h2 className="text-2xl font-extrabold">{breedName}</h2>
                {stillLoading && (
                    <p className="text-sm opacity-80 mt-1 animate-pulse">
                        Gathering care details...
                    </p>
                )}
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SECTIONS.map((s, i) => (
                    <button
                        key={s.key}
                        ref={(el) => (tabRefs.current[i] = el)}
                        type="button"
                        onClick={() => goTo(i)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            active === i
                                ? "bg-indigo-600 text-white shadow"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        {s.icon} {s.label}
                    </button>
                ))}
            </div>

            <div
                ref={trackRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {SECTIONS.map((s) => (
                    <div
                        key={s.key}
                        className="w-full shrink-0 snap-center p-6 min-h-[260px]"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            {s.icon} {s.label}
                        </h3>
                        {data[s.key] ? (
                            <SectionBody section={s} value={data[s.key]} />
                        ) : errors[s.part] ? (
                            <ErrorBody
                                message={errors[s.part]}
                                onRetry={() => onRetry?.(s.part)}
                            />
                        ) : (
                            <SkeletonBody />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    disabled={active === 0}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    ← Prev
                </button>
                <div className="flex gap-1.5">
                    {SECTIONS.map((s, i) => (
                        <button
                            key={s.key}
                            type="button"
                            aria-label={`Go to ${s.label}`}
                            onClick={() => goTo(i)}
                            className={`h-2 rounded-full transition-all ${
                                active === i
                                    ? "w-6 bg-indigo-600"
                                    : "w-2 bg-slate-300"
                            }`}
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    disabled={active === SECTIONS.length - 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
