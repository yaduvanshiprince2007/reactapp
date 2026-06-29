import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import hotelData from "../Data/hotelData.json";
import {
    FaUser, FaInfoCircle, FaSearch, FaLock, FaHotel,
    FaUtensils, FaConciergeBell, FaChair, FaTimes, FaCheck,
    FaPlus, FaBed, FaCalendarAlt, FaUserFriends, FaPhoneAlt
} from "react-icons/fa";

/* ─── Interfaces ─────────────────────────────────────────────────── */
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

interface DiningAllotment {
    id: string;
    tableNumber: string;
    guestName: string;
    phone?: string;
    refId?: string;
    covers: number;
    time: string;
    isWalkIn: boolean;
    specialNotes?: string;
}

interface RoomAssignForm {
    guestName: string;
    roomType: string;
    adults: number;
    kids: number;
    checkIn: string;
    checkOut: string;
    specialNotes: string;
}

const ROOM_TYPES = ["Standard Room", "Deluxe Room", "Suite", "Premium Suite", "Presidential Suite"];

/* ─── AutocompleteInput ──────────────────────────────────────────── */
interface AcProps {
    value: string;
    onChange: (v: string) => void;
    suggestions: string[];
    onSelect: (v: string) => void;
    placeholder?: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    extraHint?: string;
}
const AutocompleteInput = ({
    value, onChange, suggestions, onSelect, placeholder, open, setOpen, containerRef, extraHint
}: AcProps) => (
    <div className="relative" ref={containerRef}>
        <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300 text-[10px]" />
            <input
                type="text"
                value={value}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder || "Search guest name…"}
                className="w-full pl-8 pr-8 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
            {value && (
                <button
                    onMouseDown={e => { e.preventDefault(); onChange(""); setOpen(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
                >
                    <FaTimes className="text-[9px]" />
                </button>
            )}
        </div>
        {open && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy-100 rounded-xl shadow-xl z-40 overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                    <li key={i}>
                        <button
                            onMouseDown={() => { onSelect(s); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs text-navy-500 hover:bg-gold-50 hover:text-gold-700 transition-colors flex items-center gap-2"
                        >
                            <FaUser className="text-gold-400 text-[9px] shrink-0" />
                            <span className="truncate">{s}</span>
                        </button>
                    </li>
                ))}
            </ul>
        )}
        {open && value.trim() !== "" && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy-100 rounded-xl shadow-xl z-40 px-4 py-3 text-[10px] text-navy-400 italic">
                {extraHint || "No existing guest — will be added as new entry"}
            </div>
        )}
    </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const QrScanner = () => {
    const isStaff = localStorage.getItem("loggedInUserRole") === "staff";
    const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);

    /* Toast */
    const [toastMsg, setToastMsg] = useState("");
    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3500);
    };

    /* Tabs */
    const [scannerTab, setScannerTab] = useState<"verify" | "occupancy" | "dining">("verify");

    /* Verify tab */
    const [selectedRefId, setSelectedRefId] = useState("");
    const [scannedRecord, setScannedRecord] = useState<BookingRecord | null>(null);
    const [otpInput, setOtpInput] = useState("");
    const [roomUnlocked, setRoomUnlocked] = useState(false);
    const [diningUnlocked, setDiningUnlocked] = useState(false);
    const [serviceUnlocked, setServiceUnlocked] = useState(false);
    const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

    /* Occupancy tab */
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [activeRoomNumber, setActiveRoomNumber] = useState<string | null>(null);

    /* Room assignment form */
    const defaultForm: RoomAssignForm = {
        guestName: "", roomType: "Standard Room",
        adults: 1, kids: 0,
        checkIn: new Date().toISOString().split("T")[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        specialNotes: ""
    };
    const [roomForm, setRoomForm] = useState<RoomAssignForm>(defaultForm);
    const [roomAcOpen, setRoomAcOpen] = useState(false);
    const roomAcRef = useRef<HTMLDivElement>(null);

    /* Dining allotment tab */
    const [diningAllotments, setDiningAllotments] = useState<DiningAllotment[]>([]);
    const [diningMode, setDiningMode] = useState<"hotel" | "walkin">("hotel");

    // Hotel guest mode
    const [hotelGuestInput, setHotelGuestInput] = useState("");
    const [hotelGuestAcOpen, setHotelGuestAcOpen] = useState(false);
    const hotelGuestRef = useRef<HTMLDivElement>(null);
    const [hotelTableNum, setHotelTableNum] = useState("");
    const [hotelCovers, setHotelCovers] = useState(2);

    // Walk-in mode
    const [walkInName, setWalkInName] = useState("");
    const [walkInPhone, setWalkInPhone] = useState("");
    const [walkInTable, setWalkInTable] = useState("");
    const [walkInCovers, setWalkInCovers] = useState(2);
    const [walkInNotes, setWalkInNotes] = useState("");

    /* Load data */
    useEffect(() => {
        const staticList: BookingRecord[] = hotelData.pastBookings;
        const customRaw = localStorage.getItem("customBookings");
        const customList: BookingRecord[] = customRaw ? JSON.parse(customRaw) : [];
        setAllBookings([...customList, ...staticList]);

        const allotRaw = localStorage.getItem("diningTableAllotments");
        setDiningAllotments(allotRaw ? JSON.parse(allotRaw) : []);
    }, [statusUpdateSuccess]);

    /* OTP auto-match */
    useEffect(() => {
        if (!scannedRecord) return;
        const code = otpInput.trim();
        if (code.length < 4) return;
        if (scannedRecord.otpRoom && code === scannedRecord.otpRoom) {
            setRoomUnlocked(true); setOtpInput("");
            triggerToast("🏨 Stays & Rooms department details successfully unlocked!");
        }
        if (scannedRecord.otpDining && code === scannedRecord.otpDining) {
            setDiningUnlocked(true); setOtpInput("");
            triggerToast("🍽 Gourmet Kitchen & Dining orders successfully unlocked!");
        }
        if (scannedRecord.otpService && code === scannedRecord.otpService) {
            setServiceUnlocked(true); setOtpInput("");
            triggerToast("🛎 Premium Service bookings successfully unlocked!");
        }
    }, [otpInput, scannedRecord]);

    /* Close autocomplete on outside click */
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (roomAcRef.current && !roomAcRef.current.contains(e.target as Node)) setRoomAcOpen(false);
            if (hotelGuestRef.current && !hotelGuestRef.current.contains(e.target as Node)) setHotelGuestAcOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    /* All guest names for autocomplete */
    const allGuestNames = [...new Set(allBookings.map(b => b.guestName))];
    const filterNames = (q: string) =>
        q.trim() === "" ? allGuestNames.slice(0, 8)
            : allGuestNames.filter(n => n.toLowerCase().includes(q.toLowerCase())).slice(0, 8);

    /* ── Handlers ────────────────────────────────────────────────── */
    const handleSimulateScan = (refId: string) => {
        setSelectedRefId(refId); setOtpInput("");
        setRoomUnlocked(false); setDiningUnlocked(false); setServiceUnlocked(false);
        setScannedRecord(allBookings.find(b => b.refId.toUpperCase() === refId.toUpperCase()) || null);
    };

    const handleMarkItemStatus = (itemIndex: number, newStatus: string) => {
        if (!scannedRecord) return;
        const updatedItems = [...scannedRecord.items];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], status: newStatus };
        let overallStatus = scannedRecord.status;
        const allDone = updatedItems.every(i => ["Checked-Out", "Completed & Delivered", "Completed", "Cancelled"].includes(i.status || ""));
        if (allDone) overallStatus = "Completed & Served";
        else if (updatedItems.some(i => ["Checked-In", "Preparing", "In-Progress"].includes(i.status || "")))
            overallStatus = "In-Progress & Serving";
        setScannedRecord({ ...scannedRecord, status: overallStatus, items: updatedItems });
        const raw = localStorage.getItem("customBookings");
        if (raw) {
            const list: BookingRecord[] = JSON.parse(raw);
            const idx = list.findIndex(b => b.refId.toUpperCase() === scannedRecord.refId.toUpperCase());
            if (idx !== -1) {
                list[idx].items = updatedItems;
                list[idx].status = overallStatus;
                localStorage.setItem("customBookings", JSON.stringify(list));
                setStatusUpdateSuccess(p => !p);
                triggerToast(`"${updatedItems[itemIndex].name}" → ${newStatus}`);
                return;
            }
        }
        triggerToast(`Simulated update: "${updatedItems[itemIndex].name}" → ${newStatus}`);
    };

    /* Room click — open form pre-filled with existing data */
    const handleRoomClick = (roomStr: string) => {
        setActiveRoomNumber(roomStr);
        const existing = occupancyMap[roomStr];
        setRoomForm({
            guestName: existing?.guestName || "",
            roomType: "Standard Room",
            adults: 1, kids: 0,
            checkIn: new Date().toISOString().split("T")[0],
            checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            specialNotes: ""
        });
        setRoomAcOpen(false);
    };

    /* Save room assignment */
    const handleSaveRoomAssign = () => {
        if (!activeRoomNumber || !roomForm.guestName.trim()) {
            triggerToast("⚠️ Guest name is required to assign the room."); return;
        }
        const raw = localStorage.getItem("customBookings");
        const list: BookingRecord[] = raw ? JSON.parse(raw) : [];

        // Try to update existing booking that already has this room
        let updated = false;
        for (const b of list) {
            for (const item of b.items) {
                if (item.itemType === "room" && item.details?.roomNumber === activeRoomNumber) {
                    b.guestName = roomForm.guestName.trim();
                    if (item.details) {
                        item.details.adults = roomForm.adults;
                        item.details.kids = roomForm.kids;
                        item.details.checkIn = roomForm.checkIn;
                        item.details.checkOut = roomForm.checkOut;
                        item.details.specialNotes = roomForm.specialNotes;
                    }
                    updated = true;
                }
            }
        }

        // Try to find booking by guest name and attach room
        if (!updated) {
            const byName = list.find(b => b.guestName.toLowerCase() === roomForm.guestName.trim().toLowerCase());
            if (byName) {
                const unassigned = byName.items.find(i => i.itemType === "room" && !i.details?.roomNumber);
                if (unassigned) {
                    if (!unassigned.details) unassigned.details = {};
                    unassigned.details.roomNumber = activeRoomNumber;
                    unassigned.details.adults = roomForm.adults;
                    unassigned.details.kids = roomForm.kids;
                    unassigned.details.checkIn = roomForm.checkIn;
                    unassigned.details.checkOut = roomForm.checkOut;
                    unassigned.status = "Checked-In";
                    updated = true;
                }
            }
        }

        // Create brand-new record
        if (!updated) {
            list.unshift({
                refId: `STAFF-${activeRoomNumber}-${Date.now()}`,
                date: new Date().toISOString().split("T")[0],
                status: "In-Progress & Serving",
                guestName: roomForm.guestName.trim(),
                email: "staff-assigned@grandazure.com",
                total: 0,
                items: [{
                    name: `${roomForm.roomType} — Room ${activeRoomNumber}`,
                    itemType: "room",
                    quantity: 1,
                    price: 0,
                    status: "Checked-In",
                    details: {
                        roomNumber: activeRoomNumber,
                        adults: roomForm.adults,
                        kids: roomForm.kids,
                        checkIn: roomForm.checkIn,
                        checkOut: roomForm.checkOut,
                        specialNotes: roomForm.specialNotes
                    }
                }]
            });
        }

        localStorage.setItem("customBookings", JSON.stringify(list));
        setStatusUpdateSuccess(p => !p);
        triggerToast(`✅ Room ${activeRoomNumber} assigned to ${roomForm.guestName.trim()}`);
        setActiveRoomNumber(null);
        setRoomForm(defaultForm);
    };

    /* Dining allotment — hotel guest */
    const handleAllotHotelGuest = () => {
        if (!hotelGuestInput.trim() || !hotelTableNum.trim()) {
            triggerToast("⚠️ Please enter guest name and table number."); return;
        }
        if (diningAllotments.some(a => a.tableNumber === hotelTableNum.trim())) {
            triggerToast(`⚠️ Table ${hotelTableNum} is already allotted!`); return;
        }
        const matched = allBookings.find(b => b.guestName.toLowerCase() === hotelGuestInput.trim().toLowerCase());
        const entry: DiningAllotment = {
            id: `DT-${Date.now()}`,
            tableNumber: hotelTableNum.trim(),
            guestName: hotelGuestInput.trim(),
            refId: matched?.refId,
            covers: hotelCovers,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            isWalkIn: false
        };
        const updated = [...diningAllotments, entry];
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast(`🍽 Table ${hotelTableNum} allotted to hotel guest ${hotelGuestInput.trim()}`);
        setHotelGuestInput(""); setHotelTableNum(""); setHotelCovers(2);
    };

    /* Dining allotment — walk-in */
    const handleAllotWalkIn = () => {
        if (!walkInName.trim() || !walkInTable.trim()) {
            triggerToast("⚠️ Please enter guest name and table number."); return;
        }
        if (diningAllotments.some(a => a.tableNumber === walkInTable.trim())) {
            triggerToast(`⚠️ Table ${walkInTable} is already allotted!`); return;
        }
        const entry: DiningAllotment = {
            id: `DT-${Date.now()}`,
            tableNumber: walkInTable.trim(),
            guestName: walkInName.trim(),
            phone: walkInPhone.trim() || undefined,
            covers: walkInCovers,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            isWalkIn: true,
            specialNotes: walkInNotes.trim() || undefined
        };
        const updated = [...diningAllotments, entry];
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast(`🚶 Walk-in Table ${walkInTable} allotted to ${walkInName.trim()}`);
        setWalkInName(""); setWalkInPhone(""); setWalkInTable(""); setWalkInCovers(2); setWalkInNotes("");
    };

    const handleRemoveDining = (id: string) => {
        const updated = diningAllotments.filter(a => a.id !== id);
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast("🗑 Dining table allotment cleared.");
    };

    /* ── Access Guard ────────────────────────────────────────────── */
    if (!isStaff) {
        return (
            <div className="pt-36 pb-20 px-6 text-center min-h-screen bg-gradient-to-b from-navy-50/20 to-white flex flex-col justify-center items-center">
                <div className="bg-white p-8 max-w-sm rounded-3xl border border-red-200 text-center shadow-lg">
                    <span className="text-4xl mb-4 inline-block">🔒</span>
                    <h2 className="text-xl font-bold text-navy-500 mb-2">Access Denied</h2>
                    <p className="text-xs text-navy-400 font-light leading-relaxed mb-6">
                        This dashboard is strictly restricted to Grand Azure concierge and kitchen staff.
                    </p>
                    <Link to="/login" className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all w-full block shadow-md shadow-gold-500/20">
                        Login as Staff
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Occupancy map ───────────────────────────────────────────── */
    const occupancyMap: Record<string, { guestName: string; refId: string; status: string }> = {};
    allBookings.forEach(b => {
        b.items.forEach(item => {
            if (item.itemType === "room" && item.details?.roomNumber) {
                const r = item.details.roomNumber.trim();
                if (item.status !== "Cancelled" && b.status !== "Cancelled by Guest") {
                    occupancyMap[r] = { guestName: b.guestName, refId: b.refId, status: item.status || "Reserved (Future)" };
                }
            }
        });
    });

    const activeStaysCount = Object.values(occupancyMap).filter(x => x.status === "Checked-In").length;
    const reservedStaysCount = Object.values(occupancyMap).filter(x => x.status === "Reserved (Future)").length;
    const vacantCount = 300 - activeStaysCount - reservedStaysCount;

    const hasRooms = scannedRecord?.items.some(i => i.itemType === "room");
    const hasDining = scannedRecord?.items.some(i => i.itemType === "menu");
    const hasServices = scannedRecord?.items.some(i => i.itemType === "service");

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            {/* Toast */}
            {toastMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-navy-500 text-white border border-gold-300/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold">
                    <span className="text-gold-500">✦</span><span>{toastMsg}</span>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 leading-tight">
                        Concierge Operations Desk
                    </h1>
                    <p className="text-navy-400 max-w-md mx-auto text-sm font-light">
                        Manage room allocations, verify guest itineraries, and handle dining table allotments.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-navy-100 pb-4 mb-8 justify-center flex-wrap">
                    {([
                        { key: "verify" as const, label: "🔑 OTP Itinerary Desk" },
                        { key: "occupancy" as const, label: "🏨 Room Occupancy" },
                        { key: "dining" as const, label: "🍽 Dining Allotment" },
                    ]).map(tab => (
                        <button key={tab.key} onClick={() => setScannerTab(tab.key)}
                            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${scannerTab === tab.key
                                ? "bg-navy-500 text-white shadow-md shadow-navy-500/10"
                                : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ════════════════════════════════════════════════════
                    TAB 1 — OTP Itinerary Desk
                ════════════════════════════════════════════════════ */}
                {scannerTab === "verify" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                        {/* Left */}
                        <div className="lg:col-span-4 bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md flex flex-col">
                            <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FaSearch className="text-gold-500" /> Active Tickets
                            </h3>
                            <div className="mb-6">
                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-2">Select Guest Reservation ID</label>
                                <select value={selectedRefId} onChange={e => handleSimulateScan(e.target.value)}
                                    className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 text-xs font-medium cursor-pointer">
                                    <option value="">-- Choose Itinerary ID --</option>
                                    {allBookings.map(b => (
                                        <option key={b.refId} value={b.refId}>{b.refId} ({b.guestName})</option>
                                    ))}
                                </select>
                            </div>
                            {scannedRecord && (
                                <div className="border-t border-navy-50 pt-6 flex flex-col gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-2">Enter Guest Security OTP</label>
                                        <input type="text" maxLength={4} value={otpInput}
                                            onChange={e => setOtpInput(e.target.value.replace(/\D/g, ""))}
                                            placeholder="••••"
                                            className="w-full text-center text-2xl font-black tracking-widest bg-navy-50 border-2 border-navy-100 rounded-xl py-3 text-navy-500 focus:outline-none focus:border-gold-500 transition-all" />
                                        <p className="text-[10px] text-navy-300 mt-2 font-light">Matching OTP auto-unlocks the department.</p>
                                    </div>
                                    <div className="bg-navy-50/60 border border-navy-100/10 rounded-2xl p-4 text-[10px] text-navy-400 flex flex-col gap-1.5">
                                        <span className="font-bold text-navy-500 uppercase tracking-widest text-[9px] mb-1">Testing Codes</span>
                                        {scannedRecord.otpRoom && <p>🏨 Room OTP: <strong className="text-gold-600 select-all">{scannedRecord.otpRoom}</strong></p>}
                                        {scannedRecord.otpDining && <p>🍽 Dining OTP: <strong className="text-gold-600 select-all">{scannedRecord.otpDining}</strong></p>}
                                        {scannedRecord.otpService && <p>🛎 Service OTP: <strong className="text-gold-600 select-all">{scannedRecord.otpService}</strong></p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {scannedRecord ? (
                                <>
                                    <div className="bg-white border border-gold-300/10 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
                                        <div>
                                            <span className="text-[9px] uppercase font-bold text-navy-300">Active Guest Ticket</span>
                                            <h3 className="text-base font-bold text-navy-500 flex items-center gap-1.5 mt-0.5">
                                                <FaUser className="text-gold-500 text-xs" /> {scannedRecord.guestName}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-black bg-navy-50 border border-navy-100 px-3 py-1 rounded-full">{scannedRecord.refId}</span>
                                    </div>

                                    {/* Rooms */}
                                    {hasRooms && (
                                        <div className="bg-white border border-gold-300/10 rounded-3xl shadow-md overflow-hidden">
                                            <div className="bg-navy-500 text-white px-6 py-4 flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <FaHotel className="text-gold-300" /> Stays & Rooms
                                                </span>
                                                <span className="text-[10px] font-bold">{roomUnlocked ? "🔓 UNLOCKED" : "🔒 LOCKED"}</span>
                                            </div>
                                            {roomUnlocked ? (
                                                <div className="p-6 flex flex-col gap-4 animate-fade-in text-xs text-navy-400">
                                                    {scannedRecord.items.filter(i => i.itemType === "room").map((item, idx) => (
                                                        <div key={idx} className="pb-4 border-b border-navy-50 last:border-0 last:pb-0 flex flex-col gap-2">
                                                            <div className="flex justify-between font-bold text-navy-500 text-sm">
                                                                <span>{item.name} (x{item.quantity})</span>
                                                                <span>₹ {(item.price * item.quantity).toLocaleString()}</span>
                                                            </div>
                                                            {item.details && (
                                                                <p>🗓 <strong>Stay:</strong> {item.details.checkIn} to {item.details.checkOut} &nbsp;|&nbsp;
                                                                    🚪 <strong>Room:</strong> {item.details.roomNumber || "Pending"} &nbsp;|&nbsp;
                                                                    👤 <strong>Guests:</strong> {item.details.adults} Adults, {item.details.kids || 0} Kids</p>
                                                            )}
                                                            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                                                <span className="bg-gold-50 text-gold-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-gold-300/15">
                                                                    {item.status || "Reserved (Future)"}
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    {item.status === "Reserved (Future)" && (
                                                                        <button onClick={() => handleMarkItemStatus(scannedRecord.items.indexOf(item), "Checked-In")}
                                                                            className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Check-In</button>
                                                                    )}
                                                                    {item.status === "Checked-In" && (
                                                                        <button onClick={() => handleMarkItemStatus(scannedRecord.items.indexOf(item), "Checked-Out")}
                                                                            className="bg-navy-500 hover:bg-navy-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Check-Out</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-navy-50/20 text-navy-400 flex flex-col items-center gap-2">
                                                    <FaLock className="text-xl text-gold-500 animate-pulse" />
                                                    <p className="text-[10px] font-light">Enter Room OTP to unlock stay details.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Dining */}
                                    {hasDining && (
                                        <div className="bg-white border border-gold-300/10 rounded-3xl shadow-md overflow-hidden">
                                            <div className="bg-navy-500 text-white px-6 py-4 flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <FaUtensils className="text-gold-300" /> Kitchen & Dining
                                                </span>
                                                <span className="text-[10px] font-bold">{diningUnlocked ? "🔓 UNLOCKED" : "🔒 LOCKED"}</span>
                                            </div>
                                            {diningUnlocked ? (
                                                <div className="p-6 flex flex-col gap-4 animate-fade-in text-xs text-navy-400">
                                                    {scannedRecord.items.filter(i => i.itemType === "menu").map((item, idx) => (
                                                        <div key={idx} className="pb-4 border-b border-navy-50 last:border-0 last:pb-0 flex flex-col gap-2">
                                                            <div className="flex justify-between font-bold text-navy-500 text-sm">
                                                                <span>{item.name} (x{item.quantity})</span>
                                                                <span>₹ {(item.price * item.quantity).toLocaleString()}</span>
                                                            </div>
                                                            {item.details && (
                                                                <div className="bg-navy-50/40 p-2.5 rounded-xl border border-navy-100/10">
                                                                    <p>🛎 <strong>Delivery:</strong> {item.details.diningType === "room-service"
                                                                        ? `Room Service → Room #${item.details.roomNumber}`
                                                                        : `Dine-In Table #${item.details.tableNumber} at ${item.details.diningTime}`}</p>
                                                                    {item.details.specialNotes && <p>✍ <span className="text-gold-600">"{item.details.specialNotes}"</span></p>}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                                                <span className="bg-gold-50 text-gold-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-gold-300/15">{item.status || "In Progress"}</span>
                                                                <div className="flex gap-2">
                                                                    {item.status === "In Progress" && <button onClick={() => handleMarkItemStatus(scannedRecord.items.indexOf(item), "Preparing")} className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Start Prep</button>}
                                                                    {(item.status === "In Progress" || item.status === "Preparing") && <button onClick={() => handleMarkItemStatus(scannedRecord.items.indexOf(item), "Completed & Delivered")} className="bg-accent-teal hover:bg-teal-700 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Mark Delivered</button>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-navy-50/20 text-navy-400 flex flex-col items-center gap-2">
                                                    <FaLock className="text-xl text-gold-500 animate-pulse" />
                                                    <p className="text-[10px] font-light">Enter Dining OTP to unlock order details.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Services */}
                                    {hasServices && (
                                        <div className="bg-white border border-gold-300/10 rounded-3xl shadow-md overflow-hidden">
                                            <div className="bg-navy-500 text-white px-6 py-4 flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <FaConciergeBell className="text-gold-300" /> Concierge Services
                                                </span>
                                                <span className="text-[10px] font-bold">{serviceUnlocked ? "🔓 UNLOCKED" : "🔒 LOCKED"}</span>
                                            </div>
                                            {serviceUnlocked ? (
                                                <div className="p-6 flex flex-col gap-4 animate-fade-in text-xs text-navy-400">
                                                    {scannedRecord.items.filter(i => i.itemType === "service").map((item, idx) => (
                                                        <div key={idx} className="pb-4 border-b border-navy-50 last:border-0 last:pb-0 flex flex-col gap-2">
                                                            <div className="flex justify-between font-bold text-navy-500 text-sm">
                                                                <span>{item.name} (x{item.quantity})</span>
                                                                <span>₹ {(item.price * item.quantity).toLocaleString()}</span>
                                                            </div>
                                                            {item.details && (
                                                                <div className="space-y-1">
                                                                    <p>🗓 <strong>Schedule:</strong> {item.details.bookingDate} at {item.details.bookingTime}</p>
                                                                    <p>📝 <strong>Notes:</strong> "{item.details.specialNotes || "None"}"</p>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                                                <span className="bg-gold-50 text-gold-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-gold-300/15">{item.status || "Booked (Scheduled)"}</span>
                                                                <div className="flex gap-2">
                                                                    {item.status === "Booked (Scheduled)" && <button onClick={() => handleMarkItemStatus(scannedRecord.items.indexOf(item), "In-Progress")} className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Begin</button>}
                                                                    {(item.status === "Booked (Scheduled)" || item.status === "In-Progress") && <button onClick={() => handleMarkItemStatus(scannedRecord.items.indexOf(item), "Completed")} className="bg-accent-teal hover:bg-teal-700 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer">Complete</button>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-navy-50/20 text-navy-400 flex flex-col items-center gap-2">
                                                    <FaLock className="text-xl text-gold-500 animate-pulse" />
                                                    <p className="text-[10px] font-light">Enter Service OTP to unlock concierge details.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-navy-50 border border-navy-100 rounded-3xl p-12 text-center text-navy-400">
                                    <FaInfoCircle className="text-4xl mx-auto mb-3 text-gold-500 animate-bounce" />
                                    <h3 className="text-sm font-bold text-navy-500 mb-1">Waiting for Ticket Selection</h3>
                                    <p className="text-xs font-light max-w-xs mx-auto">Choose a Reference ID from the left panel to begin.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    TAB 2 — Room Occupancy  +  Click-to-Assign
                ════════════════════════════════════════════════════ */}
                {scannerTab === "occupancy" && (
                    <div className="animate-fade-in">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
                                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Vacant (Available)</span>
                                <span className="text-3xl font-black text-teal-800 mt-2 block">{vacantCount} <span className="text-xs font-normal text-teal-600">/ 300</span></span>
                            </div>
                            <div className="bg-gold-50 border border-gold-100 rounded-2xl p-5">
                                <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider">Checked-In</span>
                                <span className="text-3xl font-black text-gold-800 mt-2 block">{activeStaysCount} <span className="text-xs font-normal text-gold-600">Occupied</span></span>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Reserved / Future</span>
                                <span className="text-3xl font-black text-blue-800 mt-2 block">{reservedStaysCount} <span className="text-xs font-normal text-blue-600">Booked</span></span>
                            </div>
                        </div>

                        {/* Floor selection */}
                        <div className="mb-6">
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-3">Select Floor</label>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 10 }).map((_, i) => {
                                    const fl = i + 1;
                                    return (
                                        <button key={fl}
                                            onClick={() => { setSelectedFloor(fl); setActiveRoomNumber(null); }}
                                            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedFloor === fl
                                                ? "bg-gold-500 text-white shadow-md shadow-gold-500/10"
                                                : "bg-navy-50 hover:bg-navy-100 text-navy-600 border border-navy-100/30"}`}>
                                            Floor {fl}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Two-column layout: Grid + Assignment Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-navy-50 pt-6">
                            {/* Room grid */}
                            <div className="lg:col-span-7">
                                <h4 className="text-xs uppercase font-bold text-navy-400 tracking-wider mb-4">
                                    Floor {selectedFloor} — Rooms {selectedFloor}01–{selectedFloor}30
                                    <span className="ml-2 text-[9px] text-navy-300 normal-case font-normal">(click any room to assign/inspect)</span>
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                    {Array.from({ length: 30 }).map((_, idx) => {
                                        const n = idx + 1;
                                        const roomStr = `${selectedFloor}${n < 10 ? "0" : ""}${n}`;
                                        const occ = occupancyMap[roomStr];
                                        let bg = "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100";
                                        let lbl = "Vacant";
                                        if (occ) {
                                            if (occ.status === "Checked-In") { bg = "bg-gold-100 border-gold-300 text-gold-800 hover:bg-gold-200"; lbl = "In"; }
                                            else if (occ.status === "Checked-Out") { bg = "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"; lbl = "Out"; }
                                            else { bg = "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"; lbl = "Rsvd"; }
                                        }
                                        return (
                                            <button key={roomStr}
                                                onClick={() => handleRoomClick(roomStr)}
                                                className={`border rounded-xl p-3 flex flex-col items-center transition-all cursor-pointer ${bg} ${activeRoomNumber === roomStr ? "ring-2 ring-navy-500 scale-[1.04] shadow-md" : ""}`}>
                                                <span className="text-xs font-black">{roomStr}</span>
                                                <span className="text-[8px] uppercase mt-1 font-bold">{lbl}</span>
                                                {occ && <span className="text-[7px] truncate w-full text-center mt-0.5 opacity-70">{occ.guestName.split(" ")[0]}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Assignment Panel */}
                            <div className="lg:col-span-5">
                                {activeRoomNumber ? (
                                    <div className="bg-white border border-navy-100 rounded-3xl p-5 shadow-md flex flex-col gap-4 sticky top-24">
                                        {/* Panel header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[9px] uppercase text-navy-400 font-bold">Room Assignment</span>
                                                <h4 className="text-base font-black text-navy-500 font-display flex items-center gap-2 mt-0.5">
                                                    🚪 Room {activeRoomNumber}
                                                    {occupancyMap[activeRoomNumber] ? (
                                                        <span className="text-[9px] bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full border border-gold-200 font-bold">Occupied</span>
                                                    ) : (
                                                        <span className="text-[9px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200 font-bold">Vacant</span>
                                                    )}
                                                </h4>
                                            </div>
                                            <button onClick={() => setActiveRoomNumber(null)} className="text-navy-300 hover:text-navy-500 cursor-pointer p-1">
                                                <FaTimes />
                                            </button>
                                        </div>

                                        {/* Guest Name */}
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                                <FaUser className="text-gold-500 text-[9px]" /> Guest Name *
                                            </label>
                                            <AutocompleteInput
                                                value={roomForm.guestName}
                                                onChange={v => setRoomForm(f => ({ ...f, guestName: v }))}
                                                suggestions={filterNames(roomForm.guestName)}
                                                onSelect={v => { setRoomForm(f => ({ ...f, guestName: v })); setRoomAcOpen(false); }}
                                                placeholder="Type or search guest name…"
                                                open={roomAcOpen}
                                                setOpen={setRoomAcOpen}
                                                containerRef={roomAcRef}
                                                extraHint="New name — will create a walk-in record"
                                            />
                                        </div>

                                        {/* Room Type */}
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                                <FaBed className="text-gold-500 text-[9px]" /> Room Type
                                            </label>
                                            <select value={roomForm.roomType}
                                                onChange={e => setRoomForm(f => ({ ...f, roomType: e.target.value }))}
                                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer">
                                                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>

                                        {/* Guests row */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                                    <FaUserFriends className="text-gold-500 text-[9px]" /> Adults
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setRoomForm(f => ({ ...f, adults: Math.max(1, f.adults - 1) }))}
                                                        className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold text-sm hover:bg-navy-100 cursor-pointer">−</button>
                                                    <span className="flex-1 text-center text-sm font-black text-navy-500">{roomForm.adults}</span>
                                                    <button onClick={() => setRoomForm(f => ({ ...f, adults: Math.min(10, f.adults + 1) }))}
                                                        className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold text-sm hover:bg-navy-100 cursor-pointer">+</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Kids</label>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setRoomForm(f => ({ ...f, kids: Math.max(0, f.kids - 1) }))}
                                                        className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold text-sm hover:bg-navy-100 cursor-pointer">−</button>
                                                    <span className="flex-1 text-center text-sm font-black text-navy-500">{roomForm.kids}</span>
                                                    <button onClick={() => setRoomForm(f => ({ ...f, kids: Math.min(10, f.kids + 1) }))}
                                                        className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold text-sm hover:bg-navy-100 cursor-pointer">+</button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dates row */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1">
                                                    <FaCalendarAlt className="text-[9px] text-gold-500" /> Check-In
                                                </label>
                                                <input type="date" value={roomForm.checkIn}
                                                    onChange={e => setRoomForm(f => ({ ...f, checkIn: e.target.value }))}
                                                    className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1">
                                                    <FaCalendarAlt className="text-[9px] text-gold-500" /> Check-Out
                                                </label>
                                                <input type="date" value={roomForm.checkOut}
                                                    onChange={e => setRoomForm(f => ({ ...f, checkOut: e.target.value }))}
                                                    className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer" />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Special Notes</label>
                                            <textarea rows={2} value={roomForm.specialNotes}
                                                onChange={e => setRoomForm(f => ({ ...f, specialNotes: e.target.value }))}
                                                placeholder="Any special requests, accessibility needs…"
                                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none transition-all" />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-1">
                                            <button onClick={handleSaveRoomAssign}
                                                disabled={!roomForm.guestName.trim()}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-gold-500/20">
                                                <FaCheck className="text-[10px]" /> Assign Room
                                            </button>
                                            <button onClick={() => setActiveRoomNumber(null)}
                                                className="px-4 py-2.5 border border-navy-100 rounded-xl text-xs font-bold text-navy-500 hover:bg-navy-50 cursor-pointer transition-all">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-navy-50/60 border border-dashed border-navy-200 rounded-3xl p-10 text-center text-navy-400 flex flex-col items-center gap-3">
                                        <FaHotel className="text-3xl text-gold-300" />
                                        <div>
                                            <p className="text-xs font-bold text-navy-500">Click Any Room</p>
                                            <p className="text-[10px] font-light mt-1">Select a room from the grid to assign a guest or view its current status.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════
                    TAB 3 — Dining Table Allotment
                ════════════════════════════════════════════════════ */}
                {scannerTab === "dining" && (
                    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Allotment Form */}
                        <div className="lg:col-span-5 bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md flex flex-col gap-5">
                            <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest flex items-center gap-2">
                                <FaChair className="text-gold-500" /> Allot Dining Table
                            </h3>

                            {/* Guest Type Toggle */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-2">Guest Type</label>
                                <div className="grid grid-cols-2 gap-2 bg-navy-50/60 p-1 rounded-xl">
                                    <button
                                        onClick={() => setDiningMode("hotel")}
                                        className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${diningMode === "hotel"
                                            ? "bg-navy-500 text-white shadow-md"
                                            : "text-navy-500 hover:bg-navy-100"}`}>
                                        <FaHotel className="text-[10px]" /> Hotel Guest
                                    </button>
                                    <button
                                        onClick={() => setDiningMode("walkin")}
                                        className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${diningMode === "walkin"
                                            ? "bg-gold-500 text-white shadow-md"
                                            : "text-navy-500 hover:bg-navy-100"}`}>
                                        🚶 Walk-In Guest
                                    </button>
                                </div>
                                <p className="text-[10px] text-navy-300 mt-2 font-light">
                                    {diningMode === "hotel"
                                        ? "Search from existing hotel bookings — auto-links reservation record."
                                        : "For outside diners — enter their details manually."}
                                </p>
                            </div>

                            {/* ── Hotel Guest Form ── */}
                            {diningMode === "hotel" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                                            Search Hotel Guest *
                                        </label>
                                        <AutocompleteInput
                                            value={hotelGuestInput}
                                            onChange={setHotelGuestInput}
                                            suggestions={filterNames(hotelGuestInput)}
                                            onSelect={v => { setHotelGuestInput(v); setHotelGuestAcOpen(false); }}
                                            placeholder="Type guest name or booking name…"
                                            open={hotelGuestAcOpen}
                                            setOpen={setHotelGuestAcOpen}
                                            containerRef={hotelGuestRef}
                                            extraHint="Not found in hotel records — switch to Walk-In mode"
                                        />
                                        {hotelGuestInput.trim() && (() => {
                                            const matched = allBookings.find(b => b.guestName.toLowerCase() === hotelGuestInput.trim().toLowerCase());
                                            return matched ? (
                                                <div className="mt-2 bg-teal-50 border border-teal-100 rounded-xl p-2.5 text-[10px] text-teal-700">
                                                    <p className="font-bold">✅ Matched: {matched.guestName}</p>
                                                    <p className="font-light mt-0.5">Ref: {matched.refId} · Status: {matched.status}</p>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>

                                    {/* Also allow picking from dropdown */}
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Or Select Booking</label>
                                        <select value={allBookings.find(b => b.guestName.toLowerCase() === hotelGuestInput.trim().toLowerCase())?.refId || ""}
                                            onChange={e => {
                                                const b = allBookings.find(x => x.refId === e.target.value);
                                                if (b) setHotelGuestInput(b.guestName);
                                            }}
                                            className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 text-xs text-navy-500 font-medium focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer">
                                            <option value="">-- Browse all bookings --</option>
                                            {allBookings.map(b => (
                                                <option key={b.refId} value={b.refId}>{b.refId} — {b.guestName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Table Number *</label>
                                            <input type="text" value={hotelTableNum}
                                                onChange={e => setHotelTableNum(e.target.value)}
                                                placeholder="e.g. T-07"
                                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                            {diningAllotments.some(a => a.tableNumber === hotelTableNum.trim()) && hotelTableNum.trim() && (
                                                <p className="text-[10px] text-red-500 mt-1 font-semibold">⚠ Already allotted</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Covers</label>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setHotelCovers(c => Math.max(1, c - 1))} className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer">−</button>
                                                <span className="flex-1 text-center text-sm font-black text-navy-500">{hotelCovers}</span>
                                                <button onClick={() => setHotelCovers(c => Math.min(20, c + 1))} className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer">+</button>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={handleAllotHotelGuest}
                                        disabled={!hotelGuestInput.trim() || !hotelTableNum.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-navy-500 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-navy-500/20">
                                        <FaPlus className="text-[10px]" /> Allot Table for Hotel Guest
                                    </button>
                                </>
                            )}

                            {/* ── Walk-In Guest Form ── */}
                            {diningMode === "walkin" && (
                                <>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                                            <FaUser className="inline text-[9px] text-gold-500 mr-1" /> Guest Name *
                                        </label>
                                        <input type="text" value={walkInName}
                                            onChange={e => setWalkInName(e.target.value)}
                                            placeholder="Walk-in guest name…"
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                                            <FaPhoneAlt className="inline text-[9px] text-gold-500 mr-1" /> Phone Number <span className="font-normal text-navy-300">(optional)</span>
                                        </label>
                                        <input type="tel" value={walkInPhone}
                                            onChange={e => setWalkInPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Table Number *</label>
                                            <input type="text" value={walkInTable}
                                                onChange={e => setWalkInTable(e.target.value)}
                                                placeholder="e.g. T-03"
                                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                            {diningAllotments.some(a => a.tableNumber === walkInTable.trim()) && walkInTable.trim() && (
                                                <p className="text-[10px] text-red-500 mt-1 font-semibold">⚠ Already allotted</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Covers</label>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setWalkInCovers(c => Math.max(1, c - 1))} className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer">−</button>
                                                <span className="flex-1 text-center text-sm font-black text-navy-500">{walkInCovers}</span>
                                                <button onClick={() => setWalkInCovers(c => Math.min(20, c + 1))} className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer">+</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Special Notes</label>
                                        <textarea rows={2} value={walkInNotes}
                                            onChange={e => setWalkInNotes(e.target.value)}
                                            placeholder="Allergies, preferences, occasion…"
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none transition-all" />
                                    </div>

                                    <button onClick={handleAllotWalkIn}
                                        disabled={!walkInName.trim() || !walkInTable.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-gold-500/20">
                                        <FaPlus className="text-[10px]" /> Allot Table for Walk-In Guest
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Right: Live Table Board */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest flex items-center gap-2">
                                    <FaUtensils className="text-gold-500" /> Live Table Board
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 font-bold">
                                        {diningAllotments.filter(a => !a.isWalkIn).length} Hotel
                                    </span>
                                    <span className="text-[10px] bg-gold-50 text-gold-700 border border-gold-200 rounded-full px-3 py-1 font-bold">
                                        {diningAllotments.filter(a => a.isWalkIn).length} Walk-In
                                    </span>
                                </div>
                            </div>

                            {diningAllotments.length === 0 ? (
                                <div className="bg-white border border-navy-100 rounded-3xl p-12 text-center text-navy-400">
                                    <FaChair className="text-4xl mx-auto mb-3 text-gold-300" />
                                    <h4 className="text-sm font-bold text-navy-500 mb-1">No Tables Allotted Yet</h4>
                                    <p className="text-xs font-light max-w-xs mx-auto">Use the form to assign dining tables for hotel guests or walk-in visitors.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {diningAllotments.map(allot => (
                                        <div key={allot.id}
                                            className="bg-white border border-navy-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative group">
                                            {/* Top row */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl text-white ${allot.isWalkIn ? "bg-gold-500" : "bg-navy-500"}`}>
                                                        🪑 {allot.tableNumber}
                                                    </span>
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${allot.isWalkIn
                                                        ? "bg-gold-50 text-gold-700 border-gold-200"
                                                        : "bg-teal-50 text-teal-700 border-teal-200"}`}>
                                                        {allot.isWalkIn ? "🚶 Walk-In" : "🏨 Hotel Guest"}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveDining(allot.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 cursor-pointer transition-all p-1 shrink-0"
                                                    title="Remove">
                                                    <FaTimes className="text-xs" />
                                                </button>
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-navy-500 flex items-center gap-1.5">
                                                    <FaUser className="text-gold-400 text-[10px]" /> {allot.guestName}
                                                </p>
                                                {allot.phone && <p className="text-[10px] text-navy-400 mt-0.5">📞 {allot.phone}</p>}
                                                {allot.refId && <p className="text-[10px] text-navy-400 mt-0.5">Ref: <span className="font-semibold text-navy-500">{allot.refId}</span></p>}
                                                {allot.specialNotes && <p className="text-[10px] text-gold-600 mt-0.5 italic">"{allot.specialNotes}"</p>}
                                            </div>

                                            <div className="flex items-center gap-4 text-[10px] text-navy-400 pt-1 border-t border-navy-50">
                                                <span>👥 {allot.covers} {allot.covers === 1 ? "cover" : "covers"}</span>
                                                <span>⏰ {allot.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default QrScanner;
