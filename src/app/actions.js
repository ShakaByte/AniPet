// src/app/actions.js
"use server";

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.8-flash";

// Two smaller schemas, fetched in parallel
const PARTS = {
    quick: {
        properties: {
            temperament: {
                type: Type.STRING,
                description: "3 descriptive keywords separated by bullet dots",
            },
            grooming: {
                type: Type.STRING,
                description:
                    "Concise summary of grooming, coat brushing, and bathing rules",
            },
            firstAid: {
                type: Type.STRING,
                description:
                    "Emergency action steps or temporary cures a pet owner can perform before reaching a vet clinic",
            },
        },
        required: ["temperament", "grooming", "firstAid"],
    },
    detail: {
        properties: {
            dietDos: {
                type: Type.STRING,
                description:
                    "Highly recommended food habits separated by semicolons",
            },
            dietDonts: {
                type: Type.STRING,
                description:
                    "Toxic or dangerous foods to avoid separated by semicolons",
            },
            diseases: {
                type: Type.STRING,
                description:
                    "3 major genetic or common diseases this breed faces separated by semicolons",
            },
        },
        required: ["dietDos", "dietDonts", "diseases"],
    },
};

const systemInstruction = `You are an expert veterinary assistant and animal behaviorist. 
Analyze the animal breed provided and return highly structured pet care data.
You must fill out every single field provided in the JSON schema with concise, expert bullet points or clear summary text.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function generate(breed, part, thinkingOff) {
    return ai.models.generateContent({
        model: MODEL,
        contents: `Analyze this breed: ${breed}`,
        config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: PARTS[part].properties,
                required: PARTS[part].required,
            },
            ...(thinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
    });
}

async function generateWithFallback(breed, part) {
    let thinkingOff = true;

    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            return await generate(breed, part, thinkingOff);
        } catch (err) {
            const msg = String(err?.message || "");

            // Model rejected the speed setting: retry once without it
            if (thinkingOff && /thinking|400|INVALID_ARGUMENT/i.test(msg)) {
                thinkingOff = false;
                continue;
            }
            // Overloaded / rate limited: wait briefly and retry
            if (/503|429|overloaded|unavailable/i.test(msg) && attempt < 3) {
                await sleep(1500 * (attempt + 1));
                continue;
            }
            throw err;
        }
    }
    throw new Error("The AI is busy right now. Please try again.");
}

export async function fetchPetDetails(breedName, part = "quick") {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error(
                "Missing GEMINI_API_KEY inside your local .env.local file configuration.",
            );
        }
        if (!PARTS[part]) throw new Error("Invalid section request.");

        const cleanBreed = String(breedName || "").trim();
        if (!cleanBreed) throw new Error("Please enter a breed name.");

        const response = await generateWithFallback(cleanBreed, part);

        let petData;
        try {
            petData = JSON.parse(response.text);
        } catch {
            throw new Error(
                "The AI returned an unreadable response. Please try again.",
            );
        }

        return { success: true, ...petData };
    } catch (error) {
        console.error(`Gemini fetch error (${part}):`, error.message);
        return {
            success: false,
            error:
                error.message ||
                "Failed connecting to Google free-tier AI servers.",
        };
    }
}
