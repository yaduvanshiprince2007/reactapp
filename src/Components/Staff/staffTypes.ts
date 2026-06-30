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
        roomType?: string;
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
    menuItems?: {
        id: number;
        name: string;
        price: number;
        quantity: number;
        status?: string;
    }[];
}

/* ─── Room assignment ────────────────────────────────────────────── */
export interface RoomAssignForm {
    guestName: string;
    roomType: string;
    roomNumber?: string;
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

/**
 * Room allocation by floor:
 *   Floors 1–2  → Standard Room    (Rooms 101–230)
 *   Floors 3–4  → Deluxe Room      (Rooms 301–430)
 *   Floors 5–6  → Suite            (Rooms 501–630)
 *   Floors 7–8  → Premium Suite    (Rooms 701–830)
 *   Floors 9–10 → Presidential Suite (Rooms 901–1030)
 */
export const ROOM_TYPE_FLOOR_MAP: Record<string, number[]> = {
    "Standard Room":       [1, 2],
    "Deluxe Room":         [3, 4],
    "Suite":               [5, 6],
    "Premium Suite":       [7, 8],
    "Presidential Suite":  [9, 10],
};

/** Derive the room type from a room number string (e.g. "503" → "Suite") */
export function getRoomTypeFromNumber(roomNum: string): string {
    const floor = parseInt(roomNum.slice(0, roomNum.length > 3 ? 2 : 1), 10);
    for (const [type, floors] of Object.entries(ROOM_TYPE_FLOOR_MAP)) {
        if (floors.includes(floor)) return type;
    }
    return "Standard Room";
}

/** Return all 60 valid room numbers for a given room type */
export function getRoomsOfType(roomType: string): string[] {
    const floors = ROOM_TYPE_FLOOR_MAP[roomType] ?? [1, 2];
    const rooms: string[] = [];
    for (const floor of floors) {
        for (let n = 1; n <= 30; n++) {
            rooms.push(`${floor}${n < 10 ? "0" : ""}${n}`);
        }
    }
    return rooms;
}

/* ─── Banquet / Event booking ────────────────────────────────────── */
export interface BanquetBooking {
    id: string;
    guestName: string;
    refId?: string;
    spaceName: string;
    spaceId: number;
    bookingDate: string;
    bookingTime: string;
    expectedGuests: number;
    seatingStyle: string;
    cateringPlan: string;
    avRig: string;
    decorTheme: string;
    grandTotal: number;
    status: "Confirmed" | "In-Progress" | "Completed" | "Cancelled";
    notes?: string;
    createdAt: string;
}

/* ─── Room Type Configuration ────────────────────────────────────── */
export interface RoomTypeConfig {
    id: string;
    name: string;
    description: string;
    totalRooms: number;
    basePricePerNight: number;
    maxAdults: number;
    maxKids: number;
    amenities: string[];
    isActive: boolean;
    color: string; // tailwind color token e.g. "teal"
}

export interface RoomUpgradeRecord {
    id: string;
    refId: string;
    guestName: string;
    fromRoomNumber: string;
    toRoomNumber: string;
    fromRoomType: string;
    toRoomType: string;
    isComplimentary: boolean;
    upgradePrice: number;
    notes: string;
    performedAt: string;
}

export const DEFAULT_ROOM_TYPE_CONFIGS: RoomTypeConfig[] = [
    {
        id: "standard",
        name: "Standard Room",
        description: "Comfortable queen-bed rooms with garden view. Ideal for solo and budget travellers.",
        totalRooms: 60,
        basePricePerNight: 4999,
        maxAdults: 2,
        maxKids: 1,
        amenities: ["WiFi", "TV", "AC", "Safe", "Hair Dryer", "Housekeeping"],
        isActive: true,
        color: "teal",
    },
    {
        id: "deluxe",
        name: "Deluxe Room",
        description: "Spacious rooms with ocean view, premium linens, and enhanced amenities.",
        totalRooms: 60,
        basePricePerNight: 8999,
        maxAdults: 2,
        maxKids: 2,
        amenities: ["WiFi", "Mini Bar", "TV", "AC", "Bathrobe", "Safe", "Espresso Machine"],
        isActive: true,
        color: "blue",
    },
    {
        id: "suite",
        name: "Suite",
        description: "Elegant suites with separate living area, jacuzzi, and panoramic views.",
        totalRooms: 60,
        basePricePerNight: 19999,
        maxAdults: 3,
        maxKids: 2,
        amenities: ["WiFi", "Jacuzzi", "Butler Service", "Lounge", "Premium Bar", "Smart TV"],
        isActive: true,
        color: "purple",
    },
    {
        id: "premium-suite",
        name: "Premium Suite",
        description: "Lavish premium suites with private terrace, butler, and exclusive floor access.",
        totalRooms: 60,
        basePricePerNight: 34999,
        maxAdults: 4,
        maxKids: 2,
        amenities: ["WiFi", "Private Pool", "Butler", "Premium Bar", "Home Theater", "Concierge"],
        isActive: true,
        color: "gold",
    },
    {
        id: "presidential",
        name: "Presidential Suite",
        description: "The pinnacle of luxury — private floor, dedicated staff, and bespoke experiences.",
        totalRooms: 60,
        basePricePerNight: 74999,
        maxAdults: 6,
        maxKids: 4,
        amenities: ["WiFi", "Private Pool", "Chef", "Rolls Royce Transfer", "Personal Concierge", "Helipad Access"],
        isActive: true,
        color: "amber",
    },
];

