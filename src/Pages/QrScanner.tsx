import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import hotelData from "../Data/hotelData.json";
import {
    FaUser, FaInfoCircle, FaSearch, FaLock, FaHotel,
    FaUtensils, FaConciergeBell, FaGlassCheers, FaPlus, FaTrash, FaCheckCircle, FaBed, FaArrowUp,
} from "react-icons/fa";

/* ─── shared components ─────────────────────────────────────────── */
import StatsCard from "../Components/Staff/StatsCard";
import RoomAssignPanel from "../Components/Staff/RoomAssignPanel";
import RoomConfigTab from "../Components/Staff/RoomConfigTab";
import RoomUpgradeModal from "../Components/Staff/RoomUpgradeModal";
import PageQrLinks from "../Components/Staff/PageQrLinks";
import DiningAllotmentTab from "../Components/Staff/DiningAllotmentTab";
import { BanquetConfigModal } from "../Components/BanquetConfigModal";

/* ─── types & constants ─────────────────────────────────────────── */
import {
    type BookingRecord,
    type BookingItem,
    type DiningAllotment,
    type RoomAssignForm,
    type RoomDocument,
    type BanquetBooking,
    type RoomTypeConfig,
    type RoomUpgradeRecord,
    DEFAULT_ROOM_TYPE_CONFIGS,
} from "../Components/Staff/staffTypes";

