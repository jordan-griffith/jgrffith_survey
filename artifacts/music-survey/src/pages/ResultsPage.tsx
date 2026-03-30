import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase, type SurveyResponse } from "@/lib/supabase";

const ACCENT = "#8A3BDB";

export default function ResultsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Failed to load results. Please try again later.");
      } else {
        setResponses(data as SurveyResponse[]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const totalResponses = responses.length;

  const genreData = Object.entries(
    responses.reduce<Record<string, number>>((acc, r) => {
      acc[r.favorite_genre] = (acc[r.favorite_genre] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const hoursOrder = ["0–1 Hours", "2–7 Hours", "8–15 Hours", "16–25 Hours", "26+ Hours"];
  const hoursMap = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.hours_per_week] = (acc[r.hours_per_week] || 0) + 1;
    return acc;
  }, {});
  const hoursData = hoursOrder
    .map((name) => ({ name, count: hoursMap[name] || 0 }))
    .filter((d) => d.count > 0);

  // Locations: expand "Other" to the actual text, normalize casing
  const locationMap: Record<string, number> = {};
  for (const r of responses) {
    for (const loc of r.locations) {
      const raw =
        loc === "Other" && r.other_location
          ? r.other_location.trim()
          : loc;
      const label = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      locationMap[label] = (locationMap[label] || 0) + 1;
    }
  }
  const locationData = Object.entries(locationMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-gray-900 text-lg">Survey Results</h1>
        <Link
          href="/"
          className="text-sm font-medium focus:outline-none focus:underline hover:opacity-75"
          style={{ color: "#8A3BDB" }}
        >
          Home
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          {loading && (
            <p
              className="text-center text-gray-500 py-16"
              role="status"
              aria-live="polite"
            >
              Loading results…
            </p>
          )}

          {error && !loading && (
            <div role="alert" className="text-center text-red-600 py-16">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Total responses */}
              <section
                aria-labelledby="total-heading"
                className="mb-12 text-center"
              >
                <p
                  id="total-heading"
                  className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2"
                >
                  Total Responses
                </p>
                <p
                  className="text-7xl font-extrabold"
                  style={{ color: "#8A3BDB" }}
                  aria-label={`${totalResponses} total responses`}
                >
                  {totalResponses}
                </p>
              </section>

              {totalResponses === 0 && (
                <p className="text-center text-gray-500">
                  No responses yet.{" "}
                  <Link
                    href="/survey"
                    style={{ color: "#8A3BDB" }}
                    className="underline"
                  >
                    Be the first!
                  </Link>
                </p>
              )}

              {totalResponses > 0 && (
                <>
                  {/* Genre Chart */}
                  <ChartSection title="Favorite Genre">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={genreData}
                        margin={{ top: 4, right: 8, left: 0, bottom: 60 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#374151" }}
                          angle={-40}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#374151" }}
                          width={28}
                        />
                        <Tooltip
                          formatter={(val: number) => [val, "Responses"]}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {genreData.map((_, i) => (
                            <Cell key={i} fill={ACCENT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartSection>

                  {/* Hours per Week Chart */}
                  <ChartSection title="Hours Listening Per Week">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={hoursData}
                        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#374151" }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#374151" }}
                          width={28}
                        />
                        <Tooltip
                          formatter={(val: number) => [val, "Responses"]}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {hoursData.map((_, i) => (
                            <Cell key={i} fill={ACCENT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartSection>

                  {/* Listening Locations Chart */}
                  <ChartSection title="Listening Locations">
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(200, locationData.length * 44)}
                    >
                      <BarChart
                        layout="vertical"
                        data={locationData}
                        margin={{ top: 4, right: 40, left: 60, bottom: 4 }}
                      >
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#374151" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#374151" }}
                          width={56}
                        />
                        <Tooltip
                          formatter={(val: number) => [val, "Responses"]}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {locationData.map((_, i) => (
                            <Cell key={i} fill={ACCENT} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartSection>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-100">
        Survey by Jordan Griffith, BAIS:3300 - spring 2026.
      </footer>
    </div>
  );
}

function ChartSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = `chart-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <section aria-labelledby={id} className="mb-12">
      <h2 id={id} className="text-base font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
