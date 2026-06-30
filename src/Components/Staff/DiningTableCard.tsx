import { FaUser, FaTimes, FaEdit, FaUtensils, FaClock } from "react-icons/fa";
import type { DiningAllotment } from "./staffTypes";

interface DiningTableCardProps {
    allotment: DiningAllotment;
    onRemove: (id: string) => void;
    onEdit: (allotment: DiningAllotment) => void;
}

/** 
 * Dining table display card. 
 * Shows details about table occupancy and ordered menu items summary.
 */
const DiningTableCard = ({ allotment, onRemove, onEdit }: DiningTableCardProps) => {
    return (
        <div className="bg-white border border-navy-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative group text-left">
            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl text-white ${allotment.isWalkIn ? "bg-gold-500" : "bg-navy-500"}`}>
                        🪑 {allotment.tableNumber}
                    </span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold ${
                        allotment.isWalkIn
                            ? "bg-gold-50 text-gold-700 border-gold-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                    }`}>
                        {allotment.isWalkIn ? "🚶 Walk-In" : "🏨 Hotel Guest"}
                    </span>
                </div>

                {/* Edit & Remove Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                        onClick={() => onEdit(allotment)}
                        title="Edit allotment & add menu items"
                        className="text-navy-400 hover:text-gold-500 cursor-pointer p-1.5 rounded-full hover:bg-navy-50"
                    >
                        <FaEdit className="text-xs" />
                    </button>
                    <button
                        onClick={() => onRemove(allotment.id)}
                        title="Free Table / Checkout"
                        className="text-red-400 hover:text-red-600 cursor-pointer p-1.5 rounded-full hover:bg-navy-50"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>
            </div>

            {/* Guest Info */}
            <div>
                <h4 className="text-sm font-bold text-navy-500 flex items-center gap-2">
                    <FaUser className="text-gold-500 text-xs" /> {allotment.guestName}
                </h4>
                {allotment.phone && <p className="text-[10px] text-navy-400 mt-1">📞 {allotment.phone}</p>}
                {allotment.refId && (
                    <p className="text-[10px] text-navy-400 mt-1">
                        Ref: <span className="font-semibold text-navy-500">{allotment.refId}</span>
                    </p>
                )}
                {allotment.specialNotes && (
                    <p className="text-[10px] text-gold-600 mt-1.5 italic font-light bg-gold-50/50 p-2 rounded-xl border border-gold-150">
                        "{allotment.specialNotes}"
                    </p>
                )}
            </div>

            {/* Ordered Menu Items Summary */}
            {allotment.menuItems && allotment.menuItems.length > 0 && (
                <div className="border-t border-navy-50 pt-3">
                    <p className="text-[9px] uppercase font-bold text-navy-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <FaUtensils className="text-gold-500" /> Ordered Items
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {allotment.menuItems.map((item: any) => (
                            <span 
                                key={item.id} 
                                className="text-[9px] font-semibold text-navy-600 bg-navy-50 border border-navy-100 rounded-full px-2 py-0.5"
                            >
                                {item.name} &times; {item.quantity}
                            </span>
                        ))}
                    </div>
                    {/* Sum cost */}
                    <p className="text-[10px] font-bold text-accent-teal mt-2">
                        Total order: ₹{allotment.menuItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0).toLocaleString()}
                    </p>
                </div>
            )}

            {/* Footer indicators */}
            <div className="flex items-center gap-4 text-[10px] text-navy-400 pt-3 border-t border-navy-50 mt-auto">
                <span className="flex items-center gap-1">👥 {allotment.covers} {allotment.covers === 1 ? "cover" : "covers"}</span>
                <span className="flex items-center gap-1"><FaClock className="text-[9px] text-navy-300" /> {allotment.time}</span>
            </div>
        </div>
    );
};

export default DiningTableCard;
