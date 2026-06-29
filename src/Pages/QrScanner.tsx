import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import hotelData from "../Data/hotelData.json";
import {
    FaUser, FaInfoCircle, FaSearch, FaLock, FaHotel,
    FaUtensils, FaConciergeBell, FaChair, FaPlus, FaPhoneAlt, FaCheck,
} from "react-icons/fa";

/* ─── shared components ─────────────────────────────────────────── */
import AutocompleteInput from "../Components/Staff/AutocompleteInput";
import StatsCard from "../Components/Staff/StatsCard";
import DiningTableCard from "../Components/Staff/DiningTableCard";
import RoomAssignPanel from "../Components/Staff/RoomAssignPanel";

/* ─── types & constants ─────────────────────────────────────────── */
import {
    type BookingRecord,
    type BookingItem,
    type DiningAllotment,
    type RoomAssignForm,
    type RoomDocument,
    TOTAL_DINING_TABLES,
} from "../Components/Staff/staffTypes";

/* ══════════════════════════════════════════════════════════════════
   Main staff portal component — orchestrates tabs and shared state
══════════════════════════════════════════════════════════════════ */
const QrScanner = () => {
    const isStaff = localStorage.getItem("loggedInUserRole") === "staff";

    /* ── toast ────────────────────────────────────────────────── */
    const [toastMsg, setToastMsg] = useState("");
    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3500);
    };

    /* ── shared data ──────────────────────────────────────────── */
    const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);
    const [diningAllotments, setDiningAllotments] = useState<DiningAllotment[]>([]);
    const [roomDocuments, setRoomDocuments] = useState<RoomDocument[]>([]);
    const [dataVersion, setDataVersion] = useState(0);
    const bump = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const staticList: BookingRecord[] = hotelData.pastBookings;
        const customRaw = localStorage.getItem("customBookings");
        const customList: BookingRecord[] = customRaw ? JSON.parse(customRaw) : [];
        setAllBookings([...customList, ...staticList]);

        const allotRaw = localStorage.getItem("diningTableAllotments");
        setDiningAllotments(allotRaw ? JSON.parse(allotRaw) : []);

        const docsRaw = localStorage.getItem("roomDocuments");
        setRoomDocuments(docsRaw ? JSON.parse(docsRaw) : []);
    }, [dataVersion]);

    /* ── tabs ─────────────────────────────────────────────────── */
    const [scannerTab, setScannerTab] = useState<"verify" | "occupancy" | "dining">("verify");

    /* ── verify tab ──────────────────────────────────────────── */
    const [selectedRefId, setSelectedRefId] = useState("");
    const [scannedRecord, setScannedRecord] = useState<BookingRecord | null>(null);
    const [otpInput, setOtpInput] = useState("");
    const [roomUnlocked, setRoomUnlocked] = useState(false);
    const [diningUnlocked, setDiningUnlocked] = useState(false);
    const [serviceUnlocked, setServiceUnlocked] = useState(false);

    useEffect(() => {
        if (!scannedRecord) return;
        const code = otpInput.trim();
        if (code.length < 4) return;
        if (scannedRecord.otpRoom && code === scannedRecord.otpRoom) {
            setRoomUnlocked(true); setOtpInput("");
            triggerToast("🏨 Stays & Rooms department unlocked!");
        }
        if (scannedRecord.otpDining && code === scannedRecord.otpDining) {
            setDiningUnlocked(true); setOtpInput("");
            triggerToast("🍽 Kitchen & Dining orders unlocked!");
        }
        if (scannedRecord.otpService && code === scannedRecord.otpService) {
            setServiceUnlocked(true); setOtpInput("");
            triggerToast("🛎 Concierge Services unlocked!");
        }
    }, [otpInput, scannedRecord]);

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
        if (updatedItems.every(i => ["Checked-Out", "Completed & Delivered", "Completed", "Cancelled"].includes(i.status || "")))
            overallStatus = "Completed & Served";
        else if (updatedItems.some(i => ["Checked-In", "Preparing", "In-Progress"].includes(i.status || "")))
            overallStatus = "In-Progress & Serving";
        setScannedRecord({ ...scannedRecord, status: overallStatus, items: updatedItems });

        const raw = localStorage.getItem("customBookings");
        if (raw) {
            const list: BookingRecord[] = JSON.parse(raw);
            const idx = list.findIndex(b => b.refId.toUpperCase() === scannedRecord.refId.toUpperCase());
            if (idx !== -1) {
                list[idx] = { ...list[idx], items: updatedItems, status: overallStatus };
                localStorage.setItem("customBookings", JSON.stringify(list));
                bump();
                triggerToast(`"${updatedItems[itemIndex].name}" → ${newStatus}`);
                return;
            }
        }
        triggerToast(`Simulated: "${updatedItems[itemIndex].name}" → ${newStatus}`);
    };

    /* ── occupancy tab ───────────────────────────────────────── */
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [activeRoomNumber, setActiveRoomNumber] = useState<string | null>(null);
    const [roomFormInit, setRoomFormInit] = useState<RoomAssignForm>({
        guestName: "", roomType: "Standard Room", adults: 1, kids: 0,
        checkIn: new Date().toISOString().split("T")[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        specialNotes: "",
    });
    const [isRoomUpdate, setIsRoomUpdate] = useState(false);

    const allGuestNames = [...new Set(allBookings.map(b => b.guestName))];

    const handleRoomClick = (roomStr: string) => {
        setActiveRoomNumber(roomStr);
        const raw = localStorage.getItem("customBookings");
        const list: BookingRecord[] = raw ? JSON.parse(raw) : [];
        const allB = [...list, ...(hotelData.pastBookings as BookingRecord[])];
        for (const b of allB) {
            for (const item of b.items) {
                if (item.itemType === "room" && item.details?.roomNumber?.trim() === roomStr
                    && item.status !== "Cancelled" && b.status !== "Cancelled by Guest") {
                    setIsRoomUpdate(true);
                    setRoomFormInit({
                        guestName:    b.guestName,
                        roomType:     item.name || "Standard Room",
                        adults:       item.details?.adults ?? 1,
                        kids:         item.details?.kids ?? 0,
                        checkIn:      item.details?.checkIn || new Date().toISOString().split("T")[0],
                        checkOut:     item.details?.checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
                        specialNotes: item.details?.specialNotes || "",
                    });
                    return;
                }
            }
        }
        setIsRoomUpdate(false);
        setRoomFormInit({
            guestName: "", roomType: "Standard Room", adults: 1, kids: 0,
            checkIn: new Date().toISOString().split("T")[0],
            checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            specialNotes: "",
        });
    };

    const handleSaveRoomAssign = (form: RoomAssignForm) => {
        if (!activeRoomNumber || !form.guestName.trim()) return;
        const raw = localStorage.getItem("customBookings");
        const list: BookingRecord[] = raw ? JSON.parse(raw) : [];
        let updated = false;
        for (const b of list) {
            for (const item of b.items) {
                if (item.itemType === "room" && item.details?.roomNumber === activeRoomNumber) {
                    b.guestName = form.guestName.trim();
                    if (item.details) Object.assign(item.details, { adults: form.adults, kids: form.kids, checkIn: form.checkIn, checkOut: form.checkOut, specialNotes: form.specialNotes });
                    updated = true;
                }
            }
        }
        if (!updated) {
            const byName = list.find(b => b.guestName.toLowerCase() === form.guestName.trim().toLowerCase());
            if (byName) {
                const slot = byName.items.find(i => i.itemType === "room" && !i.details?.roomNumber);
                if (slot) {
                    if (!slot.details) slot.details = {};
                    Object.assign(slot.details, { roomNumber: activeRoomNumber, adults: form.adults, kids: form.kids, checkIn: form.checkIn, checkOut: form.checkOut, specialNotes: form.specialNotes });
                    slot.status = "Checked-In";
                    updated = true;
                }
            }
        }
        if (!updated) {
            list.unshift({
                refId: `STAFF-${activeRoomNumber}-${Date.now()}`,
                date: new Date().toISOString().split("T")[0],
                status: "In-Progress & Serving",
                guestName: form.guestName.trim(),
                email: "staff-assigned@grandazure.com",
                total: 0,
                items: [{
                    name: `${form.roomType} — Room ${activeRoomNumber}`,
                    itemType: "room", quantity: 1, price: 0, status: "Checked-In",
                    details: { roomNumber: activeRoomNumber, adults: form.adults, kids: form.kids, checkIn: form.checkIn, checkOut: form.checkOut, specialNotes: form.specialNotes },
                }],
            });
        }
        localStorage.setItem("customBookings", JSON.stringify(list));
        bump();
        triggerToast(updated
            ? `✏️ Room ${activeRoomNumber} updated for ${form.guestName.trim()}`
            : `✅ Room ${activeRoomNumber} assigned to ${form.guestName.trim()}`);
        setActiveRoomNumber(null);
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
        const file = e.target.files?.[0];
        if (!file || !activeRoomNumber) return;
        const doc: RoomDocument = {
            id: `DOC-${Date.now()}`,
            roomNumber: activeRoomNumber,
            guestName: roomFormInit.guestName || "Unknown",
            fileName: file.name, fileType: file.type,
            uploadTime: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            category, size: `${(file.size / 1024).toFixed(1)} KB`,
        };
        const updated = [...roomDocuments, doc];
        setRoomDocuments(updated);
        localStorage.setItem("roomDocuments", JSON.stringify(updated));
        triggerToast(`📄 "${file.name}" uploaded as ${category}`);
    };

    const handleDocRemove = (id: string) => {
        const updated = roomDocuments.filter(d => d.id !== id);
        setRoomDocuments(updated);
        localStorage.setItem("roomDocuments", JSON.stringify(updated));
        triggerToast("🗑 Document removed.");
    };

    /* ── dining allotment tab ─────────────────────────────────── */
    const [diningMode, setDiningMode] = useState<"hotel" | "walkin">("hotel");

    const [hotelGuestInput, setHotelGuestInput] = useState("");
    const [hotelGuestAcOpen, setHotelGuestAcOpen] = useState(false);
    const hotelGuestRef = useRef<HTMLDivElement>(null);
    const [hotelTableNum, setHotelTableNum] = useState("");
    const [hotelCovers, setHotelCovers] = useState(2);

    const [walkInName, setWalkInName] = useState("");
    const [walkInPhone, setWalkInPhone] = useState("");
    const [walkInTable, setWalkInTable] = useState("");
    const [walkInCovers, setWalkInCovers] = useState(2);
    const [walkInNotes, setWalkInNotes] = useState("");

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (hotelGuestRef.current && !hotelGuestRef.current.contains(e.target as Node))
                setHotelGuestAcOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const saveDining = (entry: DiningAllotment) => {
        if (diningAllotments.some(a => a.tableNumber === entry.tableNumber)) {
            triggerToast(`⚠️ Table ${entry.tableNumber} is already allotted!`); return;
        }
        const updated = [...diningAllotments, entry];
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast(`🍽 Table ${entry.tableNumber} allotted to ${entry.guestName}`);
    };

    const handleAllotHotelGuest = () => {
        if (!hotelGuestInput.trim() || !hotelTableNum.trim()) { triggerToast("⚠️ Enter guest name and table number."); return; }
        const matched = allBookings.find(b => b.guestName.toLowerCase() === hotelGuestInput.trim().toLowerCase());
        saveDining({ id: `DT-${Date.now()}`, tableNumber: hotelTableNum.trim(), guestName: hotelGuestInput.trim(), refId: matched?.refId, covers: hotelCovers, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), isWalkIn: false });
        setHotelGuestInput(""); setHotelTableNum(""); setHotelCovers(2);
    };

    const handleAllotWalkIn = () => {
        if (!walkInName.trim() || !walkInTable.trim()) { triggerToast("⚠️ Enter guest name and table number."); return; }
        saveDining({ id: `DT-${Date.now()}`, tableNumber: walkInTable.trim(), guestName: walkInName.trim(), phone: walkInPhone.trim() || undefined, covers: walkInCovers, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), isWalkIn: true, specialNotes: walkInNotes.trim() || undefined });
        setWalkInName(""); setWalkInPhone(""); setWalkInTable(""); setWalkInCovers(2); setWalkInNotes("");
    };

    const handleRemoveDining = (id: string) => {
        const updated = diningAllotments.filter(a => a.id !== id);
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast("🗑 Table allotment removed.");
    };

    const handleUpdateDining = (id: string, changes: Partial<DiningAllotment>) => {
        const updated = diningAllotments.map(a => a.id === id ? { ...a, ...changes } : a);
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast(`✏️ Table ${changes.tableNumber || ""} updated.`);
    };

    /* ── occupancy map (derived) ─────────────────────────────── */
    const occupancyMap: Record<string, { guestName: string; refId: string; status: string }> = {};
    allBookings.forEach(b => {
        b.items.forEach(item => {
            if (item.itemType === "room" && item.details?.roomNumber) {
                const r = item.details.roomNumber.trim();
                if (item.status !== "Cancelled" && b.status !== "Cancelled by Guest")
                    occupancyMap[r] = { guestName: b.guestName, refId: b.refId, status: item.status || "Reserved (Future)" };
            }
        });
    });
    const checkedIn = Object.values(occupancyMap).filter(x => x.status === "Checked-In").length;
    const reserved  = Object.values(occupancyMap).filter(x => x.status === "Reserved (Future)").length;
    const vacant    = 300 - checkedIn - reserved;

    const hasRooms    = scannedRecord?.items.some(i => i.itemType === "room");
    const hasDining   = scannedRecord?.items.some(i => i.itemType === "menu");
    const hasServices = scannedRecord?.items.some(i => i.itemType === "service");

    /* ── access guard ────────────────────────────────────────── */
    if (!isStaff) return (
        <div className="pt-36 pb-20 px-6 text-center min-h-screen bg-gradient-to-b from-navy-50/20 to-white flex flex-col justify-center items-center">
            <div className="bg-white p-8 max-w-sm rounded-3xl border border-red-200 text-center shadow-lg">
                <span className="text-4xl mb-4 inline-block">🔒</span>
                <h2 className="text-xl font-bold text-navy-500 mb-2">Access Denied</h2>
                <p className="text-xs text-navy-400 font-light leading-relaxed mb-6">
                    This dashboard is restricted to Grand Azure concierge and kitchen staff.
                </p>
                <Link to="/login" className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all w-full block shadow-md shadow-gold-500/20">
                    Login as Staff
                </Link>
            </div>
        </div>
    );

    /* ══════════════════════════════════════════════════════════
       Render
    ══════════════════════════════════════════════════════════ */
    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            {/* Toast */}
            {toastMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-navy-500 text-white border border-gold-300/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold">
                    <span className="text-gold-500">✦</span><span>{toastMsg}</span>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Page header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 leading-tight">
                        Concierge Operations Desk
                    </h1>
                    <p className="text-navy-400 max-w-md mx-auto text-sm font-light">
                        Manage room allocations, verify guest itineraries, and handle dining table allotments.
                    </p>
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-2 border-b border-navy-100 pb-4 mb-8 justify-center flex-wrap">
                    {([
                        { key: "verify"    as const, label: "🔑 OTP Itinerary Desk" },
                        { key: "occupancy" as const, label: "🏨 Room Occupancy" },
                        { key: "dining"    as const, label: "🍽 Dining Allotment" },
                    ]).map(tab => (
                        <button key={tab.key} onClick={() => setScannerTab(tab.key)}
                            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${scannerTab === tab.key ? "bg-navy-500 text-white shadow-md shadow-navy-500/10" : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ════════════════════════════════════════════════
                    TAB 1 — OTP Itinerary Desk
                ════════════════════════════════════════════════ */}
                {scannerTab === "verify" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                        {/* Left: lookup */}
                        <div className="lg:col-span-4 bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md flex flex-col">
                            <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FaSearch className="text-gold-500" /> Active Tickets
                            </h3>
                            <div className="mb-6">
                                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-2">Select Reservation ID</label>
                                <select value={selectedRefId} onChange={e => handleSimulateScan(e.target.value)}
                                    className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 text-xs text-navy-500 font-medium focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer">
                                    <option value="">-- Choose Itinerary ID --</option>
                                    {allBookings.map(b => <option key={b.refId} value={b.refId}>{b.refId} ({b.guestName})</option>)}
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
                                        {scannedRecord.otpRoom    && <p>🏨 Room OTP:    <strong className="text-gold-600 select-all">{scannedRecord.otpRoom}</strong></p>}
                                        {scannedRecord.otpDining  && <p>🍽 Dining OTP:  <strong className="text-gold-600 select-all">{scannedRecord.otpDining}</strong></p>}
                                        {scannedRecord.otpService && <p>🛎 Service OTP: <strong className="text-gold-600 select-all">{scannedRecord.otpService}</strong></p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: itinerary segments */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {scannedRecord ? (
                                <>
                                    {/* Guest badge */}
                                    <div className="bg-white border border-gold-300/10 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
                                        <div>
                                            <span className="text-[9px] uppercase font-bold text-navy-300">Active Guest Ticket</span>
                                            <h3 className="text-base font-bold text-navy-500 flex items-center gap-1.5 mt-0.5">
                                                <FaUser className="text-gold-500 text-xs" /> {scannedRecord.guestName}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-black bg-navy-50 border border-navy-100 px-3 py-1 rounded-full">{scannedRecord.refId}</span>
                                    </div>

                                    {/* Rooms section */}
                                    {hasRooms && <ItinerarySection title="Stays & Rooms" icon={<FaHotel className="text-gold-300" />} unlocked={roomUnlocked} lockedHint="Enter Room OTP to unlock stay details.">
                                        {scannedRecord.items.filter(i => i.itemType === "room").map((item, idx) => (
                                            <ItemRow key={idx} item={item} onStatusChange={s => handleMarkItemStatus(scannedRecord.items.indexOf(item), s)}
                                                allowedTransitions={[
                                                    { from: "Reserved (Future)", to: "Checked-In",  label: "Check-In" },
                                                    { from: "Checked-In",        to: "Checked-Out", label: "Check-Out" },
                                                ]}
                                            >
                                                {item.details && (
                                                    <p className="text-[10px] text-navy-400">
                                                        🗓 {item.details.checkIn} → {item.details.checkOut} &nbsp;|&nbsp;
                                                        🚪 Room: {item.details.roomNumber || "Pending"} &nbsp;|&nbsp;
                                                        👤 {item.details.adults} Adults, {item.details.kids || 0} Kids
                                                    </p>
                                                )}
                                            </ItemRow>
                                        ))}
                                    </ItinerarySection>}

                                    {/* Dining section */}
                                    {hasDining && <ItinerarySection title="Kitchen & Dining" icon={<FaUtensils className="text-gold-300" />} unlocked={diningUnlocked} lockedHint="Enter Dining OTP to reveal order details.">
                                        {scannedRecord.items.filter(i => i.itemType === "menu").map((item, idx) => (
                                            <ItemRow key={idx} item={item} onStatusChange={s => handleMarkItemStatus(scannedRecord.items.indexOf(item), s)}
                                                allowedTransitions={[
                                                    { from: "In Progress", to: "Preparing",            label: "Start Prep" },
                                                    { from: "Preparing",   to: "Completed & Delivered", label: "Mark Delivered" },
                                                    { from: "In Progress", to: "Completed & Delivered", label: "Mark Delivered" },
                                                ]}
                                            >
                                                {item.details && (
                                                    <div className="bg-navy-50/40 p-2.5 rounded-xl border border-navy-100/10 text-[10px] text-navy-400 mt-1">
                                                        <p>🛎 {item.details.diningType === "room-service"
                                                            ? `Room Service → Room #${item.details.roomNumber}`
                                                            : `Dine-In Table #${item.details.tableNumber} at ${item.details.diningTime}`}</p>
                                                        {item.details.specialNotes && <p>✍ <span className="text-gold-600">"{item.details.specialNotes}"</span></p>}
                                                    </div>
                                                )}
                                            </ItemRow>
                                        ))}
                                    </ItinerarySection>}

                                    {/* Services section */}
                                    {hasServices && <ItinerarySection title="Concierge Services" icon={<FaConciergeBell className="text-gold-300" />} unlocked={serviceUnlocked} lockedHint="Enter Service OTP to unlock concierge details.">
                                        {scannedRecord.items.filter(i => i.itemType === "service").map((item, idx) => (
                                            <ItemRow key={idx} item={item} onStatusChange={s => handleMarkItemStatus(scannedRecord.items.indexOf(item), s)}
                                                allowedTransitions={[
                                                    { from: "Booked (Scheduled)", to: "In-Progress", label: "Begin" },
                                                    { from: "In-Progress",        to: "Completed",   label: "Complete" },
                                                    { from: "Booked (Scheduled)", to: "Completed",   label: "Complete" },
                                                ]}
                                            >
                                                {item.details && (
                                                    <p className="text-[10px] text-navy-400">
                                                        🗓 {item.details.bookingDate} at {item.details.bookingTime} &nbsp;|&nbsp;
                                                        📝 "{item.details.specialNotes || "None"}"
                                                    </p>
                                                )}
                                            </ItemRow>
                                        ))}
                                    </ItinerarySection>}
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

                {/* ════════════════════════════════════════════════
                    TAB 2 — Room Occupancy
                ════════════════════════════════════════════════ */}
                {scannerTab === "occupancy" && (
                    <div className="animate-fade-in">
                        {/* Stats row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <StatsCard label="Vacant (Available)" value={vacant}    color="teal"  suffix={`/ 300 Rooms`} />
                            <StatsCard label="Checked-In"         value={checkedIn} color="gold"  suffix="Occupied" />
                            <StatsCard label="Reserved / Future"  value={reserved}  color="blue"  suffix="Booked" />
                        </div>

                        {/* Floor pills */}
                        <div className="mb-6">
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-3">Select Floor</label>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 10 }).map((_, i) => {
                                    const fl = i + 1;
                                    return (
                                        <button key={fl} onClick={() => { setSelectedFloor(fl); setActiveRoomNumber(null); }}
                                            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedFloor === fl ? "bg-gold-500 text-white shadow-md shadow-gold-500/10" : "bg-navy-50 hover:bg-navy-100 text-navy-600 border border-navy-100/30"}`}>
                                            Floor {fl}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Room grid + assign panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-navy-50 pt-6">
                            {/* Room grid */}
                            <div className="lg:col-span-7">
                                <h4 className="text-xs uppercase font-bold text-navy-400 tracking-wider mb-4">
                                    Floor {selectedFloor} — Rooms {selectedFloor}01–{selectedFloor}30
                                    <span className="ml-2 text-[9px] text-navy-300 normal-case font-normal">(click a room to assign / update)</span>
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                    {Array.from({ length: 30 }).map((_, idx) => {
                                        const n = idx + 1;
                                        const roomStr = `${selectedFloor}${n < 10 ? "0" : ""}${n}`;
                                        const occ = occupancyMap[roomStr];
                                        let bg = "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100";
                                        let lbl = "Vacant";
                                        if (occ) {
                                            if (occ.status === "Checked-In")        { bg = "bg-gold-100 border-gold-300 text-gold-800 hover:bg-gold-200";   lbl = "In"; }
                                            else if (occ.status === "Checked-Out")  { bg = "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"; lbl = "Out"; }
                                            else                                     { bg = "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200";   lbl = "Rsvd"; }
                                        }
                                        return (
                                            <button key={roomStr} onClick={() => handleRoomClick(roomStr)}
                                                className={`border rounded-xl p-3 flex flex-col items-center transition-all cursor-pointer ${bg} ${activeRoomNumber === roomStr ? "ring-2 ring-navy-500 scale-[1.04] shadow-md" : ""}`}>
                                                <span className="text-xs font-black">{roomStr}</span>
                                                <span className="text-[8px] uppercase mt-1 font-bold">{lbl}</span>
                                                {occ && <span className="text-[7px] truncate w-full text-center mt-0.5 opacity-70">{occ.guestName.split(" ")[0]}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Room assign panel */}
                            <div className="lg:col-span-5">
                                {activeRoomNumber ? (
                                    <RoomAssignPanel
                                        roomNumber={activeRoomNumber}
                                        initialForm={roomFormInit}
                                        isUpdate={isRoomUpdate}
                                        documents={roomDocuments}
                                        guestNameSuggestions={allGuestNames}
                                        isOccupied={!!occupancyMap[activeRoomNumber]}
                                        onSave={handleSaveRoomAssign}
                                        onClose={() => setActiveRoomNumber(null)}
                                        onDocUpload={handleDocUpload}
                                        onDocRemove={handleDocRemove}
                                    />
                                ) : (
                                    <div className="bg-navy-50/60 border border-dashed border-navy-200 rounded-3xl p-10 text-center text-navy-400 flex flex-col items-center gap-3">
                                        <FaHotel className="text-3xl text-gold-300" />
                                        <div>
                                            <p className="text-xs font-bold text-navy-500">Click Any Room</p>
                                            <p className="text-[10px] font-light mt-1">Select a room from the grid to assign or update a guest.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════
                    TAB 3 — Dining Table Allotment
                ════════════════════════════════════════════════ */}
                {scannerTab === "dining" && (
                    <div className="animate-fade-in">
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <StatsCard label="Total Tables"    value={TOTAL_DINING_TABLES} color="navy" />
                            <StatsCard label="Occupied"        value={diningAllotments.length} color="red" />
                            <StatsCard label="Available"       value={Math.max(0, TOTAL_DINING_TABLES - diningAllotments.length)} color="teal" />
                            <StatsCard label="Walk-Ins Today"  value={diningAllotments.filter(a => a.isWalkIn).length} color="gold" />
                        </div>

                        {/* Visual floor map */}
                        <div className="bg-white border border-navy-100 rounded-3xl p-5 mb-8 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-navy-400 tracking-wider mb-3">
                                Restaurant Floor Map ({TOTAL_DINING_TABLES} Tables)
                            </p>
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                {Array.from({ length: TOTAL_DINING_TABLES }).map((_, i) => {
                                    const tNum = `T-${String(i + 1).padStart(2, "0")}`;
                                    const allot = diningAllotments.find(a => a.tableNumber === tNum);
                                    return (
                                        <div key={tNum} title={allot ? `${allot.guestName} (${allot.covers} covers)` : "Available"}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                                                allot ? (allot.isWalkIn ? "bg-gold-100 border-gold-300 text-gold-800" : "bg-red-100 border-red-200 text-red-800")
                                                      : "bg-teal-50 border-teal-200 text-teal-700"}`}>
                                            <FaChair className="text-[10px] mb-0.5" />
                                            <span className="text-[8px] font-black">{tNum}</span>
                                            {allot && <span className="text-[7px] truncate w-full text-center font-bold mt-0.5">{allot.guestName.split(" ")[0]}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-[10px] text-navy-400 flex-wrap">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-teal-100 border border-teal-300 rounded" /> Available</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded" /> Hotel Guest</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gold-100 border border-gold-300 rounded" /> Walk-In</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Allotment form */}
                            <div className="lg:col-span-5 bg-white border border-gold-300/10 rounded-3xl p-6 shadow-md flex flex-col gap-5">
                                <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest flex items-center gap-2">
                                    <FaChair className="text-gold-500" /> Allot Dining Table
                                </h3>

                                {/* Mode toggle */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-2">Guest Type</label>
                                    <div className="grid grid-cols-2 gap-2 bg-navy-50/60 p-1 rounded-xl">
                                        <button onClick={() => setDiningMode("hotel")}
                                            className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${diningMode === "hotel" ? "bg-navy-500 text-white shadow-md" : "text-navy-500 hover:bg-navy-100"}`}>
                                            <FaHotel className="text-[10px]" /> Hotel Guest
                                        </button>
                                        <button onClick={() => setDiningMode("walkin")}
                                            className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${diningMode === "walkin" ? "bg-gold-500 text-white shadow-md" : "text-navy-500 hover:bg-navy-100"}`}>
                                            🚶 Walk-In Guest
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-navy-300 mt-2 font-light">
                                        {diningMode === "hotel" ? "Search from existing hotel bookings — auto-links reservation." : "For outside diners — enter their details manually."}
                                    </p>
                                </div>

                                {/* Hotel guest form */}
                                {diningMode === "hotel" && (<>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Search Hotel Guest *</label>
                                        <AutocompleteInput
                                            value={hotelGuestInput}
                                            onChange={setHotelGuestInput}
                                            suggestions={(hotelGuestInput.trim() === ""
                                                ? allGuestNames.slice(0, 8)
                                                : allGuestNames.filter(n => n.toLowerCase().includes(hotelGuestInput.toLowerCase())).slice(0, 8))}
                                            onSelect={v => { setHotelGuestInput(v); setHotelGuestAcOpen(false); }}
                                            placeholder="Type guest name or booking name…"
                                            open={hotelGuestAcOpen}
                                            setOpen={setHotelGuestAcOpen}
                                            containerRef={hotelGuestRef}
                                            extraHint="Not found in hotel records — switch to Walk-In"
                                        />
                                        {hotelGuestInput.trim() && (() => {
                                            const m = allBookings.find(b => b.guestName.toLowerCase() === hotelGuestInput.trim().toLowerCase());
                                            return m ? (
                                                <div className="mt-2 bg-teal-50 border border-teal-100 rounded-xl p-2.5 text-[10px] text-teal-700">
                                                    <p className="font-bold">✅ {m.guestName}</p>
                                                    <p className="font-light mt-0.5">Ref: {m.refId} · {m.status}</p>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Or Select Booking</label>
                                        <select
                                            value={allBookings.find(b => b.guestName.toLowerCase() === hotelGuestInput.trim().toLowerCase())?.refId || ""}
                                            onChange={e => { const b = allBookings.find(x => x.refId === e.target.value); if (b) setHotelGuestInput(b.guestName); }}
                                            className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 text-xs text-navy-500 font-medium focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer">
                                            <option value="">-- Browse all bookings --</option>
                                            {allBookings.map(b => <option key={b.refId} value={b.refId}>{b.refId} — {b.guestName}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Table Number *</label>
                                            <input value={hotelTableNum} onChange={e => setHotelTableNum(e.target.value)} placeholder="e.g. T-07"
                                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                            {diningAllotments.some(a => a.tableNumber === hotelTableNum.trim()) && hotelTableNum.trim() && <p className="text-[10px] text-red-500 mt-1 font-semibold">⚠ Already allotted</p>}
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
                                    <button onClick={handleAllotHotelGuest} disabled={!hotelGuestInput.trim() || !hotelTableNum.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-navy-500 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-navy-500/20">
                                        <FaPlus className="text-[10px]" /> Allot Table for Hotel Guest
                                    </button>
                                </>)}

                                {/* Walk-in form */}
                                {diningMode === "walkin" && (<>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Guest Name *</label>
                                        <input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Walk-in guest name…"
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                                            <FaPhoneAlt className="inline text-[9px] text-gold-500 mr-1" /> Phone <span className="font-normal text-navy-300">(optional)</span>
                                        </label>
                                        <input value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} placeholder="+91 98765 43210"
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Table Number *</label>
                                            <input value={walkInTable} onChange={e => setWalkInTable(e.target.value)} placeholder="e.g. T-03"
                                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all" />
                                            {diningAllotments.some(a => a.tableNumber === walkInTable.trim()) && walkInTable.trim() && <p className="text-[10px] text-red-500 mt-1 font-semibold">⚠ Already allotted</p>}
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
                                        <textarea rows={2} value={walkInNotes} onChange={e => setWalkInNotes(e.target.value)} placeholder="Allergies, preferences, occasion…"
                                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none transition-all" />
                                    </div>
                                    <button onClick={handleAllotWalkIn} disabled={!walkInName.trim() || !walkInTable.trim()}
                                        className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-gold-500/20">
                                        <FaPlus className="text-[10px]" /> Allot Table for Walk-In Guest
                                    </button>
                                </>)}
                            </div>

                            {/* Live table board */}
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
                                        <p className="text-xs font-light max-w-xs mx-auto">Use the form to assign dining tables.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {diningAllotments.map(allot => (
                                            <DiningTableCard
                                                key={allot.id}
                                                allotment={allot}
                                                onRemove={handleRemoveDining}
                                                onUpdate={handleUpdateDining}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

/* ══════════════════════════════════════════════════════════════════
   Small local helpers — too specific to extract but kept compact
══════════════════════════════════════════════════════════════════ */

interface ItinerarySectionProps {
    title: string;
    icon: React.ReactNode;
    unlocked: boolean;
    lockedHint: string;
    children: React.ReactNode;
}
const ItinerarySection = ({ title, icon, unlocked, lockedHint, children }: ItinerarySectionProps) => (
    <div className="bg-white border border-gold-300/10 rounded-3xl shadow-md overflow-hidden">
        <div className="bg-navy-500 text-white px-6 py-4 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">{icon} {title}</span>
            <span className="text-[10px] font-bold">{unlocked ? "🔓 UNLOCKED" : "🔒 LOCKED"}</span>
        </div>
        {unlocked ? (
            <div className="p-6 flex flex-col gap-4 animate-fade-in">{children}</div>
        ) : (
            <div className="p-8 text-center bg-navy-50/20 text-navy-400 flex flex-col items-center gap-2">
                <FaLock className="text-xl text-gold-500 animate-pulse" />
                <p className="text-[10px] font-light">{lockedHint}</p>
            </div>
        )}
    </div>
);

interface Transition { from: string; to: string; label: string; }
interface ItemRowProps {
    item: BookingItem;
    onStatusChange: (s: string) => void;
    allowedTransitions: Transition[];
    children?: React.ReactNode;
}
const ItemRow = ({ item, onStatusChange, allowedTransitions, children }: ItemRowProps) => (
    <div className="pb-4 border-b border-navy-50 last:border-0 last:pb-0 flex flex-col gap-2 text-xs text-navy-400">
        <div className="flex justify-between font-bold text-navy-500 text-sm">
            <span>{item.name} (x{item.quantity})</span>
            <span>₹ {(item.price * item.quantity).toLocaleString()}</span>
        </div>
        {children}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <span className="bg-gold-50 text-gold-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-gold-300/15">
                {item.status || allowedTransitions[0]?.from || "Pending"}
            </span>
            <div className="flex gap-2">
                {allowedTransitions.filter(t => t.from === (item.status || allowedTransitions[0]?.from)).map(t => (
                    <button key={t.to} onClick={() => onStatusChange(t.to)}
                        className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer transition-all">
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default QrScanner;
