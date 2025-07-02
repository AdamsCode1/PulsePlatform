import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center pt-32 pb-16 text-center">
      <div className="mb-8">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-xl mx-auto">
          <Image src="/favicon.png" alt="DUPulse Logo" width={120} height={120} className="rounded-full" />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">everything</span><br /> going on around town
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        DUPulse: Your one-stop shop to discover what's happening at Durham University
      </p>
    </section>
  );
} 