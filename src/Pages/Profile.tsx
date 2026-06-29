import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FaUser, FaHotel, FaUtensils, FaConciergeBell, FaKey, FaTrash } from "react-icons/fa";

interface BookingItem {
    name: string;
    itemType: string;
    quantity: number;
    price: number;
    status?: string;
    details?: {
        checkIn?: string;
        checkOut?: string;
        adults?: number;
        kids?: number;
        diningType?: string;
        roomNumber?: string;
        tableNumber?: string;
        tableGuests?: number;
        diningTime?: string;
        bookingDate?: string;
        bookingTime?: string;
        specialNotes?: string;
    };
}

interface BookingRecord {
    refId: string;
    otpRoom?: string;
    otpDining?: string;
    otpService?: string;
    date: string;
    status: string;
    guestName: string;
    email: string;
    total: number;
    items: BookingItem[];
}

const Profile = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "rooms";

    const userRole = localStorage.getItem("loggedInUserRole");
    const userName = localStorage.getItem("loggedInUserName");

    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [updateTrigger, setUpdateTrigger] = useState(false);

    // Guard: Redirect to login if not logged in as customer
    useEffect(() => {
        if (!userRole || userRole !== "customer") {
            navigate("/login");
        }
    }, [userRole, navigate]);

    // Query bookings matching this customer's name
    useEffect(() => {
        if (userName) {
            const raw = localStorage.getItem("customBookings");
            const list: BookingRecord[] = raw ? JSON.parse(raw) : [];
            // Match case-insensitively
            const filtered = list.filter(b => b.guestName.toLowerCase() === userName.toLowerCase());
            setBookings(filtered);
        }
    }, [userName, updateTrigger]);

    const handleCancelBooking = (refId: string) => {
        const confirmCancel = window.confirm(`Are you sure you want to cancel booking ${refId}?`);
        if (!confirmCancel) return;

        const raw = localStorage.getItem("customBookings");
        if (raw) {
            const list: BookingRecord[] = JSON.parse(raw);
            const index = list.findIndex(b => b.refId.toUpperCase() === refId.toUpperCase());
            if (index !== -1) {
                list[index].status = "Cancelled by Guest";
                // Also update individual item statuses
                list[index].items = list[index].items.map(item => ({
                    ...item,
                    status: "Cancelled"
                }));
                localStorage.setItem("customBookings", JSON.stringify(list));
                setUpdateTrigger(prev => !prev);
                // alert(`Booking ${refId} has been successfully cancelled.`);
            }
        }
    };

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab });
    };

    if (!userName) return null;

    // Filter items inside bookings matching current tab itemType
    const roomsList = bookings.filter(b => b.items.some(i => i.itemType === "room"));
    const diningList = bookings.filter(b => b.items.some(i => i.itemType === "menu"));
    const servicesList = bookings.filter(b => b.items.some(i => i.itemType === "service"));

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left text-navy-900">
            <div className="max-w-5xl mx-auto">
                {/* Profile Greeting Header */}
                <div className="bg-white border border-gold-300/10 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gold-500/10 text-gold-600 rounded-full flex items-center justify-center border border-gold-300/20 text-2xl font-bold">
                            <FaUser />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-navy-400 tracking-wider">Grand Azure Guest</span>
                            <h1 className="text-2xl font-black text-navy-500 font-display uppercase tracking-wide">
                                Welcome, {userName}!
                            </h1>
                            <p className="text-xs text-navy-400 font-light mt-0.5">Manage your reservations, dining points, and credentials.</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-navy-400">
                        <span><strong>Account Type:</strong> Guest Client</span>
                        <span className="mt-1"><strong>Active Tickets:</strong> {bookings.filter(b => b.status === "Confirmed (Upcoming)").length}</span>
                    </div>
                </div>

                {/* Tab Pill Headers */}
                <div className="flex flex-wrap items-center gap-2.5 border-b border-navy-100 pb-4 mb-8">
                    <button
                        onClick={() => handleTabChange("rooms")}
                        className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === "rooms"
                                ? "bg-navy-500 text-white shadow-md shadow-navy-500/10"
                                : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"
                            }`}
                    >
                        <FaHotel /> Stays & Rooms
                    </button>
                    <button
                        onClick={() => handleTabChange("dining")}
                        className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === "dining"
                                ? "bg-navy-500 text-white shadow-md shadow-navy-500/10"
                                : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"
                            }`}
                    >
                        <FaUtensils /> Dining Orders
                    </button>
                    <button
                        onClick={() => handleTabChange("services")}
                        className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === "services"
                                ? "bg-navy-500 text-white shadow-md shadow-navy-500/10"
                                : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"
                            }`}
                    >
                        <FaConciergeBell /> Premium Services
                    </button>
                    <button
                        onClick={() => handleTabChange("otp")}
                        className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === "otp"
                                ? "bg-navy-500 text-white shadow-md shadow-navy-500/10"
                                : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"
                            }`}
                    >
                        <FaKey /> Security OTP Keys
                    </button>
                </div>

                {/* Dashboard Panels */}
                <div className="min-h-[300px]">
                    {/* Tab: Rooms & Stays */}
                    {activeTab === "rooms" && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            {roomsList.length > 0 ? (
                                roomsList.map(b => (
                                    <div key={b.refId} className="bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md relative">
                                        <div className="flex justify-between items-start gap-4 mb-4 border-b border-navy-50 pb-4">
                                            <div>
                                                <span className="text-[10px] bg-navy-50 text-navy-400 font-bold px-2.5 py-0.5 rounded-full">Ref: {b.refId}</span>
                                                <span className="ml-2 text-xs font-semibold text-navy-300">Booked on: {b.date}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${b.status.includes("Cancelled")
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : b.status.includes("Checked-In")
                                                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                        : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                }`}>{b.status}</span>
                                        </div>

                                        {/* Suite Items */}
                                        <div className="flex flex-col gap-4 mb-4">
                                            {b.items.filter(i => i.itemType === "room").map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-navy-500 text-sm sm:text-base">{item.name} (x{item.quantity})</h4>
                                                        {item.status && (
                                                            <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded mt-1.5 mb-1.5 ${item.status.includes("Checked-Out")
                                                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                                    : item.status.includes("Cancelled")
                                                                        ? "bg-red-50 text-red-700 border border-red-200"
                                                                        : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                                }`}>
                                                                Room Status: {item.status}
                                                            </span>
                                                        )}
                                                        {item.details && (
                                                            <p className="text-xs text-navy-400 mt-1 font-light flex flex-col gap-0.5">
                                                                <span>🗓 <strong>Stay:</strong> {item.details.checkIn} to {item.details.checkOut}</span>
                                                                <span>🚪 <strong>Room Number Assigned:</strong> {item.details.roomNumber || "Pending Allocation"}</span>
                                                                <span>👥 <strong>Guests:</strong> {item.details.adults} Adults, {item.details.kids || 0} Kids</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-navy-500">₹ {(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions footer */}
                                        <div className="flex justify-between items-center border-t border-navy-50 pt-4 mt-2">
                                            <span className="text-xs font-light text-navy-400">Total Suite Invoice: <strong>₹ {b.total.toLocaleString()}</strong></span>
                                            {b.status === "Confirmed (Upcoming)" && (
                                                <button
                                                    onClick={() => handleCancelBooking(b.refId)}
                                                    className="border border-red-200 hover:bg-red-50 text-red-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none"
                                                >
                                                    <FaTrash className="text-[10px]" /> Cancel Reservation
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-navy-400 font-light bg-white border border-navy-100 rounded-3xl">
                                    <p className="text-sm mb-2">No active hotel room reservations found.</p>
                                    <Link to="/rooms" className="text-xs text-gold-600 font-bold hover:underline">Book a Luxury Suite →</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Dining Orders */}
                    {activeTab === "dining" && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            {diningList.length > 0 ? (
                                diningList.map(b => (
                                    <div key={b.refId} className="bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md">
                                        <div className="flex justify-between items-start gap-4 mb-4 border-b border-navy-50 pb-4">
                                            <div>
                                                <span className="text-[10px] bg-navy-50 text-navy-400 font-bold px-2.5 py-0.5 rounded-full">Ref: {b.refId}</span>
                                                <span className="ml-2 text-xs font-semibold text-navy-300">Ordered on: {b.date}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${b.status.includes("Cancelled")
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : b.status.includes("Delivered")
                                                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                        : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                }`}>{b.status}</span>
                                        </div>

                                        {/* Dining Items */}
                                        <div className="flex flex-col gap-4 mb-4">
                                            {b.items.filter(i => i.itemType === "menu").map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-navy-500 text-sm sm:text-base">{item.name} (x{item.quantity})</h4>
                                                        {item.status && (
                                                            <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded mt-1.5 mb-1.5 ${item.status.includes("Delivered")
                                                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                                    : item.status.includes("Cancelled")
                                                                        ? "bg-red-50 text-red-700 border border-red-200"
                                                                        : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                                }`}>
                                                                Order Status: {item.status}
                                                            </span>
                                                        )}
                                                        {item.details && (
                                                            <p className="text-xs text-navy-400 mt-1 font-light flex flex-col gap-0.5">
                                                                <span>🛎 <strong>Delivery Point:</strong> {item.details.diningType === "room-service" ? `Room Service to Room #${item.details.roomNumber}` : `Restaurant Table #${item.details.tableNumber} at ${item.details.diningTime}`}</span>
                                                                {item.details.specialNotes && <span>✍ <strong>Prep Requests:</strong> "{item.details.specialNotes}"</span>}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-navy-500">₹ {(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions footer */}
                                        <div className="flex justify-between items-center border-t border-navy-50 pt-4 mt-2">
                                            <span className="text-xs font-light text-navy-400">Total Dining Cost: <strong>₹ {b.total.toLocaleString()}</strong></span>
                                            {b.status === "Confirmed (Upcoming)" && (
                                                <button
                                                    onClick={() => handleCancelBooking(b.refId)}
                                                    className="border border-red-200 hover:bg-red-50 text-red-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none"
                                                >
                                                    <FaTrash className="text-[10px]" /> Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-navy-400 font-light bg-white border border-navy-100 rounded-3xl">
                                    <p className="text-sm mb-2">No active dining orders found.</p>
                                    <Link to="/menu" className="text-xs text-gold-600 font-bold hover:underline">Order gourmet dishes →</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Premium Services */}
                    {activeTab === "services" && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            {servicesList.length > 0 ? (
                                servicesList.map(b => (
                                    <div key={b.refId} className="bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md">
                                        <div className="flex justify-between items-start gap-4 mb-4 border-b border-navy-50 pb-4">
                                            <div>
                                                <span className="text-[10px] bg-navy-50 text-navy-400 font-bold px-2.5 py-0.5 rounded-full">Ref: {b.refId}</span>
                                                <span className="ml-2 text-xs font-semibold text-navy-300">Booked on: {b.date}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${b.status.includes("Cancelled")
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : b.status.includes("Completed")
                                                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                        : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                }`}>{b.status}</span>
                                        </div>

                                        {/* Services Items */}
                                        <div className="flex flex-col gap-4 mb-4">
                                            {b.items.filter(i => i.itemType === "service").map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-navy-500 text-sm sm:text-base">{item.name} (x{item.quantity})</h4>
                                                        {item.status && (
                                                            <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded mt-1.5 mb-1.5 ${item.status.includes("Completed")
                                                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                                    : item.status.includes("Cancelled")
                                                                        ? "bg-red-50 text-red-700 border border-red-200"
                                                                        : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                                }`}>
                                                                Service Status: {item.status}
                                                            </span>
                                                        )}
                                                        {item.details && (
                                                            <div className="text-xs text-navy-400 mt-1 font-light space-y-1">
                                                                <p>🗓 <strong>Scheduled Date:</strong> {item.details.bookingDate} &nbsp;|&nbsp; ⏰ <strong>Time Slot:</strong> {item.details.bookingTime}</p>
                                                                {(item.name.toLowerCase().includes("yacht") || item.name.toLowerCase().includes("cruise")) && (
                                                                    <p>🛥 <strong>Yacht Class:</strong> {item.details.roomNumber || "Royal Catamaran"} &nbsp;|&nbsp; 📍 <strong>Port:</strong> {item.details.tableNumber || "Marina Bay Marina"}</p>
                                                                )}
                                                                {(item.name.toLowerCase().includes("transfer") || item.name.toLowerCase().includes("airport")) && (
                                                                    <p>✈ <strong>Flight No:</strong> {item.details.roomNumber || "Pending"} &nbsp;|&nbsp; 📍 <strong>Pickup Point:</strong> {item.details.tableNumber || "T3 Gates"}</p>
                                                                )}
                                                                {item.details.specialNotes && <p>📝 Notes: "{item.details.specialNotes}"</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-navy-500">₹ {(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions footer */}
                                        <div className="flex justify-between items-center border-t border-navy-50 pt-4 mt-2">
                                            <span className="text-xs font-light text-navy-400">Services Total: <strong>₹ {b.total.toLocaleString()}</strong></span>
                                            {b.status === "Confirmed (Upcoming)" && (
                                                <button
                                                    onClick={() => handleCancelBooking(b.refId)}
                                                    className="border border-red-200 hover:bg-red-50 text-red-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none"
                                                >
                                                    <FaTrash className="text-[10px]" /> Quit Service
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-navy-400 font-light bg-white border border-navy-100 rounded-3xl">
                                    <p className="text-sm mb-2">No premium service bookings found.</p>
                                    <Link to="/services" className="text-xs text-gold-600 font-bold hover:underline">Browse luxury services →</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Security OTP Keys */}
                    {activeTab === "otp" && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            {bookings.length > 0 ? (
                                <div className="bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md">
                                    <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-4 font-display">Your Security Verification Keys</h3>
                                    <p className="text-xs text-navy-400 font-light leading-relaxed mb-6">
                                        Concierge and kitchen staff will ask for these department-specific 4-digit codes to verify check-ins or food coordinates. Keep them safe.
                                    </p>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left text-navy-500">
                                            <thead className="bg-navy-50 uppercase text-[9px] font-bold text-navy-400">
                                                <tr>
                                                    <th className="px-4 py-3">Reservation</th>
                                                    <th className="px-4 py-3">Order Date</th>
                                                    <th className="px-4 py-3 text-center">🏨 Suite OTP</th>
                                                    <th className="px-4 py-3 text-center">🍽 Dining OTP</th>
                                                    <th className="px-4 py-3 text-center">🛎 Service OTP</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-navy-50">
                                                {bookings.map(b => (
                                                    <tr key={b.refId} className="hover:bg-navy-50/50">
                                                        <td className="px-4 py-4.5 font-bold text-navy-500">
                                                            {b.refId}
                                                        </td>
                                                        <td className="px-4 py-4.5 font-light">
                                                            {b.date}
                                                        </td>
                                                        <td className="px-4 py-4.5 text-center font-black text-sm text-accent-teal tracking-widest font-sans">
                                                            {b.otpRoom || "—"}
                                                        </td>
                                                        <td className="px-4 py-4.5 text-center font-black text-sm text-accent-teal tracking-widest font-sans">
                                                            {b.otpDining || "—"}
                                                        </td>
                                                        <td className="px-4 py-4.5 text-center font-black text-sm text-accent-teal tracking-widest font-sans">
                                                            {b.otpService || "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-navy-400 font-light bg-white border border-navy-100 rounded-3xl">
                                    <p className="text-sm">You do not have any bookings yet. Verify keys appear here once you place a booking order.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Profile;
