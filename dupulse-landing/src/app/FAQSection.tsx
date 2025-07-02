import { useState } from 'react';

const faqs = [
  { q: 'How do I RSVP to an event?', a: 'You can RSVP by clicking the RSVP button on any event page.' },
  { q: 'How do I redeem a student deal?', a: 'Show your student ID and the deal code at the venue to redeem.' },
  { q: 'Who can post events?', a: 'Any Durham University student or society can post events.' },
  { q: 'Is DUPulse free to use?', a: 'Yes, DUPulse is completely free for students!' },
  { q: 'How do I create a student deal?', a: 'Contact us to get your business or society listed with a deal.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-center mb-2">
        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Questions</span>
      </h2>
      <p className="text-center text-gray-500 mb-10">Everything you need to know about DUPulse</p>
      <div className="flex flex-col gap-6">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/80 border border-gray-200 shadow flex flex-col overflow-hidden"
          >
            <button
              className="w-full text-left px-6 py-4 font-bold text-lg flex justify-between items-center focus:outline-none"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {faq.q}
              <span className="ml-4 text-2xl text-gray-400">{open === i ? '▲' : '▼'}</span>
            </button>
            {open === i && (
              <div className="px-6 pb-4 text-gray-600 animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 