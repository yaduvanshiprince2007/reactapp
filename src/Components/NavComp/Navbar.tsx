import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import hotelData from "../../Data/hotelData.json";
import { FaBars, FaTimes, FaChevronDown, FaUser } from "react-icons/fa";

interface NavNode {
    title: string;
    path?: string;
    children?: { title: string; path: string }[];
}

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const bookingsCount =
        useSelector(
            (state: RootState) => state.local.subscribtions.value
        ).length || 0;

    // Close mobile menu and dropdowns when path changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const isActive = (path?: string) => {
        if (!path) return false;
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    const toggleDropdown = (title: string) => {
        if (activeDropdown === title) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(title);
        }
    };

    // Retrieve login role, name and build navbar list dynamically
    const userRole = localStorage.getItem("loggedInUserRole");
    const userName = localStorage.getItem("loggedInUserName");

    // STRICT RBAC: If staff, hide all guest pages. Show ONLY Operations Desk.
    const navItems: NavNode[] = [];
    if (userRole === "staff") {
        navItems.push({ title: "Operations Desk", path: "/scan" });
    } else {
        navItems.push(...hotelData.navbar);
        if (!userRole) {
            navItems.push({ title: "Login", path: "/login" });
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("loggedInUserRole");
        localStorage.removeItem("loggedInUserName");
        navigate("/");
        window.location.reload();
    };

    const isDarkPage = location.pathname === "/menu" || location.pathname === "/services";

    return (
        <>
            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 rounded-2xl border shadow-lg transition-all duration-300 text-left ${
                isDarkPage 
                    ? "glass-dark border-white/10 text-white" 
                    : "glass-light border-gold-300/30 text-navy-900"
            }`}>
                <div className="px-6 py-4 flex items-center justify-between">
                    {/* Brand Logo - link to scan for staff, home for customer */}
                    <Link
                        to={userRole === "staff" ? "/scan" : "/"}
                        className={`flex items-center gap-2 text-2xl font-bold tracking-wider font-display transition-colors ${
                            isDarkPage ? "text-white hover:text-gold-300" : "text-navy-500 hover:text-gold-500"
                        }`}
                    >
                        <span className="text-gold-500">{hotelData.hotelInfo.logo}</span>
                        <span>{hotelData.hotelInfo.name}</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => (
                            <div key={item.title} className="relative group">
                                {item.children ? (
                                    <button
                                        onClick={() => toggleDropdown(item.title)}
                                        className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer py-1 ${
                                            isDarkPage ? "text-white/80 hover:text-gold-400" : "text-navy-500 hover:text-gold-500"
                                        }`}
                                    >
                                        {item.title}
                                        <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === item.title ? "rotate-180" : ""}`} />
                                    </button>
                                ) : (
                                    <Link
                                        to={item.path!}
                                        className={`relative font-medium transition-colors py-1 ${
                                            isActive(item.path)
                                                ? "text-gold-500"
                                                : isDarkPage
                                                    ? "text-white/80 hover:text-gold-400"
                                                    : "text-navy-500 hover:text-gold-500"
                                        }`}
                                    >
                                        {item.title}
                                        {isActive(item.path) && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-500 rounded-full animate-pulse" />
                                        )}
                                    </Link>
                                )}

                                {/* Dropdown Menu (Desktop Hover/Click) */}
                                {item.children && (
                                    <div className={`absolute top-full left-0 mt-2 w-48 border rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ${
                                        isDarkPage 
                                            ? "bg-navy-950/95 border-white/10 text-white" 
                                            : "bg-white border-gold-100 text-navy-500"
                                    }`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.title}
                                                to={child.path!}
                                                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                                                    isDarkPage 
                                                        ? "text-white/80 hover:bg-white/5 hover:text-gold-400" 
                                                        : "text-navy-500 hover:bg-gold-50 hover:text-gold-600"
                                                }`}
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bookings Action Button & Dropdown Profiles */}
                    <div className="hidden lg:flex items-center gap-4">
                        {userRole === "customer" ? (
                            <div className="relative group/profile py-2">
                                <button className={`flex items-center gap-2 text-xs font-bold border px-4 py-2.5 rounded-full shadow-sm cursor-pointer transition-colors focus:outline-none ${
                                    isDarkPage 
                                        ? "border-white/10 bg-white/5 text-white hover:bg-white/10" 
                                        : "border-gold-300/30 bg-white text-navy-500 hover:bg-gold-50"
                                }`}>
                                    <FaUser className="text-[10px] text-gold-500" />
                                    <span>{userName || "Profile"}</span>
                                    <FaChevronDown className="text-[9px] text-navy-400 transition-transform duration-200 group-hover/profile:rotate-180" />
                                </button>
                                {/* Profile Sub-menu Dropdown */}
                                <div className={`absolute right-0 top-full mt-1.5 w-52 border rounded-xl shadow-xl py-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-50 text-left ${
                                    isDarkPage 
                                        ? "bg-navy-950/95 border-white/10 text-white" 
                                        : "bg-white border-gold-100 text-navy-500"
                                }`}>
                                    <Link to="/profile?tab=rooms" className={`block px-4 py-2 text-xs font-semibold transition-colors ${
                                        isDarkPage ? "text-white/85 hover:bg-white/5 hover:text-gold-400" : "text-navy-500 hover:bg-gold-50 hover:text-gold-600"
                                    }`}>
                                        🏨 My Stays & Rooms
                                    </Link>
                                    <Link to="/profile?tab=dining" className={`block px-4 py-2 text-xs font-semibold transition-colors ${
                                        isDarkPage ? "text-white/85 hover:bg-white/5 hover:text-gold-400" : "text-navy-500 hover:bg-gold-50 hover:text-gold-600"
                                    }`}>
                                        🍽 My Dining Orders
                                    </Link>
                                    <Link to="/profile?tab=services" className={`block px-4 py-2 text-xs font-semibold transition-colors ${
                                        isDarkPage ? "text-white/85 hover:bg-white/5 hover:text-gold-400" : "text-navy-500 hover:bg-gold-50 hover:text-gold-600"
                                    }`}>
                                        🛎 My Premium Services
                                    </Link>
                                    <Link to="/profile?tab=otp" className={`block px-4 py-2 text-xs font-semibold transition-colors ${
                                        isDarkPage ? "text-white/85 hover:bg-white/5 hover:text-gold-400" : "text-navy-500 hover:bg-gold-50 hover:text-gold-600"
                                    }`}>
                                        🔑 Security OTP Keys
                                    </Link>
                                    <div className={`border-t my-1.5 ${isDarkPage ? "border-white/10" : "border-navy-50"}`} />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 font-bold transition-colors cursor-pointer focus:outline-none"
                                    >
                                        👋 Sign Out / Logout
                                    </button>
                                </div>
                            </div>
                        ) : userRole === "staff" ? (
                            <>
                                <span className={`text-xs font-semibold px-3.5 py-1.5 rounded-full select-none font-sans ${
                                    isDarkPage 
                                        ? "text-white/80 bg-white/5 border border-white/10" 
                                        : "text-navy-400 bg-navy-50 border border-navy-100/50"
                                }`}>
                                    Staff Concierge
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-full transition-colors cursor-pointer border border-red-200/20 focus:outline-none"
                                >
                                    Logout
                                </button>
                            </>
                        ) : null}

                        {userRole !== "staff" && (
                            <Link
                                to="/bookings"
                                className="relative flex items-center gap-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-semibold px-6 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
                            >
                                My Bookings
                                {bookingsCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-red text-xs text-white border-2 border-white font-bold animate-pulse">
                                        {bookingsCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`lg:hidden focus:outline-none p-1.5 rounded-lg border transition-all ${
                            isDarkPage 
                                ? "text-white hover:text-gold-400 border-white/10 hover:bg-white/5" 
                                : "text-navy-500 hover:text-gold-500 border-navy-500/10 hover:bg-navy-50"
                        }`}
                    >
                        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>

                {/* Mobile Navigation Drawer - beautiful glass slide/fold */}
                <div
                    className={`lg:hidden transition-all duration-500 ease-in-out border-t overflow-hidden ${
                        isMobileMenuOpen 
                            ? "max-h-[calc(100vh-120px)] opacity-100 py-4 px-6" 
                            : "max-h-0 opacity-0 pointer-events-none border-t-0"
                    } ${isDarkPage ? "border-white/10 bg-navy-950/95 text-white" : "border-gold-300/10 bg-white/95 text-navy-900"}`}
                    style={{
                        overflowY: isMobileMenuOpen ? 'auto' : 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d4a373 transparent',
                    }}
                >
                    <div className="flex flex-col gap-4 pb-6">
                        {userRole === "customer" && (
                            <div className={`flex flex-col gap-2 border-b pb-4 ${isDarkPage ? "border-white/10" : "border-navy-100/50"}`}>
                                <span className="text-xs font-bold text-gold-600 px-1">👤 {userName} Details:</span>
                                <Link to="/profile?tab=rooms" className={`text-xs py-1 pl-2 transition-colors ${isDarkPage ? "text-white/70 hover:text-gold-400" : "text-navy-500 hover:text-gold-500"}`}>
                                    🏨 My Stays & Rooms
                                </Link>
                                <Link to="/profile?tab=dining" className={`text-xs py-1 pl-2 transition-colors ${isDarkPage ? "text-white/70 hover:text-gold-400" : "text-navy-500 hover:text-gold-500"}`}>
                                    🍽 My Dining Orders
                                </Link>
                                <Link to="/profile?tab=services" className={`text-xs py-1 pl-2 transition-colors ${isDarkPage ? "text-white/70 hover:text-gold-400" : "text-navy-500 hover:text-gold-500"}`}>
                                    🛎 My Premium Services
                                </Link>
                                <Link to="/profile?tab=otp" className={`text-xs py-1 pl-2 transition-colors ${isDarkPage ? "text-white/70 hover:text-gold-400" : "text-navy-500 hover:text-gold-500"}`}>
                                    🔑 Security OTP Keys
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-left text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 py-2.5 rounded-xl pl-3 mt-1 cursor-pointer focus:outline-none"
                                >
                                    👋 Sign Out / Logout
                                </button>
                            </div>
                        )}

                        {userRole === "staff" && (
                            <>
                                <div className={`text-center font-bold text-xs py-1.5 border-b ${isDarkPage ? "text-white/55 border-white/10" : "text-navy-400 border-navy-100/50"}`}>
                                    Staff Concierge
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 py-2.5 rounded-xl border border-red-200/25 transition-all cursor-pointer focus:outline-none"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                        {navItems.map((item) => (
                            <div key={item.title} className="flex flex-col">
                                {item.children ? (
                                    <>
                                        <button
                                            onClick={() => toggleDropdown(item.title)}
                                            className={`flex items-center justify-between text-left font-medium py-1.5 border-b transition-colors ${
                                                isDarkPage 
                                                    ? "text-white/80 border-white/10 hover:text-gold-400" 
                                                    : "text-navy-500 border-navy-100/50 hover:text-gold-500"
                                            }`}
                                        >
                                            <span>{item.title}</span>
                                            <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === item.title ? "rotate-180" : ""}`} />
                                        </button>
                                        <div
                                            className={`pl-4 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${activeDropdown === item.title ? "max-h-[250px] py-2" : "max-h-0"
                                                }`}
                                        >
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.title}
                                                    to={child.path!}
                                                    className={`text-sm font-medium py-1 transition-colors ${
                                                        isDarkPage ? "text-white/70 hover:text-gold-400" : "text-navy-400 hover:text-gold-500"
                                                    }`}
                                                >
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        to={item.path!}
                                        className={`font-medium py-1.5 border-b transition-colors ${
                                            isActive(item.path) 
                                                ? "text-gold-600 font-semibold" 
                                                : isDarkPage 
                                                    ? "text-white/80 border-white/10 hover:text-gold-400" 
                                                    : "text-navy-500 border-navy-100/50 hover:text-gold-500"
                                        }`}
                                    >
                                        {item.title}
                                    </Link>
                                )}
                            </div>
                        ))}

                        {userRole !== "staff" && (
                            <Link
                                to="/bookings"
                                className="relative flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold py-2.5 rounded-xl shadow-md mt-2 transition-all"
                            >
                                My Bookings
                                {bookingsCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-red text-[10px] text-white font-bold">
                                        {bookingsCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;