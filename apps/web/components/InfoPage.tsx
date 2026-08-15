import Link from "next/link";
import type { ReactNode } from "react";

type InfoPageProps = { eyebrow: string; title: string; intro: string; children: ReactNode };

export default function InfoPage({ eyebrow, title, intro, children }: InfoPageProps) {
  return <main className="bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-4xl px-5 sm:px-8"><div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-10"><p className="text-sm font-semibold uppercase tracking-wider text-sky-700">{eyebrow}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{intro}</p><div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">{children}</div><div className="mt-10 border-t border-slate-200 pt-6"><Link href="/shop" className="font-semibold text-sky-700 hover:text-sky-800">Browse fishnets</Link></div></div></div></main>;
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2 className="text-xl font-bold text-slate-900">{title}</h2><div className="mt-2 space-y-3">{children}</div></section>;
}
