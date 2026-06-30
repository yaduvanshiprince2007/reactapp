import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaSearch, FaPlus, FaMinus, FaTrash, FaUtensils, FaUser, FaPhoneAlt, FaCheck, FaSignOutAlt } from "react-icons/fa";
import allProduct from "../../Data/allProducts";
import { type DiningAllotment } from "./staffTypes";

interface TableControlModalProps {
    tableNumber: string;
    allotment: DiningAllotment | null;
    allGuestNames: string[];
    onSave: (allotment: DiningAllotment) => void;
    onClose: () => void;
    onRemove: (id: string) => void;
}

export const TableControlModal: React.FC<TableControlModalProps> = ({
    tableNumber,
    allotment,
    allGuestNames,
    onSave,
    onClose,
    onRemove,
}) => {
    const isEdit = !!allotment;

    // Table settings states
    const [diningMode, setDiningMode] = useState<"hotel" | "walkin">(
        allotment?.isWalkIn ? "walkin" : "hotel"
    );
    const [guestName, setGuestName] = useState(allotment?.guestName || "");
    const [phone, setPhone] = useState(allotment?.phone || "");
    const [covers, setCovers] = useState(allotment?.covers || 2);
    const [specialNotes, setSpecialNotes] = useState(allotment?.specialNotes || "");

    // Autocomplete guest suggestions
    const [acOpen, setAcOpen] = useState(false);
    const acRef = useRef<HTMLDivElement>(null);
    const guestSuggestions = allGuestNames.filter((n) =>
        n.toLowerCase().includes(guestName.toLowerCase())
    ).slice(0, 5);

    // Menu search state
    const [menuSearch, setMenuSearch] = useState("");
    const [orderedItems, setOrderedItems] = useState<any[]>(allotment?.menuItems || []);

    // Filter available menu items from product catalog
    const menuItemsCatalog = allProduct.filter(
        (p) =>
            p.itemType === "menu" &&
            (p.heading?.toLowerCase().includes(menuSearch.toLowerCase()) ||
                p.subType?.toLowerCase().includes(menuSearch.toLowerCase()))
    );

    // Close autocomplete on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (acRef.current && !acRef.current.contains(e.target as Node)) {
                setAcOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calculate total price of ordered items
    const getMenuTotal = () => {
        return orderedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    // Add menu item to allotment
    const handleAddMenuItem = (product: any) => {
        const existing = orderedItems.find((i) => i.id === product.id);
        if (existing) {
            setOrderedItems(
                orderedItems.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            );
        } else {
            setOrderedItems([
                ...orderedItems,
                {
                    id: product.id,
                    name: product.heading,
                    price: product.newPrice || 0,
                    quantity: 1,
                    status: "Preparing",
                },
            ]);
        }
    };

    // Increment menu item quantity
    const handleIncMenuQty = (id: number) => {
        setOrderedItems(
            orderedItems.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
        );
    };

    // Decrement menu item quantity
    const handleDecMenuQty = (id: number) => {
        const item = orderedItems.find((i) => i.id === id);
        if (!item) return;

        if (item.quantity <= 1) {
            setOrderedItems(orderedItems.filter((i) => i.id !== id));
        } else {
            setOrderedItems(
                orderedItems.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            );
        }
    };

    // Remove menu item
    const handleRemoveMenuItem = (id: number) => {
        setOrderedItems(orderedItems.filter((i) => i.id !== id));
    };

    // Save Allotment handler
    const handleSave = () => {
        if (!guestName.trim()) return;

        const updatedAllotment: DiningAllotment = {
            id: allotment?.id || `DT-${Date.now()}`,
            tableNumber,
            guestName: guestName.trim(),
            phone: diningMode === "walkin" && phone.trim() ? phone.trim() : undefined,
            covers,
            time: allotment?.time || new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            isWalkIn: diningMode === "walkin",
            specialNotes: specialNotes.trim() ? specialNotes.trim() : undefined,
            menuItems: orderedItems,
        };

        onSave(updatedAllotment);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-gold-300/10 text-left">
                
                {/* Left Column: Allotment Settings */}
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-5 border-r border-navy-100/50 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gold-500 tracking-wider">
                                {isEdit ? "Update Allotment" : "Allot Dining Table"}
                            </span>
                            <h3 className="text-xl font-bold font-display text-navy-500 mt-0.5">
                                Table {tableNumber}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-navy-300 hover:text-navy-500 cursor-pointer p-1.5 rounded-full hover:bg-navy-50 md:hidden"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Guest Type Selector */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                            Guest Type
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-navy-50/60 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setDiningMode("hotel")}
                                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    diningMode === "hotel"
                                        ? "bg-navy-500 text-white shadow-sm"
                                        : "text-navy-500 hover:bg-navy-100"
                                }`}
                            >
                                Hotel Guest
                            </button>
                            <button
                                type="button"
                                onClick={() => setDiningMode("walkin")}
                                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    diningMode === "walkin"
                                        ? "bg-gold-500 text-white shadow-sm"
                                        : "text-navy-500 hover:bg-navy-100"
                                }`}
                            >
                                Walk-In Diner
                            </button>
                        </div>
                    </div>

                    {/* Guest Name Search/Input */}
                    <div className="relative" ref={acRef}>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                            <FaUser className="text-gold-500 text-[9px]" /> Guest Name *
                        </label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => {
                                setGuestName(e.target.value);
                                setAcOpen(diningMode === "hotel");
                            }}
                            onFocus={() => {
                                if (diningMode === "hotel") setAcOpen(true);
                            }}
                            placeholder={
                                diningMode === "hotel"
                                    ? "Search guest name..."
                                    : "Enter walk-in guest name..."
                            }
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all"
                        />
                        {/* Auto-complete suggestions dropdown */}
                        {acOpen && guestName.trim() !== "" && guestSuggestions.length > 0 && (
                            <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border border-navy-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-navy-50">
                                {guestSuggestions.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => {
                                            setGuestName(name);
                                            setAcOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-navy-500 hover:bg-gold-50 transition-colors cursor-pointer"
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phone for Walk-Ins */}
                    {diningMode === "walkin" && (
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5 flex items-center gap-1.5">
                                <FaPhoneAlt className="text-gold-500 text-[9px]" /> Phone Number
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 ..."
                                className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all"
                            />
                        </div>
                    )}

                    {/* Covers configuration */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                            Number of Covers
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setCovers((c) => Math.max(1, c - 1))}
                                className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer"
                            >
                                -
                            </button>
                            <span className="text-sm font-black text-navy-500 w-8 text-center">
                                {covers}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCovers((c) => Math.min(20, c + 1))}
                                className="w-8 h-8 rounded-lg bg-navy-50 border border-navy-100 text-navy-500 font-bold hover:bg-navy-100 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1.5">
                            Special Requests / Notes
                        </label>
                        <textarea
                            rows={2}
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="Preferences, allergies..."
                            className="w-full bg-navy-50 border border-navy-100 rounded-xl p-2.5 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 resize-none transition-all"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-auto pt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!guestName.trim()}
                            className="flex-1 flex items-center justify-center gap-2 bg-navy-500 hover:bg-navy-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-navy-500/20"
                        >
                            <FaCheck className="text-[10px]" />
                            {isEdit ? "Update Allotment" : "Allot Table"}
                        </button>

                        {isEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    onRemove(allotment.id);
                                    onClose();
                                }}
                                className="flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-500 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
                                title="Free / Release Table"
                            >
                                <FaSignOutAlt className="text-xs" /> Free Table
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Column: Menu Items & Ordering */}
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-4 overflow-y-auto bg-navy-50/20 min-h-[350px] md:min-h-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-navy-500 uppercase tracking-widest flex items-center gap-2">
                            <FaUtensils className="text-gold-500" /> Order Menu Items
                        </h4>
                        <button
                            onClick={onClose}
                            className="text-navy-300 hover:text-navy-500 cursor-pointer p-1.5 rounded-full hover:bg-navy-50 hidden md:block"
                        >
                            <FaTimes className="text-base" />
                        </button>
                    </div>

                    {/* Menu Search Bar */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-navy-300 pointer-events-none">
                            <FaSearch className="text-xs" />
                        </span>
                        <input
                            type="text"
                            value={menuSearch}
                            onChange={(e) => setMenuSearch(e.target.value)}
                            placeholder="Search dishes or drinks..."
                            className="w-full bg-white border border-navy-100 rounded-xl pl-9 pr-4 py-2 text-xs text-navy-500 font-medium focus:outline-none focus:border-gold-500 transition-all shadow-sm"
                        />
                    </div>

                    {/* Search results catalog (quick adding) */}
                    {menuSearch.trim() !== "" && (
                        <div className="bg-white border border-navy-100 rounded-2xl p-2.5 max-h-40 overflow-y-auto flex flex-col gap-1.5 shadow-md">
                            {menuItemsCatalog.length === 0 ? (
                                <p className="text-[10px] text-navy-300 italic p-2 text-center">
                                    No matches found.
                                </p>
                            ) : (
                                menuItemsCatalog.slice(0, 6).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-4 p-1.5 hover:bg-navy-50/50 rounded-xl transition-all"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-navy-500 truncate">
                                                {item.heading}
                                            </p>
                                            <p className="text-[9px] text-navy-400 italic">
                                                {item.subType} · ₹{item.newPrice}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAddMenuItem(item)}
                                            className="bg-gold-500 hover:bg-gold-600 text-white font-bold p-2 rounded-lg text-[9px] cursor-pointer"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Selected/Ordered items board */}
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px] border border-navy-100/50 rounded-2xl p-4 bg-white/70">
                        {orderedItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-navy-300">
                                <FaUtensils className="text-2xl text-gold-300/60 mb-2" />
                                <p className="text-[10px] font-light">No food items added yet.</p>
                                <p className="text-[9px] text-navy-300/70 font-light mt-0.5">
                                    Type in search above to add items.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {orderedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 bg-white border border-navy-50 rounded-xl p-2.5 shadow-sm group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-navy-500 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-accent-teal font-medium mt-0.5">
                                                ₹{Number(item.price).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Qty controller */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleDecMenuQty(item.id)}
                                                className="w-5 h-5 rounded bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 hover:bg-navy-100 transition-colors"
                                            >
                                                <FaMinus className="text-[7px]" />
                                            </button>
                                            <span className="text-xs font-black text-navy-500 w-4 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleIncMenuQty(item.id)}
                                                className="w-5 h-5 rounded bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 hover:bg-navy-100 transition-colors"
                                            >
                                                <FaPlus className="text-[7px]" />
                                            </button>
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMenuItem(item.id)}
                                            className="text-navy-300 hover:text-red-500 cursor-pointer p-1 rounded transition-colors shrink-0"
                                        >
                                            <FaTrash className="text-[9px]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total summary block */}
                    {orderedItems.length > 0 && (
                        <div className="bg-navy-500 text-white rounded-2xl p-4 flex justify-between items-center shadow-md">
                            <div>
                                <span className="text-[8px] uppercase tracking-widest text-gold-300 font-bold block">
                                    Current Total
                                </span>
                                <span className="text-lg font-black font-sans">
                                    ₹{getMenuTotal().toLocaleString()}
                                </span>
                            </div>
                            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full border border-white/10 font-bold">
                                {orderedItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
