
export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center pt-32 pb-16">
      {/* Main content with logo and text side by side */}
      <div className="flex items-center justify-center gap-8 mb-8 max-w-6xl mx-auto px-4">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          <div className="w-40 h-40 rounded-full flex items-center justify-center transition-transform duration-700 ease-in-out hover:rotate-360">
            <img src="/lovable-uploads/5a479623-3370-4372-a63c-169e6e212cfd.png" alt="DUPulse Logo" width={160} height={160} className="rounded-full" />
          </div>
        </div>

        {/* Text content on the right with slide-in animation */}
        <div className="text-left animate-slide-in-right">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Discover{" "}
            <span className="holographic-text inline-block">
              {"everything".split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block animate-wave-jump"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationDuration: "2s",
                    background: `linear-gradient(
                      135deg,
                      #e879f9,
                      #c084fc,
                      #f0abfc,
                      #ddd6fe,
                      #e879f9
                    )`,
                    backgroundSize: '300% 300%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent'
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>
            <br /> going on around town
          </h1>
        </div>
      </div>

      {/* Description with slide-in animation */}
      <div className="animate-slide-in-right-delayed text-center">
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          DUPulse: Your one-stop shop to discover what's happening at Durham University
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wave-jump {
            0%, 60%, 100% {
              transform: translateY(0) translateX(0);
              filter: brightness(1) saturate(1.5);
            }
            20% {
              transform: translateY(-12px) translateX(3px);
              filter: brightness(1.3) saturate(2);
            }
            40% {
              transform: translateY(-6px) translateX(-2px);
              filter: brightness(1.4) saturate(2.2);
            }
          }
          
          @keyframes slide-in-right {
            0% {
              opacity: 0;
              transform: translateX(-100px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .hover\\:rotate-360:hover {
            transform: rotate(360deg);
          }
          
          .animate-wave-jump {
            animation: wave-jump 2s ease-in-out infinite;
          }
          
          .animate-slide-in-right {
            animation: slide-in-right 1s ease-out forwards;
          }
          
          .animate-slide-in-right-delayed {
            opacity: 0;
            transform: translateX(-100px);
            animation: slide-in-right 1s ease-out 0.3s forwards;
          }
        `
      }} />
    </section>
  );
}
