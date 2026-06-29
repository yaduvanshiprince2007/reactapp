import { FaSearch, FaTimes, FaUser } from "react-icons/fa";

interface AutocompleteInputProps {
    value: string;
    onChange: (v: string) => void;
    suggestions: string[];
    onSelect: (v: string) => void;
    placeholder?: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    extraHint?: string;
}

/** Single-line text input with a floating suggestion dropdown. */
const AutocompleteInput = ({
    value, onChange, suggestions, onSelect,
    placeholder, open, setOpen, containerRef, extraHint,
}: AutocompleteInputProps) => (
    <div className="relative" ref={containerRef}>
        <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300 text-[10px]" />
            <input
                type="text"
                value={value}
                onChange={e => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder ?? "Search guest name…"}
                className="w-full pl-8 pr-8 py-2.5 bg-navy-50 border border-navy-100 rounded-xl text-xs
                           text-navy-500 font-medium focus:outline-none focus:border-gold-500
                           focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
            {value && (
                <button
                    onMouseDown={e => { e.preventDefault(); onChange(""); setOpen(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
                >
                    <FaTimes className="text-[9px]" />
                </button>
            )}
        </div>

        {open && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy-100
                           rounded-xl shadow-xl z-40 overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                    <li key={i}>
                        <button
                            onMouseDown={() => { onSelect(s); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs text-navy-500
                                       hover:bg-gold-50 hover:text-gold-700 transition-colors
                                       flex items-center gap-2"
                        >
                            <FaUser className="text-gold-400 text-[9px] shrink-0" />
                            <span className="truncate">{s}</span>
                        </button>
                    </li>
                ))}
            </ul>
        )}

        {open && value.trim() !== "" && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy-100
                            rounded-xl shadow-xl z-40 px-4 py-3 text-[10px] text-navy-400 italic">
                {extraHint ?? "No existing guest — will be added as new entry"}
            </div>
        )}
    </div>
);

export default AutocompleteInput;
