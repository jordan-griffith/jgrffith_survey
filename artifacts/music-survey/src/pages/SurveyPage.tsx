import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { supabase, type SurveyInsert } from "@/lib/supabase";

const GENRES = [
  "Alternative/Indie",
  "Ambient",
  "Blues",
  "Classical",
  "Country",
  "Electronic/Dance",
  "Folk",
  "Funk",
  "Gospel/Christian",
  "Hip-Hop/Rap",
  "Jazz",
  "K-Pop",
  "Latin",
  "Metal",
  "Pop",
  "Punk",
  "R&B/Soul",
  "Reggae",
  "Rock",
  "World Music",
];

const HOURS_OPTIONS = [
  "0–1 Hours",
  "2–7 Hours",
  "8–15 Hours",
  "16–25 Hours",
  "26+ Hours",
];

const LOCATION_OPTIONS = ["Gym", "Shower", "Car", "Bed", "Outside", "Other"];

interface FormData {
  favorite_artist: string;
  favorite_genre: string;
  hours_per_week: string;
  locations: string[];
  other_location: string;
}

interface FormErrors {
  favorite_artist?: string;
  favorite_genre?: string;
  hours_per_week?: string;
  locations?: string;
  other_location?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.favorite_artist.trim()) {
    errors.favorite_artist = "Please enter your favorite artist.";
  }
  if (!data.favorite_genre) {
    errors.favorite_genre = "Please select a genre.";
  }
  if (!data.hours_per_week) {
    errors.hours_per_week = "Please select how many hours per week.";
  }
  if (data.locations.length === 0) {
    errors.locations = "Please select at least one location.";
  }
  if (data.locations.includes("Other") && !data.other_location.trim()) {
    errors.other_location = "Please describe your other location.";
  }
  return errors;
}

interface SubmittedData extends FormData {}

