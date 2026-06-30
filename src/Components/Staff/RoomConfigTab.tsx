import { useState } from "react";
import {
    FaBed, FaEdit, FaCheck, FaTimes, FaPlus, FaTrash,
    FaToggleOn, FaToggleOff, FaChartBar,
} from "react-icons/fa";
import {
    type RoomTypeConfig,
    DEFAULT_ROOM_TYPE_CONFIGS,
    getRoomsOfType,
} from "./staffTypes";

interface RoomConfigTabProps {
    occupancyMap: Record<string, { guestName: string; refId: string; status: string }>;
    configs: RoomTypeConfig[];
    onConfigsChange: (updated: RoomTypeConfig[]) => void;
}

/* ── colour helpers (tailwind safe-list friendly) ─────────────────── */
const colorBg: Record<string, string> = {
    teal: "bg-teal-50 border-teal-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    gold: "bg-amber-50 border-amber-200",
    amber: "bg-orange-50 border-orange-200",
};
const colorBar: Record<string, string> = {
    teal: "bg-teal-400",
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    gold: "bg-amber-400",
    amber: "bg-orange-400",
};
const colorBadge: Record<string, string> = {
    teal: "bg-teal-100 text-teal-700 border-teal-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    gold: "bg-amber-100 text-amber-700 border-amber-300",
    amber: "bg-orange-100 text-orange-700 border-orange-300",
};

