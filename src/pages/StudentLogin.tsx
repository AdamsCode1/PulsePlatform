import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Failed to sign in. Please check your credentials and try again.",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        const returnTo = location.state?.returnTo || "/student/dashboard";
        navigate(returnTo);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black px-2 sm:px-4 py-6 sm:py-12 animate-fade-in relative overflow-hidden pulse-pattern">
      {/* Back Arrow Button */}
      <button
        onClick={() => navigate("/login")}
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
          
          {/* Floating Stats - Left Side */}
          <div className="absolute top-20 left-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-6 w-48 animate-float-up-1">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-pink-400 rounded-full mr-3"></div>
              <span className="text-2xl font-bold text-pink-400">50+</span>
            </div>
            <p className="text-white text-sm font-medium">Events every week</p>
            <p className="text-gray-300 text-xs">Keeping Durham vibrant</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full sm:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-4 sm:p-8 md:p-12 min-h-[500px] sm:min-h-[600px]">
          <div className="w-full max-w-sm">
            {/* Login Form Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Student Login</h1>
              <p className="text-pink-200 text-sm sm:text-base">Enter your credentials</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-pink-200 text-sm font-medium mb-2">
                  Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email"
                  className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-pink-200 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 backdrop-blur-sm"
                  required
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-pink-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 rounded focus:ring-pink-500 focus:ring-2"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-pink-400 hover:text-pink-300 transition-colors duration-300"
                  onClick={() => {
                    // TODO: Implement forgot password
                    toast({
                      title: "Feature Coming Soon",
                      description: "Password reset functionality will be available soon.",
                    });
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                }}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate("/register/student")}
                    className="text-pink-400 hover:text-pink-300 transition-colors duration-300 underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;
