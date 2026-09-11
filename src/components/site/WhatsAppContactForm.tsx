"use client";

import { useState } from "react";

const BUSINESS_WHATSAPP = "233200000000"; // international format, no leading +

export function WhatsAppContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(`Hi FudFactory, my name is ${name || "..."}. ${message}`);
    window.open(`https://wa.me/${BUSINESS_WHATSAPP}?text=${text}`, "_blank");
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
      <button type="submit" className="btn-glow self-start rounded-full px-6 py-2.5 text-sm font-semibold">
        Send via WhatsApp
      </button>
    </form>
  );
}
