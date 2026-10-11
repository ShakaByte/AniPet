// src/app/header.js
import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-white border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                    <img src="/icon.png" alt="AniPet" className="h-8" />
                </span>
                <Link
                    href="/"
                    className="text-2xl font-extrabold tracking-tight text-indigo-600"
                >
                    AniPet
                </Link>
            </div>
        </header>
    );
}
