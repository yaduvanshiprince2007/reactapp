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
    
    // STRICT RBAC: If staff, hide all guest pages. Show ONLY Scan QR page.
    const navItems: NavNode[] = [];
    if (userRole === "staff") {
        navItems.push({ title: "Scan QR", path: "/scan" });
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

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 rounded-2xl glass-light border border-gold-300/30 shadow-lg transition-all duration-300 text-left">
            <div className="px-6 py-4 flex items-center justify-between">
                {/* Brand Logo - link to scan for staff, home for customer */}
                <Link 
                    to={userRole === "staff" ? "/scan" : "/"} 
                    className="flex items-center gap-2 text-2xl font-bold tracking-wider text-navy-500 font-display hover:text-gold-500 transition-colors"
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
                                    className="flex items-center gap-1.5 font-medium text-navy-500 hover:text-gold-500 transition-colors cursor-pointer py-1"
                                >
                                    {item.title}
                                    <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === item.title ? "rotate-180" : ""}`} />
                                </button>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`relative font-medium transition-colors py-1 ${
                                        isActive(item.path)
                                            ? "text-gold-600"
                                            : "text-navy-500 hover:text-gold-500"
                                    }`}
                                >
                                    {item.title}
                                    {isActive(item.path) && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-500 rounded-full" />
                                    )}
                                </Link>
                            )}

                            {/* Dropdown Menu (Desktop Hover/Click) */}
                            {item.children && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gold-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.title}
                                            to={child.path!}
                                            className="block px-4 py-2 text-sm text-navy-500 hover:bg-gold-50 hover:text-gold-600 font-medium transition-colors"
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
                            <button className="flex items-center gap-2 text-xs font-bold text-navy-500 border border-gold-300/30 px-4 py-2.5 rounded-full bg-white hover:bg-gold-50 shadow-sm cursor-pointer transition-colors focus:outline-none">
                                <FaUser className="text-[10px] text-gold-500" />
                                <span>{userName || "Profile"}</span>
                                <FaChevronDown className="text-[9px] text-navy-400 transition-transform duration-200 group-hover/profile:rotate-180" />
                            </button>
                            {/* Profile Sub-menu Dropdown */}
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gold-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-50 text-left">
                                <Link to="/profile?tab=rooms" className="block px-4 py-2 text-xs text-navy-500 hover:bg-gold-50 hover:text-gold-600 font-semibold transition-colors">
                                    🏨 My Stays & Rooms
                                </Link>
                                <Link to="/profile?tab=dining" className="block px-4 py-2 text-xs text-navy-500 hover:bg-gold-50 hover:text-gold-600 font-semibold transition-colors">
                                    🍽 My Dining Orders
                                </Link>
                                <Link to="/profile?tab=services" className="block px-4 py-2 text-xs text-navy-500 hover:bg-gold-50 hover:text-gold-600 font-semibold transition-colors">
                                    🛎 My Premium Services
                                </Link>
                                <Link to="/profile?tab=otp" className="block px-4 py-2 text-xs text-navy-500 hover:bg-gold-50 hover:text-gold-600 font-semibold transition-colors">
                                    🔑 Security OTP Keys
                                </Link>
                                <div className="border-t border-navy-50 my-1.5" />
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
                            <span className="text-xs font-semibold text-navy-400 bg-navy-50 border border-navy-100/50 px-3.5 py-1.5 rounded-full select-none font-sans">
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
                    className="lg:hidden text-navy-500 hover:text-gold-500 focus:outline-none p-1.5 rounded-lg border border-navy-500/10 hover:bg-navy-50"
                >
                    {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <div
                className={`lg:hidden overflow-hidden transition-all duration-300 border-gold-300/10 ${
                    isMobileMenuOpen ? "max-h-[550px] border-t px-6 py-4" : "max-h-0"
                }`}
            >
                <div className="flex flex-col gap-4">
                    {userRole === "customer" && (
                        <div className="flex flex-col gap-2 border-b border-navy-100/50 pb-4">
                            <span className="text-xs font-bold text-gold-600 px-1">👤 {userName} Details:</span>
                            <Link to="/profile?tab=rooms" className="text-xs text-navy-500 hover:text-gold-500 py-1 pl-2">
                                🏨 My Stays & Rooms
                            </Link>
                            <Link to="/profile?tab=dining" className="text-xs text-navy-500 hover:text-gold-500 py-1 pl-2">
                                🍽 My Dining Orders
                            </Link>
                            <Link to="/profile?tab=services" className="text-xs text-navy-500 hover:text-gold-500 py-1 pl-2">
                                🛎 My Premium Services
                            </Link>
                            <Link to="/profile?tab=otp" className="text-xs text-navy-500 hover:text-gold-500 py-1 pl-2">
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
                            <div className="text-center font-bold text-xs text-navy-400 py-1.5 border-b border-navy-100/50">
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
                                        className="flex items-center justify-between text-left font-medium text-navy-500 py-1.5 border-b border-navy-100/50"
                                    >
                                        <span>{item.title}</span>
                                        <FaChevronDown className={`text-xs transition-transform duration-200 ${activeDropdown === item.title ? "rotate-180" : ""}`} />
                                    </button>
                                    <div
                                        className={`pl-4 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
                                            activeDropdown === item.title ? "max-h-[250px] py-2" : "max-h-0"
                                        }`}
                                    >
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.title}
                                                to={child.path!}
                                                className="text-sm font-medium text-navy-400 hover:text-gold-500 py-1"
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`font-medium py-1.5 border-b border-navy-100/50 ${
                                        isActive(item.path) ? "text-gold-600 font-semibold" : "text-navy-500"
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
    );
};

export default Navbar;