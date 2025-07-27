export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-900 to-gray-800 text-gray-100 pt-16 pb-8 px-4 mt-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-0">
        {/* Branding */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img src="/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png" alt="DUPulse Logo" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-2xl">DUPulse</span>
          </div>
          <p className="text-gray-300 max-w-xs">Your one-stop platform for all the best happenings and exclusive deals at Durham Uni.</p>
        </div>
        {/* Quick Links */}
        <div className="flex-1 flex flex-col gap-2 min-w-[120px]">
          <h3 className="font-bold text-lg mb-2">Quick Links</h3>
          <a href="/" className="hover:text-pink-400">Home</a>
          <a href="/about" className="hover:text-pink-400">About</a>
          <a href="#timetable" className="hover:text-pink-400">Events</a>
          <a href="/deals" className="hover:text-pink-400">Deals</a>
          <a href="#contact" className="hover:text-pink-400">Contact</a>
          <a href="#terms" className="text-xs text-gray-400 mt-2">Terms</a>
          <a href="#privacy" className="text-xs text-gray-400">Privacy</a>
        </div>
        {/* Social Links */}
        <div className="flex-1 flex flex-col gap-2 min-w-[180px]">
          <h3 className="font-bold text-lg mb-2">Connect With Us</h3>
          <p className="text-gray-300 mb-2">Follow us for the latest updates and events</p>
          <div className="flex gap-3">
            {/* <a href="#" className="rounded-full bg-gradient-to-br from-blue-400 to-purple-400 p-2"><svg width="24" height="24" fill="currentColor" className="text-white"><path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"/></svg></a> */}
            <a href="https://www.instagram.com/dupulse/" className="rounded-full bg-gradient-to-br from-pink-400 to-pink-600 p-2"><svg width="24" height="24" fill="currentColor" className="text-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.402 3.545 1.459 2.488 2.516 2.216 3.689 2.158 4.966.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.058 1.277.33 2.45 1.387 3.507 1.057 1.057 2.23 1.329 3.507 1.387C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.058 2.45-.33 3.507-1.387 1.057-1.057 1.329-2.23 1.387-3.507.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.058-1.277-.33-2.45-1.387-3.507C19.398.402 18.225.13 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" /></svg></a>
            {/* <a href="#" className="rounded-full bg-gradient-to-br from-blue-300 to-blue-500 p-2"><svg width="24" height="24" fill="currentColor" className="text-white"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.855 2.01-.855 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg></a> */}
            <a href="https://www.linkedin.com/company/dupulse/" className="rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-2"><svg width="24" height="24" fill="currentColor" className="text-white"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-7 19h-3v-7h3v7zm-1.5-8.25c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 8.25h-3v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4h-3v-7h3v1.25c.41-.77 1.48-1.25 2.5-1.25 1.93 0 3.5 1.57 3.5 3.5v3.5z" /></svg></a>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 text-sm mt-8">© 2025 DUPulse. All rights reserved.</div>
    </footer>
  );
} 