export default function SurveyPage() {
  const [form, setForm] = useState<FormData>({
    favorite_artist: "",
    favorite_genre: "",
    hours_per_week: "",
    locations: [],
    other_location: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmittedData | null>(null);

  const artistRef = useRef<HTMLInputElement>(null);
  const otherLocationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    artistRef.current?.focus();
  }, []);

  const showOtherInput = form.locations.includes("Other");

  useEffect(() => {
    if (showOtherInput) {
      otherLocationRef.current?.focus();
    }
  }, [showOtherInput]);

  function handleLocationChange(location: string, checked: boolean) {
    setForm((f) => {
      const updated = checked
        ? [...f.locations, location]
        : f.locations.filter((l) => l !== location);
      return {
        ...f,
        locations: updated,
        other_location: !checked && location === "Other" ? "" : f.other_location,
      };
    });
    if (errors.locations) setErrors((e) => ({ ...e, locations: undefined }));
    if (location === "Other") {
      setErrors((e) => ({ ...e, other_location: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0] as keyof FormErrors;
      const el = document.getElementById(`field-${firstErrorKey}`);
      el?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload: SurveyInsert = {
      favorite_artist: form.favorite_artist.trim(),
      favorite_genre: form.favorite_genre,
      hours_per_week: form.hours_per_week,
      locations: form.locations,
      other_location: form.locations.includes("Other")
        ? form.other_location.trim()
        : null,
    };

    const { error } = await supabase.from("survey_responses").insert(payload);
    setSubmitting(false);

    if (error) {
      setSubmitError(
        "There was an error submitting your response. Please try again."
      );
    } else {
      setSubmitted(form);
    }
  }

  if (submitted) {
    const displayLocations = submitted.locations.map((loc) =>
      loc === "Other" && submitted.other_location ? submitted.other_location : loc
    );

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                style={{ backgroundColor: "#8A3BDB" }}
                aria-hidden="true"
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Thank you for your response!
              </h1>
              <p className="text-gray-600">Here's a summary of your answers:</p>
            </div>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mb-6">
              <SummaryRow label="Favorite Artist" value={submitted.favorite_artist} />
              <SummaryRow label="Favorite Genre" value={submitted.favorite_genre} />
              <SummaryRow label="Hours Per Week" value={submitted.hours_per_week} />
              <SummaryRow
                label="Listening Locations"
                value={displayLocations.join(", ")}
              />
            </div>

            <Link
              href="/results"
              className="block w-full text-center py-3 px-6 text-white font-semibold rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: "#8A3BDB" }}
            >
              View Results
            </Link>
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-100">
          Survey by Jordan Griffith, BAIS:3300 - spring 2026.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900 hover:opacity-75 focus:outline-none focus:underline">
          Music Survey
        </Link>
        <Link
          href="/results"
          className="text-sm font-medium focus:outline-none focus:underline hover:opacity-75"
          style={{ color: "#8A3BDB" }}
        >
          View Results
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Music Listening Survey
          </h1>
          <p className="text-gray-600 mb-8 text-sm">All fields are required.</p>

          {submitError && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
            >
              <strong>Error:</strong> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Music listening survey">
            {/* Q1 – Favorite Artist */}
            <div className="mb-7">
              <label
                htmlFor="field-favorite_artist"
                className="block text-sm font-semibold text-gray-800 mb-1"
              >
                1. Who is your favorite artist?
              </label>
              <input
                ref={artistRef}
                id="field-favorite_artist"
                type="text"
                value={form.favorite_artist}
                onChange={(e) => {
                  setForm((f) => ({ ...f, favorite_artist: e.target.value }));
                  if (errors.favorite_artist)
                    setErrors((er) => ({ ...er, favorite_artist: undefined }));
                }}
                placeholder="e.g. Justin Bieber"
                autoFocus
                required
                aria-required="true"
                aria-describedby={errors.favorite_artist ? "err-favorite_artist" : undefined}
                aria-invalid={!!errors.favorite_artist}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.favorite_artist ? "#dc2626" : "#d1d5db",
                  "--tw-ring-color": "#8A3BDB",
                } as React.CSSProperties}
              />
              {errors.favorite_artist && (
                <p id="err-favorite_artist" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.favorite_artist}
                </p>
              )}
            </div>

            {/* Q2 – Favorite Genre */}
            <div className="mb-7">
              <label
                htmlFor="field-favorite_genre"
                className="block text-sm font-semibold text-gray-800 mb-1"
              >
                2. What is your favorite genre?
              </label>
              <select
                id="field-favorite_genre"
                value={form.favorite_genre}
                onChange={(e) => {
                  setForm((f) => ({ ...f, favorite_genre: e.target.value }));
                  if (errors.favorite_genre)
                    setErrors((er) => ({ ...er, favorite_genre: undefined }));
                }}
                required
                aria-required="true"
                aria-describedby={errors.favorite_genre ? "err-favorite_genre" : undefined}
                aria-invalid={!!errors.favorite_genre}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm bg-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.favorite_genre ? "#dc2626" : "#d1d5db",
                  "--tw-ring-color": "#8A3BDB",
                } as React.CSSProperties}
              >
                <option value="">Select a genre…</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.favorite_genre && (
                <p id="err-favorite_genre" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.favorite_genre}
                </p>
              )}
            </div>

            {/* Q3 – Hours per Week */}
            <fieldset className="mb-7">
              <legend className="block text-sm font-semibold text-gray-800 mb-2">
                3. How many hours per week do you listen to music?
              </legend>
              <div
                aria-describedby={errors.hours_per_week ? "err-hours_per_week" : undefined}
                aria-invalid={!!errors.hours_per_week}
                className="flex flex-col gap-2"
              >
                {HOURS_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      id={`field-hours_per_week-${option}`}
                      type="radio"
                      name="hours_per_week"
                      value={option}
                      checked={form.hours_per_week === option}
                      onChange={() => {
                        setForm((f) => ({ ...f, hours_per_week: option }));
                        if (errors.hours_per_week)
                          setErrors((er) => ({ ...er, hours_per_week: undefined }));
                      }}
                      className="w-4 h-4"
                      style={{ accentColor: "#8A3BDB" }}
                    />
                    <span className="text-sm text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
              {errors.hours_per_week && (
                <p id="err-hours_per_week" role="alert" className="mt-2 text-xs text-red-600">
                  {errors.hours_per_week}
                </p>
              )}
            </fieldset>

            {/* Q4 – Locations */}
            <fieldset className="mb-8">
              <legend className="block text-sm font-semibold text-gray-800 mb-2">
                4. Where all do you listen to music?{" "}
                <span className="font-normal text-gray-500">(Select all that apply)</span>
              </legend>
              <div
                aria-describedby={errors.locations ? "err-locations" : undefined}
                aria-invalid={!!errors.locations}
                className="flex flex-col gap-2"
              >
                {LOCATION_OPTIONS.map((location) => (
                  <div key={location}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        value={location}
                        checked={form.locations.includes(location)}
                        onChange={(e) => handleLocationChange(location, e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#8A3BDB" }}
                      />
                      <span className="text-sm text-gray-800">{location}</span>
                    </label>
                    {location === "Other" && showOtherInput && (
                      <div className="mt-2 ml-7">
                        <label
                          htmlFor="field-other_location"
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Please describe your other listening location:
                        </label>
                        <input
                          ref={otherLocationRef}
                          id="field-other_location"
                          type="text"
                          value={form.other_location}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, other_location: e.target.value }));
                            if (errors.other_location)
                              setErrors((er) => ({ ...er, other_location: undefined }));
                          }}
                          required
                          aria-required="true"
                          aria-describedby={errors.other_location ? "err-other_location" : undefined}
                          aria-invalid={!!errors.other_location}
                          className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: errors.other_location ? "#dc2626" : "#d1d5db",
                            "--tw-ring-color": "#8A3BDB",
                          } as React.CSSProperties}
                        />
                        {errors.other_location && (
                          <p id="err-other_location" role="alert" className="mt-1 text-xs text-red-600">
                            {errors.other_location}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.locations && (
                <p id="err-locations" role="alert" className="mt-2 text-xs text-red-600">
                  {errors.locations}
                </p>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 text-white font-semibold rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#8A3BDB" }}
              aria-busy={submitting}
            >
              {submitting ? "Submitting…" : "Submit Survey"}
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-100">
        Survey by Jordan Griffith, BAIS:3300 - spring 2026.
      </footer>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}
