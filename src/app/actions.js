// src/app/actions.js
"use server";

import { findBreed } from "./directory";

import { GoogleGenAI, Type } from "@google/genai";

import { cacheKey, cacheGet, cacheSet } from "./cache";

/* ---------- Schema (provider-neutral) ---------- */

const list = (desc) => ({ kind: "list", desc });
const text = (desc) => ({ kind: "text", desc });

const GROUPS = {
    g1: {
        quickFacts: list(
            "4 to 5 short facts in the form 'Label: value', such as Origin, Type (purebred or mixed), Size, Lifespan, Weight or length",
        ),
        historyParagraphs: list(
            "2 to 3 paragraphs of 3 to 4 sentences each: whether it is purebred or mixed, where and when it first appeared, the story behind it, and its significance",
        ),
        temperamentTraits: list(
            "3 personality keywords of one or two words each",
        ),
        temperamentParagraphs: list(
            "2 to 3 paragraphs of 3 to 4 sentences each on personality and everyday behaviour",
        ),
        emotionSigns: list(
            "4 to 6 items, each in the form 'Signal: what it usually means and how to respond'",
        ),
        ageHabits: list(
            "3 to 4 items, each in the form 'Life stage: typical habits and how to handle them'",
        ),
        familyParagraphs: list(
            "2 to 3 paragraphs of 3 to 4 sentences each on the best family type and how well it socializes",
        ),
        familyBullets: list(
            "4 to 6 short items on ideal home, children, other animals, public outings or handling in public, and suitability for first-time owners",
        ),
    },
    g2: {
        trainingParagraphs: list(
            "2 paragraphs of 3 to 4 sentences each on how trainable or tameable it is, whether supervision is needed, and how to handle it",
        ),
        trainingSteps: list("5 to 7 short ordered steps to train or tame it"),
        tricks: list(
            "4 to 6 tricks or skills it can learn, each with a few words on difficulty",
        ),
        healthParagraphs: list(
            "2 to 3 paragraphs of 3 to 4 sentences each on diet and overall health: what to feed, why, when and how much",
        ),
        feedingBullets: list(
            "4 to 6 short items on what to feed, portions, how often, treats, and any quirks of feeding",
        ),
        commonIssues: list(
            "4 to 6 items, each in the form 'Condition: early signs and why this breed is prone to it'",
        ),
        neuteringParagraph: text(
            "One paragraph on neutering, spaying or similar procedures: why they are done, whether necessary, best timing, and an approximate cost range noting it varies by region. If not applicable to this animal, say so in one line.",
        ),
        groomingParagraphs: list(
            "2 paragraphs of 3 to 4 sentences each on grooming: how, where, how often",
        ),
        groomingTips: list(
            "5 to 6 short items, each starting with 'Use:' or 'Avoid:' naming tools or products",
        ),
        careExtras: list(
            "3 to 5 short items on clothing (whether needed and how to choose) and housing or enclosure setup",
        ),
    },
    g3: {
        vaccineBullets: list(
            "4 to 6 items on vaccines and preventive care with timing and approximate cost ranges noting they vary by region. If not applicable, give the closest preventive care.",
        ),
        medicineTips: list(
            "3 to 5 practical tips on giving medicine, including common tricks, how often and how much in general terms, always following the vet's dose",
        ),
        firstAidBullets: list(
            "5 to 7 short first aid steps to take before reaching a vet",
        ),
        vetVisitBullets: list(
            "4 to 6 situations where a vet visit is mandatory or urgent, plus how often routine checkups are needed",
        ),
        dos: list("6 short do's for owners"),
        donts: list("6 short don'ts for owners"),
        funFacts: list("4 to 6 interesting or quirky facts"),
        resources: list(
            "3 to 5 general types of places to find food, medicine and supplies, with no brand names or web addresses",
        ),
    },
};

const SYSTEM = `You are an expert veterinary assistant and animal behaviorist writing a practical care guide for new pet owners.
Write in plain, friendly, accurate language. Use plain text only: no markdown, no asterisks, no emojis, no special symbols.
Answer the relevant what, why, when, where and how for each topic. When mentioning costs, give approximate ranges and say they vary by region.
If a topic does not apply to this kind of animal (for example neutering, walks or clothing for a fish), say so in one short line and give the closest relevant guidance instead, such as tank setup.
Never invent facts. If you are unsure, stay general.`;

