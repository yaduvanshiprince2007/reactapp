import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import ItemLong from "../Components/ItemLongComp/ItemLong";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { allRooms } from "../Redux/Reducers/Plans";
import { FaArrowLeft } from "react-icons/fa";
import { RoomFoodConfigModal } from "../Components/RoomFoodConfigModal";

const RoomDetail = () => {
    const { id } = useParams();
    const rooms = useSelector((state: RootState) => state.session.plans.value);
    const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null);
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const dispatch = useDispatch();
    const userRole = localStorage.getItem("loggedInUserRole");

    // Modal state
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    useEffect(() => {
        dispatch(allRooms());
    }, [dispatch]);

    useEffect(() => {
        if (id) {
            const room = rooms.find((p) => p.id === Number(id));
            setSelectedRoom(room || null);
        }
    }, [id, rooms]);

    if (!selectedRoom) {
        return (
            <div className="pt-36 pb-20 px-6 text-center min-h-screen bg-gradient-to-b from-navy-50/20 to-white flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-navy-500 mb-4">Room Not Found</h2>
                <Link 
                    to="/rooms" 
                    className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold px-6 py-2.5 rounded-full shadow transition-all"
                >
                    <FaArrowLeft className="text-xs" /> Back to Rooms
                </Link>
            </div>
        );
    }

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Link 
                    to="/rooms" 
                    className="inline-flex items-center gap-2 border border-navy-200 hover:border-gold-500 hover:bg-gold-50 text-navy-500 hover:text-gold-600 font-semibold px-5 py-2.5 rounded-full text-sm transition-all mb-8"
                >
                    <FaArrowLeft className="text-xs" /> Back to Rooms
                </Link>
                
                {/* Product Detail Card Container */}
                <div className="text-navy-900 shadow-xl rounded-3xl">
                    <ItemLong
                        id={selectedRoom.id}
                        image={selectedRoom.image}
                        heading={selectedRoom.heading}
                        subType={selectedRoom.subType}
                        description={selectedRoom.description}
                        keyPoints={selectedRoom.keyPoints}
                        benefits={selectedRoom.benefits}
                        targetAudience={selectedRoom.targetAudience}
                        duration={selectedRoom.duration}
                        oldPrice={selectedRoom.oldPrice}
                        effectivePrice={selectedRoom.newPrice}
                        itemType="room"
                        buttons={
                            <div className="mt-4 flex items-center justify-end">
                                {userRole === "staff" ? (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200/50 px-4 py-2 rounded-full select-none">
                                        Staff Mode: Bookings Disabled
                                    </span>
                                ) : !bookingCart.includes(selectedRoom.id) ? (
                                    <button
                                        className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-gold-500/10 cursor-pointer transition-all text-sm"
                                        onClick={() => setIsConfigOpen(true)}
                                    >
                                        Book This Room
                                    </button>
                                ) : (
                                    <Link 
                                        to="/bookings" 
                                        className="bg-accent-teal hover:bg-teal-700 active:scale-95 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-teal-800/10 transition-all text-sm text-center"
                                    >
                                        View in Bookings
                                    </Link>
                                )}
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Room customizer popup */}
            {isConfigOpen && (
                <RoomFoodConfigModal
                    item={{
                        id: selectedRoom.id,
                        heading: selectedRoom.heading || "",
                        image: selectedRoom.image || "",
                        newPrice: selectedRoom.newPrice ? String(selectedRoom.newPrice) : "0",
                        itemType: "room",
                    }}
                    onClose={() => setIsConfigOpen(false)}
                    onConfirm={() => {
                        dispatch(addSubscription(selectedRoom.id));
                        setIsConfigOpen(false);
                    }}
                />
            )}
        </section>
    );
};

export default RoomDetail;
