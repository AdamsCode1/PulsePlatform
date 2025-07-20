
export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center pt-32 pb-16">
      {/* Main content - responsive layout */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8 max-w-6xl mx-auto px-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-transform duration-700 ease-in-out hover:rotate-360 overflow-hidden">
            <img src="/lovable-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png" alt="DUPulse Logo" width={160} height={160} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text content with slide-in animation */}
        <div className="text-center md:text-left animate-slide-in-right">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Discover{" "}
            <span className="holographic-text inline-block whitespace-nowrap">
              {"everything".split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block animate-wave-jump"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: "1.5s",
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
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            going on around town
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
            animation: wave-jump 1.5s ease-in-out infinite;
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
