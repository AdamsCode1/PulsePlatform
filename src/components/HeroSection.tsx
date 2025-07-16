
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
            <span className="holographic-text inline-block animate-bounce-horizontal">
              {"everything".split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block animate-holographic-pink-purple"
                  style={{
                    animationDelay: `${index * 70}ms`,
                    animationDuration: "3s",
                    background: `linear-gradient(
                      45deg,
                      #e879f9,
                      #a855f7,
                      #ec4899,
                      #d946ef,
                      #c084fc
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
          @keyframes holographic-pink-purple {
            0% {
              background-position: 0% 50%;
              filter: brightness(1.2) saturate(1.5);
              text-shadow: 
                0 0 10px rgba(232, 121, 249, 0.6),
                0 0 20px rgba(168, 85, 247, 0.4);
            }
            25% {
              background-position: 100% 50%;
              filter: brightness(1.4) saturate(2);
              text-shadow: 
                0 0 15px rgba(168, 85, 247, 0.7),
                0 0 25px rgba(236, 72, 153, 0.5);
            }
            50% {
              background-position: 0% 100%;
              filter: brightness(1.6) saturate(2.5);
              text-shadow: 
                0 0 20px rgba(236, 72, 153, 0.8),
                0 0 30px rgba(217, 70, 239, 0.6);
            }
            75% {
              background-position: 100% 100%;
              filter: brightness(1.4) saturate(2);
              text-shadow: 
                0 0 15px rgba(192, 132, 252, 0.7),
                0 0 25px rgba(232, 121, 249, 0.5);
            }
            100% {
              background-position: 0% 50%;
              filter: brightness(1.2) saturate(1.5);
              text-shadow: 
                0 0 10px rgba(232, 121, 249, 0.6),
                0 0 20px rgba(168, 85, 247, 0.4);
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
          
          @keyframes bounce-horizontal {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-8px);
            }
            75% {
              transform: translateX(8px);
            }
          }
          
          .hover\\:rotate-360:hover {
            transform: rotate(360deg);
          }
          
          .animate-holographic-pink-purple {
            animation: holographic-pink-purple 3s ease-in-out infinite;
          }
          
          .animate-slide-in-right {
            animation: slide-in-right 1s ease-out forwards;
          }
          
          .animate-slide-in-right-delayed {
            opacity: 0;
            transform: translateX(-100px);
            animation: slide-in-right 1s ease-out 0.3s forwards;
          }
          
          .animate-bounce-horizontal {
            animation: bounce-horizontal 2s ease-in-out infinite;
          }
        `
      }} />
    </section>
  );
}
