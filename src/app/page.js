// src/app/page.js
"use client";

import { useState } from "react";

// The A-to-Z Data Blueprint Contract
const PET_DIRECTORY = {
    Cats: ["Persian", "Siamese", "Maine Coon", "Ragdoll", "Bengal"],
    Dogs: ["Golden Retriever", "German Shepherd", "Beagle", "Poodle", "Boxer"],
    Fishes: ["Betta Fish", "Goldfish", "Guppy", "Angel Fish", "Neon Tetra"],
    Snakes: [
        "Ball Python",
        "Corn Snake",
        "Garter Snake",
        "Milk Snake",
        "King Snake",
    ],
};

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openSection, setOpenSection] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState("");

    // Logic: Handles interaction when a user clicks a specific breed item
    const handleBreedClick = (breed) => {
        setSearchQuery(breed);
        setLoadingStatus(`Fetching dynamic safety & care data for ${breed}...`);
        console.log(`Target selected for upcoming Module 2: ${breed}`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoadingStatus(`Searching AI database for "${searchQuery}"...`);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                {/* Header Layout */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-indigo-600 mb-2">
                        🐾 ANIPET
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Understand, care for, and deeply bond with your
                        companion.
                    </p>
                </header>

                {/* Global Search Bar Module */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="mb-10 flex gap-2"
                >
                    <input
                        type="text"
                        placeholder="Don't see your pet? Type any breed here (e.g., Bearded Dragon)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow"
                    >
                        Explore
                    </button>
                </form>

                {/* Temporary UI Status Feedback Box */}
                {loadingStatus && (
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl animate-pulse font-medium text-sm text-center">
                        {loadingStatus}
                    </div>
                )}

                {/* A-Z Accordion Directory Sections */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold border-b border-slate-100 pb-4 mb-4 text-slate-700">
                        Browse Animals A-Z
                    </h2>
                    <div className="space-y-3">
                        {Object.keys(PET_DIRECTORY).map((category) => {
                            const isOpen = openSection === category;
                            return (
                                <div
                                    key={category}
                                    className="border border-slate-100 rounded-xl overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenSection(
                                                isOpen ? null : category,
                                            )
                                        }
                                        className="w-full flex justify-between items-center px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors font-semibold text-slate-700 text-left"
                                    >
                                        <span>
                                            {category === "Snakes"
                                                ? "🐍 Exotic / Snakes"
                                                : `✨ ${category}`}
                                        </span>
                                        <span className="text-xl text-slate-400">
                                            {isOpen ? "−" : "+"}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-100 transition-all duration-300">
                                            {PET_DIRECTORY[category].map(
                                                (breed) => (
                                                    <button
                                                        key={breed}
                                                        type="button"
                                                        onClick={() =>
                                                            handleBreedClick(
                                                                breed,
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
            </div>
        </div>
    );
}
