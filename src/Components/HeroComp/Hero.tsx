import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa6';
import hotelData from '../../Data/hotelData.json';

const Hero = () => {
    const { welcome, title, subtitle, bullets, image } = hotelData.hero;

    return (
        <section className="relative overflow-hidden pt-36 pb-20 px-6 lg:px-16 bg-gradient-to-br from-gold-50/70 via-white to-navy-50/50">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-200/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-200/10 rounded-full blur-3xl -z-10" />

            <div className=" mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Text Block */}
                <div className="flex flex-col items-start text-left">
                    <span className="inline-block bg-gold-100/60 text-gold-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-gold-300/20 mb-6">
                        {welcome}
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-500 mb-6 leading-tight tracking-tight">
                        {title}
                    </h1>

                    <p className="text-lg text-navy-400 font-normal leading-relaxed mb-8 max-w-xl">
                        {subtitle}
                    </p>

                    {/* Bullets List */}
                    <div className="flex flex-col gap-3.5 mb-8 w-full">
                        {bullets.map((bullet, index) => (
                            <div key={index} className="flex items-center gap-3 text-navy-500 font-medium text-base">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-100 text-gold-600 shrink-0">
                                    <FaStar className="text-xs" />
                                </span>
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <Link
                        to="/rooms"
                        className="group inline-flex items-center gap-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all cursor-pointer"
                    >
                        Explore Rooms
                        <FaArrowRight className="text-sm transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Right Image Block */}
                <div className="relative flex justify-center items-center">
                    <div className="relative w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-gold-300/20">
                        <img
                            src={image}
                            alt="Grand Azure Hotel Pool & Ocean View"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Floating Rating Badge */}
                    <div className="absolute bottom-6 left-6 md:-left-6 bg-white/95 backdrop-blur-md border border-gold-300/30 p-4 rounded-2xl shadow-xl flex items-center gap-3.5 max-w-xs transition-transform duration-300 hover:translate-y-[-4px]">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold-500 text-white font-bold shrink-0">
                            4.9
                        </div>
                        <div>
                            <div className="flex text-gold-500 text-xs gap-0.5 mb-1">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                            </div>
                            <p className="text-xs font-bold text-navy-500">Luxury Guest Rating</p>
                            <p className="text-[10px] text-navy-400 font-medium">Over 50,000 stays since 2015</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