const RoomConfigTab = ({ occupancyMap, configs, onConfigsChange }: RoomConfigTabProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<RoomTypeConfig | null>(null);
    const [newAmenity, setNewAmenity] = useState("");
    const [view, setView] = useState<"cards" | "table">("cards");

    /* ── derive live occupancy count per type ─────────────────────── */
    const getOccupiedCount = (typeName: string) => {
        const rooms = getRoomsOfType(typeName);
        return rooms.filter(r => occupancyMap[r]).length;
    };

    /* ── edit helpers ─────────────────────────────────────────────── */
    const startEdit = (cfg: RoomTypeConfig) => {
        setEditingId(cfg.id);
        setEditForm({ ...cfg, amenities: [...cfg.amenities] });
    };
    const cancelEdit = () => { setEditingId(null); setEditForm(null); setNewAmenity(""); };

    const saveEdit = () => {
        if (!editForm) return;
        const updated = configs.map(c => c.id === editForm.id ? editForm : c);
        onConfigsChange(updated);
        cancelEdit();
    };

    const toggleActive = (id: string) => {
        const updated = configs.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
        onConfigsChange(updated);
    };

    const resetToDefaults = () => {
        onConfigsChange(DEFAULT_ROOM_TYPE_CONFIGS);
    };

    /* ── amenity helpers inside edit form ─────────────────────────── */
    const addAmenity = () => {
        if (!newAmenity.trim() || !editForm) return;
        setEditForm(f => f ? { ...f, amenities: [...f.amenities, newAmenity.trim()] } : f);
        setNewAmenity("");
    };
    const removeAmenity = (idx: number) => {
        if (!editForm) return;
        setEditForm(f => f ? { ...f, amenities: f.amenities.filter((_, i) => i !== idx) } : f);
    };

    /* ── availability label ───────────────────────────────────────── */
    const availLabel = (avail: number, total: number) => {
        const pct = total > 0 ? avail / total : 0;
        if (pct >= 0.5) return { txt: "Available", cls: "bg-teal-100 text-teal-700 border-teal-200" };
        if (pct > 0.1) return { txt: "Filling Up", cls: "bg-amber-100 text-amber-700 border-amber-200" };
        return { txt: "Near Full", cls: "bg-red-100 text-red-700 border-red-200" };
    };

    return (
        <div className="animate-fade-in flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-lg font-black text-navy-500 flex items-center gap-2">
                        <FaBed className="text-gold-500" /> Room Configuration
                    </h2>
                    <p className="text-xs text-navy-400 font-light mt-0.5">
                        Manage room type inventory, pricing, and amenities. Changes are saved instantly.
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    {/* View toggle */}
                    <div className="flex bg-navy-50 border border-navy-100 rounded-xl overflow-hidden text-[10px] font-bold">
                        <button onClick={() => setView("cards")}
                            className={`px-3 py-2 cursor-pointer transition-all ${view === "cards" ? "bg-navy-500 text-white" : "text-navy-500 hover:bg-navy-100"}`}>
                            Cards
                        </button>
                        <button onClick={() => setView("table")}
                            className={`px-3 py-2 cursor-pointer transition-all flex items-center gap-1 ${view === "table" ? "bg-navy-500 text-white" : "text-navy-500 hover:bg-navy-100"}`}>
                            <FaChartBar className="text-[9px]" /> Summary
                        </button>
                    </div>
                    <button onClick={resetToDefaults}
                        className="px-3 py-2 text-[10px] font-bold text-navy-400 hover:text-navy-600 border border-navy-100 rounded-xl hover:bg-navy-50 transition-all cursor-pointer">
                        Reset Defaults
                    </button>
                </div>
            </div>

            {/* ── CARDS VIEW ─────────────────────────────────────────── */}
            {view === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {configs.map(cfg => {
                        const occupied = getOccupiedCount(cfg.name);
                        const available = cfg.totalRooms - occupied;
                        const pct = cfg.totalRooms > 0 ? Math.round((occupied / cfg.totalRooms) * 100) : 0;
                        const avail = availLabel(available, cfg.totalRooms);
                        const isEditing = editingId === cfg.id && editForm !== null;

                        return (
                            <div key={cfg.id}
                                className={`border rounded-2xl p-4 flex flex-col gap-3 transition-all ${colorBg[cfg.color] ?? "bg-gray-50 border-gray-200"} ${!cfg.isActive ? "opacity-50" : ""}`}>

                                {/* Card header */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-black text-navy-600">{cfg.name}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${avail.cls}`}>
                                                {avail.txt}
                                            </span>
                                            {!cfg.isActive && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full border font-bold bg-gray-100 text-gray-500 border-gray-200">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                        {!isEditing && (
                                            <p className="text-[10px] text-navy-400 mt-0.5 leading-relaxed line-clamp-2">{cfg.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => toggleActive(cfg.id)} title={cfg.isActive ? "Disable" : "Enable"}
                                            className="text-navy-400 hover:text-navy-600 cursor-pointer p-1">
                                            {cfg.isActive
                                                ? <FaToggleOn className="text-lg text-teal-500" />
                                                : <FaToggleOff className="text-lg text-gray-400" />}
                                        </button>
                                        {!isEditing && (
                                            <button onClick={() => startEdit(cfg)}
                                                className="text-navy-400 hover:text-gold-500 cursor-pointer p-1">
                                                <FaEdit className="text-sm" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Occupancy bar */}
                                {!isEditing && (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] font-bold text-navy-500">
                                            <span>{occupied} occupied</span>
                                            <span>{available} free / {cfg.totalRooms} total</span>
                                        </div>
                                        <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-white/40">
                                            <div className={`h-full rounded-full transition-all ${colorBar[cfg.color] ?? "bg-gray-400"}`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-[9px] text-navy-400">{pct}% occupied</p>
                                    </div>
                                )}

                                {/* Stats row */}
                                {!isEditing && (
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-white/60 rounded-xl p-2">
                                            <p className="text-xs font-black text-navy-600">₹{cfg.basePricePerNight.toLocaleString()}</p>
                                            <p className="text-[9px] text-navy-400">per night</p>
                                        </div>
                                        <div className="bg-white/60 rounded-xl p-2">
                                            <p className="text-xs font-black text-navy-600">{cfg.maxAdults}+{cfg.maxKids}</p>
                                            <p className="text-[9px] text-navy-400">adults/kids</p>
                                        </div>
                                        <div className="bg-white/60 rounded-xl p-2">
                                            <p className="text-xs font-black text-navy-600">{cfg.totalRooms}</p>
                                            <p className="text-[9px] text-navy-400">rooms</p>
                                        </div>
                                    </div>
                                )}

                                {/* Amenity pills */}
                                {!isEditing && (
                                    <div className="flex flex-wrap gap-1">
                                        {cfg.amenities.map(a => (
                                            <span key={a} className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${colorBadge[cfg.color] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* ── INLINE EDIT FORM ─────────────────────────── */}
                                {isEditing && editForm && (
                                    <div className="flex flex-col gap-3">
                                        {/* Description */}
                                        <div>
                                            <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Description</label>
                                            <textarea rows={2} value={editForm.description}
                                                onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)}
                                                className="w-full bg-white border border-navy-100 rounded-xl p-2 text-[10px] text-navy-500 focus:outline-none focus:border-gold-500 resize-none" />
                                        </div>

                                        {/* Numbers row */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {([
                                                { key: "totalRooms", label: "Total Rooms", min: 1 },
                                                { key: "basePricePerNight", label: "Price / Night (₹)", min: 0 },
                                                { key: "maxAdults", label: "Max Adults", min: 1 },
                                                { key: "maxKids", label: "Max Kids", min: 0 },
                                            ] as { key: keyof RoomTypeConfig; label: string; min: number }[]).map(f => (
                                                <div key={f.key}>
                                                    <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">{f.label}</label>
                                                    <input type="number" min={f.min}
                                                        value={editForm[f.key] as number}
                                                        onChange={e => setEditForm(ef => ef ? { ...ef, [f.key]: Number(e.target.value) } : ef)}
                                                        className="w-full bg-white border border-navy-100 rounded-xl p-2 text-xs text-navy-500 focus:outline-none focus:border-gold-500" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Amenities */}
                                        <div>
                                            <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Amenities</label>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {editForm.amenities.map((a, i) => (
                                                    <span key={i} className="flex items-center gap-1 bg-white border border-navy-100 rounded-full px-2 py-0.5 text-[9px] text-navy-500 font-semibold">
                                                        {a}
                                                        <button onClick={() => removeAmenity(i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                                                            <FaTimes className="text-[8px]" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-1">
                                                <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
                                                    onKeyDown={e => e.key === "Enter" && addAmenity()}
                                                    placeholder="Add amenity…"
                                                    className="flex-1 bg-white border border-navy-100 rounded-xl p-2 text-[10px] text-navy-500 focus:outline-none focus:border-gold-500" />
                                                <button onClick={addAmenity}
                                                    className="bg-navy-500 text-white px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-navy-600 transition-all">
                                                    <FaPlus className="text-[9px]" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Save / Cancel */}
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={saveEdit}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-navy-500 hover:bg-navy-600 text-white font-bold py-2 rounded-xl text-[10px] cursor-pointer transition-all">
                                                <FaCheck className="text-[9px]" /> Save Changes
                                            </button>
                                            <button onClick={cancelEdit}
                                                className="px-3 py-2 text-[10px] text-navy-400 hover:text-navy-600 border border-navy-100 rounded-xl cursor-pointer hover:bg-navy-50 transition-all">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── TABLE / SUMMARY VIEW ───────────────────────────────── */}
            {view === "table" && (
                <div className="bg-white border border-navy-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-navy-500 text-white">
                                {["Room Type", "Total", "Occupied", "Available", "Occ %", "Price / Night", "Capacity", "Status"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-bold text-[10px] uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((cfg, i) => {
                                const occupied = getOccupiedCount(cfg.name);
                                const available = cfg.totalRooms - occupied;
                                const pct = cfg.totalRooms > 0 ? Math.round((occupied / cfg.totalRooms) * 100) : 0;
                                const avail = availLabel(available, cfg.totalRooms);
                                return (
                                    <tr key={cfg.id} className={`border-t border-navy-50 ${i % 2 === 0 ? "bg-white" : "bg-navy-50/30"} hover:bg-gold-50/30 transition-colors`}>
                                        <td className="px-4 py-3 font-bold text-navy-600">{cfg.name}</td>
                                        <td className="px-4 py-3 text-navy-500 font-semibold">{cfg.totalRooms}</td>
                                        <td className="px-4 py-3 text-amber-600 font-semibold">{occupied}</td>
                                        <td className="px-4 py-3 text-teal-600 font-semibold">{available}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${colorBar[cfg.color] ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-navy-500 font-semibold">{pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-black text-navy-600">₹{cfg.basePricePerNight.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-navy-500">{cfg.maxAdults}A / {cfg.maxKids}K</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${cfg.isActive ? avail.cls : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                                {cfg.isActive ? avail.txt : "Disabled"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-navy-100 bg-navy-50/60">
                                <td className="px-4 py-3 font-black text-navy-600 text-xs uppercase tracking-wider">Total</td>
                                <td className="px-4 py-3 font-black text-navy-600">{configs.reduce((s, c) => s + c.totalRooms, 0)}</td>
                                <td className="px-4 py-3 font-black text-amber-600">{configs.reduce((s, c) => s + getOccupiedCount(c.name), 0)}</td>
                                <td className="px-4 py-3 font-black text-teal-600">{configs.reduce((s, c) => s + (c.totalRooms - getOccupiedCount(c.name)), 0)}</td>
                                <td colSpan={4} className="px-4 py-3 text-[10px] text-navy-400">Grand total across all room types</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RoomConfigTab;
