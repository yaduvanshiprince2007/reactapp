import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '../Redux/store';
import { featuredRooms } from '../Redux/Reducers/Plans';
import { addSubscription } from '../Redux/Reducers/Subscriptions';
import { RoomFoodConfigModal } from './RoomFoodConfigModal';
import { ItemGallery } from './Common/ItemGallery';

const FeaturedRooms = () => {
    const rooms = useSelector((state: RootState) => state.session.plans.value);
    const dispatch = useDispatch();

    // Customizer Modal State
    const [configuringRoom, setConfiguringRoom] = useState<any | null>(null);

    useEffect(() => {
        dispatch(featuredRooms());
    }, [dispatch]);

    return (
        <section className="py-16 px-6 lg:px-16 bg-white">
            <div className="mx-auto max-w-6xl">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-center text-navy-500 mb-2">
                    Featured Suites
                </h2>
                <p className="text-center text-navy-400 max-w-md mx-auto mb-8 text-sm sm:text-base font-light">
                    Handpicked luxury accommodations for an exceptional coastal stay.
                </p>

                <ItemGallery
                    items={rooms}
                    itemType="room"
                    onCustomise={(room) => setConfiguringRoom(room)}
                    emptyMessage="No featured suites available at this moment."
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

export default FeaturedRooms;