function toGeminiSchema(fields) {
    const properties = {};
    for (const [key, f] of Object.entries(fields)) {
        properties[key] =
            f.kind === "list"
                ? {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: f.desc,
                  }
                : { type: Type.STRING, description: f.desc };
    }
    return { type: Type.OBJECT, properties, required: Object.keys(fields) };
}

function schemaPrompt(fields) {
    const lines = Object.entries(fields).map(
        ([key, f]) =>
            `- "${key}" (${f.kind === "list" ? "array of strings" : "string"}): ${f.desc}`,
    );
    return `Return ONLY one valid JSON object, with no markdown and no commentary, containing exactly these keys:\n${lines.join("\n")}`;
}

/* ---------- Provider chain: 6 models, built from available keys ---------- */

const ATTEMPT_TIMEOUT_MS = 25000;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getChain() {
    const e = process.env;
    const gemini = (id, model) => ({
        id,
        type: "gemini",
        model,
        key: e.GEMINI_API_KEY,
    });
    const compat = (id, url, model, key) => ({
        id,
        type: "compat",
        url,
        model,
        key,
    });

    return [
        // 1-2: Gemini (each model has its own quota)
        gemini("gemini-1", e.GEMINI_MODEL || "gemini-3.5-flash-lite"),
        gemini("gemini-2", e.GEMINI_MODEL_2),
        // 3-4: Groq
        compat(
            "groq-1",
            GROQ_URL,
            e.GROQ_MODEL || "openai/gpt-oss-120b",
            e.GROQ_API_KEY,
        ),
        compat(
            "groq-2",
            GROQ_URL,
            e.GROQ_MODEL_2 || "openai/gpt-oss-20b",
            e.GROQ_API_KEY,
        ),
    ].filter((p) => p.key && p.model);
}

// Providers that recently failed are tried last (best-effort, per server instance)
const cooldown = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(
            () =>
                reject(
                    Object.assign(new Error("timeout 503"), { status: 503 }),
                ),
            ms,
        );
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/* ---------- Provider calls ---------- */

async function callGemini(p, userText, fields) {
    const client = new GoogleGenAI({ apiKey: p.key });
    const make = (thinkingOff) =>
        client.models.generateContent({
            model: p.model,
            contents: userText,
            config: {
                systemInstruction: SYSTEM,
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: toGeminiSchema(fields),
                ...(thinkingOff
                    ? { thinkingConfig: { thinkingBudget: 0 } }
                    : {}),
            },
        });

    try {
        return (await withTimeout(make(true), ATTEMPT_TIMEOUT_MS)).text;
    } catch (err) {
        // Model rejected the speed setting: retry once without it
        if (/thinking|INVALID_ARGUMENT/i.test(String(err?.message))) {
            return (await withTimeout(make(false), ATTEMPT_TIMEOUT_MS)).text;
        }
        throw err;
    }
}

