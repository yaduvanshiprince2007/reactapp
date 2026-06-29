interface StatsCardProps {
    label: string;
    value: number | string;
    /** Tailwind color prefix: "teal" | "red" | "gold" | "blue" | "navy" */
    color: "teal" | "red" | "gold" | "blue" | "navy";
    suffix?: string;
}

const colorMap: Record<StatsCardProps["color"], { bg: string; border: string; label: string; value: string }> = {
    teal:  { bg: "bg-teal-50",  border: "border-teal-100",  label: "text-teal-600",  value: "text-teal-800" },
    red:   { bg: "bg-red-50",   border: "border-red-100",   label: "text-red-600",   value: "text-red-800" },
    gold:  { bg: "bg-gold-50",  border: "border-gold-100",  label: "text-gold-600",  value: "text-gold-800" },
    blue:  { bg: "bg-blue-50",  border: "border-blue-100",  label: "text-blue-600",  value: "text-blue-800" },
    navy:  { bg: "bg-navy-50",  border: "border-navy-100",  label: "text-navy-500",  value: "text-navy-700" },
};

/** Small coloured metric card used across the staff dashboard tabs. */
const StatsCard = ({ label, value, color, suffix }: StatsCardProps) => {
    const c = colorMap[color];
    return (
        <div className={`${c.bg} ${c.border} border rounded-2xl p-4`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${c.label}`}>{label}</span>
            <span className={`text-2xl font-black mt-1.5 block ${c.value}`}>
                {value}
                {suffix && <span className="text-xs font-normal ml-1">{suffix}</span>}
            </span>
        </div>
    );
};

export default StatsCard;
