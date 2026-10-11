export const ANIMALS = [
    {
        name: "Cat",
        tags: ["domestic", "mammal"],
        breeds: ["Persian", "Siamese", "Maine Coon", "Ragdoll", "Bengal"],
    },
    {
        name: "Dog",
        tags: ["domestic", "mammal"],
        breeds: [
            "Golden Retriever",
            "German Shepherd",
            "Beagle",
            "Poodle",
            "Boxer",
        ],
    },
    {
        name: "Fish",
        tags: ["domestic", "aquatic"],
        breeds: ["Betta Fish", "Goldfish", "Guppy", "Angel Fish", "Neon Tetra"],
    },
    {
        name: "Snake",
        tags: ["exotic", "reptile"],
        breeds: [
            "Ball Python",
            "Corn Snake",
            "Garter Snake",
            "Milk Snake",
            "King Snake",
        ],
    },
];

export const DIRECTORY = ANIMALS.map((a) => ({
    ...a,
    breeds: [...a.breeds].sort(),
})).sort((a, b) => a.name.localeCompare(b.name));

// The one lookup function everything uses. Returns { breed, type } or null.
export function findBreed(name, type = "") {
    const n = String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
    if (!n) return null;
    const t = String(type || "")
        .trim()
        .toLowerCase();
    for (const a of DIRECTORY) {
        if (t && a.name.toLowerCase() !== t) continue;
        const b = a.breeds.find((x) => x.toLowerCase() === n);
        if (b) return { breed: b, type: a.name };
    }
    return null;
}
