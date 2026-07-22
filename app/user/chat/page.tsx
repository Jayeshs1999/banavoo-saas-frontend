"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";

function ChatPage() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId") ?? "";

  if (!bookingId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-5 py-4 rounded-xl text-sm">
          No booking selected. Please open a chat from your Requests page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <ChatWindow
        bookingId={bookingId}
        myRole="user"
        backHref="/user/messages"
      />
    </div>
  );
}

export default function UserChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
      </div>
    }>
      <ChatPage />
    </Suspense>
  );
}
