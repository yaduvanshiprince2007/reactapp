import hotelData from "../../Data/hotelData.json";

const NewsLetter = () => {
    const { title, subtitle } = hotelData.newsletter;

    return (
        <section className="relative overflow-hidden py-16 px-6 bg-gradient-to-r from-gold-600 to-gold-500 text-white">
            {/* Ambient Background Circles */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-xl" />

            <div className="max-w-2xl mx-auto relative z-10 text-center">
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-3 leading-tight">
                    {title}
                </h2>
                <p className="text-gold-50 text-base font-light mb-8 max-w-md mx-auto">
                    {subtitle}
                </p>
                
                <form 
                    onSubmit={(e) => e.preventDefault()}
                    className="flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto"
                >
                    <input 
                        type="email" 
                        required
                        placeholder="Enter your email address" 
                        className="bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-gold-100/70 rounded-2xl px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/40 flex-1 text-sm transition-all"
                    />
                    <button 
                        type="submit" 
                        className="bg-navy-500 hover:bg-navy-600 active:scale-95 text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm cursor-pointer whitespace-nowrap"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
};

export default NewsLetter;
