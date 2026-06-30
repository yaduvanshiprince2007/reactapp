import * as Icons from "react-icons/fa";
import hotelData from "../Data/hotelData.json";
import { Link } from "react-router-dom";

const Amenities = () => {
    const { title, subtitle, list, cta } = hotelData.amenitiesPage;

    // Helper to dynamically get react-icons/fa component by name
    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent size={32} /> : null;
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen">
            <div className=" mx-auto">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 leading-tight">
                        {title}
                    </h1>
                    <p className="text-center text-navy-400 max-w-md mx-auto text-sm sm:text-base font-light">
                        {subtitle}
                    </p>
                </div>

                {/* Amenities Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {list.map((item, index) => (
                        <Link
                            key={index}
                            to={`/amenity/${item.id}`}
                            className="bg-white border border-gold-300/10 p-6 rounded-2xl shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
                        >
                            <div className="text-gold-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                                {getIcon(item.icon)}
                            </div>
                            <h4 className="text-base font-bold text-navy-500 mb-2 font-display uppercase tracking-wide group-hover:text-gold-600 transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-navy-400 font-light leading-relaxed">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Bottom CTA Block */}
                <div className="bg-white border border-gold-300/10 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-navy-500 mb-3 leading-tight font-display uppercase tracking-wide">
                        {cta.title}
                    </h2>
                    <p className="text-sm text-navy-400 font-light mb-8 max-w-md mx-auto">
                        {cta.description}
                    </p>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gold-300/10 max-h-[350px] w-full">
                        <img
                            src={cta.image}
                            alt="Hotel luxury amenities preview"
                            className="w-full h-[350px] object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Amenities;
