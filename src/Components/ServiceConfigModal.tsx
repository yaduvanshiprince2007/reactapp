import React, { useState, useEffect } from "react";
import { FaTimes, FaSlidersH, FaCalendarAlt, FaUserFriends, FaCompass, FaRegCheckCircle } from "react-icons/fa";

interface ServiceConfigModalProps {
    serviceId: number;
    serviceName: string;
    oldPrice?: string;
    newPrice?: string;
    onClose: () => void;
    onConfirm: () => void;
}

export const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
    serviceId,
    serviceName,
    newPrice,
    onClose,
    onConfirm,
}) => {
    // Shared states
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("12:00");
    const [specialNotes, setSpecialNotes] = useState("");

    // Custom fields for specific services
    // 1. Yacht Sunset Cruise (id 50)
    const [yachtClass, setYachtClass] = useState("Royal Catamaran");
    const [boardingPort, setBoardingPort] = useState("Marina Bay Marina");
    const [yachtGuests, setYachtGuests] = useState(2);
    const [yachtCatering, setYachtCatering] = useState("Champagne & Oysters");

    // 2. Azure Serenity Spa Package (id 51)
    const [spaVariant, setSpaVariant] = useState("Hot Stone Massage");
    const [therapistPref, setTherapistPref] = useState("No preference");
    const [spaGuests, setSpaGuests] = useState(1);
    const [spaDuration, setSpaDuration] = useState("90 Minutes");

    // 3. Premium Airport Transfer (id 52)
    const [vehicleType, setVehicleType] = useState("Premium SUV");
    const [hasDriver, setHasDriver] = useState("with-driver"); // "with-driver" or "self-drive"
    const [vehicleCount, setVehicleCount] = useState(1);
    const [transferFromDate, setTransferFromDate] = useState("");
    const [transferToDate, setTransferToDate] = useState("");
    const [flightNo, setFlightNo] = useState("");
    const [pickupTerminal, setPickupTerminal] = useState("");

    // 4. Guided Scuba Diving Adventure (id 53)
    const [diversCount, setDiversCount] = useState(1);
    const [divingSkill, setDivingSkill] = useState("Beginner");
    const [divingGear, setDivingGear] = useState("need-gear"); // "need-gear" or "have-gear"
    const [diveSpot, setDiveSpot] = useState("Coral Reef Sanctuary");

    // 5. Luxury In-Room Welcome Pack (id 54)
    const [winePref, setWinePref] = useState("Vintage Cabernet");
    const [platterPref, setPlatterPref] = useState("Milk & Dark Truffles");
    const [deliveryRoom, setDeliveryRoom] = useState("");

    // Set default date to tomorrow on mount
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");
        setBookingDate(`${yyyy}-${mm}-${dd}`);
        setTransferFromDate(`${yyyy}-${mm}-${dd}`);
        setTransferToDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Compile configuration into standard room/table/specialNotes values
        let compiledRoomNumber = "";
        let compiledTableNumber = "";
        let compiledNotes = "";

        const nameLower = serviceName.toLowerCase();

        if (nameLower.includes("yacht") || nameLower.includes("cruise") || serviceId === 50) {
            compiledRoomNumber = yachtClass;
            compiledTableNumber = boardingPort;
            compiledNotes = `Guests: ${yachtGuests} | Catering: ${yachtCatering} | Notes: ${specialNotes}`;
        } else if (nameLower.includes("spa") || serviceId === 51) {
            compiledRoomNumber = `${therapistPref} (${spaDuration})`;
            compiledTableNumber = spaVariant;
            compiledNotes = `Guests: ${spaGuests} | Notes: ${specialNotes}`;
        } else if (nameLower.includes("transfer") || serviceId === 52) {
            compiledRoomNumber = flightNo || "N/A";
            compiledTableNumber = pickupTerminal || "T3 Gates";
            compiledNotes = `Vehicle: ${vehicleCount}x ${vehicleType} | Dates: ${transferFromDate} to ${transferToDate} | Driver: ${hasDriver === "with-driver" ? "With Driver" : "Self-Drive (No Driver)"} | Notes: ${specialNotes}`;
        } else if (nameLower.includes("diving") || nameLower.includes("scuba") || serviceId === 53) {
            compiledRoomNumber = `Skill: ${divingSkill}`;
            compiledTableNumber = diveSpot;
            compiledNotes = `Divers: ${diversCount} | Gear: ${divingGear === "need-gear" ? "Need Rental Gear" : "Own Gear"} | Notes: ${specialNotes}`;
        } else if (nameLower.includes("welcome") || serviceId === 54) {
            compiledRoomNumber = deliveryRoom || "Lobby Desk";
            compiledTableNumber = winePref;
            compiledNotes = `Platter: ${platterPref} | Notes: ${specialNotes}`;
        } else {
            compiledNotes = specialNotes;
        }

        const config = {
            bookingDate,
            bookingTime,
            roomNumber: compiledRoomNumber,
            tableNumber: compiledTableNumber,
            specialNotes: compiledNotes,
        };

        // Persist config in localStorage
        localStorage.setItem(`serviceConfig_${serviceId}`, JSON.stringify(config));
        
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gold-300/10 animate-scale-up text-left text-xs flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-navy-500 text-white p-5 flex justify-between items-center relative">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gold-300 flex items-center gap-1">
                            <FaSlidersH /> Service Customizer
                        </span>
                        <h3 className="text-base font-bold font-display uppercase tracking-wider mt-0.5 pr-8">{serviceName}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer absolute right-4 top-4"
                    >
                        <FaTimes className="text-base" />
                    </button>
                </div>

                {/* Content Area */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-navy-500">
                    
                    {/* General Schedule Date & Time */}
                    <div className="grid grid-cols-2 gap-4 bg-navy-50/40 p-4 rounded-2xl border border-navy-100/30">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1 flex items-center gap-1">
                                <FaCalendarAlt className="text-gold-500" /> Booking Date
                            </label>
                            <input
                                type="date"
                                required
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-white border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">
                                Preferred Time
                            </label>
                            <select
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full bg-white border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 font-medium cursor-pointer"
                            >
                                <option value="09:00">Morning (09:00 AM)</option>
                                <option value="12:00">Noon (12:00 PM)</option>
                                <option value="15:00">Afternoon (03:00 PM)</option>
                                <option value="18:00">Evening (06:00 PM)</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditional Configuration Segments */}
                    
                    {/* 1. Yacht sunset cruise */}
                    {(serviceName.toLowerCase().includes("yacht") || serviceName.toLowerCase().includes("cruise") || serviceId === 50) && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Yacht Class</label>
                                    <select
                                        value={yachtClass}
                                        onChange={(e) => setYachtClass(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Royal Catamaran">Royal Catamaran (Standard)</option>
                                        <option value="Azure Majesty Yacht">Azure Majesty (Luxury)</option>
                                        <option value="Ocean Whisperer Cruiser">Ocean Whisperer (Private)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Boarding Port</label>
                                    <select
                                        value={boardingPort}
                                        onChange={(e) => setBoardingPort(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Marina Bay Marina">Marina Bay Marina</option>
                                        <option value="Grand Pier Terminal">Grand Pier Terminal</option>
                                        <option value="Azure Lagoon Harbor">Azure Lagoon Harbor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Guests Count</label>
                                    <div className="flex gap-2 items-center mt-1">
                                        {[2, 4, 8, 12].map(num => (
                                            <button
                                                type="button"
                                                key={num}
                                                onClick={() => setYachtGuests(num)}
                                                className={`flex-1 py-1.5 rounded-lg border font-bold text-center transition-colors cursor-pointer ${
                                                    yachtGuests === num 
                                                        ? "bg-gold-500 text-white border-gold-500" 
                                                        : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Catering Package</label>
                                    <select
                                        value={yachtCatering}
                                        onChange={(e) => setYachtCatering(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Champagne & Oysters">Champagne & Fresh Oysters</option>
                                        <option value="Gourmet Buffet">Gourmet Dinner Buffet</option>
                                        <option value="None">None (Beverages only)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Spa Treatments */}
                    {(serviceName.toLowerCase().includes("spa") || serviceId === 51) && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Therapeutic Package</label>
                                    <select
                                        value={spaVariant}
                                        onChange={(e) => setSpaVariant(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Hot Stone Massage">Hot Stone Deep Massage</option>
                                        <option value="Ocean Breeze Facial">Ocean Breeze Facial Scrub</option>
                                        <option value="Full Body Deep Tissue">Full Body Deep Tissue Therapy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Therapist Preference</label>
                                    <select
                                        value={therapistPref}
                                        onChange={(e) => setTherapistPref(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="No preference">No Preference</option>
                                        <option value="Female Therapist">Female Therapist</option>
                                        <option value="Male Therapist">Male Therapist</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1 flex items-center gap-1">
                                        <FaUserFriends /> Guests Count
                                    </label>
                                    <div className="flex gap-2 items-center mt-1">
                                        {[1, 2, 3, 4].map(num => (
                                            <button
                                                type="button"
                                                key={num}
                                                onClick={() => setSpaGuests(num)}
                                                className={`flex-1 py-1.5 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                                                    spaGuests === num 
                                                        ? "bg-gold-500 text-white border-gold-500" 
                                                        : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Duration</label>
                                    <select
                                        value={spaDuration}
                                        onChange={(e) => setSpaDuration(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="60 Minutes">60 Minutes Session</option>
                                        <option value="90 Minutes">90 Minutes Session</option>
                                        <option value="120 Minutes">120 Minutes Session</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Airport Transfers */}
                    {(serviceName.toLowerCase().includes("transfer") || serviceId === 52) && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Vehicle Type</label>
                                    <select
                                        value={vehicleType}
                                        onChange={(e) => setVehicleType(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Premium SUV">Premium SUV (Cadillac Escalade)</option>
                                        <option value="Luxury Sedan">Luxury Sedan (Mercedes S-Class)</option>
                                        <option value="Elite Van">Elite Van (Mercedes V-Class)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Service Mode</label>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setHasDriver("with-driver")}
                                            className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] text-center cursor-pointer transition-colors ${
                                                hasDriver === "with-driver"
                                                    ? "bg-gold-500 text-white border-gold-500"
                                                    : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                            }`}
                                        >
                                            With Driver
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHasDriver("self-drive")}
                                            className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] text-center cursor-pointer transition-colors ${
                                                hasDriver === "self-drive"
                                                    ? "bg-gold-500 text-white border-gold-500"
                                                    : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                            }`}
                                        >
                                            Self-Drive
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={transferFromDate}
                                        onChange={(e) => setTransferFromDate(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-2 focus:outline-none text-navy-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={transferToDate}
                                        onChange={(e) => setTransferToDate(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-2 focus:outline-none text-navy-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1">
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Vehicles Count</label>
                                    <div className="flex gap-1.5 items-center mt-1">
                                        {[1, 2, 3].map(num => (
                                            <button
                                                type="button"
                                                key={num}
                                                onClick={() => setVehicleCount(num)}
                                                className={`flex-1 py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                                                    vehicleCount === num 
                                                        ? "bg-gold-500 text-white border-gold-500" 
                                                        : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Flight Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. EK-502"
                                        value={flightNo}
                                        onChange={(e) => setFlightNo(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none text-navy-500"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Terminal</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. T3 Gate B"
                                        value={pickupTerminal}
                                        onChange={(e) => setPickupTerminal(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none text-navy-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. Scuba Diving */}
                    {(serviceName.toLowerCase().includes("diving") || serviceName.toLowerCase().includes("scuba") || serviceId === 53) && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1 flex items-center gap-1">
                                        <FaCompass className="text-gold-500" /> Dive Site
                                    </label>
                                    <select
                                        value={diveSpot}
                                        onChange={(e) => setDiveSpot(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Coral Reef Sanctuary">Coral Reef Sanctuary</option>
                                        <option value="Shipwreck Cove">Shipwreck Cove (Explorer)</option>
                                        <option value="Deep Blue Lagoon">Deep Blue Lagoon (Advanced)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Divers Count</label>
                                    <div className="flex gap-2 items-center mt-1">
                                        {[1, 2, 4, 6].map(num => (
                                            <button
                                                type="button"
                                                key={num}
                                                onClick={() => setDiversCount(num)}
                                                className={`flex-1 py-1.5 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                                                    diversCount === num 
                                                        ? "bg-gold-500 text-white border-gold-500" 
                                                        : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Experience Level</label>
                                    <select
                                        value={divingSkill}
                                        onChange={(e) => setDivingSkill(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Beginner">Beginner (Includes intro guide)</option>
                                        <option value="Intermediate">Intermediate (PADI Scuba Diver)</option>
                                        <option value="Advanced">Advanced (PADI Open Water)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Gear Preference</label>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setDivingGear("need-gear")}
                                            className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] text-center cursor-pointer transition-colors ${
                                                divingGear === "need-gear"
                                                    ? "bg-gold-500 text-white border-gold-500"
                                                    : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                            }`}
                                        >
                                            Need Gear
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDivingGear("have-gear")}
                                            className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] text-center cursor-pointer transition-colors ${
                                                divingGear === "have-gear"
                                                    ? "bg-gold-500 text-white border-gold-500"
                                                    : "bg-white border-navy-200 text-navy-500 hover:bg-gold-50"
                                            }`}
                                        >
                                            Own Gear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. In-room Welcome Pack */}
                    {(serviceName.toLowerCase().includes("welcome") || serviceId === 54) && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Beverage Selection</label>
                                    <select
                                        value={winePref}
                                        onChange={(e) => setWinePref(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Vintage Cabernet">Vintage Cabernet (Red Wine)</option>
                                        <option value="Premium Chardonnay">Premium Chardonnay (White Wine)</option>
                                        <option value="Non-Alcoholic Sparkling">Non-Alcoholic Sparkling Juice</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Platter Selection</label>
                                    <select
                                        value={platterPref}
                                        onChange={(e) => setPlatterPref(e.target.value)}
                                        className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none font-medium cursor-pointer text-navy-500"
                                    >
                                        <option value="Milk & Dark Truffles">Milk & Dark Chocolate Truffles</option>
                                        <option value="Organic Fruit Platter">Organic Fresh Fruit Platter</option>
                                        <option value="Assorted Savory Nuts">Assorted Savory Nuts & Cheese</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">Delivery Room Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter your Suite number (e.g. 302)"
                                    value={deliveryRoom}
                                    onChange={(e) => setDeliveryRoom(e.target.value)}
                                    className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none text-navy-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Special Requests General Notes textarea */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">
                            Additional Special Requests
                        </label>
                        <textarea
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="e.g. Flower decorations, early arrival notes, specific diet instructions..."
                            rows={3}
                            className="w-full bg-navy-50/50 border border-navy-200 rounded-xl p-3 focus:outline-none text-navy-500 resize-none"
                        />
                    </div>

                    {/* Price and Add button */}
                    <div className="border-t border-navy-50 pt-5 mt-2 flex justify-between items-center">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-navy-300">Total Price</span>
                            <h4 className="text-base font-extrabold text-accent-teal font-sans">₹ {newPrice || "Free"}</h4>
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
