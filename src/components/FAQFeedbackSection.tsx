import { useState } from 'react';
import ContactModal from './ContactModal';

const faqs = [
  {
    q: 'How do I RSVP to an event?',
    a: 'You can RSVP by clicking the RSVP button on any event page. Once clicked, you\'ll be added to the attendee list and receive event updates.'
  },
  {
    q: 'How do I redeem a student deal?',
    a: 'Show your student ID and the deal code at the venue to redeem your discount. Make sure your student ID is valid and current.'
  },
  {
    q: 'Who can post events on DUPulse?',
    a: 'Any Durham University student or society can post events after creating an account and verifying their student status.'
  },
  {
    q: 'Is DUPulse completely free to use?',
    a: 'Yes, DUPulse is completely free for all Durham University students. There are no hidden fees or premium features.'
  },
  {
    q: 'How do I create a student deal for my business?',
    a: 'Contact us through our contact form or social media to get your business listed with exclusive student deals and promotions.'
  },
];

export default function FAQFeedbackSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <>
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about DUPulse events, tickets, and more.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFAQ === index;
                return (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <button
                      className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
                      onClick={() => toggleFAQ(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span className="text-md sm:text-lg font-medium text-gray-900">
                        {faq.q}
                      </span>
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        {/* Plus/Minus Icon */}
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
                    <div
                      id={`faq-answer-${index}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}
                    >
                      <p className="text-base text-gray-600 pt-2">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Still have questions?
            </h3>
            <p className="mt-2 text-base text-gray-600">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                Contact us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}