import Image from 'next/image';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2 w-[95vw] max-w-4xl rounded-2xl bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-between px-6 py-3 border border-gray-200">
      <div className="flex items-center gap-3">
        <Image src="/favicon.png" alt="DUPulse Logo" width={40} height={40} className="rounded-full" />
        <span className="font-extrabold text-xl text-gray-900 tracking-tight">DUPulse</span>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <Link href="#" className="text-gray-700 font-medium hover:text-pink-500 transition">Home</Link>
        <Link href="#events" className="text-gray-700 font-medium hover:text-pink-500 transition">Events</Link>
        <Link href="#deals" className="text-gray-700 font-medium hover:text-pink-500 transition">Deals</Link>
        <Link href="#about" className="text-gray-700 font-medium hover:text-pink-500 transition">About</Link>
      </div>
      <div className="flex gap-2 items-center">
        <button className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Login</button>
        <button className="px-4 py-1.5 rounded-lg bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition">Sign Up</button>
      </div>
    </nav>
  );
} 