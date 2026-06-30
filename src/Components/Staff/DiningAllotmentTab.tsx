import { useState } from "react";
import { FaChair, FaUtensils } from "react-icons/fa";
import DiningTableCard from "./DiningTableCard";
import StatsCard from "./StatsCard";
import { TableControlModal } from "./TableControlModal";
import type { DiningAllotment } from "./staffTypes";
import { TOTAL_DINING_TABLES } from "./staffTypes";

interface DiningAllotmentTabProps {
    allGuestNames: string[];
    diningAllotments: DiningAllotment[];
    onSaveDining: (entry: DiningAllotment) => void;
    onRemoveDining: (id: string) => void;
    onUpdateDining: (id: string, changes: Partial<DiningAllotment>) => void;
}

const DiningAllotmentTab = ({
    allGuestNames,
    diningAllotments,
    onSaveDining,
    onRemoveDining,
    onUpdateDining,
}: DiningAllotmentTabProps) => {
    // Modal controls state
    const [selectedTableNum, setSelectedTableNum] = useState<string | null>(null);
    const [selectedAllotment, setSelectedAllotment] = useState<DiningAllotment | null>(null);

    const handleTableClick = (tableNumber: string) => {
        const allotment = diningAllotments.find((a) => a.tableNumber === tableNumber) || null;
        setSelectedTableNum(tableNumber);
        setSelectedAllotment(allotment);
    };

    const handleEditAllotment = (allotment: DiningAllotment) => {
        setSelectedTableNum(allotment.tableNumber);
        setSelectedAllotment(allotment);
    };

    const handleModalSave = (allotment: DiningAllotment) => {
        const existing = diningAllotments.find((a) => a.id === allotment.id);
        if (existing) {
            onUpdateDining(allotment.id, allotment);
        } else {
            onSaveDining(allotment);
        }
        setSelectedTableNum(null);
        setSelectedAllotment(null);
    };

    return (
        <div className="animate-fade-in text-left">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatsCard label="Total Tables" value={TOTAL_DINING_TABLES} color="navy" />
                <StatsCard label="Occupied" value={diningAllotments.length} color="red" />
                <StatsCard label="Available" value={Math.max(0, TOTAL_DINING_TABLES - diningAllotments.length)} color="teal" />
                <StatsCard label="Walk-Ins Today" value={diningAllotments.filter((a) => a.isWalkIn).length} color="gold" />
            </div>

            {/* Restaurant Floor Map */}
            <div className="bg-white border border-navy-100 rounded-3xl p-5 mb-8 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-navy-400 tracking-wider mb-4 flex items-center gap-1.5">
                    <FaUtensils className="text-gold-500" /> Restaurant Floor Map (Click table to control)
                </p>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
                    {Array.from({ length: TOTAL_DINING_TABLES }).map((_, i) => {
                        const tableNumber = `T-${String(i + 1).padStart(2, "0")}`;
                        const allot = diningAllotments.find((a) => a.tableNumber === tableNumber);

                        let styleClass = "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100/70";
                        if (allot) {
                            styleClass = allot.isWalkIn
                                ? "bg-gold-50 border-gold-300 text-gold-700 hover:bg-gold-100"
                                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100";
                        }

                        return (
                            <button
                                key={tableNumber}
                                type="button"
                                onClick={() => handleTableClick(tableNumber)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${styleClass}`}
                            >
                                <FaChair className="text-[11px] mb-1" />
                                <span className="text-[9px] font-black">{tableNumber}</span>
                                {allot && (
                                    <span className="text-[7px] truncate w-full text-center mt-1 font-bold opacity-80">
                                        {allot.guestName.split(" ")[0]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-[10px] text-navy-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-teal-50 border border-teal-200 rounded-lg" />
                        Available
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-red-50 border border-red-200 rounded-lg" />
                        Hotel Guest
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 bg-gold-50 border border-gold-300 rounded-lg" />
                        Walk-In
                    </span>
                </div>
            </div>

            {/* Live Table Board */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest flex items-center gap-2">
                        <FaUtensils className="text-gold-500" /> Live Table Board
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1 font-bold">
                            {diningAllotments.filter((a) => !a.isWalkIn).length} Hotel
                        </span>
                        <span className="text-[10px] bg-gold-50 text-gold-700 border border-gold-200 rounded-full px-3 py-1 font-bold">
                            {diningAllotments.filter((a) => a.isWalkIn).length} Walk-In
                        </span>
                    </div>
                </div>

                {diningAllotments.length === 0 ? (
                    <div className="bg-white border border-navy-100 rounded-3xl p-12 text-center text-navy-400">
                        <FaChair className="text-4xl mx-auto mb-3 text-gold-300" />
                        <h4 className="text-sm font-bold text-navy-500 mb-1">No Tables Allotted Yet</h4>
                        <p className="text-xs font-light max-w-xs mx-auto">
                            Click any table on the map to allot it to a guest.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {diningAllotments.map((allot) => (
                            <DiningTableCard
                                key={allot.id}
                                allotment={allot}
                                onRemove={onRemoveDining}
                                onEdit={handleEditAllotment}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Interactive Control Modal */}
            {selectedTableNum && (
                <TableControlModal
                    tableNumber={selectedTableNum}
                    allotment={selectedAllotment}
                    allGuestNames={allGuestNames}
                    onSave={handleModalSave}
                    onClose={() => {
                        setSelectedTableNum(null);
                        setSelectedAllotment(null);
                    }}
                    onRemove={onRemoveDining}
                />
            )}
        </div>
    );
};

export default DiningAllotmentTab;