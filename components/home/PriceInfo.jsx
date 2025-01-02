export default function PriceInfo() {
  return (
    <section className="my-16">
      <div 
        className="w-full bg-[hsl(var(--primary)/.98)] relative py-16 -mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2)] overflow-hidden"
      >
        {/* Background with overlay and pattern */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/images/texture-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--primary)/.1)_25%,transparent_25%,transparent_50%,hsl(var(--primary)/.1)_50%,hsl(var(--primary)/.1)_75%,transparent_75%,transparent)] bg-[length:64px_64px] opacity-30" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--secondary)/.15)] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(var(--secondary)/.15)] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            {/* Price Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
              {/* First Price Line */}
              <div className="flex flex-col sm:flex-row justify-center items-center sm:items-baseline gap-2 mb-6 animate-[slideDown_0.5s_ease-out]">
                <span className="text-white/90 text-2xl md:text-3xl font-bold">পূর্বের মূল্য</span>
                <div className="relative">
                  <span className="text-red-400 text-3xl md:text-4xl font-bold line-through decoration-2">১৫৯৫/=</span>
                  <div className="absolute -right-4 -top-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    -50%
                  </div>
                </div>
                <span className="text-white/90 text-2xl md:text-3xl font-bold">টাকা</span>
              </div>

              {/* Second Price Line */}
              <div className="flex flex-col sm:flex-row justify-center items-center sm:items-baseline gap-2 animate-[slideUp_0.5s_ease-out]">
                <span className="text-white/90 text-2xl md:text-3xl font-bold">বর্তমান মূল্য</span>
                <span className="text-yellow-300 text-4xl md:text-5xl font-bold glow">৭৯০-/=</span>
                <span className="text-white/90 text-2xl md:text-3xl font-bold">টাকা</span>
              </div>
            </div>

            {/* Free Delivery Card */}
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 max-w-3xl mx-auto animate-[fadeIn_0.7s_ease-out]">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg 
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-300 text-lg md:text-xl font-medium">
                  ১০০% অরিজিনাল ম্যাজিক কনডম প্রতিটি মাত্র ৭৯০ টাকা
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <svg 
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-300 text-lg md:text-xl font-medium">
                  সারা বাংলাদেশের যে কোন জায়গায় ফ্রি ডেলিভারি চার্জ ফ্রি!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .glow {
          text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
          animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from { text-shadow: 0 0 10px rgba(253, 224, 71, 0.5); }
          to { text-shadow: 0 0 20px rgba(253, 224, 71, 0.8); }
        }
      `}</style>
    </section>
  );
}
