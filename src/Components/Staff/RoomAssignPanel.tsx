import { useRef, useState } from "react";
import {
    FaUser, FaTimes, FaCheck, FaEdit,
    FaBed, FaCalendarAlt, FaUserFriends, FaFileAlt, FaUpload, FaTrash,
} from "react-icons/fa";
import AutocompleteInput from "./AutocompleteInput";
import { DOC_CATEGORIES, ROOM_TYPES, type RoomAssignForm, type RoomDocument } from "./staffTypes";

interface RoomAssignPanelProps {
    roomNumber: string;
    initialForm: RoomAssignForm;
    isUpdate: boolean;
    documents: RoomDocument[];
    guestNameSuggestions: string[];
    onSave: (form: RoomAssignForm) => void;
    onClose: () => void;
    onDocUpload: (e: React.ChangeEvent<HTMLInputElement>, category: string) => void;
    onDocRemove: (id: string) => void;
    /** Occupied status badge value passed from parent */
    isOccupied: boolean;
}

/**
 * Sticky side panel that opens when a room tile is clicked.
 * Handles guest assignment / update and document management for that room.
 */
const RoomAssignPanel = ({
    roomNumber, initialForm, isUpdate, documents,
    guestNameSuggestions, onSave, onClose,
    onDocUpload, onDocRemove, isOccupied,
}: RoomAssignPanelProps) => {
    const [form, setForm] = useState<RoomAssignForm>(initialForm);
    const [acOpen, setAcOpen] = useState(false);
    const acRef = useRef<HTMLDivElement>(null);
    const [showDocs, setShowDocs] = useState(false);
    const [docCategory, setDocCategory] = useState("ID Proof");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const roomDocs = documents.filter(d => d.roomNumber === roomNumber);

    return (
        <div className="bg-white border border-navy-100 rounded-3xl p-5 shadow-md flex flex-col gap-4 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[9px] uppercase text-navy-400 font-bold">
                        {isUpdate ? "Update Assignment" : "Assign Room"}
                    </span>
                    <h4 className="text-base font-black text-navy-500 font-display flex items-center gap-2 mt-0.5">
                        🚪 Room {roomNumber}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                            isOccupied
                                ? "bg-gold-100 text-gold-700 border-gold-200"
                                : "bg-teal-100 text-teal-700 border-teal-200"
                        }`}>
                            {isOccupied ? "Occupied" : "Vacant"}
                        </span>
                    </h4>
                </div>
                <button onClick={onClose} className="text-navy-300 hover:text-navy-500 cursor-pointer p-1">
                    <FaTimes />
                </button>
            </div>

            {/* Guest name autocomplete */}
            <div>
                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                    <FaUser className="text-gold-500 text-[9px]" /> Guest Name *
                </label>
                <AutocompleteInput
                    value={form.guestName}
                    onChange={v => setForm(f => ({ ...f, guestName: v }))}
                    suggestions={guestNameSuggestions.filter(n =>
                        n.toLowerCase().includes(form.guestName.toLowerCase())
                    ).slice(0, 8)}
                    onSelect={v => { setForm(f => ({ ...f, guestName: v })); setAcOpen(false); }}
                    placeholder="Type or search guest name…"
                    open={acOpen}
                    setOpen={setAcOpen}
                    containerRef={acRef}
                    extraHint="New name — creates a walk-in record"
                />
            </div>

            {/* Room type */}
            <div>
                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                    <FaBed className="text-gold-500 text-[9px]" /> Room Type
                </label>
                <select
                    value={form.roomType}
                    onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))}
                    className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500
                               font-medium focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                    {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
            </div>

            {/* Adults & Kids */}
            <div className="grid grid-cols-2 gap-3">
                {(["adults", "kids"] as const).map(field => (
                    <div key={field}>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                            <FaUserFriends className="text-gold-500 text-[9px]" />
                            {field === "adults" ? "Adults" : "Kids"}
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setForm(f => ({ ...f, [field]: Math.max(field === "adults" ? 1 : 0, f[field] - 1) }))}
                                className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer"
                            >−</button>
                            <span className="flex-1 text-center text-sm font-black text-navy-500">{form[field]}</span>
                            <button
                                onClick={() => setForm(f => ({ ...f, [field]: Math.min(10, f[field] + 1) }))}
                                className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer"
                            >+</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
                {(["checkIn", "checkOut"] as const).map(field => (
                    <div key={field}>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1">
                            <FaCalendarAlt className="text-[9px] text-gold-500" />
                            {field === "checkIn" ? "Check-In" : "Check-Out"}
                        </label>
                        <input
                            type="date"
                            value={form[field]}
                            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs
                                       text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer"
                        />
                    </div>
                ))}
            </div>

            {/* Notes */}
            <div>
                <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Special Notes</label>
                <textarea
                    rows={2}
                    value={form.specialNotes}
                    onChange={e => setForm(f => ({ ...f, specialNotes: e.target.value }))}
                    placeholder="Special requests, accessibility needs…"
                    className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500
                               font-medium focus:outline-none focus:border-gold-500 resize-none transition-all"
                />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => onSave(form)}
                    disabled={!form.guestName.trim()}
                    className={`flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5
                                rounded-xl text-xs transition-all cursor-pointer shadow-md
                                disabled:opacity-40 disabled:cursor-not-allowed ${
                        isUpdate
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                            : "bg-gold-500 hover:bg-gold-600 shadow-gold-500/20"
                    }`}
                >
                    {isUpdate
                        ? <><FaEdit className="text-[10px]" /> Update Room</>
                        : <><FaCheck className="text-[10px]" /> Assign Room</>}
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2.5 border border-navy-100 rounded-xl text-xs font-bold
                               text-navy-500 hover:bg-navy-50 cursor-pointer transition-all"
                >Cancel</button>
            </div>

            {/* Document upload section */}
            <div className="border-t border-navy-100 pt-4">
                <button
                    onClick={() => setShowDocs(p => !p)}
                    className="flex items-center gap-2 text-[10px] uppercase font-bold text-navy-400
                               hover:text-navy-600 transition-colors cursor-pointer w-full mb-3"
                >
                    <FaFileAlt className="text-gold-500" />
                    Documents for Room {roomNumber}
                    <span className="ml-auto text-[9px] bg-navy-100 rounded-full px-2 py-0.5">{roomDocs.length}</span>
                    <span>{showDocs ? "▲" : "▼"}</span>
                </button>

                {showDocs && (
                    <div className="flex flex-col gap-3">
                        {/* Upload row */}
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={docCategory}
                                onChange={e => setDocCategory(e.target.value)}
                                className="flex-1 min-w-0 bg-navy-50 border border-navy-100 rounded-xl p-2
                                           text-[10px] text-navy-500 font-medium focus:outline-none
                                           focus:border-gold-500 cursor-pointer"
                            >
                                {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <label className="flex items-center gap-1.5 bg-navy-500 hover:bg-navy-600 text-white
                                              font-bold px-3 py-2 rounded-xl text-[10px] cursor-pointer transition-all shrink-0">
                                <FaUpload className="text-[9px]" /> Upload
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    className="hidden"
                                    onChange={e => { onDocUpload(e, docCategory); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                />
                            </label>
                        </div>

                        {/* Doc list */}
                        {roomDocs.length === 0 ? (
                            <p className="text-[10px] text-navy-300 italic">No documents uploaded yet.</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {roomDocs.map(doc => (
                                    <div key={doc.id}
                                        className="flex items-center gap-2 bg-navy-50/60 border border-navy-100 rounded-xl p-2.5 group">
                                        <FaFileAlt className="text-gold-500 text-sm shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-navy-500 truncate">{doc.fileName}</p>
                                            <p className="text-[9px] text-navy-400">{doc.category} · {doc.size} · {doc.uploadTime}</p>
                                        </div>
                                        <button
                                            onClick={() => onDocRemove(doc.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 cursor-pointer transition-all p-1"
                                        >
                                            <FaTrash className="text-[9px]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomAssignPanel;
