1. Overview
AniPet is a web app that gives new and prospective pet owners a complete, easy-to-read care profile for a chosen animal breed. The user picks a breed from an A-Z directory and receives a nine-section profile with a breed photo, covering history, temperament, training, health, grooming, vaccines, emergencies and more, written in plain language.

2. Problem Statement
People who bring home a pet often struggle to find reliable, organised care information in one place.
•	Information is scattered across many websites, forums and videos, and quality varies widely.
•	Content is often written for experts, or is padded with advertising and affiliate links.
•	Beginners do not know what to ask: when to vaccinate, how to groom, what to feed, which signs mean a vet visit is urgent.
•	Advice for dogs and cats is easy to find, but less common pets (fish, snakes and other exotic animals) are poorly covered.
•	Most existing tools need accounts, subscriptions or payment before showing useful content.

3. Solution
AniPet combines a curated A-Z directory of animals and breeds with AI-generated care guidance, delivered as a fast, tabbed profile.
•	A curated directory is the single source of truth for what can be searched, so users only ever see supported breeds.
•	Care content is generated on demand by AI in a fixed, validated structure, then cached so the same breed is never generated twice.
•	Content loads in three parallel groups so the first sections appear without waiting for the whole profile.
•	A layered cache (browser, then shared Redis) makes repeat views near-instant and keeps AI usage inside free quotas.
•	The app needs no sign-up, no payment and no stored personal data.


4. Tech Stack: Next.js, React, JavaScript, Tailwind CSS, Upstash Redis, Gemini API, Groq API, GitHub Actions
