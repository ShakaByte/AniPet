# 🐾 AniPet

A web app that gives pet owners a complete, easy-to-read care profile for any supported animal breed.

🔗 [Live Demo](https://ani-pet.vercel.app)

## 📌 Overview

AniPet gives new and prospective pet owners a complete care profile for a chosen breed. Pick a breed from an A-Z directory and get a nine-section profile with a breed photo, covering history, temperament, training, health, grooming, vaccines, emergencies and more, written in plain language.

## ❗ Problem Statement

People who bring home a pet often struggle to find reliable, organised care information in one place.
- Information is scattered across websites, forums and videos, and quality varies widely.
- Content is often written for experts or padded with ads and affiliate links.
- Beginners don't know what to ask: when to vaccinate, how to groom, what to feed, which signs mean an urgent vet visit.
- Dogs and cats are well covered, but less common pets (fish, snakes, exotics) are not.
- Most existing tools require accounts, subscriptions or payment before showing useful content.

## ✅ Solution

- **Curated A-Z directory:** the single source of truth for searchable breeds, so users only see supported ones
- **AI-generated care guidance:** produced on demand in a fixed, validated structure, then cached so a breed is never generated twice
- **Parallel loading:** content loads in three groups, so the first sections appear without waiting for the full profile
- **Layered caching:** browser cache, then shared Redis, for near-instant repeat views and AI usage within free quotas
- **Zero friction:** no sign-up, no payment, no stored personal data

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, JavaScript, Tailwind CSS |
| AI | Gemini API, Groq API |
| Caching | Upstash Redis |
| CI/CD | GitHub Actions |


## 👤 Author

**Vedant Pokale** ([ShakaByte](https://github.com/ShakaByte))