import allProducts from "../Data/allProducts";

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

    /* ── banquet state ───────────────────────────────────────── */
    const [banquetBookings, setBanquetBookings] = useState<BanquetBooking[]>([]);
    const [showBanquetModal, setShowBanquetModal] = useState(false);
    const [banquetModalItem, setBanquetModalItem] = useState<typeof allProducts[0] | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("staffBanquetBookings");
        setBanquetBookings(raw ? JSON.parse(raw) : []);
    }, [dataVersion]);

    const handleStaffBanquetConfirm = (qty: number, guestName?: string) => {
        if (!banquetModalItem || !guestName) return;
        const configRaw = localStorage.getItem(`banquetConfig_${banquetModalItem.id}`);
        const config = configRaw ? JSON.parse(configRaw) : {};
        const newBooking: BanquetBooking = {
            id: `BNQ-STAFF-${Date.now()}`,
            guestName,
            spaceName: banquetModalItem.heading ?? "",
            spaceId: banquetModalItem.id,
            bookingDate: config.bookingDate || "",
            bookingTime: config.bookingTime || "",
            expectedGuests: config.expectedGuests || 100,
            seatingStyle: config.seatingStyle || "Round Tables",
            cateringPlan: config.cateringPlan || "None",
            avRig: config.avRig || "None",
            decorTheme: config.decorTheme || "None",
            grandTotal: config.calculatedPrice || 0,
            status: "Confirmed",
            createdAt: new Date().toISOString(),
        };
        const updated = [newBooking, ...banquetBookings];
        setBanquetBookings(updated);
        localStorage.setItem("staffBanquetBookings", JSON.stringify(updated));
        setShowBanquetModal(false);
        setBanquetModalItem(null);
        triggerToast(`🎉 Banquet booked for ${guestName} — ${banquetModalItem.heading}`);
    };

    const handleRemoveBanquetBooking = (id: string) => {
        const updated = banquetBookings.filter(b => b.id !== id);
        setBanquetBookings(updated);
        localStorage.setItem("staffBanquetBookings", JSON.stringify(updated));
        triggerToast("🗑 Banquet booking removed.");
    };

    const banquetSpaces = allProducts.filter((p: typeof allProducts[0]) => p.itemType === "banquet");

    /* ── room config state ───────────────────────────────────── */
    const [roomConfigs, setRoomConfigs] = useState<RoomTypeConfig[]>(() => {
        const raw = localStorage.getItem("roomTypeConfigs");
        return raw ? JSON.parse(raw) : DEFAULT_ROOM_TYPE_CONFIGS;
    });

    const handleRoomConfigsChange = (updated: RoomTypeConfig[]) => {
        setRoomConfigs(updated);
        localStorage.setItem("roomTypeConfigs", JSON.stringify(updated));
        triggerToast("⚙️ Room configuration saved.");
    };

    /* ── room upgrade state ──────────────────────────────────── */
    const [upgradeTarget, setUpgradeTarget] = useState<{
        roomNumber: string; roomType: string; guestName: string; refId: string; nightlyRate: number;
    } | null>(null);

    const handleUpgradeConfirm = (record: RoomUpgradeRecord) => {
        /* 1. Persist upgrade log */
        const raw = localStorage.getItem("roomUpgrades");
        const log: RoomUpgradeRecord[] = raw ? JSON.parse(raw) : [];
        log.unshift(record);
        localStorage.setItem("roomUpgrades", JSON.stringify(log));

        /* 2. Update booking — change roomNumber and roomType in customBookings */
        const cbRaw = localStorage.getItem("customBookings");
        const cbList: BookingRecord[] = cbRaw ? JSON.parse(cbRaw) : [];
        for (const b of cbList) {
            for (const item of b.items) {
                if (item.itemType === "room" && item.details?.roomNumber === record.fromRoomNumber) {
                    item.name = `${record.toRoomType} — Room ${record.toRoomNumber}`;
                    if (item.details) {
                        item.details.roomNumber = record.toRoomNumber;
                        item.details.roomType = record.toRoomType;
                    }
                    /* 3. Add charge line if paid */
                    if (!record.isComplimentary && record.upgradePrice > 0) {
                        b.total += record.upgradePrice;
                        b.items.push({
                            name: `Room Upgrade: ${record.fromRoomType} → ${record.toRoomType}`,
                            itemType: "service",
                            quantity: 1,
                            price: record.upgradePrice,
                            status: "Completed",
                        });
                    }
                }
            }
        }
        localStorage.setItem("customBookings", JSON.stringify(cbList));
        bump();
        setUpgradeTarget(null);
        triggerToast(record.isComplimentary
            ? `✦ Complimentary upgrade: Room ${record.toRoomNumber} (${record.toRoomType})`
            : `⬆️ Room ${record.toRoomNumber} upgraded — ₹${record.upgradePrice.toLocaleString()} charged`);
    };

    /* ── tabs ─────────────────────────────────────────────────── */
    const [scannerTab, setScannerTab] = useState<"verify" | "occupancy" | "dining" | "qrlinks" | "events" | "roomconfig">("verify");

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
                        guestName: b.guestName,
                        roomType: item.name || "Standard Room",
                        adults: item.details?.adults ?? 1,
                        kids: item.details?.kids ?? 0,
                        checkIn: item.details?.checkIn || new Date().toISOString().split("T")[0],
                        checkOut: item.details?.checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
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
        const targetRoomNum = form.roomNumber?.trim() || activeRoomNumber;
        const raw = localStorage.getItem("customBookings");
        const list: BookingRecord[] = raw ? JSON.parse(raw) : [];
        let updated = false;

        for (const b of list) {
            for (const item of b.items) {
                if (item.itemType === "room" && item.details?.roomNumber === activeRoomNumber) {
                    b.guestName = form.guestName.trim();
                    item.name = `${form.roomType} — Room ${targetRoomNum}`;
                    if (item.details) {
                        Object.assign(item.details, {
                            roomNumber: targetRoomNum,
                            roomType: form.roomType,
                            adults: form.adults,
                            kids: form.kids,
                            checkIn: form.checkIn,
                            checkOut: form.checkOut,
                            specialNotes: form.specialNotes
                        });
                    }
                    updated = true;
                }
            }
        }
        if (!updated) {
            const byName = list.find(b => b.guestName.toLowerCase() === form.guestName.trim().toLowerCase());
            if (byName) {
                const slot = byName.items.find(i => i.itemType === "room" && (!i.details?.roomNumber || i.details?.roomNumber === activeRoomNumber));
                if (slot) {
                    if (!slot.details) slot.details = {};
                    slot.name = `${form.roomType} — Room ${targetRoomNum}`;
                    Object.assign(slot.details, {
                        roomNumber: targetRoomNum,
                        roomType: form.roomType,
                        adults: form.adults,
                        kids: form.kids,
                        checkIn: form.checkIn,
                        checkOut: form.checkOut,
                        specialNotes: form.specialNotes
                    });
                    slot.status = "Checked-In";
                    updated = true;
                }
            }
        }
        if (!updated) {
            list.unshift({
                refId: `STAFF-${targetRoomNum}-${Date.now()}`,
                date: new Date().toISOString().split("T")[0],
                status: "In-Progress & Serving",
                guestName: form.guestName.trim(),
                email: "staff-assigned@grandazure.com",
                total: 0,
                items: [{
                    name: `${form.roomType} — Room ${targetRoomNum}`,
                    itemType: "room", quantity: 1, price: 0, status: "Checked-In",
                    details: {
                        roomNumber: targetRoomNum,
                        roomType: form.roomType,
                        adults: form.adults,
                        kids: form.kids,
                        checkIn: form.checkIn,
                        checkOut: form.checkOut,
                        specialNotes: form.specialNotes
                    },
                }],
            });
        }
        localStorage.setItem("customBookings", JSON.stringify(list));
        bump();
        triggerToast(updated
            ? `✏️ Room ${activeRoomNumber} updated to ${targetRoomNum} for ${form.guestName.trim()}`
            : `✅ Room ${targetRoomNum} assigned to ${form.guestName.trim()}`);
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
    const saveDining = (entry: DiningAllotment) => {
        if (diningAllotments.some(a => a.tableNumber === entry.tableNumber)) {
            triggerToast(`⚠️ Table ${entry.tableNumber} is already allotted!`); return;
        }
        const updated = [...diningAllotments, entry];
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast(`🍽 Table ${entry.tableNumber} allotted to ${entry.guestName}`);
    };

    const handleRemoveDining = (id: string) => {
        const updated = diningAllotments.filter(a => a.id !== id);
        setDiningAllotments(updated);
        localStorage.setItem("diningTableAllotments", JSON.stringify(updated));
        triggerToast("🗑 Table allotment removed.");
    };

    const handleUpdateDining = (id: string, changes: Partial<DiningAllotment>) => {
        if (changes.tableNumber && diningAllotments.some(a => a.id !== id && a.tableNumber === changes.tableNumber)) {
            triggerToast(`Table ${changes.tableNumber} is already allotted!`);
            return;
        }
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
    const reserved = Object.values(occupancyMap).filter(x => x.status === "Reserved (Future)").length;
    const vacant = 300 - checkedIn - reserved;

    const hasRooms = scannedRecord?.items.some(i => i.itemType === "room");
    const hasDining = scannedRecord?.items.some(i => i.itemType === "menu");
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
        <>
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            {/* Toast */}
            {toastMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-navy-500 text-white border border-gold-300/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold">
                    <span className="text-gold-500">✦</span><span>{toastMsg}</span>
                </div>
            )}

            <div className="min-w-6xl mx-auto">
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
                        { key: "verify" as const, label: "🔑 OTP Desk" },
                        { key: "occupancy" as const, label: "🏨 Room Occupancy" },
                        { key: "dining" as const, label: "🍽 Dining" },
                        { key: "events" as const, label: "🎉 Events" },
                        { key: "roomconfig" as const, label: "⚙️ Room Config" },
                        { key: "qrlinks" as const, label: "🔗 QR Links" },
                    ]).map(tab => (
                        <button key={tab.key} onClick={() => setScannerTab(tab.key)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${scannerTab === tab.key ? "bg-navy-500 text-white shadow-md shadow-navy-500/10" : "bg-white border border-navy-100 hover:bg-navy-50 text-navy-500"}`}>
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
                                        {scannedRecord.otpRoom && <p>🏨 Room OTP:    <strong className="text-gold-600 select-all">{scannedRecord.otpRoom}</strong></p>}
                                        {scannedRecord.otpDining && <p>🍽 Dining OTP:  <strong className="text-gold-600 select-all">{scannedRecord.otpDining}</strong></p>}
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
                                                    { from: "Reserved (Future)", to: "Checked-In", label: "Check-In" },
                                                    { from: "Checked-In", to: "Checked-Out", label: "Check-Out" },
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
                                                    { from: "In Progress", to: "Preparing", label: "Start Prep" },
                                                    { from: "Preparing", to: "Completed & Delivered", label: "Mark Delivered" },
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
                                                    { from: "In-Progress", to: "Completed", label: "Complete" },
                                                    { from: "Booked (Scheduled)", to: "Completed", label: "Complete" },
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
                {/* ──────────────────────────────────────────────────────
                    TAB X — QR Links
                ────────────────────────────────────────────────────── */}
                {scannerTab === "qrlinks" && (
                    <div className="animate-fade-in">
                        <PageQrLinks />
                    </div>
                )}
                {/* ════════════════════════════════════════════════
                    TAB 2 — Room Occupancy
                ════════════════════════════════════════════════ */}
                {scannerTab === "occupancy" && (
                    <div className="animate-fade-in">
                        {/* Stats row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <StatsCard label="Vacant (Available)" value={vacant} color="teal" suffix={`/ 300 Rooms`} />
                            <StatsCard label="Checked-In" value={checkedIn} color="gold" suffix="Occupied" />
                            <StatsCard label="Reserved / Future" value={reserved} color="blue" suffix="Booked" />
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
                                            if (occ.status === "Checked-In") { bg = "bg-gold-100 border-gold-300 text-gold-800 hover:bg-gold-200"; lbl = "In"; }
                                            else if (occ.status === "Checked-Out") { bg = "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"; lbl = "Out"; }
                                            else { bg = "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"; lbl = "Rsvd"; }
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
                                        occupancyMap={occupancyMap}
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
                    <DiningAllotmentTab
                        allGuestNames={allGuestNames}
                        diningAllotments={diningAllotments}
                        onSaveDining={saveDining}
                        onRemoveDining={handleRemoveDining}
                        onUpdateDining={handleUpdateDining}
                    />
                )}

                {/* ════════════════════════════════════════════════
                    TAB 4 — Events & Banquet Desk
                ════════════════════════════════════════════════ */}
                {scannerTab === "events" && (
                    <div className="animate-fade-in flex flex-col gap-8">
                        {/* Header row */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="text-lg font-black text-navy-500 flex items-center gap-2">
                                    <FaGlassCheers className="text-gold-500" /> Events & Banquet Desk
                                </h2>
                                <p className="text-xs text-navy-400 font-light mt-0.5">Book event spaces directly on behalf of guests.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {banquetSpaces.map((space: typeof allProducts[0]) => (
                                    <button key={space.id}
                                        onClick={() => { setBanquetModalItem(space); setShowBanquetModal(true); }}
                                        className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-gold-500/20">
                                        <FaPlus className="text-[9px]" /> {space.heading}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active banquet bookings */}
                        {banquetBookings.length === 0 ? (
                            <div className="bg-navy-50/60 border border-dashed border-navy-200 rounded-3xl p-12 text-center text-navy-400 flex flex-col items-center gap-3">
                                <FaGlassCheers className="text-3xl text-gold-300" />
                                <p className="text-xs font-bold text-navy-500">No Active Event Bookings</p>
                                <p className="text-[10px] font-light">Use the buttons above to book an event space for a guest.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xs uppercase font-bold text-navy-400 tracking-wider">Active Event Bookings ({banquetBookings.length})</h3>
                                {banquetBookings.map(bq => (
                                    <div key={bq.id} className="bg-white border border-navy-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-4 shadow-sm">
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-black text-navy-500">{bq.spaceName}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                                    bq.status === "Confirmed" ? "bg-teal-100 text-teal-700 border-teal-200"
                                                    : bq.status === "Completed" ? "bg-navy-100 text-navy-500 border-navy-200"
                                                    : "bg-gold-100 text-gold-700 border-gold-200"
                                                }`}>{bq.status}</span>
                                            </div>
                                            <p className="text-[10px] text-navy-400">
                                                <FaUser className="inline mr-1 text-[8px] text-gold-500" />{bq.guestName}
                                                &nbsp;·&nbsp; 📅 {bq.bookingDate} at {bq.bookingTime}
                                                &nbsp;·&nbsp; 👥 {bq.expectedGuests} guests
                                            </p>
                                            <p className="text-[10px] text-navy-400">
                                                🪑 {bq.seatingStyle} &nbsp;·&nbsp;
                                                🍽 {bq.cateringPlan} &nbsp;·&nbsp;
                                                🎵 {bq.avRig} &nbsp;·&nbsp;
                                                🎨 {bq.decorTheme}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-black text-navy-600">₹{bq.grandTotal.toLocaleString()}</span>
                                                {bq.status === "Confirmed" && (
                                                    <button onClick={() => {
                                                        const updated = banquetBookings.map(b => b.id === bq.id ? { ...b, status: "Completed" as const } : b);
                                                        setBanquetBookings(updated);
                                                        localStorage.setItem("staffBanquetBookings", JSON.stringify(updated));
                                                        triggerToast(`✅ ${bq.spaceName} marked as Completed.`);
                                                    }} className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white font-bold px-2.5 py-1 rounded-lg text-[9px] cursor-pointer transition-all">
                                                        <FaCheckCircle className="text-[8px]" /> Mark Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveBanquetBooking(bq.id)}
                                            className="shrink-0 text-red-300 hover:text-red-500 cursor-pointer transition-colors p-1">
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════
                    TAB 5 — Room Configuration
                ════════════════════════════════════════════════ */}
                {scannerTab === "roomconfig" && (
                    <RoomConfigTab
                        occupancyMap={occupancyMap}
                        configs={roomConfigs}
                        onConfigsChange={handleRoomConfigsChange}
                    />
                )}
            </div>
        </section>

        {/* Banquet booking modal for staff */}
        {showBanquetModal && banquetModalItem && (
            <BanquetConfigModal
                item={banquetModalItem}
                onClose={() => { setShowBanquetModal(false); setBanquetModalItem(null); }}
                onConfirm={handleStaffBanquetConfirm}
                isStaffFlow
                guestNameSuggestions={allGuestNames}
            />
        )}

        {/* Room upgrade modal */}
        {upgradeTarget && (
            <RoomUpgradeModal
                fromRoomNumber={upgradeTarget.roomNumber}
                fromRoomType={upgradeTarget.roomType}
                guestName={upgradeTarget.guestName}
                refId={upgradeTarget.refId}
                currentNightlyRate={upgradeTarget.nightlyRate}
                occupancyMap={occupancyMap}
                roomConfigs={roomConfigs}
                onClose={() => setUpgradeTarget(null)}
                onConfirm={handleUpgradeConfirm}
            />
        )}
        </>
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
