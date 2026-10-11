// src/app/profile.js
"use client";

import { useState, useRef, useEffect } from "react";

const arr = (v) => (Array.isArray(v) ? v : []);
const has = (v) => arr(v).length > 0;

const TONES = {
    neutral: "bg-slate-50 border-slate-200 text-slate-700",
    good: "bg-emerald-50 border-emerald-100 text-emerald-800",
    bad: "bg-rose-50 border-rose-100 text-rose-800",
    warn: "bg-amber-50 border-amber-100 text-amber-800",
};

function Paragraphs({ items }) {
    if (!has(items)) return null;
    return (
        <div className="space-y-3">
            {arr(items).map((p, i) => (
                <p
                    key={i}
                    className="text-slate-700 leading-relaxed text-[15px]"
                >
                    {p}
                </p>
            ))}
        </div>
    );
}

function Bullets({ items, tone = "neutral" }) {
    if (!has(items)) return null;
    return (
        <ul className="space-y-2">
            {arr(items).map((item, i) => (
                <li
                    key={i}
                    className={`px-4 py-2.5 rounded-xl border text-sm leading-relaxed ${TONES[tone]}`}
                >
                    {item}
                </li>
            ))}
        </ul>
    );
}

function Steps({ items }) {
    if (!has(items)) return null;
    return (
        <ol className="space-y-2">
            {arr(items).map((item, i) => (
                <li
                    key={i}
                    className="flex gap-3 items-start text-sm leading-relaxed text-slate-700"
                >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ol>
    );
}

function Chips({ items }) {
    if (!has(items)) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {arr(items).map((item, i) => (
                <span
                    key={i}
                    className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-semibold text-sm border border-indigo-100"
                >
                    {item}
                </span>
            ))}
        </div>
    );
}

function QuickFacts({ items }) {
    if (!has(items)) return null;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {arr(items).map((item, i) => {
                const idx = String(item).indexOf(":");
                const label = idx > -1 ? item.slice(0, idx) : "";
                const value = idx > -1 ? item.slice(idx + 1).trim() : item;
                return (
                    <div
                        key={i}
                        className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100"
                    >
                        {label && (
                            <p className="text-[11px] uppercase tracking-wide text-indigo-500 font-semibold">
                                {label}
                            </p>
                        )}
                        <p className="text-sm font-bold text-indigo-900">
                            {value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

function Block({ title, when = true, children }) {
    if (!when) return null;
    return (
        <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
                {title}
            </h4>
            {children}
        </div>
    );
}

const SECTIONS = [
    {
        id: "overview",
        label: "Overview & History",
        group: "g1",
        render: (d) => (
            <>
                <QuickFacts items={d.quickFacts} />
                <div className="mt-5">
                    <Paragraphs items={d.historyParagraphs} />
                </div>
            </>
        ),
    },
    {
        id: "temperament",
        label: "Temperament & Emotions",
        group: "g1",
        render: (d) => (
            <>
                <Chips items={d.temperamentTraits} />
                <div className="mt-5">
                    <Paragraphs items={d.temperamentParagraphs} />
                </div>
                <Block title="Reading their mood" when={has(d.emotionSigns)}>
                    <Bullets items={d.emotionSigns} />
                </Block>
                <Block title="Habits by age" when={has(d.ageHabits)}>
                    <Bullets items={d.ageHabits} />
                </Block>
            </>
        ),
    },
    {
        id: "family",
        label: "Family & Socialization",
        group: "g1",
        render: (d) => (
            <>
                <Paragraphs items={d.familyParagraphs} />
                <Block title="Good to know" when={has(d.familyBullets)}>
                    <Bullets items={d.familyBullets} />
                </Block>
            </>
        ),
    },
    {
        id: "training",
        label: "Training",
        group: "g2",
        render: (d) => (
            <>
                <Paragraphs items={d.trainingParagraphs} />
                <Block title="Step by step" when={has(d.trainingSteps)}>
                    <Steps items={d.trainingSteps} />
                </Block>
                <Block title="Tricks and skills" when={has(d.tricks)}>
                    <Bullets items={d.tricks} />
                </Block>
            </>
        ),
    },
    {
        id: "health",
        label: "Health & Diet",
        group: "g2",
        render: (d) => (
            <>
                <Paragraphs items={d.healthParagraphs} />
                <Block title="Feeding guide" when={has(d.feedingBullets)}>
                    <Bullets items={d.feedingBullets} tone="good" />
                </Block>
                <Block title="Common health issues" when={has(d.commonIssues)}>
                    <Bullets items={d.commonIssues} tone="warn" />
                </Block>
                <Block
                    title="Neutering and procedures"
                    when={!!d.neuteringParagraph}
                >
                    <Paragraphs items={[d.neuteringParagraph]} />
                </Block>
            </>
        ),
    },
    {
        id: "grooming",
        label: "Grooming & Daily Care",
        group: "g2",
        render: (d) => (
            <>
                <Paragraphs items={d.groomingParagraphs} />
                <Block title="What to use and avoid" when={has(d.groomingTips)}>
                    <Bullets items={d.groomingTips} />
                </Block>
                <Block title="Clothing and home setup" when={has(d.careExtras)}>
                    <Bullets items={d.careExtras} />
                </Block>
            </>
        ),
    },
    {
        id: "vaccines",
        label: "Vaccines & Emergencies",
        group: "g3",
        render: (d) => (
            <>
                <Block
                    title="Vaccines and preventive care"
                    when={has(d.vaccineBullets)}
                >
                    <Bullets items={d.vaccineBullets} />
                </Block>
                <Block title="Giving medicine" when={has(d.medicineTips)}>
                    <Bullets items={d.medicineTips} />
                </Block>
                <Block
                    title="First aid before the vet"
                    when={has(d.firstAidBullets)}
                >
                    <Bullets items={d.firstAidBullets} tone="warn" />
                </Block>
                <Block
                    title="A vet visit is a must when"
                    when={has(d.vetVisitBullets)}
                >
                    <Bullets items={d.vetVisitBullets} tone="bad" />
                </Block>
            </>
        ),
    },
    {
        id: "dosdonts",
        label: "Do's & Don'ts",
        group: "g3",
        render: (d) => (
            <div className="grid md:grid-cols-2 gap-5">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">
                        Do
                    </h4>
                    <Bullets items={d.dos} tone="good" />
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3">
                        Don't
                    </h4>
                    <Bullets items={d.donts} tone="bad" />
                </div>
            </div>
        ),
    },
    {
        id: "facts",
        label: "Fun Facts & Resources",
        group: "g3",
        render: (d) => (
            <>
                <Block title="Fun facts" when={has(d.funFacts)}>
                    <Bullets items={d.funFacts} />
                </Block>
                <Block
                    title="Where to find food, medicine and supplies"
                    when={has(d.resources)}
                >
                    <Bullets items={d.resources} />
                </Block>
            </>
        ),
    },
];

function SkeletonBody() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-11/12" />
            <div className="h-4 bg-slate-100 rounded w-4/5" />
            <div className="h-10 bg-slate-100 rounded-xl w-full mt-5" />
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

// Loads a photo URL from Wikipedia. Nothing is stored: the browser fetches it directly.
function ProfileImage({ breedName, animalType }) {
    const [img, setImg] = useState({ state: "loading", url: "", title: "" });

    useEffect(() => {
        let cancelled = false;
        setImg({ state: "loading", url: "", title: "" });

        const extra =
            animalType &&
            !breedName.toLowerCase().includes(animalType.toLowerCase())
                ? animalType
                : "";
        const params = new URLSearchParams({
            action: "query",
            format: "json",
            origin: "*",
            generator: "search",
            gsrsearch: `${breedName} ${extra}`.trim(),
            gsrlimit: "3",
            prop: "pageimages",
            piprop: "thumbnail",
            pithumbsize: "900",
        });

        fetch(`https://en.wikipedia.org/w/api.php?${params}`)
            .then((r) => r.json())
            .then((json) => {
                const pages = Object.values(json?.query?.pages || {}).sort(
                    (a, b) => a.index - b.index,
                );
                const hit = pages.find((p) => p.thumbnail?.source);
                if (cancelled) return;
                setImg(
                    hit
                        ? {
                              state: "ready",
                              url: hit.thumbnail.source,
                              title: hit.title,
                          }
                        : { state: "none", url: "", title: "" },
                );
            })
            .catch(() => {
                if (!cancelled) setImg({ state: "none", url: "", title: "" });
            });

        return () => {
            cancelled = true;
        };
    }, [breedName, animalType]);

    if (img.state === "loading") {
        return (
            <div className="mt-4 h-48 sm:h-56 rounded-xl bg-white/20 animate-pulse" />
        );
    }
    if (img.state === "none") {
        return (
            <div className="mt-4 h-28 rounded-xl bg-white/10 flex items-center justify-center text-4xl">
                🐾
            </div>
        );
    }
    return (
        <div className="mt-4">
            <div className="relative w-full h-56 sm:h-72 overflow-hidden rounded-xl bg-black/20">
                <img
                    src={img.url}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
                />
                <img
                    src={img.url}
                    alt={breedName}
                    className="relative w-full h-full object-contain"
                />
            </div>
            <p className="text-[11px] opacity-80 mt-1 text-right">
                Photo:{" "}
                <a
                    href={`https://en.wikipedia.org/wiki/${encodeURIComponent(img.title.replace(/ /g, "_"))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                >
                    Wikipedia
                </a>
            </p>
        </div>
    );
}

export default function Profile({
    breedName,
    animalType = "",
    data = {},
    status = {},
    errors = {},
    onRetry,
}) {
    const [active, setActive] = useState(0);
    const tabRefs = useRef([]);
    const touch = useRef({ x: 0, y: 0 });

    const go = (i) => setActive(Math.max(0, Math.min(SECTIONS.length - 1, i)));
    const section = SECTIONS[active];
    const stillLoading = Object.values(status).some((s) => s === "loading");

    // Keep the active tab visible in the mobile tab bar
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            tabRefs.current[active]?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            });
        }
    }, [active]);

    const onTouchStart = (e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e) => {
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            go(dx < 0 ? active + 1 : active - 1);
        }
    };

    const state = status[section.group] || "loading";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header: name, then image just below */}
            <div className="px-5 md:px-6 pt-5 pb-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <p className="text-xs uppercase tracking-widest opacity-80">
                    {animalType ? `${animalType} Profile` : "Breed Profile"}
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                    {breedName}
                </h2>
                {stillLoading && (
                    <p className="text-sm opacity-80 mt-1 animate-pulse">
                        Gathering details...
                    </p>
                )}
                <ProfileImage breedName={breedName} animalType={animalType} />
            </div>

            <div className="md:flex">
                {/* Tabs: left sidebar on desktop, swipeable bar on mobile */}
                <nav className="md:w-60 md:shrink-0 md:border-r border-b md:border-b-0 border-slate-100 bg-slate-50">
                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {SECTIONS.map((s, i) => (
                            <button
                                key={s.id}
                                ref={(el) => (tabRefs.current[i] = el)}
                                type="button"
                                onClick={() => go(i)}
                                className={`shrink-0 text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                    active === i
                                        ? "bg-indigo-600 text-white shadow"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Content */}
                <div
                    className="flex-1 min-w-0 p-5 md:p-6 min-h-[360px]"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                        {section.label}
                    </h3>

                    {state === "ready" ? (
                        section.render(data)
                    ) : state === "error" ? (
                        <ErrorBody
                            message={errors[section.group]}
                            onRetry={() => onRetry?.(section.group)}
                        />
                    ) : (
                        <SkeletonBody />
                    )}

                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => go(active - 1)}
                            disabled={active === 0}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            ← Prev
                        </button>
                        <span className="text-xs text-slate-400">
                            {active + 1} / {SECTIONS.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => go(active + 1)}
                            disabled={active === SECTIONS.length - 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="px-5 md:px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                Information is for general guidance and may vary. Always consult
                a qualified vet or specialist in person.
            </div>
        </div>
    );
}
