import Hero from '../Components/HeroComp/Hero'
import FeaturedRooms from '../Components/FeaturedRooms'
import Offers from '../Components/Offers/Offers'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedRooms />
      
      {/* Fine Dining Callout Section */}
      <section className="py-12 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-gradient-to-r from-red-950 via-[#4A1E27] to-red-950 shadow-xl border border-red-900/10">
          <div className="md:col-span-7 p-8 lg:p-12 flex flex-col justify-center items-start text-left text-white">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gold-300 mb-4 leading-tight">
              Fine Dining Awaits
            </h2>
            <p className="text-sm sm:text-base text-red-100/90 font-light leading-relaxed mb-8 max-w-lg">
              From truffle arancini to grilled wagyu steak — explore our award-winning chef's curated selection of gourmet dining.
            </p>
            <div>
              <Link 
                to="/menu" 
                className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-gold-500/10 transition-all text-sm cursor-pointer"
              >
                View Menu
              </Link>
            </div>
          </div>
          
          <div className="md:col-span-5 relative min-h-[250px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700" 
              alt="Restaurant Dining Table" 
              className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out" 
            />
            <div className="absolute inset-0 bg-red-950/10" />
          </div>
        </div>
      </section>

      <Offers />
      <NewsLetter />
    </>
  )
}

export default Home
