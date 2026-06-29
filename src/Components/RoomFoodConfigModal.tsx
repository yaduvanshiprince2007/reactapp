import React, { useState, useEffect } from "react";
import { FaTimes, FaSlidersH, FaCalendarAlt, FaHotel, FaUtensils, FaRegCheckCircle, FaThermometerHalf } from "react-icons/fa";

interface RoomFoodConfigModalProps {
    item: {
        id: number;
        heading: string;
        image: string;
        newPrice: number | string;
        itemType: "room" | "menu";
    };
    onClose: () => void;
    onConfirm: (quantity: number) => void;
}

export const RoomFoodConfigModal: React.FC<RoomFoodConfigModalProps> = ({
    item,
    onClose,
    onConfirm,
}) => {
    const itemPrice = Number(item.newPrice) || 0;

    // Room configurations
    const [roomQty, setRoomQty] = useState(1);
    const [isAc, setIsAc] = useState(true);
    const [roomTemp, setRoomTemp] = useState(22);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState(2);
    const [kids, setKids] = useState(0);

    // Food configurations
    const [foodQty, setFoodQty] = useState(1);
    const [spiciness, setSpiciness] = useState("Medium");
    const [dietary, setDietary] = useState("Default");
    const [diningType, setDiningType] = useState<"room-service" | "dine-in">("room-service");
    const [roomNumber, setRoomNumber] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [specialNotes, setSpecialNotes] = useState("");

    // Set default dates for room stays on mount
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDate = (date: Date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        };

        setCheckIn(formatDate(today));
        setCheckOut(formatDate(tomorrow));
    }, []);

    // Calculate dynamic pricing
    const getDynamicPricePerNight = () => {
        let base = itemPrice;
        if (item.itemType === "room" && isAc) {
            base += 1000; // Surcharge for AC room
        }
        return base;
    };

    const getDynamicTotal = () => {
        if (item.itemType === "room") {
            const nightlyRate = getDynamicPricePerNight();
            // Calculate date difference
            let nights = 1;
            if (checkIn && checkOut) {
                const date1 = new Date(checkIn);
                const date2 = new Date(checkOut);
                const diffTime = Math.abs(date2.getTime() - date1.getTime());
                nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            }
            return nightlyRate * nights * roomQty;
        } else {
            return itemPrice * foodQty;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (item.itemType === "room") {
            const config = {
                quantity: roomQty,
                checkIn,
                checkOut,
                adults,
                kids,
                isAc,
                roomTemp,
                nightlyPrice: getDynamicPricePerNight(),
            };
            localStorage.setItem(`roomConfig_${item.id}`, JSON.stringify(config));
            onConfirm(roomQty);
        } else {
            const config = {
                quantity: foodQty,
                spiciness,
                dietary,
                diningType,
                roomNumber,
                tableNumber,
                specialNotes: `Spice: ${spiciness} | Diet: ${dietary} | Notes: ${specialNotes}`,
            };
            localStorage.setItem(`foodConfig_${item.id}`, JSON.stringify(config));
            onConfirm(foodQty);
        }
    };

    return (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gold-300/10 animate-scale-up text-left text-xs flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-navy-500 text-white p-5 flex justify-between items-center relative">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gold-300 flex items-center gap-1">
                            <FaSlidersH /> {item.itemType === "room" ? "Stay Customizer" : "Order Customizer"}
                        </span>
                        <h3 className="text-base font-bold font-display uppercase tracking-wider mt-0.5 pr-8">{item.heading}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer absolute right-4 top-4"
                    >
                        <FaTimes className="text-base" />
                    </button>
                </div>

                {/* Content area */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-navy-500">
                    
                    {/* ROOM CUSTOMIZER */}
                    {item.itemType === "room" && (
                        <div className="flex flex-col gap-4">
                            
                            {/* Quantity selection count */}
                            <div className="bg-gold-50/40 border border-gold-300/10 p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-navy-500 text-sm flex items-center gap-1.5">
                                        <FaHotel className="text-gold-500" /> Count of Rooms
                                    </h4>
                                    <p className="text-[10px] text-navy-300 font-light mt-0.5">Select how many rooms of this type you require.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRoomQty(Math.max(1, roomQty - 1))}
                                        className="w-8 h-8 rounded-full bg-white border border-navy-200 font-bold hover:bg-gold-500 hover:text-white hover:border-gold-500 flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                                    >
                                        -
                                    </button>
                                    <span className="font-extrabold text-sm text-navy-500 w-4 text-center">{roomQty}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRoomQty(Math.min(5, roomQty + 1))}
                                        className="w-8 h-8 rounded-full bg-white border border-navy-200 font-bold hover:bg-gold-500 hover:text-white hover:border-gold-500 flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* AC vs Non-AC options */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Air Conditioning</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAc(true)}
                                            className={`flex-1 py-2.5 rounded-xl border font-bold text-center transition-colors cursor-pointer ${
                                                isAc 
                                                    ? "bg-gold-500 text-white border-gold-500" 
                                                    : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                            }`}
                                        >
                                            AC Room (+₹1K)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAc(false)}
                                            className={`flex-1 py-2.5 rounded-xl border font-bold text-center transition-colors cursor-pointer ${
                                                !isAc 
                                                    ? "bg-gold-500 text-white border-gold-500" 
                                                    : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                            }`}
                                        >
                                            Non-AC Room
                                        </button>
                                    </div>
                                </div>

                                {/* Room Temperature slider */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1 flex items-center gap-1">
                                        <FaThermometerHalf className={isAc ? "text-gold-500" : "text-navy-300"} /> Room Temperature
                                    </label>
                                    <div className={`p-2.5 rounded-xl border border-navy-200 bg-navy-50/20 flex flex-col gap-1.5 ${!isAc ? "opacity-40" : ""}`}>
                                        <input
                                            type="range"
                                            min="16"
                                            max="28"
                                            disabled={!isAc}
                                            value={roomTemp}
                                            onChange={(e) => setRoomTemp(Number(e.target.value))}
                                            className="w-full h-1 bg-navy-100 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                        />
                                        <span className="text-[10px] font-bold text-navy-500 text-right">{roomTemp}°C</span>
                                    </div>
                                </div>
                            </div>

                            {/* Check-In / Check-Out */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1 flex items-center gap-1">
                                        <FaCalendarAlt /> Check-In Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="w-full bg-white border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1 flex items-center gap-1">
                                        <FaCalendarAlt /> Check-Out Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        className="w-full bg-white border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 text-xs font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Guests adults & kids */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Adults Count (18+)</label>
                                    <select
                                        value={adults}
                                        onChange={(e) => setAdults(Number(e.target.value))}
                                        className="w-full bg-white border border-navy-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 font-medium cursor-pointer"
                                    >
                                        <option value="1">1 Adult</option>
                                        <option value="2">2 Adults</option>
                                        <option value="3">3 Adults</option>
                                        <option value="4">4 Adults</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Kids Count (0-17)</label>
                                    <select
                                        value={kids}
                                        onChange={(e) => setKids(Number(e.target.value))}
                                        className="w-full bg-white border border-navy-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 font-medium cursor-pointer"
                                    >
                                        <option value="0">No Kids</option>
                                        <option value="1">1 Kid</option>
                                        <option value="2">2 Kids</option>
                                        <option value="3">3 Kids</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FOOD CUSTOMIZER */}
                    {item.itemType === "menu" && (
                        <div className="flex flex-col gap-4">
                            
                            {/* Food Quantity Plates Count */}
                            <div className="bg-gold-50/40 border border-gold-300/10 p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-navy-500 text-sm flex items-center gap-1.5">
                                        <FaUtensils className="text-gold-500" /> Plates / Portions Count
                                    </h4>
                                    <p className="text-[10px] text-navy-300 font-light mt-0.5">Select how many quantities of this dish you wish to order.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFoodQty(Math.max(1, foodQty - 1))}
                                        className="w-8 h-8 rounded-full bg-white border border-navy-200 font-bold hover:bg-gold-500 hover:text-white hover:border-gold-500 flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                                    >
                                        -
                                    </button>
                                    <span className="font-extrabold text-sm text-navy-500 w-4 text-center">{foodQty}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFoodQty(Math.min(10, foodQty + 1))}
                                        className="w-8 h-8 rounded-full bg-white border border-navy-200 font-bold hover:bg-gold-500 hover:text-white hover:border-gold-500 flex items-center justify-center cursor-pointer transition-colors focus:outline-none"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Spiciness & Dietary preference */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Spiciness Level</label>
                                    <select
                                        value={spiciness}
                                        onChange={(e) => setSpiciness(e.target.value)}
                                        className="w-full bg-white border border-navy-200 rounded-xl p-2.5 focus:outline-none text-navy-500 font-semibold cursor-pointer"
                                    >
                                        <option value="Mild">Mild (Non-spicy)</option>
                                        <option value="Medium">Medium (Balanced)</option>
                                        <option value="Hot">Hot (Spicy)</option>
                                        <option value="Extra Hot">Extra Hot (Very spicy)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Dietary Preferences</label>
                                    <select
                                        value={dietary}
                                        onChange={(e) => setDietary(e.target.value)}
                                        className="w-full bg-white border border-navy-200 rounded-xl p-2.5 focus:outline-none text-navy-500 font-semibold cursor-pointer"
                                    >
                                        <option value="Default">Standard Recipe</option>
                                        <option value="Vegan">Vegan Recipe</option>
                                        <option value="Gluten-Free">Gluten-Free Option</option>
                                        <option value="Nut-Free">Nut-Free Option</option>
                                    </select>
                                </div>
                            </div>

                            {/* Delivery Options room service vs dine-in */}
                            <div className="bg-navy-50/40 p-4 rounded-2xl border border-navy-100/35">
                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-2">Delivery Designation</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                                        <input
                                            type="radio"
                                            name="diningTypePopup"
                                            checked={diningType === "room-service"}
                                            onChange={() => setDiningType("room-service")}
                                            className="text-gold-500 focus:ring-0"
                                        />
                                        Room Service
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                                        <input
                                            type="radio"
                                            name="diningTypePopup"
                                            checked={diningType === "dine-in"}
                                            onChange={() => setDiningType("dine-in")}
                                            className="text-gold-500 focus:ring-0"
                                        />
                                        Dine-In Restaurant Table
                                    </label>
                                </div>

                                {diningType === "room-service" ? (
                                    <div className="mt-3">
                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-1">Room Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter delivery room # (e.g. 302)"
                                            value={roomNumber}
                                            onChange={(e) => setRoomNumber(e.target.value)}
                                            className="w-full bg-white border border-navy-200 rounded-xl px-3 py-2 focus:outline-none text-navy-500 font-semibold"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-1">Table Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter table # (e.g. Table 4)"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                            className="w-full bg-white border border-navy-200 rounded-xl px-3 py-2 focus:outline-none text-navy-500 font-semibold"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Cooking Request notes */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Special Cooking Requests</label>
                                <textarea
                                    value={specialNotes}
                                    onChange={(e) => setSpecialNotes(e.target.value)}
                                    placeholder="e.g. Allergen alerts, extra sauce, sugar-free, specific cutlery..."
                                    rows={2.5}
                                    className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none text-navy-500 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Price and Add button */}
                    <div className="border-t border-navy-50 pt-5 mt-2 flex justify-between items-center">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-navy-300">
                                {item.itemType === "room" ? "Total Price" : "Total Price"}
                            </span>
                            <h4 className="text-base font-extrabold text-accent-teal font-sans">
                                ₹ {getDynamicTotal().toLocaleString()} {item.itemType === "room" && "Total"}
                            </h4>
                        </div>
                        <button
                            type="submit"
                            className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-gold-500/10 cursor-pointer transition-all flex items-center gap-1.5"
                        >
                            <FaRegCheckCircle /> Confirm & Add to Cart
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
