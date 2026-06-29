import { Link } from "react-router-dom";
import { BsGift, BsStars } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import hotelData from "../../Data/hotelData.json";

const Offers = () => {
    const { title, highlight, description, image } = hotelData.offers;

    return (
        <section className="py-12 px-6 lg:px-16 bg-white">
            <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-gradient-to-br from-navy-500 to-navy-700 shadow-xl border border-navy-600/20">
                {/* Image Column */}
                <div className="lg:col-span-5 relative min-h-[250px] lg:min-h-[360px] overflow-hidden">
                    <img
                        className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        src={image}
                        alt="Luxury hotel room offer"
                    />
                    <div className="absolute inset-0 bg-navy-950/15" />
                </div>

                {/* Content Column */}
                <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center items-start text-left text-white">
                    <div className="flex items-center gap-2 text-gold-400 font-bold uppercase tracking-wider text-xs lg:text-sm mb-4">
                        <BsGift className="text-sm shrink-0" />
                        <span>{title}</span>
                        <BsStars className="text-sm shrink-0" />
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                        {highlight}
                    </h3>
                    
                    <p className="text-base lg:text-lg text-navy-100/90 font-light leading-relaxed mb-8 max-w-lg">
                        {description}
                    </p>
                    
                    <div>
                        <Link
                            to="/rooms"
                            className="group inline-flex items-center gap-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all text-sm cursor-pointer"
                        >
                            View Rooms
                            <FaArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
