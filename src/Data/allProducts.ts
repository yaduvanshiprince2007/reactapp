import hotelData from "./hotelData.json";

export interface AllProductProp {
    id: number;
    image?: string;
    heading?: string;
    subType?: string;
    description?: string;
    oldPrice?: number;
    newPrice?: number;
    keyPoints?: string[];
    benefits?: string[];
    targetAudience?: string;
    duration?: number;
    category: "featuredRoom" | "room" | "appetizer" | "mainCourse" | "dessert" | "beverage" | "spa" | "tour" | "transfer" | "welcome";
    itemType: "room" | "menu" | "service";
    hotelDetails?: {
        overview: string;
        keyFactors: string[];
        amenities?: string[];
        approach: string[];
    };
}

const allProduct = hotelData.products as AllProductProp[];

export default allProduct;
