import { useState, useEffect } from "react";
import hotelData from "../Data/hotelData.json";
import { FaStar, FaUser, FaRegCalendarAlt, FaQuoteLeft, FaCommentAlt, FaRegSmile } from "react-icons/fa";

interface ReviewRecord {
    id: number;
    name: string;
    rating: number;
    category: string;
    date: string;
    comment: string;
}

const Reviews = () => {
    const [reviewsList, setReviewsList] = useState<ReviewRecord[]>([]);
    const [guestName, setGuestName] = useState("");
    const [rating, setRating] = useState(5);
    const [category, setCategory] = useState("room");
    const [comment, setComment] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Load static reviews + custom guest reviews from localstorage on mount
    useEffect(() => {
        const staticReviews: ReviewRecord[] = hotelData.pastReviews;
        const customReviewsRaw = localStorage.getItem("customReviews");
        const customReviewsList: ReviewRecord[] = customReviewsRaw ? JSON.parse(customReviewsRaw) : [];
        setReviewsList([...customReviewsList, ...staticReviews]);
    }, [submitSuccess]);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim() || !comment.trim()) return;

        const newReview: ReviewRecord = {
            id: Date.now(),
            name: guestName.trim(),
            rating,
            category,
            date: new Date().toISOString().split('T')[0],
            comment: comment.trim()
        };

        const customReviewsRaw = localStorage.getItem("customReviews");
        const customReviewsList: ReviewRecord[] = customReviewsRaw ? JSON.parse(customReviewsRaw) : [];
        customReviewsList.unshift(newReview); // Insert new reviews first
        localStorage.setItem("customReviews", JSON.stringify(customReviewsList));

        // Reset form
        setGuestName("");
        setRating(5);
        setCategory("room");
        setComment("");
        setSubmitSuccess(prev => !prev);

        // Show success alert briefly
        // alert("Thank you! Your feedback has been shared successfully.");
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-navy-50/20 via-white to-white min-h-screen text-left">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-500 mb-2 leading-tight">
                        Guest Reviews & Feedback
                    </h1>
                    <p className="text-navy-400 max-w-md mx-auto text-sm sm:text-base font-light">
                        Discover genuine feedback shared by travelers worldwide, or tell us about your experience at Grand Azure.
                    </p>
                </div>

                {/* Rating Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-navy-500 text-white rounded-3xl p-8 text-center flex flex-col justify-center items-center">
                        <span className="text-5xl font-black text-gold-400 mb-1">4.8</span>
                        <div className="flex gap-1 mb-2 text-gold-400">
                            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <p className="text-xs text-navy-200 font-light">Average guest rating based on over 12,000 verified bookings.</p>
                    </div>

                    <div className="bg-white border border-gold-300/10 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
                        <h4 className="font-bold text-navy-500 text-sm uppercase tracking-wider mb-3">Service Breakdown</h4>
                        <div className="flex flex-col gap-2 text-xs text-navy-400">
                            <div className="flex justify-between items-center">
                                <span>Suites & Comfort</span>
                                <span className="font-bold text-navy-500">4.9 / 5</span>
                            </div>
                            <div className="w-full bg-navy-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gold-500 h-full w-[98%]" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Dining & Bar</span>
                                <span className="font-bold text-navy-500">4.8 / 5</span>
                            </div>
                            <div className="w-full bg-navy-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gold-500 h-full w-[96%]" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Spa & Leisure</span>
                                <span className="font-bold text-navy-500">4.7 / 5</span>
                            </div>
                            <div className="w-full bg-navy-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gold-500 h-full w-[94%]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gold-300/10 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
                        <h4 className="font-bold text-navy-500 text-sm uppercase tracking-wider mb-2">Hospitality Standards</h4>
                        <p className="text-xs text-navy-400 font-light leading-relaxed">
                            Each review undergoes verification to maintain transparent service quality standards. We review all feedback to ensure excellence.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Write a review column */}
                    <div className="lg:col-span-4 bg-white border border-gold-300/10 rounded-3xl p-6 sm:p-8 shadow-md">
                        <h3 className="text-lg font-bold text-navy-500 mb-2 font-display uppercase tracking-wider flex items-center gap-2">
                            <FaCommentAlt className="text-gold-500 text-sm" /> Share Experience
                        </h3>
                        <p className="text-xs text-navy-400 font-light mb-6">Your feedback helps us tailor our hotel amenities and hospitality standards.</p>

                        <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 text-xs">
                            <div>
                                <label className="block font-semibold text-navy-400 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="e.g. Liam Foster"
                                    className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-navy-400 mb-1">Rating</label>
                                <div className="flex gap-2 text-lg text-gold-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="cursor-pointer focus:outline-none hover:scale-110 transition-transform"
                                        >
                                            {star <= rating ? <FaStar /> : <FaStar className="text-navy-100" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-navy-400 mb-1">Category Reviewed</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500"
                                >
                                    <option value="room">Suite & Room Stays</option>
                                    <option value="dining">Fine Dining & Bars</option>
                                    <option value="spa">Wellness & Spa Services</option>
                                    <option value="tour">Outdoor Tours & Activities</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-navy-400 mb-1">Your Comments</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write details of your stay..."
                                    className="w-full bg-navy-50/50 border border-navy-100 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer font-sans"
                            >
                                Submit Feedback
                            </button>
                        </form>
                    </div>

                    {/* Timeline reviews column */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {reviewsList.length === 0 ? (
                            <div className="text-center py-10 bg-white border rounded-3xl p-6 text-navy-400">
                                <FaRegSmile className="text-3xl mx-auto mb-2 text-gold-500" />
                                <p className="text-sm font-light">Be the first to share a review about our hotel!</p>
                            </div>
                        ) : (
                            reviewsList.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-white border border-gold-300/10 rounded-3xl p-6 shadow-sm relative animate-fade-in text-left hover:shadow-md transition-shadow"
                                >
                                    <span className="absolute top-6 right-6 text-navy-100 text-4xl pointer-events-none">
                                        <FaQuoteLeft />
                                    </span>

                                    {/* Author row */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-navy-100 text-navy-500 rounded-full flex items-center justify-center font-bold">
                                            <FaUser className="text-xs" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-navy-500">{review.name}</h4>
                                            <div className="flex gap-3 text-[10px] text-navy-300 mt-0.5 items-center font-light">
                                                <span className="flex items-center gap-1">
                                                    <FaRegCalendarAlt /> {review.date}
                                                </span>
                                                <span className={`inline-block font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px] ${review.category === "room"
                                                        ? "bg-navy-50 text-navy-500"
                                                        : review.category === "dining"
                                                            ? "bg-gold-50 text-gold-700"
                                                            : "bg-purple-50 text-purple-700"
                                                    }`}>
                                                    {review.category === "room" ? "Stay" : review.category === "dining" ? "Dining" : "Wellness"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating stars */}
                                    <div className="flex gap-1 text-gold-400 text-xs mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < review.rating ? "text-gold-400" : "text-navy-100"}
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-xs sm:text-sm text-navy-400 font-light leading-relaxed italic">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Reviews;
