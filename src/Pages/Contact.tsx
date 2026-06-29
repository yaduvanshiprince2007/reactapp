import { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaCheckCircle } from "react-icons/fa";

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [refId, setRefId] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;

        // Mock submission success
        setShowSuccessModal(true);
    };

    const handleCloseModal = () => {
        setName("");
        setEmail("");
        setSubject("");
        setRefId("");
        setMessage("");
        setShowSuccessModal(false);
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 leading-tight">
                        Contact Concierge
                    </h1>
                    <p className="text-navy-400 max-w-md mx-auto text-sm sm:text-base font-light">
                        We are dedicated to ensuring a seamless stay. Reach out for customizations, transfers, or bookings.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Contact details */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white border border-gold-300/10 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
                            <h3 className="text-lg font-bold text-navy-500 font-display uppercase tracking-wider mb-2">
                                Hotel Information
                            </h3>

                            {/* Map Marker */}
                            <div className="flex gap-4 items-start">
                                <span className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                                    <FaMapMarkerAlt className="text-sm" />
                                </span>
                                <div>
                                    <h4 className="text-xs uppercase font-bold text-navy-400 mb-1">Location</h4>
                                    <p className="text-sm font-medium text-navy-500">1 Azure Boulevard, Coastal City</p>
                                    <p className="text-xs text-navy-300 font-light mt-0.5">Overlooking Azure Shorelines</p>
                                </div>
                            </div>

                            {/* Call */}
                            <div className="flex gap-4 items-start">
                                <span className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                                    <FaPhoneAlt className="text-sm" />
                                </span>
                                <div>
                                    <h4 className="text-xs uppercase font-bold text-navy-400 mb-1">Direct Call</h4>
                                    <p className="text-sm font-medium text-navy-500 hover:text-gold-500 transition-colors">
                                        <a href="tel:+1800GRANDAZ">+1 800 GRAND AZ</a>
                                    </p>
                                    <p className="text-xs text-navy-300 font-light mt-0.5">Complimentary call within city limits</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-4 items-start">
                                <span className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                                    <FaEnvelope className="text-sm" />
                                </span>
                                <div>
                                    <h4 className="text-xs uppercase font-bold text-navy-400 mb-1">Email Concierge</h4>
                                    <p className="text-sm font-medium text-navy-500 hover:text-gold-500 transition-colors">
                                        <a href="mailto:concierge@grandazure.com">concierge@grandazure.com</a>
                                    </p>
                                    <p className="text-xs text-navy-300 font-light mt-0.5">Average reply time under 2 hours</p>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="flex gap-4 items-start">
                                <span className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                                    <FaClock className="text-sm" />
                                </span>
                                <div>
                                    <h4 className="text-xs uppercase font-bold text-navy-400 mb-1">Support Hours</h4>
                                    <p className="text-sm font-medium text-navy-500">24 Hours / 7 Days a week</p>
                                    <p className="text-xs text-navy-300 font-light mt-0.5">Lobby reception desk is always staffed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Form Column */}
                    <div className="lg:col-span-7 bg-white border border-gold-300/10 rounded-3xl p-6 sm:p-8 shadow-md">
                        <h3 className="text-lg font-bold text-navy-500 font-display uppercase tracking-wider mb-2">
                            Send Inquiry
                        </h3>
                        <p className="text-xs text-navy-400 font-light mb-6">Drop us details below and our guest relations executive will review it.</p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-navy-400 mb-1">Full Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Charlotte Bennett"
                                        className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-navy-400 mb-1">Email Address</label>
                                    <input 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. charlotte@example.com"
                                        className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-navy-400 mb-1">Inquiry Subject</label>
                                    <input 
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Airport Transfer Pickup"
                                        className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-navy-400 mb-1">Booking Reference ID (Optional)</label>
                                    <input 
                                        type="text"
                                        value={refId}
                                        onChange={(e) => setRefId(e.target.value)}
                                        placeholder="e.g. GA-9821"
                                        className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 text-transform-uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-navy-400 mb-1">Message Detail</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write details of your request or question..."
                                    className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-navy-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer font-sans"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Inquiry Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-gold-300/10 shadow-2xl animate-scale-up">
                        <div className="w-16 h-16 bg-accent-teal/10 text-accent-teal rounded-full flex items-center justify-center mx-auto mb-5">
                            <FaCheckCircle className="text-3xl text-accent-teal animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-navy-500 mb-2 font-display uppercase tracking-wider">
                            Inquiry Received
                        </h3>
                        <p className="text-xs text-navy-400 font-light leading-relaxed mb-6">
                            Thank you, Charlotte! Your inquiry has been sent to our guest relations team. We will review details and follow up shortly via email.
                        </p>
                        <button
                            onClick={handleCloseModal}
                            className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold py-2.5 rounded-full text-xs sm:text-sm transition-all w-full cursor-pointer shadow-md shadow-gold-500/25 focus:outline-none"
                        >
                            Return to Form
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Contact;
