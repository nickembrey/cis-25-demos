import type { ReactNode } from 'react'

export default function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <nav className="mb-4 text-sm">
        <a className="text-sky-300 hover:underline" href="../">CIS 25 Demos</a>
      </nav>
      <h1 className="mb-6 text-2xl font-semibold text-white">{title}</h1>
      {children}
    </main>
  )
}
