import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { allServices } from "../Redux/Reducers/Plans";
import ItemLong from "../Components/ItemLongComp/ItemLong";
import { Link } from "react-router-dom";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { ServiceConfigModal } from "../Components/ServiceConfigModal";

const Services = () => {
    const services = useSelector((state: RootState) => state.session.plans.value);
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const dispatch = useDispatch();
    const userRole = localStorage.getItem("loggedInUserRole");
    
    // Popup selector state
    const [configuringItem, setConfiguringItem] = useState<any | null>(null);

    useEffect(() => {
        dispatch(allServices());
    }, [dispatch]);

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-navy-500 mb-2 leading-tight">
                    Premium Services
                </h1>
                <p className="text-center text-navy-400 max-w-md mx-auto mb-12 text-sm sm:text-base font-light">
                    Enhance your stay with yacht cruises, spa treatments, and private conveniences.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((item) => (
                        <div key={item.id} className="text-navy-900">
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
                                            to={`/service/${item.id}`} 
                                            className="flex-1 inline-flex items-center justify-center border border-navy-200 hover:border-gold-500 hover:bg-gold-50 text-navy-500 hover:text-gold-600 font-semibold px-4 py-2.5 rounded-full text-sm transition-all"
                                        >
                                            Details
                                        </Link>
                                        {userRole !== "staff" && (
                                            !bookingCart.includes(item.id) ? (
                                                <button
                                                    className="flex-1 inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-all shadow-md shadow-gold-500/10 cursor-pointer"
                                                    onClick={() => setConfiguringItem(item)}
                                                >
                                                    Order Service
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
