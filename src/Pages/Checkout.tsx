import React, { useEffect, useState } from "react";
import allProduct from "../Data/allProducts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { removeSubscription, setSubscription } from "../Redux/Reducers/Subscriptions";
import { useNavigate } from "react-router-dom";

interface BookingItem {
    image: string;
    planId: number;
    name: string;
    unitPrice: number;
    quantity: number;
    maxQuantity: number;
    itemType: "room" | "menu" | "service";
    total: number;
}

interface BookingDetails {
    // Rooms
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    kids?: number;
    isAc?: boolean;
    roomTemp?: number;
    nightlyPrice?: number;
    quantity?: number;
    // Dining
    diningType?: "room-service" | "dine-in";
    roomNumber?: string;
    tableNumber?: string;
    tableGuests?: number;
    diningTime?: string;
    spiciness?: string;
    dietary?: string;
    // Services
    bookingDate?: string;
    bookingTime?: string;
    specialNotes?: string;
}

const Checkout: React.FC = () => {
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const [bookedItems, setBookedItems] = useState<BookingItem[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [createdRefId, setCreatedRefId] = useState("");
    const [createdOtpRoom, setCreatedOtpRoom] = useState("");
    const [createdOtpDining, setCreatedOtpDining] = useState("");
    const [createdOtpService, setCreatedOtpService] = useState("");
    const [itemDetails, setItemDetails] = useState<Record<number, BookingDetails>>({});
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getAvailableRoomNumbers = () => {
        const rooms: string[] = [];
        
        // 1. Collect room numbers from rooms currently in this cart
        bookedItems.forEach(item => {
            if (item.itemType === "room") {
                const roomNum = itemDetails[item.planId]?.roomNumber;
                if (roomNum && !rooms.includes(roomNum)) {
                    rooms.push(roomNum);
                }
            }
        });

        // 2. Collect room numbers from active past bookings in localStorage
        try {
            const customRaw = localStorage.getItem("customBookings");
            if (customRaw) {
                const list = JSON.parse(customRaw);
                list.forEach((booking: any) => {
                    if (booking.status !== "Cancelled by Guest" && booking.status !== "Cancelled") {
                        booking.items.forEach((item: any) => {
                            if (item.itemType === "room" && item.details?.roomNumber) {
                                if (!rooms.includes(item.details.roomNumber)) {
                                    rooms.push(item.details.roomNumber);
                                }
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Error reading past room numbers", e);
        }

        return rooms;
    };

    // Guard: Force Guest Login if not authenticated
    useEffect(() => {
        const userRole = localStorage.getItem("loggedInUserRole");
        if (!userRole || userRole !== "customer") {
            navigate("/login?redirect=bookings");
        }
    }, [navigate]);

    // Synchronize booked items with dynamic configuration surcharge math
    useEffect(() => {
        if (bookingCart.length === 0 && isSuccessModalOpen) {
            return;
        }
        const items = allProduct
            .filter((product) => bookingCart.includes(product.id))
            .map((item) => {
                let unitPrice = Number(item.newPrice) || 0;
                let qty = 1;
                let maxQty = 10;

                if (item.itemType === "room") {
                    const details = itemDetails[item.id];
                    const savedConfig = localStorage.getItem(`roomConfig_${item.id}`);
                    
                    let isAcVal = true;
                    let nightlyPriceVal = unitPrice + 1000;
                    if (savedConfig) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            isAcVal = parsed.isAc ?? true;
                            nightlyPriceVal = parsed.nightlyPrice ?? (isAcVal ? unitPrice + 1000 : unitPrice);
                        } catch (e) {}
                    }

                    unitPrice = nightlyPriceVal;

                    let cIn = details?.checkIn;
                    let cOut = details?.checkOut;
                    qty = details?.quantity || 1;

                    if (savedConfig && (!cIn || !cOut)) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            cIn = cIn || parsed.checkIn;
                            cOut = cOut || parsed.checkOut;
                            qty = details?.quantity || parsed.quantity || 1;
                        } catch (e) {}
                    }

                    let nights = 1;
                    if (cIn && cOut) {
                        const d1 = new Date(cIn);
                        const d2 = new Date(cOut);
                        const diff = Math.abs(d2.getTime() - d1.getTime());
                        nights = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
                    }
                    
                    unitPrice = unitPrice * nights;
                    maxQty = 35;
                } else if (item.itemType === "menu") {
                    const details = itemDetails[item.id];
                    qty = details?.quantity || 1;
                    const savedConfig = localStorage.getItem(`foodConfig_${item.id}`);
                    if (savedConfig && !details?.quantity) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            qty = parsed.quantity || 1;
                        } catch (e) {}
                    }
                    maxQty = 15;
                } else if (item.itemType === "service") {
                    const details = itemDetails[item.id];
                    qty = details?.quantity || 1;
                    const savedConfig = localStorage.getItem(`serviceConfig_${item.id}`);
                    if (savedConfig && !details?.quantity) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            qty = parsed.quantity || 1;
                        } catch (e) {}
                    }
                    maxQty = 12;
                }

                return {
                    image: item.image || "",
                    planId: item.id,
                    name: item.heading || "",
                    unitPrice,
                    quantity: qty,
                    maxQuantity: maxQty,
                    itemType: item.itemType,
                    total: unitPrice * qty,
                };
            });
        setBookedItems(items);
    }, [bookingCart, isSuccessModalOpen, itemDetails]);

    useEffect(() => {
        const grandTotal = bookedItems.reduce((acc, item) => acc + item.total, 0);
        setTotal(grandTotal);
    }, [bookedItems]);

    // Pre-populate details with default values when items list changes
    useEffect(() => {
        const initialDetails = { ...itemDetails };
        let updated = false;
        const deliverToAmenity = localStorage.getItem("deliverToAmenity");

        bookedItems.forEach(item => {
            if (!initialDetails[item.planId]) {
                updated = true;
                if (item.itemType === "room") {
                    const savedConfig = localStorage.getItem(`roomConfig_${item.planId}`);
                    const randFloor = Math.floor(1 + Math.random() * 10);
                    const randRoomNum = Math.floor(1 + Math.random() * 30);
                    const defaultRoom = `${randFloor}${randRoomNum < 10 ? '0' : ''}${randRoomNum}`;
                    if (savedConfig) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            initialDetails[item.planId] = {
                                checkIn: parsed.checkIn || new Date().toISOString().split('T')[0],
                                checkOut: parsed.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                adults: parsed.adults || 2,
                                kids: parsed.kids || 0,
                                roomNumber: defaultRoom,
                                isAc: parsed.isAc ?? true,
                                roomTemp: parsed.roomTemp ?? 22,
                                nightlyPrice: parsed.nightlyPrice
                            };
                        } catch (e) {
                            initialDetails[item.planId] = {
                                checkIn: new Date().toISOString().split('T')[0],
                                checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                adults: 2,
                                kids: 0,
                                roomNumber: defaultRoom
                            };
                        }
                    } else {
                        initialDetails[item.planId] = {
                            checkIn: new Date().toISOString().split('T')[0],
                            checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            adults: 2,
                            kids: 0,
                            roomNumber: defaultRoom
                        };
                    }
                } else if (item.itemType === "service") {
                    const savedConfig = localStorage.getItem(`serviceConfig_${item.planId}`);
                    if (savedConfig) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            initialDetails[item.planId] = {
                                bookingDate: parsed.bookingDate || new Date().toISOString().split('T')[0],
                                bookingTime: parsed.bookingTime || "14:00",
                                roomNumber: parsed.roomNumber || "",
                                tableNumber: parsed.tableNumber || "",
                                specialNotes: parsed.specialNotes || ""
                            };
                        } catch (e) {
                            initialDetails[item.planId] = {
                                bookingDate: new Date().toISOString().split('T')[0],
                                bookingTime: "14:00",
                                specialNotes: ""
                            };
                        }
                    } else {
                        initialDetails[item.planId] = {
                            bookingDate: new Date().toISOString().split('T')[0],
                            bookingTime: "14:00",
                            specialNotes: ""
                        };
                    }
                } else {
                    // Menu / Dining
                    const savedConfig = localStorage.getItem(`foodConfig_${item.planId}`);
                    if (savedConfig) {
                        try {
                            const parsed = JSON.parse(savedConfig);
                            initialDetails[item.planId] = {
                                diningType: parsed.diningType || "room-service",
                                roomNumber: parsed.roomNumber || "101",
                                tableNumber: parsed.tableNumber || "12",
                                tableGuests: 2,
                                diningTime: "13:00",
                                spiciness: parsed.spiciness || "Medium",
                                dietary: parsed.dietary || "Default",
                                specialNotes: parsed.specialNotes || ""
                            };
                        } catch (e) {
                            if (deliverToAmenity) {
                                initialDetails[item.planId] = {
                                    diningType: "dine-in",
                                    tableNumber: `${deliverToAmenity} - Lounger/Cabana #`,
                                    tableGuests: 2,
                                    diningTime: "13:00"
                                };
                            } else {
                                initialDetails[item.planId] = {
                                    diningType: "room-service",
                                    roomNumber: "101",
                                    tableNumber: "12",
                                    tableGuests: 2,
                                    diningTime: "13:00"
                                };
                            }
                        }
                    } else {
                        if (deliverToAmenity) {
                            initialDetails[item.planId] = {
                                diningType: "dine-in",
                                tableNumber: `${deliverToAmenity} - Lounger/Cabana #`,
                                tableGuests: 2,
                                diningTime: "13:00"
                            };
                        } else {
                            initialDetails[item.planId] = {
                                diningType: "room-service",
                                roomNumber: "101",
                                tableNumber: "12",
                                tableGuests: 2,
                                diningTime: "13:00"
                            };
                        }
                    }
                }
            }
        });

        if (updated) {
            setItemDetails(initialDetails);
        }
    }, [bookedItems]);

    const handleUpdateDetails = (id: number, key: keyof BookingDetails, value: any) => {
        setItemDetails(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [key]: value
            }
        }));
    };

    const decreaseQty = (id: number) => {
        const item = bookedItems.find(i => i.planId === id);
        if (!item) return;
        
        const newQty = Math.max(1, item.quantity - 1);
        handleUpdateDetails(id, "quantity", newQty);

        if (item.quantity === 1) {
            dispatch(removeSubscription(id));
            localStorage.removeItem(`roomConfig_${id}`);
            localStorage.removeItem(`foodConfig_${id}`);
            localStorage.removeItem(`serviceConfig_${id}`);
        }
    };

    const increaseQty = (id: number) => {
        const item = bookedItems.find(i => i.planId === id);
        if (!item) return;
        
        const newQty = Math.min(item.maxQuantity, item.quantity + 1);
        handleUpdateDetails(id, "quantity", newQty);
    };

    const removeItem = (id: number) => {
        dispatch(removeSubscription(id));
        localStorage.removeItem(`roomConfig_${id}`);
        localStorage.removeItem(`foodConfig_${id}`);
        localStorage.removeItem(`serviceConfig_${id}`);
    };

    const handleConfirmCheckout = () => {
        const refId = `GA-${Math.floor(1000 + Math.random() * 9000)}`;

        const hasRooms = bookedItems.some(i => i.itemType === "room");
        const hasDining = bookedItems.some(i => i.itemType === "menu");
        const hasServices = bookedItems.some(i => i.itemType === "service");

        const otpRoom = hasRooms ? String(Math.floor(1000 + Math.random() * 9000)) : "";
        const otpDining = hasDining ? String(Math.floor(1000 + Math.random() * 9000)) : "";
        const otpService = hasServices ? String(Math.floor(1000 + Math.random() * 9000)) : "";

        const guestName = localStorage.getItem("loggedInUserName") || "Guest User";

        const newBooking = {
            refId,
            otpRoom: otpRoom || undefined,
            otpDining: otpDining || undefined,
            otpService: otpService || undefined,
            date: new Date().toISOString().split('T')[0],
            status: "Confirmed (Upcoming)",
            guestName,
            email: `${guestName.toLowerCase().replace(/\s+/g, "")}@grandazure.com`,
            total,
            items: bookedItems.map(item => ({
                name: item.name,
                itemType: item.itemType,
                quantity: item.quantity,
                price: item.unitPrice,
                status: item.itemType === "room" ? "Reserved (Future)" : item.itemType === "menu" ? "In Progress" : "Booked (Scheduled)",
                details: itemDetails[item.planId] || {}
            }))
        };

        const existingCustom = localStorage.getItem("customBookings");
        const customList = existingCustom ? JSON.parse(existingCustom) : [];
        customList.push(newBooking);
        localStorage.setItem("customBookings", JSON.stringify(customList));

        setCreatedRefId(refId);
        setCreatedOtpRoom(otpRoom);
        setCreatedOtpDining(otpDining);
        setCreatedOtpService(otpService);
        setIsSuccessModalOpen(true);
        dispatch(setSubscription([]));
    };

    const handleCloseSuccessModal = () => {
        localStorage.removeItem("deliverToAmenity");
        setIsSuccessModalOpen(false);
        navigate(`/lookup?refId=${createdRefId}`);
    };

    if (bookingCart.length === 0 && !isSuccessModalOpen) {
        return (
            <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-center">
                <div className="max-w-xl mx-auto py-20 px-6 bg-white rounded-3xl border border-gold-300/10 shadow-md">
                    <span className="text-4xl mb-4 inline-block">🛏</span>
                    <h3 className="text-xl font-bold text-navy-500 mb-2">No bookings or orders yet</h3>
                    <p className="text-sm text-navy-400 font-light mb-0">
                        Browse our luxury suites, dining menu, or hotel services to get started!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-navy-900">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-navy-500 mb-2 leading-tight">
                    My Bookings & Orders
                </h1>
                <p className="text-center text-navy-400 max-w-md mx-auto mb-10 text-sm font-light">
                    Review and confirm your luxury suites reservation and gourmet room service order.
                </p>

                <div className="bg-white/70 backdrop-blur border border-gold-300/10 rounded-3xl p-6 sm:p-8 shadow-md relative text-left">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-navy-100 font-bold text-navy-500 font-display text-sm tracking-wide mb-6">
                        <div className="col-span-2">Image</div>
                        <div className="col-span-3">Item Details</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2 text-center">Nights / Qty</div>
                        <div className="col-span-2 text-right">Total</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {/* List items */}
                    <div className="flex flex-col gap-6">
                        {bookedItems.map((item) => (
                            <div
                                key={item.planId}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pb-6 border-b border-navy-50 last:border-0 last:pb-0"
                            >
                                {/* Image */}
                                <div className="col-span-1 md:col-span-2">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-24 md:h-16 object-cover rounded-xl border border-navy-100 shadow-sm"
                                    />
                                </div>

                                {/* Name & Inputs */}
                                <div className="col-span-1 md:col-span-3 text-left">
                                    <h4 className="font-bold text-navy-500 text-sm sm:text-base leading-tight">
                                        {item.name}
                                    </h4>
                                    <span className="inline-block text-[9px] font-bold text-gold-600 bg-gold-50 border border-gold-300/10 px-2 py-0.5 rounded mt-1 uppercase">
                                        {item.itemType === "room" ? "Stay" : item.itemType === "service" ? "Service" : "Dining"}
                                    </span>

                                    {/* Department Forms */}
                                    <div className="mt-3 bg-navy-50/50 rounded-xl p-3 border border-navy-100/10 flex flex-col gap-2.5 text-[11px] text-navy-400">
                                        {item.itemType === "room" && (
                                            <>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Check-In</label>
                                                        <input
                                                            type="date"
                                                            value={itemDetails[item.planId]?.checkIn || ""}
                                                            onChange={(e) => handleUpdateDetails(item.planId, "checkIn", e.target.value)}
                                                            className="w-full bg-white border border-navy-100 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Check-Out</label>
                                                        <input
                                                            type="date"
                                                            value={itemDetails[item.planId]?.checkOut || ""}
                                                            onChange={(e) => handleUpdateDetails(item.planId, "checkOut", e.target.value)}
                                                            className="w-full bg-white border border-navy-100 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Adults</label>
                                                        <select
                                                            value={itemDetails[item.planId]?.adults || 2}
                                                            onChange={(e) => handleUpdateDetails(item.planId, "adults", Number(e.target.value))}
                                                            className="w-full bg-white border border-navy-100 rounded px-1 py-0.5 text-[10px] focus:outline-none"
                                                        >
                                                            <option value={1}>1 Guest</option>
                                                            <option value={2}>2 Guests</option>
                                                            <option value={3}>3 Guests</option>
                                                            <option value={4}>4 Guests</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Kids</label>
                                                        <select
                                                            value={itemDetails[item.planId]?.kids || 0}
                                                            onChange={(e) => handleUpdateDetails(item.planId, "kids", Number(e.target.value))}
                                                            className="w-full bg-white border border-navy-100 rounded px-1 py-0.5 text-[10px] focus:outline-none"
                                                        >
                                                            <option value={0}>0 Kids</option>
                                                            <option value={1}>1 Kid</option>
                                                            <option value={2}>2 Kids</option>
                                                            <option value={3}>3 Kids</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {item.itemType === "menu" && (
                                            <>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Delivery Type</label>
                                                    <div className="flex gap-4 items-center mt-1">
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`diningType-${item.planId}`}
                                                                checked={itemDetails[item.planId]?.diningType === "room-service"}
                                                                onChange={() => handleUpdateDetails(item.planId, "diningType", "room-service")}
                                                                className="text-gold-500 focus:ring-0"
                                                            />
                                                            Room Service
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`diningType-${item.planId}`}
                                                                checked={itemDetails[item.planId]?.diningType === "dine-in"}
                                                                onChange={() => handleUpdateDetails(item.planId, "diningType", "dine-in")}
                                                                className="text-gold-500 focus:ring-0"
                                                            />
                                                            Dine-In Table
                                                        </label>
                                                    </div>
                                                </div>

                                                 {itemDetails[item.planId]?.diningType === "room-service" && (() => {
                                                     const availableRooms = getAvailableRoomNumbers();
                                                     const currentVal = itemDetails[item.planId]?.roomNumber || "";
                                                     
                                                     return (
                                                         <div>
                                                             <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Delivery Room #</label>
                                                             {availableRooms.length > 0 ? (
                                                                 <div className="flex flex-col gap-1.5">
                                                                     <select
                                                                         value={currentVal}
                                                                         onChange={(e) => handleUpdateDetails(item.planId, "roomNumber", e.target.value)}
                                                                         className="w-full bg-white border border-navy-100 rounded px-2.5 py-1 text-[10px] focus:outline-none text-navy-500 font-medium cursor-pointer"
                                                                     >
                                                                         <option value="">-- Select Booked Room --</option>
                                                                         {availableRooms.map((rm) => (
                                                                             <option key={rm} value={rm}>Room {rm} (Active Stay)</option>
                                                                         ))}
                                                                         <option value="custom">-- Enter Other Room Number --</option>
                                                                     </select>
                                                                     {currentVal === "custom" && (
                                                                         <input
                                                                             type="text"
                                                                             placeholder="Enter Room Number (e.g. 302)"
                                                                             onChange={(e) => handleUpdateDetails(item.planId, "roomNumber", e.target.value)}
                                                                             className="w-full bg-white border border-navy-100 rounded px-2.5 py-1 text-[10px] focus:outline-none text-navy-500 font-medium mt-1"
                                                                         />
                                                                     )}
                                                                 </div>
                                                             ) : (
                                                                 <input
                                                                     type="text"
                                                                     value={currentVal}
                                                                     onChange={(e) => handleUpdateDetails(item.planId, "roomNumber", e.target.value)}
                                                                     placeholder="Enter Room Number (e.g. 302)"
                                                                     className="w-full bg-white border border-navy-100 rounded px-2.5 py-1 text-[10px] focus:outline-none text-navy-500 font-medium"
                                                                 />
                                                             )}
                                                         </div>
                                                     );
                                                 })()}
                                                 {itemDetails[item.planId]?.diningType !== "room-service" && (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Table Number / Point</label>
                                                                <input
                                                                    type="text"
                                                                    value={itemDetails[item.planId]?.tableNumber || ""}
                                                                    onChange={(e) => handleUpdateDetails(item.planId, "tableNumber", e.target.value)}
                                                                    placeholder="e.g. Table #4"
                                                                    className="w-full bg-white border border-navy-100 rounded px-2.5 py-1 text-[10px] focus:outline-none"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Guests Count</label>
                                                                <select
                                                                    value={itemDetails[item.planId]?.tableGuests || 2}
                                                                    onChange={(e) => handleUpdateDetails(item.planId, "tableGuests", Number(e.target.value))}
                                                                    className="w-full bg-white border border-navy-100 rounded px-1 py-1 text-[10px] focus:outline-none"
                                                                >
                                                                    <option value={1}>1 Guest</option>
                                                                    <option value={2}>2 Guests</option>
                                                                    <option value={4}>4 Guests</option>
                                                                    <option value={6}>6 Guests</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Reservation Time</label>
                                                            <input
                                                                type="time"
                                                                value={itemDetails[item.planId]?.diningTime || ""}
                                                                onChange={(e) => handleUpdateDetails(item.planId, "diningTime", e.target.value)}
                                                                className="w-full bg-white border border-navy-100 rounded px-2 py-0.5 text-[10px] focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-2.5">
                                                    <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Special Dietary / Prep Requests</label>
                                                    <textarea
                                                        value={itemDetails[item.planId]?.specialNotes || ""}
                                                        onChange={(e) => handleUpdateDetails(item.planId, "specialNotes", e.target.value)}
                                                        placeholder="e.g. Extra spicy, gluten-free, no peanuts, cutlery choice..."
                                                        rows={1.5}
                                                        className="w-full bg-white border border-navy-100 rounded px-2.5 py-1.5 text-[10px] focus:outline-none resize-none"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {item.itemType === "service" && (
                                            <>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Schedule Date</label>
                                                        <input
                                                            type="date"
                                                            value={itemDetails[item.planId]?.bookingDate || ""}
                                                            onChange={(e) => handleUpdateDetails(item.planId, "bookingDate", e.target.value)}
                                                            className="w-full bg-white border border-navy-100 rounded px-2 py-0.5 text-[10px] focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Preferred Slot</label>
                                                        <select
                                                            value={itemDetails[item.planId]?.bookingTime || "14:00"}
                                                            onChange={(e) => handleUpdateDetails(item.planId, "bookingTime", e.target.value)}
                                                            className="w-full bg-white border border-navy-100 rounded px-1.5 py-1 text-[10px] focus:outline-none"
                                                        >
                                                            <option value="09:00">Morning (09:00 AM)</option>
                                                            <option value="12:00">Noon (12:00 PM)</option>
                                                            <option value="15:00">Afternoon (03:00 PM)</option>
                                                            <option value="18:00">Evening (06:00 PM)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {(item.name.toLowerCase().includes("yacht") || item.name.toLowerCase().includes("cruise")) ? (
                                                    <div className="flex gap-2 mt-2">
                                                        <div className="flex-1">
                                                            <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Boarding Port</label>
                                                            <select
                                                                value={itemDetails[item.planId]?.tableNumber || "Marina Bay Marina"}
                                                                onChange={(e) => handleUpdateDetails(item.planId, "tableNumber", e.target.value)}
                                                                className="w-full bg-white border border-navy-100 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                                                            >
                                                                <option value="Marina Bay Marina">Marina Bay Marina</option>
                                                                <option value="Grand Pier Terminal">Grand Pier Terminal</option>
                                                                <option value="Azure Lagoon Harbor">Azure Lagoon Harbor</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Yacht Class</label>
                                                            <select
                                                                value={itemDetails[item.planId]?.roomNumber || "Royal Catamaran"}
                                                                onChange={(e) => handleUpdateDetails(item.planId, "roomNumber", e.target.value)}
                                                                className="w-full bg-white border border-navy-100 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                                                            >
                                                                <option value="Royal Catamaran">Royal Catamaran (Standard)</option>
                                                                <option value="Azure Majesty Yacht">Azure Majesty (Luxury)</option>
                                                                <option value="Ocean Whisperer Cruiser">Ocean Whisperer (Private)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ) : (item.name.toLowerCase().includes("transfer") || item.name.toLowerCase().includes("airport")) ? (
                                                    <div className="flex gap-2 mt-2">
                                                        <div className="flex-1">
                                                            <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Flight Number</label>
                                                            <input 
                                                                type="text"
                                                                placeholder="e.g. EK-502"
                                                                value={itemDetails[item.planId]?.roomNumber || ""}
                                                                onChange={(e) => handleUpdateDetails(item.planId, "roomNumber", e.target.value)}
                                                                className="w-full bg-white border border-navy-100 rounded px-2 py-1 text-[10px] focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Pickup Terminal</label>
                                                            <input 
                                                                type="text"
                                                                placeholder="e.g. T3 Gate B"
                                                                value={itemDetails[item.planId]?.tableNumber || ""}
                                                                onChange={(e) => handleUpdateDetails(item.planId, "tableNumber", e.target.value)}
                                                                className="w-full bg-white border border-navy-100 rounded px-2 py-1 text-[10px] focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="mt-2">
                                                    <label className="block text-[9px] uppercase font-bold text-navy-300 mb-0.5">Special Requests</label>
                                                    <textarea
                                                        value={itemDetails[item.planId]?.specialNotes || ""}
                                                        onChange={(e) => handleUpdateDetails(item.planId, "specialNotes", e.target.value)}
                                                        placeholder="e.g. Dietary tags, spa therapist preferences, allergies..."
                                                        rows={2}
                                                        className="w-full bg-white border border-navy-100 rounded-xl px-2.5 py-1.5 text-[10px] focus:outline-none resize-none"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-1 md:col-span-2 text-left md:text-center text-xs font-semibold text-navy-400">
                                    <span className="md:hidden font-bold">Price: </span>
                                    ₹ {item.unitPrice.toLocaleString()} {item.itemType === "room" && "/ night"}
                                </div>

                                {/* Quantity controls */}
                                <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center gap-2">
                                    <span className="md:hidden text-xs font-bold text-navy-400">Quantity: </span>
                                    <div className="flex items-center gap-2.5 bg-navy-50/50 rounded-full border border-navy-100/50 p-1 text-xs">
                                        <button
                                            onClick={() => decreaseQty(item.planId)}
                                            className="w-6 h-6 rounded-full bg-white hover:bg-gold-500 hover:text-white transition-colors cursor-pointer focus:outline-none flex items-center justify-center font-bold text-navy-500"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-navy-500 w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => increaseQty(item.planId)}
                                            disabled={item.quantity >= item.maxQuantity}
                                            className="w-6 h-6 rounded-full bg-white hover:bg-gold-500 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-inherit transition-colors cursor-pointer focus:outline-none flex items-center justify-center font-bold text-navy-500"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Row Total */}
                                <div className="col-span-1 md:col-span-2 text-left md:text-right text-sm font-bold text-navy-500 font-sans">
                                    <span className="md:hidden font-bold">Total: </span>
                                    ₹ {item.total.toLocaleString()}
                                </div>

                                {/* Remove Action Button */}
                                <div className="col-span-1 md:col-span-1 text-left md:text-right">
                                    <button
                                        onClick={() => removeItem(item.planId)}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline cursor-pointer focus:outline-none"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart summary footer details */}
                    <div className="mt-10 border-t border-navy-100 pt-6 flex justify-between items-center bg-navy-50/30 p-6 rounded-2xl">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-navy-300">Total Items Cost</span>
                            <h3 className="text-xs text-navy-400 font-light mt-0.5">Taxes and resort fees calculated at check-in desk.</h3>
                        </div>
                        <div className="text-2xl font-black text-accent-teal font-sans">
                            ₹ {total.toLocaleString()}
                        </div>
                    </div>

                    {/* Actions button */}
                    <div className="text-center mt-8">
                        <button
                            onClick={handleConfirmCheckout}
                            className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-10 py-3.5 rounded-full shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all text-sm cursor-pointer focus:outline-none"
                        >
                            Confirm Booking & Pay
                        </button>
                    </div>

                    {/* Checkout Success Popup Modal */}
                    {isSuccessModalOpen && (
                        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-gold-300/10 shadow-2xl animate-scale-up">
                                <div className="w-16 h-16 bg-accent-teal/10 text-accent-teal rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-navy-500 mb-2 font-display uppercase tracking-wide">Booking Confirmed!</h3>
                                <p className="text-xs text-navy-400 font-light mb-6">
                                    Your reservation was processed successfully. Booking receipt is dispatched to your email address.
                                </p>
                                
                                {/* Reference ID and Security OTP details */}
                                <div className="bg-navy-50 p-4 rounded-2xl mb-6 text-left text-xs font-semibold flex flex-col gap-2 border border-navy-100/40">
                                    <div className="flex justify-between">
                                        <span className="text-navy-300 font-medium">Invoice ID:</span>
                                        <span className="text-navy-500 font-bold">{createdRefId}</span>
                                    </div>
                                    {createdOtpRoom && (
                                        <div className="flex justify-between">
                                            <span className="text-navy-300 font-medium">Stays check-in OTP:</span>
                                            <span className="text-gold-600 font-extrabold">{createdOtpRoom}</span>
                                        </div>
                                    )}
                                    {createdOtpDining && (
                                        <div className="flex justify-between">
                                            <span className="text-navy-300 font-medium">Dining verify OTP:</span>
                                            <span className="text-gold-600 font-extrabold">{createdOtpDining}</span>
                                        </div>
                                    )}
                                    {createdOtpService && (
                                        <div className="flex justify-between">
                                            <span className="text-navy-300 font-medium">Services verify OTP:</span>
                                            <span className="text-gold-600 font-extrabold">{createdOtpService}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleCloseSuccessModal}
                                    className="w-full bg-navy-500 hover:bg-navy-600 text-white font-bold py-3 rounded-full text-xs transition-colors shadow shadow-navy-500/10 cursor-pointer focus:outline-none"
                                >
                                    Proceed to Lookup
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Checkout;
