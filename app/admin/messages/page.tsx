"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { chatAPI } from "@/services/api";

interface Conversation {
  bookingId: string;
  pgName: string;
  pgPhoto: string | null;
  userName: string;
  userEmail: string;
  status: string;
  lastMessage: { text: string; createdAt: string } | null;
  unread: number;
}

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

function StatusBadge({ status }: { status: string }) {
  const cls = status === "approved" ? "bg-green-100 text-green-700"
    : status === "pending" ? "bg-yellow-100 text-yellow-700"
    : status === "rejected" ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-500";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${cls}`}>{status}</span>;
}

export default function AdminMessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    chatAPI.getConversations()
      .then((res) => { setConvs(res.data ?? []); })
      .catch((e: any) => setError(e.message || "Failed to load conversations"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">Conversations with tenants across all your PGs</p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && convs.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">No conversations yet.<br />Tenants who book your PG will appear here.</p>
        </div>
      )}

      <div className="space-y-2">
        {convs.map((c) => (
          <Link
            key={c.bookingId}
            href={`/admin/chat?bookingId=${c.bookingId}`}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-base">
              {(c.userName?.[0] ?? "?").toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-sm truncate ${c.unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                  {c.userName}
                </p>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-gray-500 truncate">{c.pgName}</p>
              {c.lastMessage && (
                <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                  {c.lastMessage.text}
                </p>
              )}
            </div>

            {/* Right meta */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {c.lastMessage && (
                <span className="text-[10px] text-gray-400">{fmtTime(c.lastMessage.createdAt)}</span>
              )}
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {c.unread > 9 ? "9+" : c.unread}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
