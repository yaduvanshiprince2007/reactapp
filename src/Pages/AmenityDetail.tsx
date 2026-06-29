import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import hotelData from "../Data/hotelData.json";
import allProduct from "../Data/allProducts";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaShoppingBag, FaConciergeBell } from "react-icons/fa";

interface AmenityData {
    id: string;
    title: string;
    description: string;
    image: string;
    hours: string;
    location: string;
    overview: string;
    rules: string[];
}

const AmenityDetail = () => {
    const { id } = useParams();
    const [amenity, setAmenity] = useState<AmenityData | null>(null);
    const dispatch = useDispatch();
    const userRole = localStorage.getItem("loggedInUserRole");
    const [orderFeedback, setOrderFeedback] = useState("");

    useEffect(() => {
        if (id) {
            const list: AmenityData[] = hotelData.amenitiesPage.list as any;
            const found = list.find(x => x.id === id);
            setAmenity(found || null);
        }
    }, [id]);

    if (!amenity) {
        return (
            <div className="pt-36 pb-20 px-6 text-center min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-navy-500 mb-4">Amenity Not Found</h2>
                <Link
                    to="/amenities"
                    className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold px-6 py-2.5 rounded-full transition-all"
                >
                    <FaArrowLeft className="text-xs" /> Back to Amenities
                </Link>
            </div>
        );
    }

    // Filter 3 popular snacks/drinks for quick checkout
    const quickMenu = allProduct
        .filter(item => item.itemType === "menu" && (item.category === "beverage" || item.category === "appetizer"))
        .slice(0, 3);

    const handleQuickOrder = (prodId: number) => {
        if (userRole === "staff") {
            return;
        }
        // Set delivery destination to localstorage
        localStorage.setItem("deliverToAmenity", amenity.title);
        dispatch(addSubscription(prodId));
        setOrderFeedback(`Added to order! Click "My Bookings" in header to checkout.`);
        setTimeout(() => setOrderFeedback(""), 4500);
    };

    const handleOrderOffline = () => {
        localStorage.setItem("deliverToAmenity", amenity.title);
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            <div className="max-w-6xl mx-auto">
                {/* Back/Exit link */}
                <Link
                    to="/amenities"
                    className="inline-flex items-center gap-2 border border-navy-200 hover:border-gold-500 hover:bg-gold-50 text-navy-500 hover:text-gold-600 font-semibold px-5 py-2.5 rounded-full text-sm transition-all mb-8"
                >
                    <FaArrowLeft className="text-xs" /> Back to Amenities
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                    {/* Left Column: Image and Details */}
                    <div className="lg:col-span-8 bg-white border border-gold-300/10 rounded-3xl overflow-hidden shadow-md">
                        <img
                            src={amenity.image}
                            alt={amenity.title}
                            className="w-full h-[350px] sm:h-[450px] object-cover"
                        />
                        <div className="p-6 sm:p-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-500 mb-4 leading-tight uppercase font-display tracking-wider">
                                {amenity.title}
                            </h1>

                            {/* Meta items */}
                            <div className="flex flex-wrap gap-6 border-b border-navy-100 pb-6 mb-6 text-xs text-navy-400 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <FaClock className="text-gold-500 text-sm" /> <strong>Hours:</strong> {amenity.hours}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FaMapMarkerAlt className="text-gold-500 text-sm" /> <strong>Location:</strong> {amenity.location}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-3 font-display">Overview</h3>
                                <p className="text-sm sm:text-base text-navy-400 font-light leading-relaxed">
                                    {amenity.overview}
                                </p>
                            </div>

                            {/* Rules */}
                            <div>
                                <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-3 font-display">Guidelines & Rules</h3>
                                <ul className="list-disc pl-5 flex flex-col gap-2 text-xs sm:text-sm text-navy-400 font-light leading-relaxed">
                                    {amenity.rules.map((rule, idx) => (
                                        <li key={idx}>{rule}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Food Ordering Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {/* Food Delivery Service */}
                        <div className="bg-navy-500 text-white border border-gold-300/10 rounded-3xl p-6 sm:p-8 shadow-lg text-center flex flex-col items-center">
                            <div className="w-10 h-10 bg-gold-400/20 text-gold-300 rounded-full flex items-center justify-center mb-4">
                                <FaConciergeBell className="text-sm animate-pulse" />
                            </div>
                            <h3 className="text-lg font-bold text-gold-300 mb-2 uppercase font-display tracking-wider">
                                Order Food Here
                            </h3>
                            <p className="text-xs text-navy-100 font-light leading-relaxed mb-6">
                                Deliver gourmet dining orders and drinks straight to your lounger or cabana at the <strong className="font-semibold text-white">{amenity.title}</strong>.
                            </p>

                            <Link
                                to={userRole === "staff" ? "#" : `/menu?deliverTo=${encodeURIComponent(amenity.title)}`}
                                onClick={userRole === "staff" ? undefined : handleOrderOffline}
                                className={`font-bold py-3 rounded-full text-xs sm:text-sm transition-all w-full text-center uppercase tracking-wider ${userRole === "staff"
                                        ? "bg-navy-400/20 text-navy-300 cursor-not-allowed border border-navy-400/10"
                                        : "bg-gold-500 hover:bg-gold-600 text-white shadow-md shadow-gold-500/20 cursor-pointer"
                                    }`}
                            >
                                {userRole === "staff" ? "Staff Mode: Booking Disabled" : "Browse Food & Drinks Menu"}
                            </Link>
                        </div>

                        {/* Quick pool/spa items shelf */}
                        <div className="bg-white border border-gold-300/10 rounded-3xl p-6 sm:p-8 shadow-md">
                            <h3 className="text-sm font-bold text-navy-500 uppercase tracking-widest mb-4 font-display">
                                Popular Here
                            </h3>

                            {orderFeedback && (
                                <div className="mb-4 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold py-2 px-3 rounded-xl animate-pulse">
                                    {orderFeedback}
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                {quickMenu.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center pb-3 border-b border-navy-50 last:border-0 last:pb-0">
                                        <img
                                            src={item.image}
                                            alt={item.heading}
                                            className="w-12 h-12 object-cover rounded-xl border border-navy-100"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-navy-500 truncate">{item.heading}</h4>
                                            <p className="text-[10px] text-navy-400 font-sans mt-0.5">₹ {item.newPrice}</p>
                                        </div>
                                        {userRole !== "staff" && (
                                            <button
                                                onClick={() => handleQuickOrder(item.id)}
                                                className="bg-gold-100 hover:bg-gold-500 text-gold-800 hover:text-white p-2 rounded-full transition-colors cursor-pointer focus:outline-none"
                                                title="Quick Order Direct"
                                            >
                                                <FaShoppingBag className="text-[10px]" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AmenityDetail;
