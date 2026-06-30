import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { allRooms } from "../Redux/Reducers/Plans";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { RoomFoodConfigModal } from "./RoomFoodConfigModal";
import { ItemGallery } from "./Common/ItemGallery";

const RoomsGrid = () => {
    const rooms = useSelector((state: RootState) => state.session.plans.value);
    const dispatch = useDispatch();

    // Customizer Modal State
    const [configuringRoom, setConfiguringRoom] = useState<any | null>(null);

    useEffect(() => {
        dispatch(allRooms());
    }, [dispatch]);

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-amber-50/40 via-orange-50/15 to-white min-h-screen">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-navy-500 mb-2 leading-tight">
                    Rooms & Suites
                </h1>
                <p className="text-center text-navy-400 max-w-md mx-auto mb-8 text-sm sm:text-base font-light">
                    Explore our exquisite collection of premium suites and accommodations.
                </p>

                <ItemGallery
                    items={rooms}
                    itemType="room"
                    onCustomise={(room) => setConfiguringRoom(room)}
                    emptyMessage="No rooms or suites available at this moment."
                />
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
