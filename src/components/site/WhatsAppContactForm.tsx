"use client";

import { useState } from "react";

export function WhatsAppContactForm({ businessName, whatsapp }: { businessName: string; whatsapp: string | null }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(`Hi ${businessName}, my name is ${name || "..."}. ${message}`);
    const number = (whatsapp ?? "").replace(/[^\d]/g, "");
    window.open(`https://wa.me/${number}?text=${text}`, "_blank");
  };

  return (
    <form onSubmit={send} className="flex flex-col gap-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="input-dark rounded-lg px-4 py-2 text-sm"
      />
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we help?"
        rows={4}
        className="input-dark rounded-lg px-4 py-2 text-sm"
      />
      <button type="submit" className="btn-glow self-start rounded-md px-6 py-2.5 text-sm font-semibold">
        Send via WhatsApp
      </button>
    </form>
  );
}
