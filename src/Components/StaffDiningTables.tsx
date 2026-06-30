import { FaChair, FaTimes, FaUser, FaUtensils } from "react-icons/fa";

export interface StaffDiningAllotment {
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

interface DiningStatsProps {
    totalTables: number;
    allotments: StaffDiningAllotment[];
}

export const DiningStats = ({ totalTables, allotments }: DiningStatsProps) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-4">
            <span className="text-[10px] text-navy-500 font-bold uppercase tracking-wider">Total Tables</span>
            <span className="text-2xl font-black text-navy-700 mt-1.5 block">{totalTables}</span>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Occupied</span>
            <span className="text-2xl font-black text-red-800 mt-1.5 block">{allotments.length}</span>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Available</span>
            <span className="text-2xl font-black text-teal-800 mt-1.5 block">{Math.max(0, totalTables - allotments.length)}</span>
        </div>
        <div className="bg-gold-50 border border-gold-100 rounded-2xl p-4">
            <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider">Walk-Ins Today</span>
            <span className="text-2xl font-black text-gold-800 mt-1.5 block">{allotments.filter(a => a.isWalkIn).length}</span>
        </div>
    </div>
);

interface DiningTableMapProps {
    totalTables: number;
    allotments: StaffDiningAllotment[];
    selectedTable: string;
    onSelectTable: (tableNumber: string) => void;
}

export const DiningTableMap = ({ totalTables, allotments, selectedTable, onSelectTable }: DiningTableMapProps) => (
    <div className="bg-white border border-navy-100 rounded-3xl p-5 mb-8 shadow-sm">
        <p className="text-[10px] uppercase font-bold text-navy-400 tracking-wider mb-3">Restaurant Floor Map ({totalTables} Tables)</p>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: totalTables }).map((_, i) => {
                const tableNumber = `T-${String(i + 1).padStart(2, "0")}`;
                const allot = allotments.find(a => a.tableNumber === tableNumber);
                const selected = selectedTable === tableNumber;
                return (
                    <button
                        key={tableNumber}
                        type="button"
                        title={allot ? `${allot.guestName} (${allot.covers} covers)` : "Available"}
                        onClick={() => onSelectTable(tableNumber)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            allot
                                ? allot.isWalkIn
                                    ? "bg-gold-100 border-gold-300 text-gold-800 hover:bg-gold-200"
                                    : "bg-red-100 border-red-200 text-red-800 hover:bg-red-200"
                                : "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                        } ${selected ? "ring-2 ring-navy-500 scale-[1.04] shadow-md" : ""}`}
                    >
                        <FaChair className="text-[10px] mb-0.5" />
                        <span className="text-[8px] font-black">{tableNumber}</span>
                        {allot && <span className="text-[7px] truncate w-full text-center font-bold mt-0.5">{allot.guestName.split(" ")[0]}</span>}
                    </button>
                );
            })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-navy-400 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-teal-100 border border-teal-300 rounded"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span> Hotel Guest</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gold-100 border border-gold-300 rounded"></span> Walk-In</span>
        </div>
    </div>
);

interface DiningTableSelectProps {
    value: string;
    allotments: StaffDiningAllotment[];
    totalTables: number;
    editingId: string | null;
    onChange: (tableNumber: string) => void;
}

export const DiningTableSelect = ({ value, allotments, totalTables, editingId, onChange }: DiningTableSelectProps) => {
    const selectedAllotment = allotments.find(a => a.tableNumber === value.trim() && a.id !== editingId);

    return (
        <div>
            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">Table Number *</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all cursor-pointer"
            >
                <option value="">Select table</option>
                {Array.from({ length: totalTables }).map((_, i) => {
                    const tableNumber = `T-${String(i + 1).padStart(2, "0")}`;
                    const allot = allotments.find(a => a.tableNumber === tableNumber && a.id !== editingId);
                    return (
                        <option key={tableNumber} value={tableNumber}>
                            {tableNumber}{allot ? ` - occupied by ${allot.guestName}` : " - available"}
                        </option>
                    );
                })}
            </select>
            {selectedAllotment && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold">Already allotted to {selectedAllotment.guestName}</p>
            )}
        </div>
    );
};

interface DiningTableBoardProps {
    allotments: StaffDiningAllotment[];
    onEdit: (allotment: StaffDiningAllotment) => void;
    onRemove: (id: string) => void;
}

export const DiningTableBoard = ({ allotments, onEdit, onRemove }: DiningTableBoardProps) => (
    <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest flex items-center gap-2">
                <FaUtensils className="text-gold-500" /> Live Table Board
            </h3>
            <div className="flex items-center gap-2">
                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 font-bold">
                    {allotments.filter(a => !a.isWalkIn).length} Hotel
                </span>
                <span className="text-[10px] bg-gold-50 text-gold-700 border border-gold-200 rounded-full px-3 py-1 font-bold">
                    {allotments.filter(a => a.isWalkIn).length} Walk-In
                </span>
            </div>
        </div>

        {allotments.length === 0 ? (
            <div className="bg-white border border-navy-100 rounded-3xl p-12 text-center text-navy-400">
                <FaChair className="text-4xl mx-auto mb-3 text-gold-300" />
                <h4 className="text-sm font-bold text-navy-500 mb-1">No Tables Allotted Yet</h4>
                <p className="text-xs font-light max-w-xs mx-auto">Use the form to assign dining tables for hotel guests or walk-in visitors.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allotments.map(allot => (
                    <button
                        key={allot.id}
                        type="button"
                        onClick={() => onEdit(allot)}
                        className="bg-white border border-navy-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow relative group text-left cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-black px-3 py-1.5 rounded-xl text-white ${allot.isWalkIn ? "bg-gold-500" : "bg-navy-500"}`}>
                                    {allot.tableNumber}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${allot.isWalkIn
                                    ? "bg-gold-50 text-gold-700 border-gold-200"
                                    : "bg-teal-50 text-teal-700 border-teal-200"}`}>
                                    {allot.isWalkIn ? "Walk-In" : "Hotel Guest"}
                                </span>
                            </div>
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={e => { e.stopPropagation(); onRemove(allot.id); }}
                                onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onRemove(allot.id);
                                    }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 cursor-pointer transition-all p-1 shrink-0"
                                title="Remove"
                            >
                                <FaTimes className="text-xs" />
                            </span>
                        </div>

                        <div>
                            <p className="text-sm font-bold text-navy-500 flex items-center gap-1.5">
                                <FaUser className="text-gold-400 text-[10px]" /> {allot.guestName}
                            </p>
                            {allot.phone && <p className="text-[10px] text-navy-400 mt-0.5">{allot.phone}</p>}
                            {allot.refId && <p className="text-[10px] text-navy-400 mt-0.5">Ref: <span className="font-semibold text-navy-500">{allot.refId}</span></p>}
                            {allot.specialNotes && <p className="text-[10px] text-gold-600 mt-0.5 italic">"{allot.specialNotes}"</p>}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-navy-400 pt-1 border-t border-navy-50">
                            <span>{allot.covers} {allot.covers === 1 ? "cover" : "covers"}</span>
                            <span>{allot.time}</span>
                        </div>
                    </button>
                ))}
            </div>
        )}
    </div>
);