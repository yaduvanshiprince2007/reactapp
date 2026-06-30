import { useEffect, useRef, useState } from "react";
import {
    FaUser, FaTimes, FaCheck,
    FaBed, FaCalendarAlt, FaUserFriends, FaFileAlt, FaUpload, FaTrash,
} from "react-icons/fa";
import AutocompleteInput from "./AutocompleteInput";
import {
    DOC_CATEGORIES, ROOM_TYPES,
    getRoomTypeFromNumber, getRoomsOfType,
    type RoomAssignForm, type RoomDocument,
} from "./staffTypes";

interface OccupancyEntry { guestName: string; refId: string; status: string; }

interface RoomAssignPanelProps {
    roomNumber: string;
    initialForm: RoomAssignForm;
    isUpdate: boolean;
    documents: RoomDocument[];
    guestNameSuggestions: string[];
    occupancyMap: Record<string, OccupancyEntry>;
    onSave: (form: RoomAssignForm) => void;
    onClose: () => void;
    onDocUpload: (e: React.ChangeEvent<HTMLInputElement>, category: string) => void;
    onDocRemove: (id: string) => void;
    isOccupied: boolean;
}

const RoomAssignPanel = ({
    roomNumber, initialForm, isUpdate, documents,
    guestNameSuggestions, occupancyMap, onSave, onClose,
    onDocUpload, onDocRemove, isOccupied,
}: RoomAssignPanelProps) => {
    const [form, setForm] = useState<RoomAssignForm>({
        ...initialForm,
        roomType: initialForm.roomType || getRoomTypeFromNumber(roomNumber),
        roomNumber: initialForm.roomNumber ?? roomNumber,
    });
    const [acOpen, setAcOpen] = useState(false);
    const acRef = useRef<HTMLDivElement>(null);
    const [showDocs, setShowDocs] = useState(false);
    const [docCategory, setDocCategory] = useState("ID Proof");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const rooms = getRoomsOfType(form.roomType);
        if (!rooms.includes(form.roomNumber ?? "")) {
            setForm(f => ({ ...f, roomNumber: rooms[0] }));
        }
    }, [form.roomType]);

    const roomDocs = documents.filter(d => d.roomNumber === roomNumber);
    const roomsForType = getRoomsOfType(form.roomType);

    const getRoomLabel = (rn: string) => {
        const occ = occupancyMap[rn];
        if (!occ) return `Room ${rn} — Vacant`;
        const gFirst = occ.guestName.split(" ")[0];
        return `Room ${rn} — ${occ.status === "Checked-In" ? `Occupied (${gFirst})` : "Reserved"}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white border border-navy-100 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 w-full max-w-lg relative z-10 animate-fade-in max-h-[90vh] overflow-y-auto text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[9px] uppercase text-navy-400 font-bold">
                            {isUpdate ? "Update Assignment" : "Assign Room"}
                        </span>
                        <h4 className="text-base font-black text-navy-500 font-display flex items-center gap-2 mt-0.5">
                            Room {roomNumber}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${isOccupied ? "bg-gold-100 text-gold-700 border-gold-200" : "bg-teal-100 text-teal-700 border-teal-200"}`}>
                                {isOccupied ? "Occupied" : "Vacant"}
                            </span>
                        </h4>
                    </div>
                    <button onClick={onClose} className="text-navy-300 hover:text-navy-500 cursor-pointer p-1"><FaTimes /></button>
                </div>

                <div ref={acRef}>
                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                        <FaUser className="text-gold-500 text-[9px]" /> Guest Name *
                    </label>
                    <AutocompleteInput
                        value={form.guestName}
                        onChange={v => setForm(f => ({ ...f, guestName: v }))}
                        suggestions={guestNameSuggestions.filter(n => n.toLowerCase().includes(form.guestName.toLowerCase())).slice(0, 8)}
                        onSelect={v => { setForm(f => ({ ...f, guestName: v })); setAcOpen(false); }}
                        placeholder="Type or search guest name..."
                        open={acOpen}
                        setOpen={setAcOpen}
                        containerRef={acRef}
                        extraHint="New name creates a walk-in record"
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                        <FaBed className="text-gold-500 text-[9px]" /> Room Type
                    </label>
                    <select value={form.roomType} onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))}
                        className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-semibold focus:outline-none focus:border-gold-500 cursor-pointer">
                        {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                        Switch Room
                        <span className="normal-case font-normal text-navy-300 text-[9px]">(showing {form.roomType} rooms)</span>
                    </label>
                    <select value={form.roomNumber ?? roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
                        className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer">
                        {roomsForType.map(rn => (
                            <option key={rn} value={rn}>{getRoomLabel(rn)}</option>
                        ))}
                    </select>
                    {occupancyMap[form.roomNumber ?? roomNumber] && (
                        <p className="text-[10px] text-amber-600 font-bold mt-1.5">
                            This room is occupied — switching will update the assignment.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {(["adults", "kids"] as const).map(field => (
                        <div key={field}>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaUserFriends className="text-gold-500 text-[9px]" />
                                {field === "adults" ? "Adults" : "Kids"}
                            </label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setForm(f => ({ ...f, [field]: Math.max(field === "adults" ? 1 : 0, f[field] - 1) }))}
                                    className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer">-</button>
                                <span className="flex-1 text-center text-sm font-black text-navy-500">{form[field]}</span>
                                <button onClick={() => setForm(f => ({ ...f, [field]: Math.min(10, f[field] + 1) }))}
                                    className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer">+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {(["checkIn", "checkOut"] as const).map(field => (
                        <div key={field}>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaCalendarAlt className="text-gold-500 text-[9px]" />
                                {field === "checkIn" ? "Check-In" : "Check-Out"}
                            </label>
                            <input type="date" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer" />
                        </div>
                    ))}
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Special Notes</label>
                    <textarea rows={2} value={form.specialNotes || ""} onChange={e => setForm(f => ({ ...f, specialNotes: e.target.value }))}
                        className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none"
                        placeholder="Dietary preferences, late check-in details..." />
                </div>

                <div>
                    <button onClick={() => onSave(form)} disabled={!form.guestName.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-navy-500 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-navy-500/20">
                        <FaCheck className="text-[10px]" />
                        {isUpdate ? "Update Assignment" : "Confirm Assignment"}
                    </button>
                </div>

                <div className="border-t border-navy-100 pt-4 flex flex-col gap-3">
                    <button onClick={() => setShowDocs(!showDocs)}
                        className="w-full flex items-center gap-2 text-xs font-bold text-navy-500 hover:text-gold-600 transition-colors focus:outline-none cursor-pointer">
                        <FaFileAlt className="text-gold-500" />
                        Documents for Room {roomNumber}
                        <span className="ml-auto text-[9px] bg-navy-100 rounded-full px-2 py-0.5">{roomDocs.length}</span>
                        <span>{showDocs ? "^" : "v"}</span>
                    </button>

                    {showDocs && (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2 flex-wrap">
                                <select value={docCategory} onChange={e => setDocCategory(e.target.value)}
                                    className="flex-1 min-w-0 bg-navy-50 border border-navy-100 rounded-xl p-2 text-[10px] text-navy-500 font-medium focus:outline-none focus:border-gold-500 cursor-pointer">
                                    {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <label className="flex items-center gap-1.5 bg-navy-500 hover:bg-navy-600 text-white font-bold px-3 py-2 rounded-xl text-[10px] cursor-pointer transition-all shrink-0">
                                    <FaUpload className="text-[9px]" /> Upload
                                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
                                        onChange={e => { onDocUpload(e, docCategory); if (fileInputRef.current) fileInputRef.current.value = ""; }} />
                                </label>
                            </div>
                            {roomDocs.length === 0 ? (
                                <p className="text-[10px] text-navy-300 italic">No documents uploaded yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {roomDocs.map(doc => (
                                        <div key={doc.id} className="flex items-center gap-2 bg-navy-50/60 border border-navy-100 rounded-xl p-2.5 group">
                                            <FaFileAlt className="text-gold-500 text-sm shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-navy-500 truncate">{doc.fileName}</p>
                                                <p className="text-[9px] text-navy-400">{doc.category} · {doc.size} · {doc.uploadTime}</p>
                                            </div>
                                            <button onClick={() => onDocRemove(doc.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 cursor-pointer transition-all p-1">
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
        </div>
    );
};

export default RoomAssignPanel;
