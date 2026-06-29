import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RootState } from "../Redux/store";
import { allMenu } from "../Redux/Reducers/Plans";
import ItemLong from "../Components/ItemLongComp/ItemLong";
import { Link } from "react-router-dom";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import allProduct from "../Data/allProducts";
import { RoomFoodConfigModal } from "../Components/RoomFoodConfigModal";

const CATEGORIES = [
    { key: "all", label: "All Items" },
    { key: "appetizer", label: "Appetizers" },
    { key: "mainCourse", label: "Main Course" },
    { key: "dessert", label: "Desserts" },
    { key: "beverage", label: "Beverages" },
];

const Menu = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialCat = searchParams.get("cat") || "all";
    const deliverTo = searchParams.get("deliverTo");
    const [activeCategory, setActiveCategory] = useState(initialCat);
    const menuItems = useSelector((state: RootState) => state.session.plans.value);
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const dispatch = useDispatch();
    const userRole = localStorage.getItem("loggedInUserRole");

    // Dining customizer state
    const [configuringFood, setConfiguringFood] = useState<any | null>(null);

    useEffect(() => {
        dispatch(allMenu());
    }, [dispatch]);

    // Save delivery location to localStorage when param changes
    useEffect(() => {
        if (deliverTo) {
            localStorage.setItem("deliverToAmenity", deliverTo);
        }
    }, [deliverTo]);

    const handleCancelDelivery = () => {
        localStorage.removeItem("deliverToAmenity");
        navigate("/menu");
    };

    const handleOrder = (item: any) => {
        setConfiguringFood(item);
    };

    const filteredItems = activeCategory === "all"
        ? menuItems
        : allProduct.filter(x => x.category === activeCategory && x.itemType === "menu");

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-red-950 via-slate-900 to-navy-950 text-white min-h-screen text-left">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gold-200 mb-2 leading-tight">
                    Restaurant Menu
                </h1>
                <p className="text-center text-navy-200/80 max-w-md mx-auto mb-10 text-sm sm:text-base font-light">
                    Exquisite dishes crafted by our award-winning culinary team.
                </p>

                {/* Delivery Location Banner */}
                {deliverTo && (
                    <div className="bg-gold-500 text-white font-semibold py-3 px-6 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-md mb-10 max-w-2xl mx-auto animate-pulse">
                        <span>📍 Delivery Point: <strong className="font-extrabold uppercase tracking-wide text-navy-950">{deliverTo}</strong></span>
                        <button
                            onClick={handleCancelDelivery}
                            className="underline hover:text-navy-950 font-bold ml-4 cursor-pointer focus:outline-none"
                        >
                            Cancel Delivery
                        </button>
                    </div>
                )}

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-12 max-w-2xl mx-auto">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${activeCategory === cat.key
                                ? "bg-gold-500 border border-gold-500 text-white shadow-md shadow-gold-500/20"
                                : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                }`}
                            onClick={() => setActiveCategory(cat.key)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div key={activeCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="text-navy-900 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"> {/* Force text dark inside card container */}
                            <ItemLong
                                id={item.id}
                                image={item.image}
                                heading={item.heading}
                                subType={item.subType}
                                oldPrice={item.oldPrice}
                                effectivePrice={item.newPrice}
                                itemType="menu"
                                buttons={
                                    <div className="flex items-center gap-3 mt-4">
                                        <Link
                                            to={`/menu/${item.id}`}
                                            className="flex-1 inline-flex items-center justify-center border border-navy-200 hover:border-gold-500 hover:bg-gold-50 text-navy-500 hover:text-gold-600 font-semibold px-4 py-2.5 rounded-full text-sm transition-all text-center"
                                        >
                                            Details
                                        </Link>
                                        {userRole !== "staff" && (
                                            !bookingCart.includes(item.id) ? (
                                                <button
                                                    className="flex-1 inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
                                                    onClick={() => handleOrder(item)}
                                                >
                                                    Order
                                                </button>
                                            ) : (
                                                <Link
                                                    to="/bookings"
                                                    className="flex-1 inline-flex items-center justify-center bg-accent-teal hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-all shadow-md cursor-pointer"
                                                >
                                                    In Cart
                                                </Link>
                                            )
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Food customizer popup */}
            {configuringFood && (
                <RoomFoodConfigModal
                    item={{
                        id: configuringFood.id,
                        heading: configuringFood.heading || "",
                        image: configuringFood.image || "",
                        newPrice: configuringFood.newPrice ? String(configuringFood.newPrice) : "0",
                        itemType: "menu",
                    }}
                    onClose={() => setConfiguringFood(null)}
                    onConfirm={() => {
                        dispatch(addSubscription(configuringFood.id));
                        setConfiguringFood(null);
                    }}
                />
            )}
        </section>
    );
};

export default Menu;
