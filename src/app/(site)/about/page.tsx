import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about FudFactory — a Ghanaian food, pastry and catering business.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">About FudFactory</h1>
      <p className="mt-4 text-cocoa-900/80">
        FudFactory started as a small home kitchen serving neighbours fresh meat pies and doughnuts,
        and has grown into a full food, pastry and catering business trusted for birthdays,
        weddings, corporate events and everyday cravings.
      </p>
      <p className="mt-4 text-cocoa-900/80">
        Everything we sell — from our signature meat pies to custom celebration cakes — is baked and
        prepared fresh using quality ingredients. We run our own kitchen, production planning and
        delivery so that what you order online is exactly what turns up at your door.
      </p>
      <h2 className="mt-10 text-xl font-bold text-cocoa-900">What we offer</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          "Cakes & celebration bakes",
          "Pastries & pies",
          "Snacks & breakfast items",
          "Full meals & event packages",
          "Corporate & bulk catering",
          "Custom birthday & wedding cakes",
        ].map((item) => (
          <li key={item} className="rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm font-medium text-cocoa-900 shadow-sm">
            {item}
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-xl font-bold text-cocoa-900">Find us</h2>
      <p className="mt-3 text-cocoa-900/80">Accra, Ghana · Follow us on Instagram at @fudfactory.gh</p>
    </div>
  );
}
