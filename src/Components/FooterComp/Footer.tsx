import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import hotelData from "../../Data/hotelData.json";

const Footer = () => {
    const { name, tagline, email, phone, address } = hotelData.hotelInfo;

    return (
        <footer className="bg-navy-950 text-white border-t-4 border-gold-500 pt-16 pb-8 px-6 lg:px-16">
            <div className=" mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
                {/* Column 1: Brand Info */}
                <div className="md:col-span-5 flex flex-col gap-4">
                    <h3 className="text-xl font-bold tracking-wider uppercase text-gold-500 font-display">
                        {name}
                    </h3>
                    <p className="text-sm text-navy-300 leading-relaxed max-w-sm font-light">
                        {tagline}. Enjoy premium suites, award-winning dining, and world-class spa facilities by the coast.
                    </p>
                </div>

                {/* Column 2: Quick Links */}
                <div className="md:col-span-3 flex flex-col gap-4">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-gold-500 font-display">
                        Quick Links
                    </h3>
                    <ul className="flex flex-col gap-2.5 text-sm font-medium text-navy-300">
                        <li>
                            <Link to="/" className="hover:text-gold-500 transition-colors inline-block hover:translate-x-1 transition-transform duration-200">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/rooms" className="hover:text-gold-500 transition-colors inline-block hover:translate-x-1 transition-transform duration-200">
                                Rooms & Suites
                            </Link>
                        </li>
                        <li>
                            <Link to="/menu" className="hover:text-gold-500 transition-colors inline-block hover:translate-x-1 transition-transform duration-200">
                                Restaurant Menu
                            </Link>
                        </li>
                        <li>
                            <Link to="/amenities" className="hover:text-gold-500 transition-colors inline-block hover:translate-x-1 transition-transform duration-200">
                                Amenities
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="hover:text-gold-500 transition-colors inline-block hover:translate-x-1 transition-transform duration-200">
                                About Us
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Contact Info & Socials */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-gold-500 font-display">
                        Contact Us
                    </h3>
                    <div className="flex flex-col gap-2 text-sm text-navy-300 font-light">
                        <p><strong className="font-semibold text-white">Email:</strong> {email}</p>
                        <p><strong className="font-semibold text-white">Phone:</strong> {phone}</p>
                        <p><strong className="font-semibold text-white">Location:</strong> {address}</p>
                    </div>

                    {/* Social Media Grid */}
                    <div className="flex items-center gap-3.5 mt-2">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300 text-sm"
                        >
                            <FaFacebookF />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300 text-sm"
                        >
                            <FaTwitter />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300 text-sm"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-navy-900 border border-navy-800 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300 text-sm"
                        >
                            <FaLinkedin />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Section */}
            <div className="border-t border-navy-900 pt-6 text-center">
                <p className="text-xs text-navy-400 font-light">
                    &copy; {new Date().getFullYear()} {name}. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
