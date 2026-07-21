"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { chatAPI } from "@/services/api";

interface Message {
  _id: string;
  text: string;
  senderType: "user" | "admin";
  createdAt: string;
  readAt: string | null;
}

interface ChatMeta {
  bookingId: string;
  pgName: string;
  userName: string;
  senderType: "user" | "admin";
}

interface ChatWindowProps {
  bookingId: string;
  /** The role of the currently logged-in person */
  myRole: "user" | "admin";
  /** Link to go back (conversations list) */
  backHref: string;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const m of messages) {
    const d = fmtDate(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === d) {
      last.messages.push(m);
    } else {
      groups.push({ date: d, messages: [m] });
    }
  }
  return groups;
}

export default function ChatWindow({ bookingId, myRole, backHref }: ChatWindowProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<ChatMeta | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<string | undefined>(undefined); // ISO of last message
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── initial load ── */
  const loadMessages = useCallback(async (after?: string) => {
    try {
      const res = await chatAPI.getMessages(bookingId, after);
      if (!res.success) return;
      if (!after) {
        setMessages(res.data);
        setMeta(res.meta);
        setLoading(false);
      } else if (res.data.length > 0) {
        setMessages((prev) => [...prev, ...res.data]);
      }
      if (res.data.length > 0) {
        latestRef.current = res.data[res.data.length - 1].createdAt;
      }
    } catch (e: any) {
      if (!after) setError(e.message || "Failed to load messages");
    }
  }, [bookingId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  /* ── scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── polling every 4 seconds ── */
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (latestRef.current) loadMessages(latestRef.current);
      else loadMessages();
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages]);

  /* ── send ── */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await chatAPI.sendMessage(bookingId, trimmed);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        latestRef.current = res.data.createdAt;
        setText("");
      }
    } catch (e: any) {
      setError(e.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  /* ── render ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 h-96 justify-center">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={() => { setError(""); loadMessages(); }}
          className="text-xs border border-primary/30 text-primary px-4 py-1.5 rounded-lg hover:bg-primary/5">
          Retry
        </button>
      </div>
    );
  }

  const otherName = myRole === "user" ? (meta?.pgName ?? "PG Owner") : (meta?.userName ?? "Tenant");
  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[720px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <Link href={backHref}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{otherName}</p>
          <p className="text-[11px] text-gray-400">
            {myRole === "user" ? "PG Owner" : "Tenant"} · Booking #{bookingId.slice(-6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50/40">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              No messages yet. Say hello to start the conversation!
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-medium text-gray-400 px-2">{group.date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {group.messages.map((msg) => {
              const isMe = msg.senderType === myRole;
              return (
                <div key={msg._id} className={`flex mb-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                  }`}>
                    <p className="break-words">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-white/60" : "text-gray-400"}`}>
                      {fmtTime(msg.createdAt)}
                      {isMe && msg.readAt && (
                        <span className="ml-1.5 text-white/70">✓✓</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Error strip */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600 flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend}
        className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 bg-white shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }
          }}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          maxLength={1000}
          className="flex-1 resize-none px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition max-h-28 overflow-y-auto"
          style={{ minHeight: "42px" }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
