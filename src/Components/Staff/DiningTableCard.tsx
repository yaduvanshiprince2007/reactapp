import { useState } from "react";
import { FaUser, FaTimes, FaEdit, FaCheck } from "react-icons/fa";
import type { DiningAllotment } from "./staffTypes";

interface DiningTableCardProps {
    allotment: DiningAllotment;
    onRemove: (id: string) => void;
    onUpdate: (id: string, changes: Partial<DiningAllotment>) => void;
}

interface EditState {
    tableNumber: string;
    guestName: string;
    phone: string;
    covers: number;
    specialNotes: string;
}

/** Single dining table card — supports inline editing of all fields. */
const DiningTableCard = ({ allotment, onRemove, onUpdate }: DiningTableCardProps) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<EditState>({
        tableNumber:  allotment.tableNumber,
        guestName:    allotment.guestName,
        phone:        allotment.phone ?? "",
        covers:       allotment.covers,
        specialNotes: allotment.specialNotes ?? "",
    });

    const resetForm = () =>
        setForm({
            tableNumber:  allotment.tableNumber,
            guestName:    allotment.guestName,
            phone:        allotment.phone ?? "",
            covers:       allotment.covers,
            specialNotes: allotment.specialNotes ?? "",
        });

    const handleSave = () => {
        if (!form.guestName.trim() || !form.tableNumber.trim()) return;
        onUpdate(allotment.id, {
            tableNumber:  form.tableNumber.trim(),
            guestName:    form.guestName.trim(),
            phone:        form.phone.trim() || undefined,
            covers:       form.covers,
            specialNotes: form.specialNotes.trim() || undefined,
        });
        setEditing(false);
    };

    const handleCancel = () => { resetForm(); setEditing(false); };

    /* ── Edit mode ─────────────────────────────────────────────── */
    if (editing) {
        return (
            <div className="bg-white border-2 border-gold-400/60 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                        ✏️ Editing Table
                    </span>
                    <button onClick={handleCancel} className="text-navy-300 hover:text-navy-500 cursor-pointer">
                        <FaTimes className="text-xs" />
                    </button>
                </div>

                {/* Table number + Covers on one row */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Table #</label>
                        <input
                            value={form.tableNumber}
                            onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
                            className="w-full bg-navy-50 border border-navy-100 rounded-lg p-2 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Covers</label>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setForm(f => ({ ...f, covers: Math.max(1, f.covers - 1) }))}
                                className="w-7 h-7 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer text-sm"
                            >−</button>
                            <span className="flex-1 text-center text-sm font-black text-navy-500">{form.covers}</span>
                            <button
                                onClick={() => setForm(f => ({ ...f, covers: Math.min(20, f.covers + 1) }))}
                                className="w-7 h-7 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer text-sm"
                            >+</button>
                        </div>
                    </div>
                </div>

                {/* Guest name */}
                <div>
                    <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Guest Name</label>
                    <input
                        value={form.guestName}
                        onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                        className="w-full bg-navy-50 border border-navy-100 rounded-lg p-2 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Phone <span className="font-normal text-navy-300">(optional)</span></label>
                    <input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 ..."
                        className="w-full bg-navy-50 border border-navy-100 rounded-lg p-2 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-[9px] uppercase font-bold text-navy-400 mb-1">Notes</label>
                    <textarea
                        rows={2}
                        value={form.specialNotes}
                        onChange={e => setForm(f => ({ ...f, specialNotes: e.target.value }))}
                        placeholder="Allergies, preferences…"
                        className="w-full bg-navy-50 border border-navy-100 rounded-lg p-2 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none transition-all"
                    />
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={!form.guestName.trim() || !form.tableNumber.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-600
                                   disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 rounded-xl
                                   text-[10px] transition-all cursor-pointer shadow-sm shadow-gold-500/20"
                    >
                        <FaCheck className="text-[9px]" /> Save Changes
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-3 py-2 border border-navy-100 rounded-xl text-[10px] font-bold
                                   text-navy-500 hover:bg-navy-50 cursor-pointer transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    /* ── View mode ─────────────────────────────────────────────── */
    return (
        <div className="bg-white border border-navy-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative group">
            {/* Top row: table badge + type badge + actions */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl text-white ${allotment.isWalkIn ? "bg-gold-500" : "bg-navy-500"}`}>
                        🪑 {allotment.tableNumber}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                        allotment.isWalkIn
                            ? "bg-gold-50 text-gold-700 border-gold-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                    }`}>
                        {allotment.isWalkIn ? "🚶 Walk-In" : "🏨 Hotel Guest"}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                        onClick={() => setEditing(true)}
                        title="Edit table allotment"
                        className="text-navy-400 hover:text-blue-600 cursor-pointer p-1"
                    >
                        <FaEdit className="text-xs" />
                    </button>
                    <button
                        onClick={() => onRemove(allotment.id)}
                        title="Remove allotment"
                        className="text-red-400 hover:text-red-600 cursor-pointer p-1"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>
            </div>

            {/* Guest info */}
            <div>
                <p className="text-sm font-bold text-navy-500 flex items-center gap-1.5">
                    <FaUser className="text-gold-400 text-[10px]" /> {allotment.guestName}
                </p>
                {allotment.phone && <p className="text-[10px] text-navy-400 mt-0.5">📞 {allotment.phone}</p>}
                {allotment.refId && (
                    <p className="text-[10px] text-navy-400 mt-0.5">
                        Ref: <span className="font-semibold text-navy-500">{allotment.refId}</span>
                    </p>
                )}
                {allotment.specialNotes && (
                    <p className="text-[10px] text-gold-600 mt-0.5 italic">"{allotment.specialNotes}"</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 text-[10px] text-navy-400 pt-1 border-t border-navy-50">
                <span>👥 {allotment.covers} {allotment.covers === 1 ? "cover" : "covers"}</span>
                <span>⏰ {allotment.time}</span>
            </div>
        </div>
    );
};

export default DiningTableCard;
