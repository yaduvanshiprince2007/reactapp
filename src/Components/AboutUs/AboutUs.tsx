import hotelData from "../../Data/hotelData.json";

const AboutUs = () => {
    const { 
        title, 
        description, 
        mission, 
        vision, 
        heritage, 
        image, 
        experienceTitle, 
        experienceList, 
        testimonial 
    } = hotelData.about;

    return (
        <section className="pt-36 pb-20 px-6 lg:px-16 bg-gradient-to-b from-navy-50/20 via-white to-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-6 leading-tight tracking-tight">
                        {title}
                    </h2>
                    <p className="text-base sm:text-lg text-navy-400 font-light leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Mission, Vision, Heritage Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* Mission Card */}
                    <div className="bg-white border border-gold-300/10 p-8 rounded-2xl shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center">
                        <span className="text-3xl mb-4">🎯</span>
                        <h3 className="text-lg font-bold text-gold-600 mb-3 font-display uppercase tracking-wider">
                            {mission.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy-400 font-light leading-relaxed">
                            {mission.text}
                        </p>
                    </div>

                    {/* Vision Card */}
                    <div className="bg-white border border-gold-300/10 p-8 rounded-2xl shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center">
                        <span className="text-3xl mb-4">👁</span>
                        <h3 className="text-lg font-bold text-gold-600 mb-3 font-display uppercase tracking-wider">
                            {vision.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy-400 font-light leading-relaxed">
                            {vision.text}
                        </p>
                    </div>

                    {/* Heritage Card */}
                    <div className="bg-white border border-gold-300/10 p-8 rounded-2xl shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center">
                        <span className="text-3xl mb-4">🏛</span>
                        <h3 className="text-lg font-bold text-gold-600 mb-3 font-display uppercase tracking-wider">
                            {heritage.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-navy-400 font-light leading-relaxed">
                            {heritage.text}
                        </p>
                    </div>
                </div>

                {/* Media Showcase Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
                    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gold-300/10 aspect-[4/3] w-full">
                        <img
                            src={image}
                            alt="Grand Azure Luxury Hotel Lobby"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <h3 className="text-2xl lg:text-3xl font-extrabold text-navy-500 mb-6 leading-tight tracking-tight">
                            {experienceTitle}
                        </h3>
                        <div className="flex flex-col gap-5 w-full">
                            {experienceList.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-100 text-gold-700 text-sm font-bold shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-navy-500 mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-navy-400 font-light leading-relaxed">
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Guest Testimonial Block */}
                <div className="relative max-w-4xl mx-auto bg-gold-50/30 border border-gold-300/15 p-8 sm:p-12 rounded-3xl shadow-sm text-center overflow-hidden">
                    <div className="absolute -top-10 -left-6 text-9xl text-gold-300/10 font-serif select-none pointer-events-none">
                        “
                    </div>
                    <blockquote className="relative z-10">
                        <p className="text-base sm:text-lg lg:text-xl text-navy-500 italic leading-relaxed mb-6 font-light">
                            "{testimonial.quote}"
                        </p>
                        <cite className="not-italic text-xs font-bold text-gold-600 uppercase tracking-widest block">
                            — {testimonial.author}
                        </cite>
                    </blockquote>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
