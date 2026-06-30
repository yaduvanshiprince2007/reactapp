import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTh, FaList, FaPlus, FaMinus, FaSlidersH, FaCheck } from "react-icons/fa";
import { useCart, ItemType } from "../../hooks/useCart";
import ItemLong from "../ItemLongComp/ItemLong";

interface ItemGalleryProps {
    items: any[];
    itemType: ItemType;
    onCustomise: (item: any) => void;
    emptyMessage?: string;
}

export const ItemGallery: React.FC<ItemGalleryProps> = ({
    items,
    itemType,
    onCustomise,
    emptyMessage = "No items found in this section.",
}) => {
    const { quantities, incrementQty, decrementQty } = useCart();
    const userRole = localStorage.getItem("loggedInUserRole");

    const [viewMode, setViewMode] = useState<"card" | "table">(() => {
        return (localStorage.getItem("itemGalleryViewMode") as "card" | "table") || "card";
    });

    const handleToggleView = (mode: "card" | "table") => {
        setViewMode(mode);
        localStorage.setItem("itemGalleryViewMode", mode);
    };

    if (items.length === 0) {
        return (
            <div className="bg-white/60 backdrop-blur border border-navy-150 rounded-3xl p-12 text-center text-navy-400">
                <p className="text-sm font-light">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* View Mode Toggle Switch */}
            <div className="flex justify-end items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold text-navy-400 tracking-wider mr-2">
                    View Mode:
                </span>
                <div className="bg-navy-50/60 border border-navy-100 p-1 rounded-xl flex items-center shadow-sm">
                    <button
                        onClick={() => handleToggleView("card")}
                        title="Card Grid View"
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-all ${
                            viewMode === "card"
                                ? "bg-navy-500 text-white shadow-sm"
                                : "text-navy-400 hover:text-navy-600"
                        }`}
                    >
                        <FaTh />
                    </button>
                    <button
                        onClick={() => handleToggleView("table")}
                        title="Compact Table View"
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-all ${
                            viewMode === "table"
                                ? "bg-navy-500 text-white shadow-sm"
                                : "text-navy-400 hover:text-navy-600"
                        }`}
                    >
                        <FaList />
                    </button>
                </div>
            </div>

            {/* CARD GRID VIEW */}
            {viewMode === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => {
                        const qty = quantities[item.id] || 0;
                        const isBooked = qty > 0;
                        const itemDetailPath = `/${itemType === "room" ? "room" : itemType === "menu" ? "menu" : "service"}/${item.id}`;

                        return (
                            <ItemLong
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                heading={item.heading}
                                subType={item.subType}
                                duration={item.duration}
                                oldPrice={item.oldPrice}
                                effectivePrice={item.newPrice}
                                itemType={itemType === "room" ? "room" : "menu"}
                                description={item.description}
                                keyPoints={item.keyPoints}
                                benefits={item.benefits}
                                buttons={
                                    <div className="flex flex-col gap-3 mt-4">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                to={itemDetailPath}
                                                className="flex-1 inline-flex items-center justify-center border border-navy-200 hover:border-gold-500 hover:bg-gold-50 text-navy-500 hover:text-gold-600 font-semibold px-4 py-2.5 rounded-full text-xs transition-all text-center"
                                            >
                                                Details
                                            </Link>

                                            {userRole !== "staff" && (
                                                !isBooked ? (
                                                    <button
                                                        onClick={() => onCustomise(item)}
                                                        className="flex-1 inline-flex items-center justify-center border border-transparent bg-navy-500 hover:bg-navy-600 text-white font-semibold px-4 py-2.5 rounded-full text-xs transition-all cursor-pointer shadow-md shadow-navy-500/10"
                                                    >
                                                        <FaSlidersH className="mr-1.5 text-[10px]" /> Customize
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to="/bookings"
                                                        className="flex-1 inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-full text-xs transition-all shadow-md cursor-pointer text-center"
                                                    >
                                                        <FaCheck className="mr-1 text-[9px]" /> Checkout
                                                    </Link>
                                                )
                                            )}
                                        </div>

                                        {/* Direct Select Option */}
                                        {userRole !== "staff" && (
                                            <div className="w-full">
                                                {!isBooked ? (
                                                    <button
                                                        onClick={() => incrementQty(item.id, itemType, item.newPrice, item.heading)}
                                                        className="w-full inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 active:scale-98 text-white font-bold px-4 py-2.5 rounded-full text-xs transition-all shadow-md shadow-gold-500/10 cursor-pointer"
                                                    >
                                                        Direct Select
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-gold-50 border border-gold-300/30 rounded-full px-1.5 py-1 shadow-sm">
                                                        <button
                                                            onClick={() => decrementQty(item.id, itemType)}
                                                            className="w-8 h-8 rounded-full bg-white hover:bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 cursor-pointer shadow-sm active:scale-90 transition-all font-bold"
                                                        >
                                                            <FaMinus className="text-[9px]" />
                                                        </button>
                                                        <div className="text-center">
                                                            <span className="text-[9px] uppercase font-bold text-navy-400 block tracking-wider leading-none">Ordered Count</span>
                                                            <span className="text-sm font-black text-navy-500 leading-none">{qty}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => incrementQty(item.id, itemType, item.newPrice, item.heading)}
                                                            className="w-8 h-8 rounded-full bg-white hover:bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 cursor-pointer shadow-sm active:scale-90 transition-all font-bold"
                                                        >
                                                            <FaPlus className="text-[9px]" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        );
                    })}
                </div>
            )}

            {/* COMPACT TABLE VIEW */}
            {viewMode === "table" && (
                <div className="bg-white/90 backdrop-blur border border-gold-300/10 rounded-3xl overflow-hidden shadow-md">
                    {/* Desktop Table - Hidden on small devices */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs text-navy-500 font-sans">
                            <thead>
                                <tr className="border-b border-navy-100 bg-navy-50/50 font-bold uppercase tracking-wider text-[10px] text-navy-400">
                                    <th className="py-4 px-6">Item</th>
                                    <th className="py-4 px-6">Highlights / Details</th>
                                    <th className="py-4 px-6 text-right">Price</th>
                                    {userRole !== "staff" && <th className="py-4 px-6 text-center w-[200px]">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const qty = quantities[item.id] || 0;
                                    const isBooked = qty > 0;
                                    const itemDetailPath = `/${itemType === "room" ? "room" : itemType === "menu" ? "menu" : "service"}/${item.id}`;

                                    return (
                                        <tr key={item.id} className="border-b border-navy-50/50 hover:bg-navy-50/20 transition-colors last:border-0">
                                            {/* Info Column */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.heading}
                                                            className="w-12 h-12 object-cover rounded-xl border border-navy-100 bg-navy-50 shrink-0"
                                                        />
                                                    )}
                                                    <div>
                                                        <Link to={itemDetailPath} className="font-bold text-navy-500 text-sm hover:text-gold-600 transition-colors">
                                                            {item.heading}
                                                        </Link>
                                                        <p className="text-[10px] text-navy-400 italic font-medium">{item.subType}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Details / Highlights Column */}
                                            <td className="py-4 px-6 max-w-sm">
                                                {item.keyPoints && item.keyPoints.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.keyPoints.slice(0, 3).map((kp: string, idx: number) => (
                                                            <span key={idx} className="text-[9px] font-semibold text-gold-700 bg-gold-50 border border-gold-200/50 rounded-full px-2 py-0.5">
                                                                {kp}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="line-clamp-2 text-navy-400 font-light">{item.description}</p>
                                                )}
                                            </td>

                                            {/* Pricing Column */}
                                            <td className="py-4 px-6 text-right font-sans">
                                                <div className="flex flex-col items-end justify-center">
                                                    <span className="text-sm font-extrabold text-accent-teal">
                                                        ₹{Number(item.newPrice).toLocaleString()}
                                                        {itemType === "room" && <span className="text-[10px] font-medium text-navy-400">/night</span>}
                                                    </span>
                                                    {item.oldPrice && (
                                                        <span className="text-[10px] text-navy-300 line-through">
                                                            ₹{Number(item.oldPrice).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            {userRole !== "staff" && (
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col items-stretch gap-2">
                                                        {!isBooked ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => incrementQty(item.id, itemType, item.newPrice, item.heading)}
                                                                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-1.5 px-3 rounded-full text-[10px] transition-all cursor-pointer text-center"
                                                                >
                                                                    Direct
                                                                </button>
                                                                <button
                                                                    onClick={() => onCustomise(item)}
                                                                    className="flex-1 bg-navy-500 hover:bg-navy-600 text-white font-bold py-1.5 px-3 rounded-full text-[10px] transition-all cursor-pointer text-center"
                                                                >
                                                                    Custom
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between bg-gold-50 border border-gold-300/30 rounded-full px-1 py-0.5">
                                                                <button
                                                                    onClick={() => decrementQty(item.id, itemType)}
                                                                    className="w-6 h-6 rounded-full bg-white hover:bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 cursor-pointer shadow-sm active:scale-90 transition-all"
                                                                >
                                                                    <FaMinus className="text-[8px]" />
                                                                </button>
                                                                <span className="text-xs font-black text-navy-500 px-2">{qty}</span>
                                                                <button
                                                                    onClick={() => incrementQty(item.id, itemType, item.newPrice, item.heading)}
                                                                    className="w-6 h-6 rounded-full bg-white hover:bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-600 cursor-pointer shadow-sm active:scale-90 transition-all"
                                                                >
                                                                    <FaPlus className="text-[8px]" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Compact List View - Visible on small devices */}
                    <div className="block md:hidden divide-y divide-navy-50">
                        {items.map((item) => {
                            const qty = quantities[item.id] || 0;
                            const isBooked = qty > 0;
                            const itemDetailPath = `/${itemType === "room" ? "room" : itemType === "menu" ? "menu" : "service"}/${item.id}`;

                            return (
                                <div key={item.id} className="p-4 flex gap-3 items-center">
                                    {/* Thumbnail */}
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.heading}
                                            className="w-16 h-16 object-cover rounded-xl border border-navy-100 bg-navy-50 shrink-0"
                                        />
                                    )}

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <Link to={itemDetailPath} className="font-bold text-navy-500 text-sm hover:text-gold-600 truncate block">
                                            {item.heading}
                                        </Link>
                                        <span className="text-[10px] text-navy-300 font-medium truncate block leading-none">{item.subType}</span>
                                        <span className="text-xs font-extrabold text-accent-teal mt-1 font-sans">
                                            ₹{Number(item.newPrice).toLocaleString()}
                                            {itemType === "room" && <span className="text-[9px] font-medium text-navy-400">/night</span>}
                                        </span>
                                    </div>

                                    {/* Action Column for mobile */}
                                    {userRole !== "staff" && (
                                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                                            {!isBooked ? (
                                                <div className="flex flex-col gap-1 w-20">
                                                    <button
                                                        onClick={() => incrementQty(item.id, itemType, item.newPrice, item.heading)}
                                                        className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-1 px-2 rounded-lg text-[9px] text-center"
                                                    >
                                                        Direct
                                                    </button>
                                                    <button
                                                        onClick={() => onCustomise(item)}
                                                        className="w-full bg-navy-500 hover:bg-navy-600 text-white font-bold py-1 px-2 rounded-lg text-[9px] text-center"
                                                    >
                                                        Customize
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-gold-50 border border-gold-300/30 rounded-xl px-1 py-0.5">
                                                    <button
                                                        onClick={() => decrementQty(item.id, itemType)}
                                                        className="w-5 h-5 rounded-lg bg-white border border-navy-100 flex items-center justify-center text-navy-600 font-bold"
                                                    >
                                                        <FaMinus className="text-[8px]" />
                                                    </button>
                                                    <span className="text-xs font-black text-navy-500">{qty}</span>
                                                    <button
                                                        onClick={() => incrementQty(item.id, itemType, item.newPrice, item.heading)}
                                                        className="w-5 h-5 rounded-lg bg-white border border-navy-100 flex items-center justify-center text-navy-600 font-bold"
                                                    >
                                                        <FaPlus className="text-[8px]" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
