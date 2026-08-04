"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { reviewAPI } from "../../../services/api";

interface ReviewContext {
  alreadySubmitted: boolean;
  reviewerName: string;
  pg: { _id: string; name: string; location: { subcity: string; city: string; state: string } };
  rating?: number;
  comment?: string;
}

const STAR_LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

export default function ReviewPage() {
  const { token } = useParams<{ token: string }>();

  const [ctx, setCtx]             = useState<ReviewContext | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewAPI.getByToken(token);
      if (res.success) {
        setCtx(res.data);
        if (res.data.alreadySubmitted) {
          setRating(res.data.rating ?? 0);
          setComment(res.data.comment ?? "");
        }
      } else {
        setError("This review link is invalid or has already been used.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "This review link is invalid.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadContext(); }, [loadContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError("Please select a star rating."); return; }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await reviewAPI.submit(token, { rating, comment: comment.trim() });
      if (res.success) {
        setSubmitted(true);
      } else {
        setSubmitError(res.message || "Failed to submit review.");
      }
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Error / Invalid token ── */
  if (error || !ctx) {
    return (
      <Shell>
        <div className="text-center py-10">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Review Link</h2>
          <p className="text-gray-500 text-sm">{error || "This review link is not valid."}</p>
        </div>
      </Shell>
    );
  }

  const displayRating = hovered || rating;

  /* ── Already submitted ── */
  if (ctx.alreadySubmitted && !submitted) {
    return (
      <Shell pgName={ctx.pg.name}>
        <div className="text-center py-6">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Review Already Submitted</h2>
          <p className="text-sm text-gray-500 mb-4">
            You already shared your feedback for <strong>{ctx.pg.name}</strong>.
          </p>
          <Stars value={rating} size="lg" />
          {comment && (
            <p className="mt-4 text-sm text-gray-600 italic bg-gray-50 rounded-xl px-4 py-3">
              &ldquo;{comment}&rdquo;
            </p>
          )}
        </div>
      </Shell>
    );
  }

  /* ── Success after submit ── */
  if (submitted) {
    return (
      <Shell pgName={ctx.pg.name}>
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Thank You, {ctx.reviewerName.split(" ")[0]}!</h2>
          <p className="text-sm text-gray-500">
            Your review for <strong>{ctx.pg.name}</strong> has been published.
          </p>
          <Stars value={rating} size="lg" className="mt-4" />
          {comment && (
            <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 rounded-xl px-4 py-3">
              &ldquo;{comment}&rdquo;
            </p>
          )}
        </div>
      </Shell>
    );
  }

  /* ── Review form ── */
  return (
    <Shell pgName={ctx.pg.name} location={`${ctx.pg.location?.subcity}, ${ctx.pg.location?.city}`}>
      <p className="text-sm text-gray-500 mb-5">
        Hi <strong>{ctx.reviewerName.split(" ")[0]}</strong>, how was your stay?
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-4xl leading-none transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <span className={star <= displayRating ? "text-amber-400" : "text-gray-200"}>★</span>
              </button>
            ))}
          </div>
          {displayRating > 0 && (
            <p className="mt-1 text-xs text-amber-600 font-medium">
              {STAR_LABELS[displayRating - 1]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Tell others about the facilities, cleanliness, food, owner responsiveness…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 text-right mt-0.5">{comment.length}/1000</p>
        </div>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </Shell>
  );
}

/* ── Layout shell ─────────────────────────────────── */
function Shell({ children, pgName, location }: { children: React.ReactNode; pgName?: string; location?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-12 px-4 pb-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-purple-700 tracking-tight">BEDWALE.IN</p>
        </div>
        {pgName && (
          <div className="mb-5">
            <h1 className="text-lg font-bold text-gray-900">{pgName}</h1>
            {location && <p className="text-xs text-gray-400 mt-0.5">{location}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ── Static star display ──────────────────────────── */
function Stars({ value, size = "md", className = "" }: { value: number; size?: "md" | "lg"; className?: string }) {
  const sz = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <div className={`flex justify-center gap-0.5 ${sz} ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= value ? "text-amber-400" : "text-gray-200"}>★</span>
      ))}
    </div>
  );
}
