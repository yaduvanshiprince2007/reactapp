import { useState, useEffect } from "react";
import { FaTimes, FaArrowRight, FaGift, FaRupeeSign, FaCheck, FaBed } from "react-icons/fa";
import {
    ROOM_TYPES, getRoomsOfType,
    type RoomTypeConfig, type RoomUpgradeRecord,
} from "./staffTypes";

interface OccupancyEntry { guestName: string; refId: string; status: string; }

interface RoomUpgradeModalProps {
    /** The room being upgraded (source) */
    fromRoomNumber: string;
    fromRoomType: string;
    guestName: string;
    refId: string;
    /** Current nightly rate so staff see price delta */
    currentNightlyRate: number;
    occupancyMap: Record<string, OccupancyEntry>;
    roomConfigs: RoomTypeConfig[];
    onClose: () => void;
    onConfirm: (record: RoomUpgradeRecord) => void;
}

const RoomUpgradeModal = ({
    fromRoomNumber, fromRoomType, guestName, refId,
    currentNightlyRate, occupancyMap, roomConfigs, onClose, onConfirm,
}: RoomUpgradeModalProps) => {
    /* Only allow upgrading to equal-or-higher tiers */
    const fromIdx = ROOM_TYPES.indexOf(fromRoomType);
    const upgradeTypes = roomConfigs.filter(c =>
        c.isActive && ROOM_TYPES.indexOf(c.name) >= fromIdx
    );

    const [toType, setToType] = useState(upgradeTypes[0]?.name ?? fromRoomType);
    const [toRoom, setToRoom] = useState("");
    const [isComplimentary, setIsComplimentary] = useState(false);
    const [upgradePrice, setUpgradePrice] = useState(0);
    const [notes, setNotes] = useState("");

    /* Rebuild room dropdown when type changes */
    useEffect(() => {
        const rooms = getRoomsOfType(toType);
        const firstFree = rooms.find(r => !occupancyMap[r] || r === fromRoomNumber);
        setToRoom(firstFree ?? rooms[0] ?? "");
    }, [toType, fromRoomNumber, occupancyMap]);

    /* Auto-suggest price delta based on configs */
    useEffect(() => {
        if (isComplimentary) { setUpgradePrice(0); return; }
        const targetCfg = roomConfigs.find(c => c.name === toType);
        if (targetCfg) {
            const delta = Math.max(0, targetCfg.basePricePerNight - currentNightlyRate);
            setUpgradePrice(delta);
        }
    }, [toType, isComplimentary, currentNightlyRate, roomConfigs]);

    const roomsForType = getRoomsOfType(toType);

    const getRoomLabel = (rn: string) => {
        const occ = occupancyMap[rn];
        if (rn === fromRoomNumber) return `Room ${rn} — (current)`;
        if (!occ) return `Room ${rn} — Vacant ✓`;
        return `Room ${rn} — Occupied (${occ.guestName.split(" ")[0]})`;
    };

    const targetCfg = roomConfigs.find(c => c.name === toType);

    const handleConfirm = () => {
        if (!toRoom) return;
        const record: RoomUpgradeRecord = {
            id: `UPG-${Date.now()}`,
            refId, guestName,
            fromRoomNumber, toRoomNumber: toRoom,
            fromRoomType, toRoomType: toType,
            isComplimentary,
            upgradePrice: isComplimentary ? 0 : upgradePrice,
            notes,
            performedAt: new Date().toISOString(),
        };
        onConfirm(record);
    };

    const isSameRoom = toRoom === fromRoomNumber && toType === fromRoomType;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white border border-navy-100 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 animate-fade-in max-h-[90vh] overflow-y-auto text-left">
                {/* Header */}
                <div className="bg-gradient-to-r from-navy-500 to-navy-600 text-white p-5 rounded-t-3xl flex items-center justify-between">
                    <div>
                        <span className="text-[9px] uppercase font-bold text-navy-200 tracking-wider">Room Upgrade</span>
                        <h3 className="text-base font-black mt-0.5 flex items-center gap-2">
                            <FaBed className="text-gold-400" /> {guestName}
                        </h3>
                        <p className="text-[10px] text-navy-200 mt-0.5">
                            Current: <strong className="text-white">{fromRoomType}</strong> · Room {fromRoomNumber}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-navy-300 hover:text-white cursor-pointer p-1">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    {/* Upgrade path visual */}
                    <div className="flex items-center gap-2 bg-navy-50 border border-navy-100 rounded-2xl p-3">
                        <div className="flex-1 text-center">
                            <p className="text-[9px] uppercase font-bold text-navy-400">From</p>
                            <p className="text-xs font-black text-navy-600">{fromRoomType}</p>
                            <p className="text-[10px] text-navy-400">Room {fromRoomNumber}</p>
                            <p className="text-[10px] font-bold text-navy-500 mt-0.5">₹{currentNightlyRate.toLocaleString()}/night</p>
                        </div>
                        <FaArrowRight className="text-gold-500 text-lg shrink-0" />
                        <div className="flex-1 text-center">
                            <p className="text-[9px] uppercase font-bold text-navy-400">To</p>
                            <p className="text-xs font-black text-navy-600">{toType}</p>
                            <p className="text-[10px] text-navy-400">Room {toRoom || "—"}</p>
                            <p className="text-[10px] font-bold text-gold-600 mt-0.5">₹{(targetCfg?.basePricePerNight ?? 0).toLocaleString()}/night</p>
                        </div>
                    </div>

                    {/* Target Room Type */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                            <FaBed className="text-gold-500 text-[9px]" /> Upgrade To Room Type
                        </label>
                        <select value={toType} onChange={e => setToType(e.target.value)}
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-semibold focus:outline-none focus:border-gold-500 cursor-pointer">
                            {upgradeTypes.map(c => (
                                <option key={c.id} value={c.name}>
                                    {c.name} — ₹{c.basePricePerNight.toLocaleString()}/night
                                    {c.name === fromRoomType ? " (current type)" : ""}
                                </option>
                            ))}
                        </select>
                        {targetCfg && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {targetCfg.amenities.map(a => (
                                    <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 text-gold-700 font-semibold">{a}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Target Room Number */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                            Select Target Room <span className="normal-case font-normal text-navy-300">(vacant rooms shown first)</span>
                        </label>
                        <select value={toRoom} onChange={e => setToRoom(e.target.value)}
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer">
                            {/* Vacant rooms first */}
                            {roomsForType.filter(r => !occupancyMap[r] || r === fromRoomNumber).map(r => (
                                <option key={r} value={r}>{getRoomLabel(r)}</option>
                            ))}
                            {/* Occupied rooms (still selectable but warned) */}
                            {roomsForType.filter(r => occupancyMap[r] && r !== fromRoomNumber).map(r => (
                                <option key={r} value={r}>{getRoomLabel(r)}</option>
                            ))}
                        </select>
                        {toRoom && occupancyMap[toRoom] && toRoom !== fromRoomNumber && (
                            <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ This room is occupied — confirm only if transfer is arranged.</p>
                        )}
                    </div>

                    {/* Complimentary toggle */}
                    <div className="bg-navy-50/60 border border-navy-100 rounded-2xl p-3 flex flex-col gap-3">
                        <label className="block text-[10px] uppercase font-bold text-navy-400">Upgrade Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsComplimentary(false)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${!isComplimentary ? "bg-navy-500 text-white border-navy-500" : "bg-white text-navy-500 border-navy-100 hover:bg-navy-50"}`}>
                                <FaRupeeSign className="text-[9px]" /> Paid Upgrade
                            </button>
                            <button
                                onClick={() => setIsComplimentary(true)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isComplimentary ? "bg-gold-500 text-white border-gold-500" : "bg-white text-navy-500 border-navy-100 hover:bg-navy-50"}`}>
                                <FaGift className="text-[9px]" /> Complimentary
                            </button>
                        </div>

                        {/* Price input for paid upgrade */}
                        {!isComplimentary && (
                            <div>
                                <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">
                                    Upgrade Price (₹) <span className="normal-case font-normal">— set 0 for free upgrade</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-xs font-bold">₹</span>
                                    <input type="number" min={0} value={upgradePrice}
                                        onChange={e => setUpgradePrice(Number(e.target.value))}
                                        className="w-full pl-7 bg-white border border-navy-100 rounded-xl p-2.5 text-sm font-black text-navy-500 focus:outline-none focus:border-gold-500" />
                                </div>
                                <p className="text-[9px] text-navy-400 mt-1">
                                    Suggested delta vs. base: ₹{Math.max(0, (targetCfg?.basePricePerNight ?? 0) - currentNightlyRate).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {isComplimentary && (
                            <div className="flex items-center gap-2 bg-gold-50 border border-gold-200 rounded-xl p-2.5">
                                <FaGift className="text-gold-500 text-sm shrink-0" />
                                <p className="text-[10px] text-gold-700 font-semibold">This upgrade will be recorded as complimentary (₹0 charge).</p>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Reason / Notes</label>
                        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Loyalty reward, complaint resolution, availability..."
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none" />
                    </div>

                    {/* Summary box */}
                    <div className="bg-gradient-to-r from-navy-50 to-gold-50/30 border border-navy-100 rounded-2xl p-3 flex flex-col gap-1.5">
                        <p className="text-[9px] uppercase font-bold text-navy-400 tracking-wider">Upgrade Summary</p>
                        <div className="flex justify-between text-xs text-navy-500">
                            <span>Guest</span><span className="font-bold">{guestName}</span>
                        </div>
                        <div className="flex justify-between text-xs text-navy-500">
                            <span>From</span><span className="font-bold">{fromRoomType} · Room {fromRoomNumber}</span>
                        </div>
                        <div className="flex justify-between text-xs text-navy-500">
                            <span>To</span><span className="font-bold">{toType} · Room {toRoom || "—"}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-navy-100 pt-1.5 mt-0.5">
                            <span className="text-navy-500">Upgrade Charge</span>
                            <span className={`font-black ${isComplimentary ? "text-gold-600" : "text-navy-600"}`}>
                                {isComplimentary ? "Complimentary ✦" : `₹${upgradePrice.toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    {/* Confirm */}
                    <button onClick={handleConfirm}
                        disabled={!toRoom || isSameRoom}
                        className="w-full flex items-center justify-center gap-2 bg-navy-500 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-navy-500/20">
                        <FaCheck className="text-[10px]" />
                        {isComplimentary ? "Confirm Complimentary Upgrade" : `Confirm Upgrade${upgradePrice > 0 ? ` — ₹${upgradePrice.toLocaleString()}` : " (Free)"}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomUpgradeModal;
