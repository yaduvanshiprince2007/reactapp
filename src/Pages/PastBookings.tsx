import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import hotelData from "../Data/hotelData.json";
import { FaSearch, FaTicketAlt, FaRegCalendarAlt, FaUser, FaInfoCircle } from "react-icons/fa";

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
        seatingStyle?: string;
        cateringPlan?: string;
        avRig?: string;
        decorTheme?: string;
        expectedGuests?: number;
        calculatedPrice?: number;
    };
}

interface BookingRecord {
    refId: string;
    date: string;
    status: string;
    guestName: string;
    email: string;
    total: number;
    items: BookingItem[];
}

const PastBookings = () => {
    const [searchParams] = useSearchParams();
    const refIdParam = searchParams.get("refId");
    
    const [searchVal, setSearchVal] = useState("");
    const [searchedId, setSearchedId] = useState("");
    const [searchResult, setSearchResult] = useState<BookingRecord | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [userCreatedIds, setUserCreatedIds] = useState<string[]>([]);

    // Automatically perform booking lookup on mount if refId is passed via URL (e.g. from QR scan)
    useEffect(() => {
        if (refIdParam) {
            const query = refIdParam.trim().toUpperCase();
            setSearchVal(query);
            setSearchedId(query);
            setHasSearched(true);

            let found: BookingRecord | undefined = hotelData.pastBookings.find(
                (b) => b.refId.toUpperCase() === query
            );

            if (!found) {
                const existingCustom = localStorage.getItem("customBookings");
                if (existingCustom) {
                    const list: BookingRecord[] = JSON.parse(existingCustom);
                    found = list.find((b) => b.refId.toUpperCase() === query);
                }
            }
            setSearchResult(found || null);
        }
    }, [refIdParam]);

    // Load custom dynamic reference IDs from localstorage to display as recommendations
    useEffect(() => {
        const existingCustom = localStorage.getItem("customBookings");
        if (existingCustom) {
            const list: BookingRecord[] = JSON.parse(existingCustom);
            setUserCreatedIds(list.map(x => x.refId));
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchVal.trim().toUpperCase();
        if (!query) return;

        setSearchedId(query);
        setHasSearched(true);

        // 1. Search in static hotelData mock
        let found: BookingRecord | undefined = hotelData.pastBookings.find(
            (b) => b.refId.toUpperCase() === query
        );

        // 2. Search in custom bookings in localStorage
        if (!found) {
            const existingCustom = localStorage.getItem("customBookings");
            if (existingCustom) {
                const list: BookingRecord[] = JSON.parse(existingCustom);
                found = list.find((b) => b.refId.toUpperCase() === query);
            }
        }

        setSearchResult(found || null);
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen">
            <div className="max-w-3xl mx-auto text-left">
                {/* Headers */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 leading-tight">
                        Booking Lookup
                    </h1>
                    <p className="text-navy-400 max-w-md mx-auto text-sm sm:text-base font-light">
                        Review details and status of past bookings or current reservation details.
                    </p>
                </div>

                {/* Search Bar Card */}
                <div className="bg-white border border-gold-300/10 shadow-md p-6 rounded-3xl mb-8">
                    <form onSubmit={handleSearch} className="flex gap-3 items-stretch">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-navy-300 pointer-events-none">
                                <FaTicketAlt className="text-sm" />
                            </span>
                            <input
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                placeholder="Enter Reference ID (e.g. GA-9821)"
                                className="w-full bg-navy-50/50 border border-navy-100 placeholder-navy-300 text-navy-500 rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sm font-medium transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
                        >
                            <FaSearch className="text-xs" /> Search
                        </button>
                    </form>

                    {/* Recommendations / Tips */}
                    <div className="mt-4 flex flex-col gap-2 border-t border-navy-50 pt-4 text-left">
                        <p className="text-xs text-navy-400 flex items-center gap-1.5 font-light">
                            <FaInfoCircle className="text-gold-500 shrink-0" />
                            <span>Try searching for these sample IDs: <strong className="font-semibold text-navy-500">GA-9821</strong> or <strong className="font-semibold text-navy-500">GA-7721</strong></span>
                        </p>
                        {userCreatedIds.length > 0 && (
                            <p className="text-xs text-navy-400 flex items-center gap-1.5 font-light">
                                <span className="inline-block w-1.5 h-1.5 bg-accent-teal rounded-full animate-ping shrink-0" />
                                <span>Your recent booking IDs: {userCreatedIds.map((id, index) => (
                                    <button 
                                        key={id}
                                        onClick={() => { setSearchVal(id); setSearchedId(id); setHasSearched(true); }}
                                        className="font-bold text-accent-teal hover:underline inline-block mr-2"
                                    >
                                        {id}{index < userCreatedIds.length - 1 ? "," : ""}
                                    </button>
                                ))}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Search Results Display */}
                {hasSearched && (
                    <div className="animate-fade-in">
                        {searchResult ? (
                            <div className="bg-white border border-gold-300/10 rounded-3xl shadow-lg overflow-hidden text-left transition-all">
                                {/* Booking Header */}
                                <div className="bg-navy-500 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-xs uppercase font-extrabold text-gold-300 tracking-wider">Reference ID</span>
                                            <span className="text-base font-black tracking-wide font-sans">{searchResult.refId}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-navy-100 font-light flex-wrap">
                                            <span className="flex items-center gap-1.5">
                                                <FaRegCalendarAlt /> {searchResult.date}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FaUser /> {searchResult.guestName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="sm:text-right">
                                        <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white/10 text-gold-300 border border-white/15`}>
                                            {searchResult.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Items list */}
                                <div className="p-6 sm:p-8">
                                    <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-4 font-display">
                                        Reserved Suites & Orders
                                    </h3>
                                    
                                    <div className="flex flex-col gap-4">
                                        {searchResult.items.map((item, index) => (
                                            <div 
                                                key={index}
                                                className="py-4 border-b border-navy-50 last:border-0"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider mb-1 mr-2 ${
                                                            item.itemType === "room" 
                                                                ? "bg-navy-100 text-navy-600" 
                                                                : item.itemType === "service"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : item.itemType === "banquet"
                                                                ? "bg-indigo-100 text-indigo-700"
                                                                : "bg-gold-100 text-gold-700"
                                                        }`}>
                                                            {item.itemType === "room" ? "Suite" : item.itemType === "service" ? "Service" : item.itemType === "banquet" ? "Event" : "Dining"}
                                                        </span>
                                                        <h4 className="text-sm font-semibold text-navy-500 inline">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-xs text-navy-400 font-light mt-0.5">
                                                            {item.quantity} {item.itemType === "room" ? "night(s)" : "item(s)"} x ₹ {item.price.toLocaleString()}
                                                        </p>
                                                        {item.status && (
                                                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                                                                item.status.includes("Completed") || item.status.includes("Delivered") || item.status.includes("Checked-Out")
                                                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                                                    : item.status.includes("Cancelled")
                                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                                    : "bg-gold-50 text-gold-700 border border-gold-300/20"
                                                            }`}>
                                                                Status: {item.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-bold text-navy-500 text-sm font-sans">
                                                        ₹ {(item.quantity * item.price).toLocaleString()}
                                                    </div>
                                                </div>

                                                {/* Render item details if they exist */}
                                                {item.details && Object.keys(item.details).length > 0 && (
                                                    <div className="bg-navy-50/40 border border-navy-100/40 rounded-xl p-3 mt-3 text-[11px] text-navy-400 font-light flex flex-col gap-1">
                                                        {item.itemType === "room" && (
                                                            <>
                                                                <p>🗓 <strong>Check-In:</strong> {item.details.checkIn} &nbsp;|&nbsp; <strong>Check-Out:</strong> {item.details.checkOut}</p>
                                                                <p>🚪 <strong>Room Number Assigned:</strong> {item.details.roomNumber || "Pending Allocation"}</p>
                                                                <p>👤 <strong>Guests:</strong> {item.details.adults} Adults, {item.details.kids || 0} Children</p>
                                                            </>
                                                        )}
                                                        {item.itemType === "menu" && (
                                                            <>
                                                                <p>🛎 <strong>Delivery Option:</strong> {item.details.diningType === "room-service" ? "In-Room Room Service" : "Dine-In at Restaurant"}</p>
                                                                {item.details.diningType === "room-service" ? (
                                                                    <p>🚪 <strong>Room Number:</strong> {item.details.roomNumber}</p>
                                                                ) : (
                                                                    <p>🍽 <strong>Table:</strong> {item.details.tableNumber} &nbsp;|&nbsp; <strong>Table Guests:</strong> {item.details.tableGuests} &nbsp;|&nbsp; <strong>Time:</strong> {item.details.diningTime}</p>
                                                                )}
                                                                {item.details.specialNotes && <p>✍ <strong>Prep Requests:</strong> "{item.details.specialNotes}"</p>}
                                                            </>
                                                        )}
                                                        {item.itemType === "service" && (
                                                            <>
                                                                <p>⏰ <strong>Booking Date:</strong> {item.details.bookingDate} &nbsp;|&nbsp; <strong>Time Slot:</strong> {item.details.bookingTime}</p>
                                                                {/* Custom Yacht Details */}
                                                                {(item.name.toLowerCase().includes("yacht") || item.name.toLowerCase().includes("cruise")) && (
                                                                    <p>🛥 <strong>Yacht Class:</strong> {item.details.roomNumber || "Royal Catamaran"} &nbsp;|&nbsp; 📍 <strong>Port:</strong> {item.details.tableNumber || "Marina Bay Marina"}</p>
                                                                )}
                                                                {/* Custom Airport Details */}
                                                                {(item.name.toLowerCase().includes("transfer") || item.name.toLowerCase().includes("airport")) && (
                                                                    <p>✈ <strong>Flight No:</strong> {item.details.roomNumber || "Pending"} &nbsp;|&nbsp; 📍 <strong>Pickup Point:</strong> {item.details.tableNumber || "T3 Gates"}</p>
                                                                )}
                                                                {item.details.specialNotes && <p>✍ <strong>Special Requests:</strong> "{item.details.specialNotes}"</p>}
                                                            </>
                                                        )}
                                                        {item.itemType === "banquet" && (
                                                            <>
                                                                <p>🗓 <strong>Event Date:</strong> {item.details.bookingDate} &nbsp;|&nbsp; ⏰ <strong>Time:</strong> {item.details.bookingTime}</p>
                                                                <p>🪑 <strong>Seating Layout:</strong> {item.details.seatingStyle} &nbsp;|&nbsp; 👥 <strong>Expected Guests:</strong> {item.details.expectedGuests}</p>
                                                                <p>🍽 <strong>Catering:</strong> {item.details.cateringPlan} &nbsp;|&nbsp; 🎨 <strong>Decor Theme:</strong> {item.details.decorTheme}</p>
                                                                {item.details.avRig && <p>🎵 <strong>AV Setup:</strong> {item.details.avRig}</p>}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary Grand Total */}
                                    <div className="border-t border-navy-100 mt-6 pt-6 flex justify-between items-center">
                                        <span className="text-sm font-bold text-navy-500 font-display">Grand Total Invoice</span>
                                        <span className="text-xl font-extrabold text-accent-teal font-sans">₹ {searchResult.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50/50 border border-red-200 text-red-700 p-8 rounded-3xl text-center">
                                <span className="text-3xl mb-3 inline-block">🔍</span>
                                <h3 className="text-lg font-bold mb-2">No Booking Record Found</h3>
                                <p className="text-xs font-light max-w-sm mx-auto leading-relaxed">
                                    We couldn't find a booking matching Reference ID: <strong className="font-semibold text-navy-500">"{searchedId}"</strong>. Please verify the ID format and try again.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PastBookings;
