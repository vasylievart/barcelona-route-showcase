"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./preview.css";
import { createClient } from "@/lib/supabase/client";
import { PreviewScreen } from "@/components/itinerary/PreviewScreen";
import { trackPinterest } from "@/lib/pinterest";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";
import type { FullItinerary } from "@/types/itinerary";

// FIX 6: the hardcoded "1541 places" leaked the dataset size and went stale.
const LOADING_STEPS = [
  "Locating your hotel...",
  "Checking places around you...",
  "Matching your interests...",
  "Checking opening hours...",
  "Optimising your walking route...",
  "Building your perfect day...",
];


const MIN_LOADING_MS = 12_000;
const STEP_INTERVAL_MS = 2_000;

type GenerateResult = { tripId: string; itinerary: FullItinerary };

// Only the fields this page reads from the stored onboarding answers.
interface PendingRoute {
  tripDays: number;
  budget: number;
  budgetPersona: string;
  interests: string[];
  foodPrefs: string[];
}

function safely(fn: () => void) {
  try {
    fn();
  } catch (e) {
    console.warn("tracking call failed:", e);
  }
}

export default function PreviewPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "preview">("loading");
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);


  useEffect(() => {
    if (phase !== "loading" || error) return;
    const id = setInterval(
      () => setLoadStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      STEP_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [phase, error]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function generateRoute() {
      const raw = sessionStorage.getItem("pendingRoute");
      if (!raw) {
        router.push("/plan");
        return;
      }

      let input: PendingRoute;
      try {
        input = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem("pendingRoute");
        router.push("/plan");
        return;
      }

      safely(() =>
        trackPinterest("search", {
          search_query: input.interests?.join(", ") ?? "barcelona",
        })
      );
      safely(() =>
        posthog.capture("route_generation_started", {
          trip_days: input.tripDays,
          budget: input.budget,
          budget_persona: input.budgetPersona,
          interests: input.interests,
          food_prefs: input.foodPrefs,
        })
      );

      safely(() =>
        Sentry.setContext("route_generation", {
          trip_days: input.tripDays,
          budget: input.budget,
          budget_persona: input.budgetPersona,
          interests: input.interests,
          food_prefs: input.foodPrefs,
        })
      );

      const startTime = Date.now();

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          // Send the stored string as it is instead of parsing and
          // stringifying it again.
          body: raw,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const apiError = new Error(
            `generate-itinerary returned ${response.status}: ${body?.error ?? "unknown"}`
          );

          Sentry.captureException(apiError, {
            tags: {
              component: "PreviewPage",
              error_type: "api_error",
              status_code: String(response.status),
            },
            extra: {
              status: response.status,
              response_body: body,
              trip_days: input.tripDays,
              budget: input.budget,
              interests: input.interests,
            },
          });
          safely(() =>
            posthog.capture("route_generation_failed", {
              status: response.status,
              interests: input.interests,
            })
          );
          throw apiError;
        }

        const data: GenerateResult = await response.json();

        // Generation succeeded, so store the result and clear the pending
        // answers even if the user has already left the page.
        sessionStorage.setItem("generatedRoute", JSON.stringify(data));
        sessionStorage.removeItem("pendingRoute");

        if (!isMountedRef.current) return;

        const remaining = Math.max(0, MIN_LOADING_MS - (Date.now() - startTime));
        revealTimerRef.current = setTimeout(() => {
          setResult(data);
          setPhase("preview");

          safely(() =>
            posthog.capture("route_generation_completed", {
              trip_id: data.tripId,
              total_stops: data.itinerary?.days?.[0]?.steps?.length ?? 0,
              estimated_cost: data.itinerary?.days?.[0]?.totalEstimatedCost ?? 0,
              generation_ms: Date.now() - startTime,
            })
          );
          safely(() => trackPinterest("lead", { lead_type: "itinerary_generated" }));
        }, remaining);
      } catch (err) {
        if (
          !(err instanceof Error && err.message.startsWith("generate-itinerary returned"))
        ) {
          Sentry.captureException(err, {
            tags: { component: "PreviewPage", error_type: "unexpected_error" },
            extra: {
              trip_days: input.tripDays,
              budget: input.budget,
              interests: input.interests,
            },
          });
        }
        setError("Something went wrong. Please try again.");
        console.error(err);
      }
    }

    generateRoute();
  }, [router]);


  if (error) {
    return (
      <div className="preview-error">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn--primary"
        >
          Try again
        </button>
        <button onClick={() => router.push("/plan")} className="btn">
          Change my answers
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="loading">
        <div className="loading__inner">
          <div className="loading__spinner" />
          <h2 className="loading__title">Building your route</h2>
          <div className="loading__steps">
            {LOADING_STEPS.map((step, i) => (
              <div
                key={i}
                className={`loading__step ${
                  i < loadStep
                    ? "loading__step--done"
                    : i === loadStep
                      ? "loading__step--active"
                      : ""
                }`}
              >
                <span className="loading__step-icon">
                  {i < loadStep ? "✓" : i === loadStep ? "→" : "·"}
                </span>
                {step}
              </div>
            ))}
          </div>
          <p className="loading__note">
            Worth the wait — this route is made for you.
          </p>
        </div>
      </div>
    );
  }

  return <PreviewScreen itinerary={result} />;
}