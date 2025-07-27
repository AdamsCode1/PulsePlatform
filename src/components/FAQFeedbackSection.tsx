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
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section - Centered */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">FAQ</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Got questions? We've got answers.
            Browse through the FAQs below—your solution might be just a scroll away.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Feedback Section - Left Side */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Have Any Questions?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                We'd love to hear from you!
                Whether it's a question, suggestion, or just a thought—drop us a message anytime.
              </p>
            </div>

            <button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Contact us
            </button>
          </div>

          {/* FAQ Section - Right Side */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                {/* Question Button */}
                <button
                  className="w-full text-left py-4 px-5 font-medium text-gray-900 flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <div className={`w-6 h-6 rounded-full bg-black flex items-center justify-center transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>

                {/* Answer inside the same box */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFAQ === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="text-sm text-gray-600 leading-relaxed px-5 pb-4 border-t border-gray-200">
                    {faq.a}
                  </div>
                </div>
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