async function callCompat(p, userText, fields) {
    const body = {
        model: p.model,
        temperature: 0.3,
        max_tokens: 5000,
        messages: [
            { role: "system", content: `${SYSTEM}\n\n${schemaPrompt(fields)}` },
            { role: "user", content: userText },
        ],
        response_format: { type: "json_object" },
    };

    const send = (b) =>
        fetch(p.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${p.key}`,
                "X-Title": "AniPet",
            },
            body: JSON.stringify(b),
            signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        });

    let res = await send(body);
    // Some models don't support JSON mode: retry once without it
    if (res.status === 400) {
        const { response_format, ...rest } = body;
        res = await send(rest);
    }
    if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw Object.assign(
            new Error(`${res.status} ${detail.slice(0, 300)}`),
            {
                status: res.status,
            },
        );
    }
    const json = await res.json();
    return json?.choices?.[0]?.message?.content || "";
}

/* ---------- Output checking ---------- */

const badOutput = (msg) => Object.assign(new Error(msg), { kind: "bad" });

function extractJson(raw) {
    const s = String(raw || "").replace(/```json|```/gi, "");
    const a = s.indexOf("{");
    const b = s.lastIndexOf("}");
    if (a < 0 || b < a) throw badOutput("no json");
    try {
        return JSON.parse(s.slice(a, b + 1));
    } catch {
        throw badOutput("unparseable json");
    }
}

// Plain text only: strip emojis and markdown marks
const clean = (s) =>
    String(s)
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/[*`]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

function validate(data, fields) {
    const out = {};
    for (const [key, f] of Object.entries(fields)) {
        let v = data?.[key];

        if (f.kind === "list") {
            if (typeof v === "string") v = v.split(/\n+/);
            if (!Array.isArray(v)) throw badOutput(`missing ${key}`);
            v = v
                .map((x) =>
                    clean(
                        x && typeof x === "object"
                            ? Object.values(x).join(": ")
                            : x,
                    ),
                )
                .filter(Boolean);
            if (v.length === 0) throw badOutput(`empty ${key}`);
            out[key] = v;
        } else {
            if (Array.isArray(v)) v = v.join(" ");
            v = clean(v ?? "");
            if (!v) throw badOutput(`empty ${key}`);
            out[key] = v;
        }
    }
    return out;
}

/* ---------- Error handling ---------- */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

function classify(err) {
    const msg = String(err?.message || "");
    const status = err?.status;

    if (err?.kind === "bad") return { kind: "bad", cooldownMs: 0 };
    if (/per day|PerDay|TPD|RPD|daily/i.test(msg))
        return { kind: "quota", cooldownMs: 3 * HOUR };
    if (status === 429 || /429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(msg))
        return { kind: "limit", cooldownMs: 2 * MIN };
    if (
        status === 401 ||
        status === 402 ||
        status === 403 ||
        status === 404 ||
        /API key|not found|not supported|INVALID_ARGUMENT|does not exist/i.test(msg,)
    )
        return { kind: "config", cooldownMs: 6 * HOUR };
    return { kind: "busy", cooldownMs: 1 * MIN }; // 5xx, timeouts, network
}

function friendlyError(err) {
    const msg = String(err?.message || "");
    if (/Missing GEMINI_API_KEY/i.test(msg)) return msg;

    const kinds = err?.kinds || [];
    if (kinds.length && kinds.every((k) => k === "quota" || k === "limit"))
        return "We're getting a lot of requests right now. Please try again in a little while.";
    if (kinds.includes("busy"))
        return "This is taking longer than usual. Please try again in a moment.";
    return "Something went wrong loading this section. Please try again.";
}

/* ---------- Run a request through the chain ---------- */

async function generateViaChain(breed, animalType, group) {
    const chain = getChain();
    if (chain.length === 0) {
        throw new Error(
            "Missing GEMINI_API_KEY inside your local .env.local file configuration.",
        );
    }

    const fields = GROUPS[group];
    const userText = animalType
        ? `Animal: ${animalType}. Breed: ${breed}`
        : `Breed or animal: ${breed}`;
    const kinds = [];

    for (let pass = 0; pass < 2; pass++) {
        const now = Date.now();
        const ready = chain.filter((p) => (cooldown.get(p.id) || 0) <= now);
        const resting = chain.filter((p) => (cooldown.get(p.id) || 0) > now);
        let allBusy = true;

        for (const p of [...ready, ...resting]) {
            try {
                const raw =
                    p.type === "gemini"
                        ? await callGemini(p, userText, fields)
                        : await callCompat(p, userText, fields);
                const data = validate(extractJson(raw), fields);
                cooldown.delete(p.id);
                console.log(
                    `[AniPet] ${group} "${breed}" served by ${p.id} (${p.model})`,
                );
                return data;
            } catch (err) {
                const c = classify(err);
                if (c.cooldownMs) cooldown.set(p.id, Date.now() + c.cooldownMs);
                if (c.kind !== "busy") allBusy = false;
                kinds.push(c.kind);
                console.warn(
                    `[AniPet] ${group} ${p.id} failed (${c.kind}): ${String(err?.message).slice(0, 200)}`,
                );
            }
        }

        // Only worth a second sweep if everything was a temporary overload
        if (!allBusy || pass === 1) break;
        await sleep(2000);
    }

    throw Object.assign(new Error("all providers failed"), { kinds });
}

/* ---------- Public action ---------- */

export async function fetchPetDetails(
    breedName,
    group = "g1",
    animalType = "",
) {
    try {
        if (!GROUPS[group]) throw new Error("Invalid section request.");
        const match = findBreed(breedName, animalType);
        if (!match)
            return {
                success: false,
                error: "No match found. Check your spelling. If it's correct, it's not available yet.",
            };
        const cleanBreed = match.breed;
        const cleanType = match.type;

        const key = cacheKey(cleanType, cleanBreed, group);
        const hit = await cacheGet(key);
        if (hit) {
            console.log("cache HIT", key);
            return { success: true, ...hit };
        }
        console.log("cache MISS", key);

        const data = await generateViaChain(cleanBreed, cleanType, group);
        await cacheSet(key, data);
        return { success: true, ...data };
    } catch (error) {
        console.error(`[AniPet] fetch error (${group}):`, error.message);
        return { success: false, error: friendlyError(error) };
    }
}