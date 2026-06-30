import React, { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaUsers, FaChair, FaUtensils, FaMusic, FaPalette, FaCheckCircle, FaUser } from "react-icons/fa";

interface BanquetConfigModalProps {
    item: {
        id: number;
        heading: string;
        image: string;
        newPrice: number | string;
        itemType: string;
    };
    onClose: () => void;
    onConfirm: (quantity: number, guestName?: string) => void;
    /** When true, shows a guest name picker for staff-initiated bookings */
    isStaffFlow?: boolean;
    /** List of known guest names for autocomplete in staff flow */
    guestNameSuggestions?: string[];
}

export const BanquetConfigModal: React.FC<BanquetConfigModalProps> = ({
    item,
    onClose,
    onConfirm,
    isStaffFlow = false,
    guestNameSuggestions = [],
}) => {
    const basePrice = Number(item.newPrice) || 0;
    const [staffGuestName, setStaffGuestName] = useState("");
    const [staffGuestFilter, setStaffGuestFilter] = useState("");
    const [showGuestDrop, setShowGuestDrop] = useState(false);

    // Customization states
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("10:00");
    const [seatingStyle, setSeatingStyle] = useState("Round Tables");
    const [cateringPlan, setCateringPlan] = useState("Bronze Buffet");
    const [avRig, setAvRig] = useState("Basic (Mic + Projector)");
    const [decorTheme, setDecorTheme] = useState("Royal Gold");
    const [expectedGuests, setExpectedGuests] = useState(100);

    // Initial date setup (default to next week)
    useEffect(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const yyyy = nextWeek.getFullYear();
        const mm = String(nextWeek.getMonth() + 1).padStart(2, "0");
        const dd = String(nextWeek.getDate()).padStart(2, "0");
        setBookingDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    // Price helpers
    const getCateringCostPerGuest = () => {
        switch (cateringPlan) {
            case "Bronze Buffet": return 1000;
            case "Silver Buffet": return 1500;
            case "Gold Plated Dinner": return 2500;
            case "Platinum Royal Dining": return 4000;
            default: return 0;
        }
    };

    const getAvCost = () => {
        switch (avRig) {
            case "Basic (Mic + Projector)": return 15000;
            case "Premium (DJ + Lighting + Stage)": return 50000;
            default: return 0;
        }
    };

    const getDecorCost = () => {
        switch (decorTheme) {
            case "Royal Gold": return 30000;
            case "Floral Elegance": return 45000;
            case "Oceanic Serenity": return 25000;
            default: return 0;
        }
    };

    const getCateringTotal = () => getCateringCostPerGuest() * expectedGuests;
    const getGrandTotal = () => basePrice + getCateringTotal() + getAvCost() + getDecorCost();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isStaffFlow && !staffGuestName.trim()) return;

        const config = {
            quantity: 1,
            bookingDate,
            bookingTime,
            seatingStyle,
            cateringPlan,
            avRig,
            decorTheme,
            expectedGuests,
            calculatedPrice: getGrandTotal(),
            guestName: isStaffFlow ? staffGuestName.trim() : undefined,
        };

        localStorage.setItem(`banquetConfig_${item.id}`, JSON.stringify(config));
        onConfirm(1, isStaffFlow ? staffGuestName.trim() : undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Modal Box */}
            <div className="bg-white border border-navy-100 rounded-3xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] text-left animate-fade-in">
                {/* Left Column: Image & Overview */}
                <div className="md:w-5/12 relative bg-navy-950 flex flex-col justify-end p-6 sm:p-8 text-white min-h-[250px] md:min-h-0">
                    <img
                        src={item.image}
                        alt={item.heading}
                        className="absolute inset-0 w-full h-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
                    
                    <div className="relative z-10 flex flex-col gap-2">
                        <span className="text-[10px] bg-gold-500 text-white font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest">
                            Event Space
                        </span>
                        <h3 className="text-2xl font-black font-display text-white mt-1 leading-tight">
                            {item.heading}
                        </h3>
                        <p className="text-xs text-navy-200/90 font-light leading-relaxed">
                            Customize and lock down your layout, catering dining plan, AV setups, and guest capacity limits.
                        </p>
                        <div className="border-t border-white/10 pt-4 mt-2">
                            <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">Base Space Fare</span>
                            <p className="text-xl font-black text-white mt-0.5">₹{basePrice.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customizer Form */}
                <form onSubmit={handleSubmit} className="md:w-7/12 p-6 sm:p-8 overflow-y-auto flex flex-col gap-5 text-navy-900 bg-white">
                    <div className="flex items-center justify-between border-b border-navy-50 pb-3">
                        <h4 className="text-sm font-black uppercase tracking-widest text-navy-500">Configure Event</h4>
                        <button type="button" onClick={onClose} className="text-navy-300 hover:text-navy-500 p-1.5 hover:bg-navy-50 rounded-full cursor-pointer transition-colors">
                            <FaTimes className="text-base" />
                        </button>
                    </div>

                    {/* Staff-only: Guest name picker */}
                    {isStaffFlow && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-col gap-2">
                            <label className="block text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1.5">
                                <FaUser className="text-[9px]" /> Booking on Behalf of Guest *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={staffGuestFilter}
                                    onChange={e => { setStaffGuestFilter(e.target.value); setShowGuestDrop(true); }}
                                    onFocus={() => setShowGuestDrop(true)}
                                    placeholder="Search or type guest name..."
                                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-amber-400"
                                />
                                {showGuestDrop && (staffGuestFilter || guestNameSuggestions.length > 0) && (
                                    <div className="absolute z-20 top-full mt-1 w-full bg-white border border-navy-100 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                        {guestNameSuggestions
                                            .filter(n => n.toLowerCase().includes(staffGuestFilter.toLowerCase()))
                                            .slice(0, 8)
                                            .map(n => (
                                                <button key={n} type="button" onMouseDown={() => { setStaffGuestName(n); setStaffGuestFilter(n); setShowGuestDrop(false); }}
                                                    className="w-full text-left px-3 py-2 text-xs text-navy-500 hover:bg-navy-50 cursor-pointer">
                                                    {n}
                                                </button>
                                            ))}
                                        {staffGuestFilter && !guestNameSuggestions.includes(staffGuestFilter) && (
                                            <button type="button" onMouseDown={() => { setStaffGuestName(staffGuestFilter); setShowGuestDrop(false); }}
                                                className="w-full text-left px-3 py-2 text-xs text-navy-400 hover:bg-navy-50 cursor-pointer italic">
                                                + New guest: "{staffGuestFilter}"
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {staffGuestName && <p className="text-[10px] text-green-700 font-bold">Booking for: {staffGuestName}</p>}
                        </div>
                    )}

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaCalendarAlt className="text-gold-500 text-[9px]" /> Event Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaClock className="text-gold-500 text-[9px]" /> Start Time *
                            </label>
                            <input
                                type="time"
                                required
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Guest Count & Seating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaUsers className="text-gold-500 text-[9px]" /> Expected Guests: {expectedGuests}
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="1000"
                                step="10"
                                value={expectedGuests}
                                onChange={(e) => setExpectedGuests(Number(e.target.value))}
                                className="w-full h-1.5 bg-navy-100 rounded-lg appearance-none cursor-pointer accent-gold-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaChair className="text-gold-500 text-[9px]" /> Seating Style
                            </label>
                            <select
                                value={seatingStyle}
                                onChange={(e) => setSeatingStyle(e.target.value)}
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-semibold focus:outline-none cursor-pointer"
                            >
                                <option>Round Tables</option>
                                <option>Theater Setup</option>
                                <option>Classroom Setup</option>
                                <option>U-Shape Style</option>
                                <option>Cocktail Reception</option>
                            </select>
                        </div>
                    </div>

                    {/* Catering and Decor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaUtensils className="text-gold-500 text-[9px]" /> Catering
                            </label>
                            <select
                                value={cateringPlan}
                                onChange={(e) => setCateringPlan(e.target.value)}
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-semibold focus:outline-none cursor-pointer"
                            >
                                <option>None</option>
                                <option>Bronze Buffet</option>
                                <option>Silver Buffet</option>
                                <option>Gold Plated Dinner</option>
                                <option>Platinum Royal Dining</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaPalette className="text-gold-500 text-[9px]" /> Decor Theme
                            </label>
                            <select
                                value={decorTheme}
                                onChange={(e) => setDecorTheme(e.target.value)}
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-semibold focus:outline-none cursor-pointer"
                            >
                                <option>None</option>
                                <option>Royal Gold</option>
                                <option>Floral Elegance</option>
                                <option>Oceanic Serenity</option>
                            </select>
                        </div>
                    </div>

                    {/* AV Rig */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                            <FaMusic className="text-gold-500 text-[9px]" /> Audio / Visual Setup
                        </label>
                        <select
                            value={avRig}
                            onChange={(e) => setAvRig(e.target.value)}
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-semibold focus:outline-none cursor-pointer"
                        >
                            <option>None</option>
                            <option>Basic (Mic + Projector)</option>
                            <option>Premium (DJ + Lighting + Stage)</option>
                        </select>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-navy-50/50 border border-navy-100/50 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold text-navy-400 tracking-wider">Live Cost Estimates</span>
                        <div className="flex justify-between text-xs text-navy-500">
                            <span>Space Base Rent</span>
                            <span>₹{basePrice.toLocaleString()}</span>
                        </div>
                        {getCateringTotal() > 0 && (
                            <div className="flex justify-between text-xs text-navy-500">
                                <span>Catering ({cateringPlan} x {expectedGuests} guests)</span>
                                <span>₹{getCateringTotal().toLocaleString()}</span>
                            </div>
                        )}
                        {getAvCost() > 0 && (
                            <div className="flex justify-between text-xs text-navy-500">
                                <span>Audio/Visual ({avRig})</span>
                                <span>₹{getAvCost().toLocaleString()}</span>
                            </div>
                        )}
                        {getDecorCost() > 0 && (
                            <div className="flex justify-between text-xs text-navy-500">
                                <span>Decor Theme ({decorTheme})</span>
                                <span>₹{getDecorCost().toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t border-navy-100 pt-2 flex justify-between text-sm font-black text-navy-600">
                            <span>Est. Grand Total</span>
                            <span>₹{getGrandTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Confirm Booking */}
                    <button
                        type="submit"
                        disabled={isStaffFlow && !staffGuestName.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-gold-500/10"
                    >
                        <FaCheckCircle className="text-sm" />
                        {isStaffFlow ? "Confirm Booking on Behalf of Guest" : "Confirm Event Space Booking"}
                    </button>
                </form>
            </div>
        </div>
    );
};
