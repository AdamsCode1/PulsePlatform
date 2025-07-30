import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const renderLoginForm = () => {
    if (!selectedType) {
      return (
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Get Started</h1>
            <p className="text-pink-200 text-base sm:text-lg">Choose account type</p>
          </div>

          {/* Account Type Buttons */}
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={() => setSelectedType("student")}
              className="w-full p-4 sm:p-6 bg-pink-500/20 border-2 border-pink-500/50 rounded-xl sm:rounded-2xl hover:bg-pink-500 hover:border-pink-400 transition-all duration-300 group backdrop-blur-sm transform hover:scale-105"
              style={{
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
              }}
            >
              <span className="text-pink-200 group-hover:text-white font-semibold text-lg sm:text-xl">Student</span>
            </button>

            <button
              onClick={() => setSelectedType("society")}
              className="w-full p-4 sm:p-6 bg-pink-500/20 border-2 border-pink-500/50 rounded-xl sm:rounded-2xl hover:bg-pink-500 hover:border-pink-400 transition-all duration-300 group backdrop-blur-sm transform hover:scale-105"
              style={{
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
              }}
            >
              <span className="text-pink-200 group-hover:text-white font-semibold text-lg sm:text-xl">Society</span>
            </button>

            <button
              onClick={() => setSelectedType("organization")}
              className="w-full p-4 sm:p-6 bg-pink-500/20 border-2 border-pink-500/50 rounded-xl sm:rounded-2xl hover:bg-pink-500 hover:border-pink-400 transition-all duration-300 group backdrop-blur-sm transform hover:scale-105"
              style={{
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)'
              }}
            >
              <span className="text-pink-200 group-hover:text-white font-semibold text-lg sm:text-xl">Organization</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          onClick={() => setSelectedType(null)}
          className="mb-4 sm:mb-6 p-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-pink-500/20 hover:border-pink-500 transition-all duration-300 group"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-pink-200 group-hover:text-pink-400"
          >
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Login Form Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {selectedType === "student" && "Student Login"}
            {selectedType === "society" && "Society Login"}
            {selectedType === "organization" && "Organization Login"}
          </h1>
          <p className="text-pink-200 text-sm sm:text-base">Enter your credentials</p>
        </div>

        {/* Login Form */}
        <form className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-pink-200 text-sm font-medium mb-2">
              {selectedType === "student" ? "Student Email" :
                selectedType === "society" ? "Society Email" : "Organization Email"}
            </label>
            <input
              type="email"
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
              placeholder={`Enter your ${selectedType} email`}
            />
          </div>

          <div>
            <label className="block text-pink-200 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors duration-300 text-sm sm:text-base"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center text-pink-200">
              <input type="checkbox" className="mr-2 accent-pink-500" />
              <span className="text-xs sm:text-sm">Remember me</span>
            </label>
            <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors duration-300 text-xs sm:text-sm">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full p-3 sm:p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            style={{
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
            }}
          >
            Sign In
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              Don't have an account?{" "}
              <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors duration-300">
                Sign up here
              </a>
            </p>
          </div>
        </form>
      </div>
    );
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 px-2 sm:px-4 py-6 sm:py-12 animate-fade-in relative overflow-hidden">
      {/* Back Arrow Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 p-2 sm:p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-pink-500/20 hover:border-pink-500 transition-all duration-300 group"
        style={{
          boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)'
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-pink-200 group-hover:text-pink-400 transition-colors duration-300"
        >
          <path
            d="M19 12H5M12 19L5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Background decorative elements - smaller on mobile */}
      <div className="absolute top-10 right-10 w-16 h-16 sm:w-32 sm:h-32 bg-pink-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-12 h-12 sm:w-24 sm:h-24 bg-purple-500/20 rounded-full blur-lg"></div>
      <div className="absolute top-1/3 left-1/4 w-8 h-8 sm:w-16 sm:h-16 bg-pink-500/10 rounded-full blur-md"></div>

      {/* Left Side Floating Boxes - Moving Upward */}
      <div className="absolute left-0 top-0 w-64 h-full pointer-events-none hidden lg:block">
        <div
          className="absolute top-20 left-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-6 w-48 animate-float-up-1"
          style={{ animationDelay: '0s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-pink-400">50+</span>
          </div>
          <p className="text-white text-sm font-medium">Events every week</p>
          <p className="text-gray-300 text-xs">Keeping Durham vibrant</p>
        </div>

        <div
          className="absolute top-80 left-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 w-52 animate-float-up-2"
          style={{ animationDelay: '2s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-cyan-400">200+</span>
          </div>
          <p className="text-white text-sm font-medium">Societies</p>
          <p className="text-gray-300 text-xs">Growing network</p>
        </div>

        <div
          className="absolute top-96 left-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-5 w-44 animate-float-up-3"
          style={{ animationDelay: '4s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
            <span className="text-xl font-bold text-purple-400">100%</span>
          </div>
          <p className="text-white text-sm font-medium">Free platform</p>
          <p className="text-gray-300 text-xs">Always accessible</p>
        </div>
      </div>

      {/* Right Side Floating Boxes - Moving Downward */}
      <div className="absolute right-0 top-0 w-64 h-full pointer-events-none hidden lg:block">
        <div
          className="absolute top-16 right-8 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 w-52 animate-float-down-1"
          style={{ animationDelay: '1s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-cyan-400">170K+</span>
          </div>
          <p className="text-white text-sm font-medium">Total views on all platforms</p>
          <p className="text-gray-300 text-xs">Reaching the community</p>
        </div>

        <div
          className="absolute top-72 right-12 bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-6 w-48 animate-float-down-2"
          style={{ animationDelay: '3s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-pink-400">200+</span>
          </div>
          <p className="text-white text-sm font-medium">WhatsApp members</p>
          <p className="text-gray-300 text-xs">Active community</p>
        </div>

        <div
          className="absolute top-[26rem] right-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-5 w-46 animate-float-down-3"
          style={{ animationDelay: '5s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
            <span className="text-xl font-bold text-purple-400">24/7</span>
          </div>
          <p className="text-white text-sm font-medium">Platform availability</p>
          <p className="text-gray-300 text-xs">Always online</p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md sm:max-w-5xl mx-auto bg-gray-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col sm:flex-row">

        {/* Left Side - Background Image Only - hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:flex sm:w-1/2 relative overflow-hidden min-h-[500px]">
          {/* Background Image */}
          <img
            src="/image-uploads/login-logo.jpeg"
            alt="DuPulse Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Dynamic Content */}
        <div className="w-full sm:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-4 sm:p-8 md:p-12 min-h-[500px] sm:min-h-[600px]">
          {renderLoginForm()}
        </div>

      </div>
    </div>
  );
};
export default UserTypeSelection;
