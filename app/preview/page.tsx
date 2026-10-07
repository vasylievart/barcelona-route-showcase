"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./preview.css"
import { createClient } from "@/lib/supabase/client";
import { PreviewScreen } from "@/components/itinerary/PreviewScreen";
import { trackPinterest } from "@/lib/pinterest";
import posthog from "posthog-js";
import * as Sentry                from "@sentry/nextjs"; 

const LOADING_STEPS = [
  "Locating your hotel...",
  "Checking 1541 Barcelona places...",
  "Matching your interests...",
  "Checking opening hours...",
  "Optimising your walking route...",
  "Building your perfect day...",
];

export default function PreviewPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "preview">("loading");
  const [loadStep, setLoadStep] = useState(0);
  const [itinerary, setItinerary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    let interval: NodeJS.Timeout

    async function generateRoute() {
      const raw = sessionStorage.getItem("pendingRoute")

      if (!raw) {
        router.push("/plan")
        return
      }

      const input = JSON.parse(raw)
      trackPinterest('search', {
        search_query: input.interests?.join(', ') ?? 'barcelona',
      })

      posthog.capture('route_generation_started', {
        trip_days: input.tripDays,
        budget: input.budget,
        budget_persona: input.budgetPersona,
        interests: input.interests,
        food_prefs: input.foodPrefs,
      })

      Sentry.setContext("route_generation", {
        trip_days:      input.tripDays,
        budget:         input.budget,
        budget_persona: input.budgetPersona,
        interests:      input.interests,
        food_prefs:     input.foodPrefs,
        accommodation:  input.accommodationAddress,
      })

      const startTime = Date.now()

      interval = setInterval(() => {
        setLoadStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
      }, 2000)

      try {
        // Get current auth session
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Call API with token if logged in
        const response = await fetch("/api/generate-itinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify(input),
        })

        if(!response.ok){
          const body = await response.json().catch(() => ({}))

          const apiError = new Error(
            `generate-itinerary returned ${response.status}: ${body?.error ?? 'unknown'}`
          )

          Sentry.captureException(apiError, {
            tags:{
              component: 'PreviewPage',
              error_type: 'api_error',
              status_code: String(response.status),
            },
            extra: {
              status: response.status,
              response_body: body,
              trip_days: input.tripDays,
              budget: input.budget,
              interests: input.interests,
            },
          })

          posthog.capture('route_generation_failed', {
            status: response.status,
            interests: input.interests,
          })
          throw apiError
        }

        const data = await response.json()


        clearInterval(interval)
        sessionStorage.setItem("generatedRoute", JSON.stringify(data))
        sessionStorage.removeItem("pendingRoute")

        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 12000 - elapsed)

        setTimeout(() => {
          setItinerary(data)
          setPhase("preview")

          posthog.capture('route_generation_completed', {
            trip_id: data.tripId,
            total_stops: data.itinerary?.days?.[0]?.steps?.length ?? 0,
            estimated_cost: data.itinerary?.days?.[0]?.totalEstimatedCost ?? 0,
            generation_ms:  Date.now() - startTime,
          })

          trackPinterest('lead', {lead_type: 'itinerary_generated'})
        }, remaining)

      } catch (err) {
        clearInterval(interval)

        if(!(err instanceof Error && err.message.startsWith('generate-itinerary returned'))) {
          Sentry.captureException(err, {
            tags: {
              component: 'PreviewPage',
              error_type: 'unexpected_error',
            },
            extra: {
              trip_days:  input.tripDays,
              budget:     input.budget,
              interests:  input.interests,
            },
          })
        }
        setError("Something went wrong. Please try again.")
        console.error(err)
      }
    }

    generateRoute()


    return () => {
      if (interval) clearInterval(interval)
    }
  }, [router])

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

  // Preview screen — built in Day 5
  return <PreviewScreen itinerary={itinerary}/>;
}


