import { useState } from 'react';
import { X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Us</h3>

        <div className="space-y-4">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/dupulse/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <svg width="20" height="20" fill="currentColor" className="text-white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.402 3.545 1.459 2.488 2.516 2.216 3.689 2.158 4.966.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.058 1.277.33 2.45 1.387 3.507 1.057 1.057 2.23 1.329 3.507 1.387C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.058 2.45-.33 3.507-1.387 1.057-1.057 1.329-2.23 1.387-3.507.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.058-1.277-.33-2.45-1.387-3.507C19.398.402 18.225.13 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
              </svg>
            </div>
            <span className="text-gray-700 group-hover:text-gray-900 font-medium">DM us on Instagram</span>
          </a>

          {/* Gmail */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <svg width="20" height="20" fill="currentColor" className="text-white">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.887.711-1.603 1.598-1.62L12 10.773l10.402-6.936A1.636 1.636 0 0 1 24 5.457z" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">example123@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}