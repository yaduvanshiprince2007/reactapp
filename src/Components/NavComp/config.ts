export interface NavbarItem {
    title: string;
    path?: string;
    children?: NavbarItem[];
}

export const navbarItems: NavbarItem[] = [
    {
        title: "Home",
        path: "/"
    },
    {
        title: "Rooms",
        path: "/rooms"
    },
    {
        title: "Dining",
        children: [
            {
                title: "Full Menu",
                path: "/menu"
            },
            {
                title: "Appetizers",
                path: "/menu?cat=appetizer"
            },
            {
                title: "Main Course",
                path: "/menu?cat=mainCourse"
            },
            {
                title: "Desserts",
                path: "/menu?cat=dessert"
            },
            {
                title: "Beverages",
                path: "/menu?cat=beverage"
            }
        ]
    },
    {
        title: "Amenities",
        path: "/amenities"
    },
    {
        title: "About",
        path: "/about"
    }
];