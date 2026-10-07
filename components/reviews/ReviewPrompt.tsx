"use client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";
import "./review-prompt.css";

interface Props {
  tripId: string;
}

export function ReviewPrompt({ tripId }: Props) {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Single stable client instance
  const supabase = useMemo(() => createClient(), []);

  // Ref to track if prompt was already scheduled — prevents duplicate timers
  const scheduledRef = useRef(false);

  useEffect(() => {
    const key = `review-dismissed-${tripId}`;
    if (localStorage.getItem(key)) return;

    let timer: NodeJS.Timeout;

    function schedulePrompt() {
      // Guard against scheduling twice
      if (scheduledRef.current) return;
      scheduledRef.current = true;
      timer = setTimeout(() => setVisible(true), 30000);
    }

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) schedulePrompt();
    }

    checkSession();

    // Also react if user logs in after page render
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) return;
      if (localStorage.getItem(key)) return;
      schedulePrompt();
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [tripId, supabase]); // ← visible removed from deps

  function handleDismiss() {
    localStorage.setItem(`review-dismissed-${tripId}`, "true");
    setVisible(false);
  }

  async function handleSubmit() {
    if (rating === 0) return;
    setSaving(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          tripId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      localStorage.setItem(`review-dismissed-${tripId}`, "true");
      setSubmitted(true);
      setTimeout(() => setVisible(false), 2000);
    } catch (err) {
      console.error("Review submit failed:", err);
    } finally {
      setSaving(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="review-prompt-overlay" onClick={handleDismiss}>
      <div className="review-prompt" onClick={(e) => e.stopPropagation()}>
        <button className="review-prompt__close" onClick={handleDismiss}>
          ×
        </button>

        {submitted ? (
          <div className="review-prompt__success">
            <p className="review-prompt__success-icon">🙏</p>
            <p className="review-prompt__success-text">
              Thank you for your feedback!
            </p>
          </div>
        ) : (
          <>
            <p className="review-prompt__eyebrow">Quick question</p>
            <h3 className="review-prompt__title">
              How was your Barcelona route?
            </h3>

            {/* Star rating */}
            <div className="review-prompt__stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`review-prompt__star ${
                    n <= (hovered || rating)
                      ? "review-prompt__star--active"
                      : ""
                  }`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Optional comment — only show after rating selected */}
            {rating > 0 && (
              <textarea
                className="review-prompt__textarea"
                placeholder="What did you think? (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            )}

            <div className="review-prompt__actions">
              <button
                className="btn btn--primary review-prompt__submit"
                onClick={handleSubmit}
                disabled={rating === 0 || saving}
              >
                {saving ? "Sending..." : "Send feedback"}
              </button>
              <button className="review-prompt__skip" onClick={handleDismiss}>
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
