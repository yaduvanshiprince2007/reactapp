import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { addSubscription, removeSubscription } from "../Redux/Reducers/Subscriptions";
import { useState, useCallback, useEffect } from "react";

export type ItemType = "room" | "menu" | "service" | "banquet";

export const getCartItemQty = (id: number, itemType: ItemType): number => {
    const configKey = `${itemType}Config_${id}`;
    const saved = localStorage.getItem(configKey);
    if (!saved) return 0;
    try {
        const parsed = JSON.parse(saved);
        return parsed.quantity || 1;
    } catch {
        return 1;
    }
};

export const useCart = () => {
    const dispatch = useDispatch();
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});

    // Read quantities from localStorage for all items currently in the cart
    const refreshQuantities = useCallback(() => {
        const qtys: Record<number, number> = {};
        bookingCart.forEach((id) => {
            if (localStorage.getItem(`roomConfig_${id}`)) {
                qtys[id] = getCartItemQty(id, "room");
            } else if (localStorage.getItem(`foodConfig_${id}`)) {
                qtys[id] = getCartItemQty(id, "menu");
            } else if (localStorage.getItem(`serviceConfig_${id}`)) {
                qtys[id] = getCartItemQty(id, "service");
            } else if (localStorage.getItem(`banquetConfig_${id}`)) {
                qtys[id] = getCartItemQty(id, "banquet");
            } else {
                qtys[id] = 1;
            }
        });
        setCartQuantities(qtys);
    }, [bookingCart]);

    useEffect(() => {
        refreshQuantities();
    }, [bookingCart, refreshQuantities]);

    const saveCartItemQty = useCallback((id: number, itemType: ItemType, qty: number, basePrice: number, heading: string) => {
        const configKey = `${itemType}Config_${id}`;
        if (qty <= 0) {
            localStorage.removeItem(configKey);
            dispatch(removeSubscription(id));
            return;
        }

        const saved = localStorage.getItem(configKey);
        let config: any = {};
        if (saved) {
            try {
                config = JSON.parse(saved);
            } catch {}
        }

        config.quantity = qty;

        // Initialize default fields if not present (Direct Select / Quick Add)
        if (itemType === "room") {
            if (!config.checkIn) config.checkIn = new Date().toISOString().split("T")[0];
            if (!config.checkOut) config.checkOut = new Date(Date.now() + 86400000).toISOString().split("T")[0];
            if (config.adults === undefined) config.adults = 2;
            if (config.kids === undefined) config.kids = 0;
            if (config.isAc === undefined) config.isAc = true;
            if (config.roomTemp === undefined) config.roomTemp = 22;
            if (!config.nightlyPrice) config.nightlyPrice = basePrice + 1000;
        } else if (itemType === "menu") {
            if (!config.spiciness) config.spiciness = "Medium";
            if (!config.dietary) config.dietary = "Default";
            if (!config.diningType) config.diningType = "room-service";
            if (!config.roomNumber) config.roomNumber = "101";
            if (!config.tableNumber) config.tableNumber = "12";
            if (!config.specialNotes) config.specialNotes = "Direct order without customization";
        } else if (itemType === "service") {
            if (!config.bookingDate) config.bookingDate = new Date().toISOString().split("T")[0];
            if (!config.bookingTime) config.bookingTime = "14:00";
            if (!config.specialNotes) config.specialNotes = "Direct order without customization";

            const nameLower = heading.toLowerCase();
            if (nameLower.includes("yacht") || nameLower.includes("cruise") || id === 50) {
                config.roomNumber = config.roomNumber || "Royal Catamaran";
                config.tableNumber = config.tableNumber || "Marina Bay Marina";
            } else if (nameLower.includes("spa") || id === 51) {
                config.roomNumber = config.roomNumber || "No preference (90 Minutes)";
                config.tableNumber = config.tableNumber || "Hot Stone Massage";
            } else if (nameLower.includes("transfer") || id === 52) {
                config.roomNumber = config.roomNumber || "N/A";
                config.tableNumber = config.tableNumber || "T3 Gates";
            } else if (nameLower.includes("diving") || nameLower.includes("scuba") || id === 53) {
                config.roomNumber = config.roomNumber || "Skill: Beginner";
                config.tableNumber = config.tableNumber || "Coral Reef Sanctuary";
            } else if (nameLower.includes("welcome") || id === 54) {
                config.roomNumber = config.roomNumber || "Lobby Desk";
                config.tableNumber = config.tableNumber || "Vintage Cabernet";
            }
        } else if (itemType === "banquet") {
            if (!config.bookingDate) {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                config.bookingDate = nextWeek.toISOString().split("T")[0];
            }
            if (!config.bookingTime) config.bookingTime = "10:00";
            if (!config.seatingStyle) config.seatingStyle = "Round Tables";
            if (!config.cateringPlan) config.cateringPlan = "Bronze Buffet";
            if (!config.avRig) config.avRig = "Basic (Mic + Projector)";
            if (!config.decorTheme) config.decorTheme = "Royal Gold";
            if (config.expectedGuests === undefined) config.expectedGuests = 100;
            // Est total calculation: basePrice + catering (100 * 1000) + AV (15000) + Decor (30000) = base + 145000
            if (!config.calculatedPrice) config.calculatedPrice = basePrice + 145000;
        }

        localStorage.setItem(configKey, JSON.stringify(config));
        
        if (!bookingCart.includes(id)) {
            dispatch(addSubscription(id));
        } else {
            refreshQuantities();
        }
    }, [bookingCart, dispatch, refreshQuantities]);

    const incrementQty = useCallback((id: number, itemType: ItemType, basePrice: number, heading: string) => {
        const currentQty = cartQuantities[id] || 0;
        const maxQty = itemType === "room" ? 35 : itemType === "menu" ? 15 : itemType === "banquet" ? 5 : 12;
        if (currentQty < maxQty) {
            saveCartItemQty(id, itemType, currentQty + 1, basePrice, heading);
        }
    }, [cartQuantities, saveCartItemQty]);

    const decrementQty = useCallback((id: number, itemType: ItemType) => {
        const currentQty = cartQuantities[id] || 0;
        if (currentQty > 0) {
            saveCartItemQty(id, itemType, currentQty - 1, 0, "");
        }
    }, [cartQuantities, saveCartItemQty]);

    return {
        bookingCart,
        quantities: cartQuantities,
        saveCartItemQty,
        incrementQty,
        decrementQty,
        refreshQuantities,
    };
};
