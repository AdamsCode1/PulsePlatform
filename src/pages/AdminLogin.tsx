import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add admin login logic here
        console.log("Admin login attempt:", { email, password });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-200 via-purple-300 to-pink-300 px-2 sm:px-4 py-6 sm:py-12 animate-fade-in relative overflow-hidden">
            {/* Back Arrow Button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 p-2 sm:p-3 rounded-full bg-white/40 backdrop-blur-sm border border-purple-300/50 hover:bg-purple-200/50 hover:border-purple-400/70 transition-all duration-300 group"
                style={{
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-purple-600 group-hover:text-purple-700 transition-colors duration-300"
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

            {/* Background decorative elements */}
            <div className="absolute top-10 right-10 w-16 h-16 sm:w-32 sm:h-32 bg-purple-300/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-12 h-12 sm:w-24 sm:h-24 bg-cyan-300/30 rounded-full blur-lg"></div>
            <div className="absolute top-1/3 left-1/4 w-8 h-8 sm:w-16 sm:h-16 bg-pink-300/20 rounded-full blur-md"></div>

            {/* Main Admin Login Container */}
            <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-purple-200/50 overflow-hidden p-8 sm:p-12">

                {/* Admin Login Form */}
                <div className="w-full">
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-4">Admin Access</h1>
                        <p className="text-purple-600 text-sm sm:text-base">For DuPulse Team Members only!</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                        {/* Email Input */}
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-white/60 border-2 border-purple-200 rounded-xl text-purple-800 placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-colors duration-300 text-sm sm:text-base backdrop-blur-sm"
                                placeholder="Email"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-white/60 border-2 border-purple-200 rounded-xl text-purple-800 placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-colors duration-300 text-sm sm:text-base backdrop-blur-sm"
                                placeholder="Password"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full p-4 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                            style={{
                                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                            }}
                        >
                            Submit
                        </button>

                        {/* Support Text */}
                        <div className="text-center mt-6">
                            <p className="text-purple-500 text-xs sm:text-sm">
                                Contact your team leader for support
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;
