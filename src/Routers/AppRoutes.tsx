import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from '../Pages/Home'
import Checkout from '../Pages/Checkout'
import Rooms from '../Pages/Rooms'
import RoomDetail from '../Pages/RoomDetail'
import Menu from '../Pages/Menu'
import MenuDetail from '../Pages/MenuDetail'
import AboutUs from '../Components/AboutUs/AboutUs'
import Amenities from '../Pages/Amenities'
import Services from '../Pages/Services'
import ServiceDetail from '../Pages/ServiceDetail'
import PastBookings from '../Pages/PastBookings'
import Reviews from '../Pages/Reviews'
import Contact from '../Pages/Contact'
import AmenityDetail from '../Pages/AmenityDetail'
import Login from '../Pages/Login'
import QrScanner from '../Pages/QrScanner'
import Profile from '../Pages/Profile'
import Banquet from '../Pages/Banquet'

const AppRoutes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem("loggedInUserRole");

    useEffect(() => {
        // STRICT RBAC ROUTE GUARD: If staff is logged in, redirect them to /scan for all routes
        if (userRole === "staff" && location.pathname !== "/scan") {
            navigate("/scan");
        }
    }, [userRole, location.pathname, navigate]);

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/rooms' element={<Rooms />} />
            <Route path='/room/:id' element={<RoomDetail />} />
            <Route path='/menu' element={<Menu />} />
            <Route path='/menu/:id' element={<MenuDetail />} />
            <Route path='/services' element={<Services />} />
            <Route path='/service/:id' element={<ServiceDetail />} />
            <Route path='/banquet' element={<Banquet />} />
            <Route path='/bookings' element={<Checkout />} />
            <Route path='/about' element={<AboutUs />} />
            <Route path='/amenities' element={<Amenities />} />
            <Route path='/amenity/:id' element={<AmenityDetail />} />
            <Route path='/lookup' element={<PastBookings />} />
            <Route path='/reviews' element={<Reviews />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/login' element={<Login />} />
            <Route path='/scan' element={<QrScanner />} />
            <Route path='/profile' element={<Profile />} />
            
            {/* Legacy redirects */}
            <Route path='/allplans' element={<Rooms />} />
            <Route path='/cart' element={<Checkout />} />
            <Route path='/plan/:id' element={<RoomDetail />} />
            <Route path='/aboutus' element={<AboutUs />} />
            <Route path='*' element={<Home />} />
        </Routes>
    )
}

export default AppRoutes;
