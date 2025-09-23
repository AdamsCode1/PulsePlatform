
import React, { useState, useEffect } from 'react';

export default function HeroSection() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload both critical images
    const backgroundImg = new Image();
    const logoImg = new Image();
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        setIsLoading(false);
      }
    };

    backgroundImg.onload = () => {
      setImageLoaded(true);
      checkAllLoaded();
    };
    backgroundImg.onerror = () => {
      setImageLoaded(false);
      checkAllLoaded();
    };
    backgroundImg.src = '/image-uploads/background_cathedral.png';

    logoImg.onload = () => {
      setLogoLoaded(true);
      checkAllLoaded();
    };
    logoImg.onerror = () => {
      setLogoLoaded(false);
      checkAllLoaded();
    };
    logoImg.src = '/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png';
  }, []);

  return (
    <section
      id="hero"
      className={`relative flex flex-col items-center justify-center pt-32 pb-16 bg-cover bg-center bg-no-repeat min-h-screen transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-90'
        }`}
      style={{
        backgroundImage: imageLoaded
          ? `url('/image-uploads/background_cathedral.png')`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Fallback gradient
        backgroundColor: '#667eea' // Fallback color
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10 w-full">
        {/* Main content - responsive layout */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8 max-w-6xl mx-auto px-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-transform duration-700 ease-in-out hover:rotate-360 overflow-hidden">
              {logoLoaded ? (
                <img
                  src="/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png"
                  alt="DUPulse Logo"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">DU</span>
                </div>
              )}
            </div>
          </div>

          {/* Text content with slide-in animation */}
          <div className="text-center md:text-left animate-slide-in-right">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
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
        <div className="animate-slide-in-right-delayed text-center mb-8">
          <p className="text-lg md:text-xl max-w-2xl mx-auto px-4 drop-shadow-md text-white">
            <span className="holographic-text font-semibold">DUPulse</span>: Your
            <span className="text-white font-bold drop-shadow-lg text-shadow-strong"> ultimate companion</span> to discover what's happening at Durham University
          </p>
        </div>

        {/* Scroll down arrow */}
        <div
          className="flex flex-col items-center text-center animate-bounce cursor-pointer"
          onClick={() => {
            // Scroll to show the whole Today's Schedule section
            const scheduleSection = document.querySelector('section') || document.querySelector('main');
            if (scheduleSection && scheduleSection !== document.querySelector('section')) {
              scheduleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              // Fallback: scroll to next section after hero
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
              });
            }
          }}
        >
          <div className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
            <p className="text-sm font-medium mb-2 tracking-wide">scroll down to see timetable</p>
            <div className="animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
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
          
          .text-shadow-strong {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.6);
          }
        `
      }} />
    </section>
  );
}