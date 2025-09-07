import React, { useState } from "react";
import { Phone, Mail } from "lucide-react";

interface HomePageProps {
  onNavigateToCatalog: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToCatalog }) => {
  const [showContactOptions, setShowContactOptions] = useState(false);

  const handlePhoneClick = () => setShowContactOptions(true);

  const handleCallOption = () => {
    window.open("tel:+254741922588", "_self");
    setShowContactOptions(false);
  };

  const handleWhatsAppOption = () => {
    const message =
      encodeURIComponent("Hello SeasideSeafood,\n\nI would like to inquire about your seafood products.\n\nThank you!");
    window.open(`https://wa.me/254741922588?text=${message}`, "_blank");
    setShowContactOptions(false);
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent("Seafood Inquiry");
    const body = encodeURIComponent("Hello SeasideSeafood,\n\nI would like to inquire about your seafood products.\n\nThank you!");
    
    // Create mailto link with proper encoding
    const mailtoLink = `mailto:orders.seasideseafood@gmail.com?subject=${subject}&body=${body}`;
    
    // Use window.location.href for better mobile compatibility
    window.location.href = mailtoLink;
  };

  return (
    <div className="relative">
      {/* Fixed Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/Homepage Background Image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll", // Always use scroll for better mobile performance
        }}
      />

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 text-center text-white">
          <img
            src="/SEASIDESEAFOOD LOGO! copy.png"
            alt="Seaside Seafood Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 mx-auto drop-shadow-2xl mb-6 object-contain transform-gpu"
            loading="eager"
            style={{ 
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          />

          <h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-orange-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(255,165,0,0.7)) drop-shadow(0 0 20px rgba(0,191,255,0.5))",
            }}
          >
            SEASIDE SEAFOOD
          </h1>

          <h2
            className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-6 drop-shadow-lg"
            style={{
              filter:
                "drop-shadow(0 0 10px rgba(255,165,0,0.7)) drop-shadow(0 0 20px rgba(0,191,255,0.5))",
            }}
          >
            Home By The Sea😊
          </h2>

          <p
            className="text-base sm:text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed font-medium px-4"
            style={{
              textShadow:
                "1px 1px 3px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.2)",
            }}
          >
            Experience the finest selection of{" "}
            <span className="font-bold text-orange-300">fresh</span>,{" "}
            <span className="font-bold text-orange-300">affordable</span>, and{" "}
            <span className="font-bold text-orange-300">authentic seafood</span>{" "}
            from the coastal heart of Kenya; Diani
          </p>
        </section>

        {/* Contact Section */}
        <section className="flex justify-center px-4 sm:px-8 py-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-lg">
              Get in Touch
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handlePhoneClick}
                className="flex-1 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition transform flex items-center justify-center space-x-3"
              >
                <Phone className="h-5 w-5" />
                <span>Call / WhatsApp</span>
              </button>

              <button
                onClick={handleEmailClick}
                className="flex-1 bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition transform flex items-center justify-center space-x-3"
              >
                <Mail className="h-5 w-5" />
                <span>Email Us</span>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-8 pb-20">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl hover:scale-105 transition transform text-center">
              <h3
                className="text-2xl font-bold text-white drop-shadow-lg"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                🛵 Fast Delivery!
              </h3>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl hover:scale-105 transition transform text-center">
              <h3
                className="text-2xl font-bold text-white drop-shadow-lg"
                style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
              >
                🐟 Clean, Fresh & Reliable!
              </h3>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8">
          <p
            className="text-white/80 text-sm font-medium"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
          >
            ©Hamisi Bilashaka
          </p>
        </footer>
      </div>

      {/* Contact Options Modal */}
      {showContactOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Choose Contact Method
            </h3>

            <div className="space-y-4">
              <button
                onClick={handleCallOption}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition transform flex items-center justify-center space-x-3"
              >
                <Phone className="h-6 w-6" />
                <span>Call Directly</span>
              </button>

              <button
                onClick={handleWhatsAppOption}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition transform flex items-center justify-center space-x-3"
              >
                WhatsApp
              </button>

              <button
                onClick={() => setShowContactOptions(false)}
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;