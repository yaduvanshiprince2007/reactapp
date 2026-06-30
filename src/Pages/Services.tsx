import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { allServices } from "../Redux/Reducers/Plans";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { ServiceConfigModal } from "../Components/ServiceConfigModal";
import { ItemGallery } from "../Components/Common/ItemGallery";

const Services = () => {
    const services = useSelector((state: RootState) => state.session.plans.value);
    const dispatch = useDispatch();

    // Popup selector state
    const [configuringItem, setConfiguringItem] = useState<any | null>(null);

    useEffect(() => {
        dispatch(allServices());
    }, [dispatch]);

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-teal-950 via-[#0e2735] to-[#04121a] text-white min-h-screen">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-navy-500 mb-2 leading-tight">
                    Premium Services
                </h1>
                <p className="text-center text-navy-400 max-w-md mx-auto mb-8 text-sm sm:text-base font-light">
                    Enhance your stay with yacht cruises, spa treatments, and private conveniences.
                </p>

                <div className="text-navy-900">
                    <ItemGallery
                        items={services}
                        itemType="service"
                        onCustomise={(item) => setConfiguringItem(item)}
                        emptyMessage="No premium services available at the moment."
                    />
                </div>
            </div>

            {/* Customizer config popup */}
            {configuringItem && (
                <ServiceConfigModal
                    serviceId={configuringItem.id}
                    serviceName={configuringItem.heading}
                    oldPrice={configuringItem.oldPrice}
                    newPrice={configuringItem.newPrice}
                    onClose={() => setConfiguringItem(null)}
                    onConfirm={() => {
                        dispatch(addSubscription(configuringItem.id));
                        setConfiguringItem(null);
                    }}
                />
            )}
        </section>
    );
};

export default Services;
