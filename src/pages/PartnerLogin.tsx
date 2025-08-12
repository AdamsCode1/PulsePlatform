import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const PartnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Registration logic
        if (password !== confirmPassword) {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "Passwords do not match.",
          });
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { business_name: businessName }
          }
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message || "Failed to create account. Please try again.",
          });
        } else {
          // Create partner row in database
          const { error: dbError } = await supabase
            .from('partners')
            .insert([{ contact_email: email, name: businessName }]);

          if (dbError) {
            console.error('Database error:', dbError);
          }

          toast({
            title: "Registration Successful",
            description: "Your partner account has been created! Please check your email to verify your account.",
          });

          // Switch to login mode after successful registration
          setIsRegisterMode(false);
          setBusinessName("");
          setConfirmPassword("");
        }
      } else {
        // Login logic
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
            description: "Welcome to your partner dashboard!",
          });
          const returnTo = location.state?.returnTo || "/partner/dashboard";
          navigate(returnTo);
        }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: isRegisterMode ? "Registration Error" : "Login Error",
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
              <span className="text-2xl font-bold text-pink-400">25+</span>
            </div>
            <p className="text-white text-sm font-medium">Partner businesses</p>
            <p className="text-gray-300 text-xs">Supporting students</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full sm:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm p-4 sm:p-8 md:p-12 min-h-[500px] sm:min-h-[600px]">
          <div className="w-full max-w-sm">
            {/* Login Form Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isRegisterMode ? "Partner Registration" : "Partner Login"}
              </h1>
              <p className="text-pink-200 text-sm sm:text-base">
                {isRegisterMode ? "Register your business" : "Access your partner dashboard"}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {isRegisterMode && (
                <div>
                  <label className="block text-pink-200 text-sm font-medium mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your business name"
                    className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 backdrop-blur-sm"
                    required={isRegisterMode}
                  />
                </div>
              )}

              <div>
                <label className="block text-pink-200 text-sm font-medium mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your business email"
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

              {isRegisterMode && (
                <div>
                  <label className="block text-pink-200 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 sm:py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 backdrop-blur-sm"
                    required={isRegisterMode}
                  />
                </div>
              )}

              {/* Remember Me and Forgot Password */}
              {!isRegisterMode && (
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
              )}

              {/* Sign In/Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                }}
              >
                {isLoading
                  ? (isRegisterMode ? "Creating Account..." : "Signing In...")
                  : (isRegisterMode ? "Register Business" : "Sign In")
                }
              </button>

              {/* Toggle between Login and Register */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      // Clear form fields when switching modes
                      setEmail("");
                      setPassword("");
                      setBusinessName("");
                      setConfirmPassword("");
                      setRememberMe(false);
                    }}
                    className="text-pink-400 hover:text-pink-300 transition-colors duration-300 underline"
                  >
                    {isRegisterMode ? "Sign in here" : "Sign up here"}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Left Side Floating Boxes - Moving Upward */}
      <div className="absolute left-0 top-0 w-64 h-full pointer-events-none hidden xl:block">
        <div
          className="absolute top-20 left-8 bg-gradient-to-br from-pink-500/60 to-purple-500/60 backdrop-blur-sm border-2 border-pink-500/80 rounded-2xl p-6 w-48 animate-float-up-1 shadow-xl"
          style={{ animationDelay: '0s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-pink-400">25+</span>
          </div>
          <p className="text-white text-sm font-medium">Partner businesses</p>
          <p className="text-gray-300 text-xs">Supporting students</p>
        </div>

        <div
          className="absolute top-80 left-16 bg-gradient-to-br from-cyan-500/60 to-blue-500/60 backdrop-blur-sm border-2 border-cyan-500/80 rounded-2xl p-6 w-52 animate-float-up-2 shadow-xl"
          style={{ animationDelay: '2s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-cyan-400">500+</span>
          </div>
          <p className="text-white text-sm font-medium">Exclusive deals</p>
          <p className="text-gray-300 text-xs">Student benefits</p>
        </div>

        <div
          className="absolute top-96 left-4 bg-gradient-to-br from-purple-500/60 to-pink-500/60 backdrop-blur-sm border-2 border-purple-500/80 rounded-2xl p-5 w-44 animate-float-up-3 shadow-xl"
          style={{ animationDelay: '4s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
            <span className="text-xl font-bold text-purple-400">Growth</span>
          </div>
          <p className="text-white text-sm font-medium">Business reach</p>
          <p className="text-gray-300 text-xs">Expand audience</p>
        </div>
      </div>

      {/* Right Side Floating Boxes - Moving Downward */}
      <div className="absolute right-0 top-0 w-64 h-full pointer-events-none hidden xl:block">
        <div
          className="absolute top-16 right-8 bg-gradient-to-br from-cyan-500/60 to-teal-500/60 backdrop-blur-sm border-2 border-cyan-500/80 rounded-2xl p-6 w-52 animate-float-down-1 shadow-xl"
          style={{ animationDelay: '1s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-cyan-400">Direct</span>
          </div>
          <p className="text-white text-sm font-medium">Student access</p>
          <p className="text-gray-300 text-xs">Target audience</p>
        </div>

        <div
          className="absolute top-72 right-12 bg-gradient-to-br from-pink-500/60 to-red-500/60 backdrop-blur-sm border-2 border-pink-500/80 rounded-2xl p-6 w-48 animate-float-down-2 shadow-xl"
          style={{ animationDelay: '3s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full mr-3"></div>
            <span className="text-2xl font-bold text-pink-400">Easy</span>
          </div>
          <p className="text-white text-sm font-medium">Deal management</p>
          <p className="text-gray-300 text-xs">Simple tools</p>
        </div>

        <div
          className="absolute top-[26rem] right-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-5 w-46 animate-float-down-3"
          style={{ animationDelay: '5s' }}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
            <span className="text-xl font-bold text-purple-400">ROI</span>
          </div>
          <p className="text-white text-sm font-medium">Track performance</p>
          <p className="text-gray-300 text-xs">Measure success</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
