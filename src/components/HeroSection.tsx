
export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center pt-32 pb-16 text-center">
      <div className="mb-8">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center shadow-xl mx-auto">
          <img src="/favicon.ico" alt="DUPulse Logo" width={120} height={120} className="rounded-full" />
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
        Discover{" "}
        <span className="holographic-text inline-block">
          {"everything".split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block animate-holographic"
              style={{
                animationDelay: `${index * 70}ms`,
                animationDuration: "2s",
                background: `linear-gradient(
                  45deg,
                  #ff006e,
                  #8338ec,
                  #3a86ff,
                  #06ffa5,
                  #ffbe0b,
                  #fb5607,
                  #ff006e
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
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        DUPulse: Your one-stop shop to discover what's happening at Durham University
      </p>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes holographic {
            0% {
              background-position: 0% 50%;
              filter: hue-rotate(0deg) brightness(1.2) saturate(1.5);
              text-shadow: 
                0 0 5px rgba(255, 0, 110, 0.5),
                0 0 10px rgba(131, 56, 236, 0.5),
                0 0 15px rgba(58, 134, 255, 0.5);
            }
            25% {
              background-position: 100% 50%;
              filter: hue-rotate(90deg) brightness(1.4) saturate(2);
              text-shadow: 
                0 0 8px rgba(6, 255, 165, 0.6),
                0 0 16px rgba(255, 190, 11, 0.6),
                0 0 24px rgba(251, 86, 7, 0.6);
            }
            50% {
              background-position: 0% 100%;
              filter: hue-rotate(180deg) brightness(1.6) saturate(2.5);
              text-shadow: 
                0 0 10px rgba(255, 0, 110, 0.7),
                0 0 20px rgba(131, 56, 236, 0.7),
                0 0 30px rgba(58, 134, 255, 0.7);
            }
            75% {
              background-position: 100% 100%;
              filter: hue-rotate(270deg) brightness(1.4) saturate(2);
              text-shadow: 
                0 0 8px rgba(6, 255, 165, 0.6),
                0 0 16px rgba(255, 190, 11, 0.6),
                0 0 24px rgba(251, 86, 7, 0.6);
            }
            100% {
              background-position: 0% 50%;
              filter: hue-rotate(360deg) brightness(1.2) saturate(1.5);
              text-shadow: 
                0 0 5px rgba(255, 0, 110, 0.5),
                0 0 10px rgba(131, 56, 236, 0.5),
                0 0 15px rgba(58, 134, 255, 0.5);
            }
          }
          
          .animate-holographic {
            animation: holographic 2s ease-in-out infinite;
          }
        `
      }} />
    </section>
  );
}
