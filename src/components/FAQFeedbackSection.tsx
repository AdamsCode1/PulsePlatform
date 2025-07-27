import { useState } from 'react';
import ContactModal from './ContactModal';

const faqs = [
  { q: 'How do I RSVP to an event?', a: 'You can RSVP by clicking the RSVP button on any event page.' },
  { q: 'How do I redeem a student deal?', a: 'Show your student ID and the deal code at the venue to redeem.' },
  { q: 'Who can post events?', a: 'Any Durham University student or society can post events.' },
  { q: 'Is DUPulse free to use?', a: 'Yes, DUPulse is completely free for students!' },
  { q: 'How do I create a student deal?', a: 'Contact us to get your business or society listed with a deal.' },
];

export default function FAQFeedbackSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        {/* Feedback Section - Left Side */}
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex-grow">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Have Any Questions?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We'd love to hear from you!
              Whether it's a question, suggestion, or just a thought—drop us a message anytime.


            </p>
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors mt-auto"
          >
            Contact us
          </button>
        </div>

        {/* FAQ Section - Right Side */}
        <div className="space-y-4">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">FAQ</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600">
              Got questions? We've got answers.
              Browse through the FAQs below—your solution might be just a scroll away.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 font-medium text-gray-900 flex justify-between items-center focus:outline-none hover:bg-gray-100 transition-colors"
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-sm flex items-center justify-center font-bold">
                      ?
                    </span>
                    {faq.q}
                  </span>
                  <div className={`transition-transform duration-200 ${openFAQ === i ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-gray-500">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                {openFAQ === i && (
                  <div className="px-5 pb-4 text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </section>
  );
}