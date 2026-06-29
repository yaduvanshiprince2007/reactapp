import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { allRooms } from "../Redux/Reducers/Plans";
import ItemLong from "./ItemLongComp/ItemLong";
import { Link } from "react-router-dom";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { RoomFoodConfigModal } from "./RoomFoodConfigModal";

const RoomsGrid = () => {
    const rooms = useSelector((state: RootState) => state.session.plans.value);
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const dispatch = useDispatch();

    // Customizer Modal State
    const [configuringRoom, setConfiguringRoom] = useState<any | null>(null);

    useEffect(() => {
        dispatch(allRooms());
    }, [dispatch]);

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-navy-500 mb-2 leading-tight">
                    Rooms & Suites
                </h1>
                <p className="text-center text-navy-400 max-w-md mx-auto mb-12 text-sm sm:text-base font-light">
                    Explore our exquisite collection of premium suites and accommodations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <ItemLong
                            key={room.id}
                            id={room.id}
                            image={room.image}
                            heading={room.heading}
                            subType={room.subType}
                            duration={room.duration}
                            oldPrice={room.oldPrice}
                            effectivePrice={room.newPrice}
                            itemType="room"
                            buttons={
                                <div className="flex items-center gap-3 mt-4">
                                    <Link 
                                        to={`/room/${room.id}`} 
                                        className="flex-1 inline-flex items-center justify-center border border-navy-200 hover:border-gold-500 hover:bg-gold-50 text-navy-500 hover:text-gold-600 font-semibold px-4 py-2.5 rounded-full text-sm transition-all"
                                    >
                                        Details
                                    </Link>
                                    {!bookingCart.includes(room.id) && (
                                        <button
                                            className="flex-1 inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
                                            onClick={() => setConfiguringRoom(room)}
                                        >
                                            Book
                                        </button>
                                    )}
                                </div>
                            }
                        />
                    ))}
                </div>
            </div>

            {/* Room customizer popup */}
            {configuringRoom && (
                <RoomFoodConfigModal
                    item={{
                        id: configuringRoom.id,
                        heading: configuringRoom.heading,
                        image: configuringRoom.image,
                        newPrice: configuringRoom.newPrice,
                        itemType: "room",
                    }}
                    onClose={() => setConfiguringRoom(null)}
                    onConfirm={() => {
                        dispatch(addSubscription(configuringRoom.id));
                        setConfiguringRoom(null);
                    }}
                />
            )}
        </section>
    );
};

export default RoomsGrid;
