export default function CommunityCTA() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-8 px-4">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6 max-w-xl w-full flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Join Our Student Community!</h2>
        <p className="text-gray-700 mb-4 text-base md:text-lg">
          Join our WhatsApp group for exclusive deals and the latest events at Durham — Be the first to know!
        </p>
        <a
          href="https://chat.whatsapp.com/HepNMq2g9W63ruiYBQQSvc?mode=r_t"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow transition-all duration-200"
        >
          Join WhatsApp Community
        </a>
      </div>
    </section>
  );
} 