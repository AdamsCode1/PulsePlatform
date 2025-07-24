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
    <section className="py-24 max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-extrabold mb-4">
          Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Questions</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to know about DUPulse</p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
              open === i 
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg' 
                : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
            }`}
          >
            <button
              className="w-full text-left px-6 py-5 font-semibold text-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className={`transition-colors ${open === i ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'}`}>
                {faq.q}
              </span>
              <div className={`ml-4 transition-all duration-300 ${open === i ? 'rotate-180 text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-gray-700 leading-relaxed animate-in slide-in-from-top-2 duration-300">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 