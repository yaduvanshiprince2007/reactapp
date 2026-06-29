import React, { JSX } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

interface ItemLongProps {
    id: number;
    image?: string;
    heading?: string;
    subType?: string;
    description?: string;
    keyPoints?: string[];
    benefits?: string[];
    targetAudience?: string;
    duration?: number;
    oldPrice?: number;
    effectivePrice?: number;
    itemType?: "room" | "menu";
    buttons?: JSX.Element;
}

const ItemLong: React.FC<ItemLongProps> = ({
    id,
    image,
    heading,
    subType,
    description,
    keyPoints = [],
    benefits = [],
    targetAudience,
    duration,
    oldPrice,
    effectivePrice,
    itemType = "room",
    buttons,
}) => {
    const bookings = useSelector((state: RootState) => state.local.subscribtions.value);
    const booked = bookings.includes(id);
    const priceLabel = itemType === "room" ? "/night" : "";

    return (
        <div className="group relative flex flex-col h-full bg-white/90 backdrop-blur-sm border border-gold-300/10 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:translate-y-[-6px] transition-all duration-300">
            {/* Ribbon if already Booked */}
            {booked && (
                <div className="absolute top-4 right-4 z-10 bg-gold-500 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md border border-white/20 animate-pulse">
                    Booked
                </div>
            )}

            {/* Product Image */}
            {image && (
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-navy-50">
                    <img
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        src={image}
                        alt={heading || "Item image"}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/15 to-transparent" />
                    
                    {/* Item type pill */}
                    <span className="absolute top-4 left-4 bg-navy-500/80 backdrop-blur-md text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10">
                        {itemType === "room" ? "Suite" : "Dining"}
                    </span>
                </div>
            )}

            {/* Product Body */}
            <div className="p-6 flex flex-col flex-1">
                {heading && (
                    <h3 className="text-xl font-bold text-navy-500 font-display mb-1.5 tracking-wide line-clamp-1 group-hover:text-gold-600 transition-colors" title={heading}>
                        {heading}
                    </h3>
                )}

                {subType && (
                    <p className="text-xs text-navy-400 font-medium mb-3.5 italic line-clamp-1" title={subType}>
                        {subType}
                    </p>
                )}

                <div className="h-px bg-navy-100/50 w-full mb-4" />

                {description && (
                    <p className="text-xs text-navy-400 font-light leading-relaxed mb-5 line-clamp-3" title={description}>
                        {description}
                    </p>
                )}

                {/* Key highlights (keyPoints) */}
                {keyPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {keyPoints.map((point, index) => (
                            <span 
                                key={index} 
                                className="text-[10px] font-semibold text-gold-700 bg-gold-50 border border-gold-200/50 rounded-full px-2.5 py-0.5 line-clamp-1"
                                title={point}
                            >
                                {point}
                            </span>
                        ))}
                    </div>
                )}

                {/* Included Inclusions (benefits) */}
                {benefits.length > 0 && (
                    <ul className="flex flex-col gap-1.5 mb-6 text-xs text-navy-400 font-light">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-1.5">
                                <span className="text-accent-teal font-bold shrink-0">✔</span>
                                <span className="line-clamp-1">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Details Footer information */}
                {(targetAudience || duration) && itemType === "room" && (
                    <div className="flex items-center justify-between text-xs text-navy-400 font-light mb-6 bg-navy-50/50 px-3.5 py-2.5 rounded-xl border border-navy-100/30">
                        {targetAudience && (
                            <p>
                                <span className="font-semibold text-navy-500">Ideal for:</span> {targetAudience}
                            </p>
                        )}
                        {duration && (
                            <p>
                                <span className="font-semibold text-navy-500">Min:</span> {duration} night
                            </p>
                        )}
                    </div>
                )}

                {/* Pricing Block */}
                {(oldPrice !== undefined || effectivePrice !== undefined) && (
                    <div className="mt-auto pt-4 border-t border-navy-100/40 flex items-end justify-between">
                        <div>
                            <span className="text-[10px] text-navy-300 font-medium uppercase tracking-wider block mb-0.5">
                                {itemType === "room" ? "Rate starting at" : "Price"}
                            </span>
                            <div className="flex items-baseline gap-2">
                                {effectivePrice !== undefined && (
                                    <span className="text-lg font-extrabold text-accent-teal font-sans">
                                        ₹{effectivePrice.toLocaleString()}<span className="text-xs font-medium text-navy-400">{priceLabel}</span>
                                    </span>
                                )}
                                {oldPrice !== undefined && (
                                    <span className="text-xs text-navy-300 line-through font-sans">
                                        ₹{oldPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Extra Discount Tag */}
                        {oldPrice && effectivePrice && (
                            <span className="text-[10px] font-bold text-accent-red bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-md">
                                -{Math.round(((oldPrice - effectivePrice) / oldPrice) * 100)}%
                            </span>
                        )}
                    </div>
                )}

                {/* Custom Action buttons slot */}
                {buttons && <div className="mt-4 w-full">{buttons}</div>}
            </div>
        </div>
    );
};

export default ItemLong;
