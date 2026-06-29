/* ─── Booking domain types ───────────────────────────────────────── */
export interface BookingItem {
    name: string;
    itemType: string;
    quantity: number;
    price: number;
    status?: string;
    details?: {
        checkIn?: string;
        checkOut?: string;
        adults?: number;
        kids?: number;
        diningType?: string;
        roomNumber?: string;
        tableNumber?: string;
        tableGuests?: number;
        diningTime?: string;
        bookingDate?: string;
        bookingTime?: string;
        specialNotes?: string;
    };
}

export interface BookingRecord {
    refId: string;
    otpRoom?: string;
    otpDining?: string;
    otpService?: string;
    date: string;
    status: string;
    guestName: string;
    email: string;
    total: number;
    items: BookingItem[];
}

/* ─── Dining allotment ───────────────────────────────────────────── */
export interface DiningAllotment {
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

/* ─── Room assignment ────────────────────────────────────────────── */
export interface RoomAssignForm {
    guestName: string;
    roomType: string;
    adults: number;
    kids: number;
    checkIn: string;
    checkOut: string;
    specialNotes: string;
}

/* ─── Document upload ────────────────────────────────────────────── */
export interface RoomDocument {
    id: string;
    roomNumber: string;
    refId?: string;
    guestName: string;
    fileName: string;
    fileType: string;
    uploadTime: string;
    category: string;
    size: string;
}

/* ─── Constants ──────────────────────────────────────────────────── */
export const ROOM_TYPES = [
    "Standard Room", "Deluxe Room", "Suite",
    "Premium Suite", "Presidential Suite",
];

export const DOC_CATEGORIES = [
    "ID Proof", "Passport", "Visa",
    "Credit Card Auth", "Medical", "Other",
];

export const TOTAL_DINING_TABLES = 40;
