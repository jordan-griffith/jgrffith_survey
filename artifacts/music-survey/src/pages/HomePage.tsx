import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: "#8A3BDB" }}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Music Listening Survey
          </h1>
          <p className="text-gray-600 mb-8 text-base leading-relaxed">
            We're collecting data on music listening habits among undergraduate
            business students. This short survey takes about 2 minutes to
            complete.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/survey"
              className="block w-full py-3 px-6 text-white font-semibold rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: "#8A3BDB" }}
            >
              Take the Survey
            </Link>
            <Link
              href="/results"
              className="block w-full py-3 px-6 font-semibold rounded-lg border transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: "#8A3BDB", borderColor: "#8A3BDB" }}
            >
              View Results
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-100">
        Survey by Jordan Griffith, BAIS:3300 - spring 2026.
      </footer>
    </div>
  );
}
