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

export default function ModernFAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - FAQ */}
            <div>
              {/* Enhanced Heading with More Margin */}
              <div className="mb-16">
                <h1 className="text-6xl lg:text-7xl font-black text-black mb-6 leading-tight">
                  Frequently<br />
                  asked questions
                </h1>
                <p className="text-lg text-gray-500 font-light max-w-md">
                  Find answers to common questions about DUPulse events, tickets, and more.
                </p>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isOpen = openFAQ === index;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button
                        className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        onClick={() => toggleFAQ(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${index}`}
                      >
                        <span className="text-lg font-medium text-black pr-4">
                          {faq.q}
                        </span>
                        <div className="flex-shrink-0">
                          {/* Chevron Icon */}
                          <svg
                            className={`w-6 h-6 text-black transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      <div
                        id={`faq-answer-${index}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Contact */}
            <div className="lg:pl-8">
              <div className="sticky top-8">
                {/* Speech Bubble */}
                <div className="relative mb-8">
                  <div className="bg-black text-white p-6 rounded-2xl rounded-bl-none">
                    <h3 className="text-xl font-semibold mb-3">Got questions? We've got answers.</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Contact us through email or DM us on Instagram for any inquiries or support. We're here to help you make the most of your DUPulse experience!
                    </p>
                  </div>
                  {/* Speech bubble tail */}
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-black transform rotate-45"></div>
                </div>

                {/* Centered Contact Button with Enhanced Hover Effects */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Contact us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}