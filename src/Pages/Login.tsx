import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaUserCircle, FaLock, FaSignInAlt, FaUserTie } from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectParam = searchParams.get("redirect");

    // Login modes: "guest" or "staff"
    const [loginMode, setLoginMode] = useState<"guest" | "staff">("guest");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const u = username.trim().toLowerCase();
        const p = password.trim();

        if (loginMode === "staff") {
            if (u === "staff" && p === "admin123") {
                localStorage.setItem("loggedInUserRole", "staff");
                localStorage.setItem("loggedInUserName", "Staff Concierge");
                navigate("/scan");
                window.location.reload();
            } else {
                setErrorMsg("Invalid Staff Credentials. (Hint: ID is 'staff' & Password is 'admin123')");
            }
        } else {
            // Guest Login: Prince or any username
            if (!username.trim()) {
                setErrorMsg("Please enter your name to log in.");
                return;
            }
            localStorage.setItem("loggedInUserRole", "customer");
            const nameFormatted = username.trim().charAt(0).toUpperCase() + username.trim().slice(1);
            localStorage.setItem("loggedInUserName", nameFormatted);
            
            // Redirect back to bookings checkout page if forced, otherwise home
            if (redirectParam === "bookings") {
                navigate("/bookings");
            } else {
                navigate("/");
            }
            window.location.reload();
        }
    };

    const handleQuickLogin = (role: "staff" | "guest") => {
        if (role === "staff") {
            setLoginMode("staff");
            setUsername("staff");
            setPassword("admin123");
        } else {
            setLoginMode("guest");
            setUsername("Prince");
            setPassword("anypassword");
        }
        setErrorMsg("");
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            <div className="max-w-md mx-auto bg-white border border-gold-300/10 rounded-3xl p-8 shadow-xl">
                {/* Headers */}
                <div className="text-center mb-8">
                    <span className="text-5xl text-gold-500 font-bold select-none animate-pulse inline-block mb-3">✦</span>
                    <h1 className="text-2xl font-bold text-navy-500 uppercase tracking-wider font-display">Grand Azure Login</h1>
                    <p className="text-xs text-navy-400 font-light mt-1">
                        {redirectParam === "bookings" 
                            ? "Please log in to proceed to your bookings checkout." 
                            : "Select your role below to log into the hotel portal."}
                    </p>
                </div>

                {/* Login Mode Selector Tabs */}
                <div className="flex border-b border-navy-100 mb-6 text-xs">
                    <button
                        type="button"
                        onClick={() => { setLoginMode("guest"); setErrorMsg(""); setUsername(""); setPassword(""); }}
                        className={`flex-1 pb-3 font-bold transition-all border-b-2 text-center cursor-pointer ${
                            loginMode === "guest"
                                ? "border-gold-500 text-gold-600"
                                : "border-transparent text-navy-300 hover:text-navy-400"
                        }`}
                    >
                        👤 Login as Guest
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginMode("staff"); setErrorMsg(""); setUsername(""); setPassword(""); }}
                        className={`flex-1 pb-3 font-bold transition-all border-b-2 text-center cursor-pointer ${
                            loginMode === "staff"
                                ? "border-gold-500 text-gold-600"
                                : "border-transparent text-navy-300 hover:text-navy-400"
                        }`}
                    >
                        🛎 Login as Staff
                    </button>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
                    <div>
                        <label className="block font-semibold text-navy-400 mb-1">
                            {loginMode === "staff" ? "Staff Username / ID" : "Your Name"}
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-300 pointer-events-none">
                                {loginMode === "staff" ? <FaUserTie className="text-xs" /> : <FaUserCircle className="text-xs" />}
                            </span>
                            <input 
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={loginMode === "staff" ? "Enter staff ID (e.g. staff)" : "Enter your name (e.g. prince)"}
                                className="w-full bg-navy-50/50 border border-navy-100 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-navy-400 mb-1">
                            Password {loginMode === "guest" && "(Optional)"}
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-300 pointer-events-none">
                                <FaLock className="text-xs" />
                            </span>
                            <input 
                                type="password"
                                required={loginMode === "staff"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-navy-50/50 border border-navy-100 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 animate-pulse">
                            {errorMsg}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer font-sans text-sm flex items-center justify-center gap-2 mt-2 focus:outline-none"
                    >
                        <FaSignInAlt className="text-xs" /> {loginMode === "staff" ? "Log In as Staff" : "Log In as Guest"}
                    </button>
                </form>

                {/* Quick login simulators */}
                <div className="mt-6 border-t border-navy-50 pt-4 flex flex-col gap-2">
                    <span className="text-[9px] uppercase font-bold text-navy-300 text-center">Quick Login Helpers</span>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin("guest")}
                            className="bg-navy-50 hover:bg-navy-100 text-navy-600 font-semibold py-2 rounded-lg text-[10px] cursor-pointer focus:outline-none transition-colors border border-navy-100/30"
                        >
                            Prince (Guest)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin("staff")}
                            className="bg-navy-50 hover:bg-navy-100 text-navy-600 font-semibold py-2 rounded-lg text-[10px] cursor-pointer focus:outline-none transition-colors border border-navy-100/30"
                        >
                            Staff Account
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
