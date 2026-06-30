import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { allBanquets } from "../Redux/Reducers/Plans";
import { ItemGallery } from "../Components/Common/ItemGallery";
import { BanquetConfigModal } from "../Components/BanquetConfigModal";
import { useCart } from "../hooks/useCart";

const Banquet = () => {
    const dispatch = useDispatch();
    const banquets = useSelector((state: RootState) => state.session.plans.value);
    const { saveCartItemQty } = useCart();

    // Customizer Modal state
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
    const [customizingItem, setCustomizingItem] = useState<any | null>(null);

    useEffect(() => {
        dispatch(allBanquets());
    }, [dispatch]);

    const handleOpenCustomizer = (item: any) => {
        setCustomizingItem(item);
        setIsCustomizerOpen(true);
    };

    const handleConfirmCustomizer = (qty: number) => {
        if (customizingItem) {
            // Get configured total from localStorage
            const saved = localStorage.getItem(`banquetConfig_${customizingItem.id}`);
            let calculatedPrice = Number(customizingItem.newPrice);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    calculatedPrice = parsed.calculatedPrice || calculatedPrice;
                } catch {}
            }
            saveCartItemQty(
                customizingItem.id,
                "banquet",
                qty,
                calculatedPrice,
                customizingItem.heading
            );
        }
        setIsCustomizerOpen(false);
    };

    return (
        <section className="pt-36 pb-20 px-6 bg-gradient-to-b from-[#1c0f30] via-[#110a1d] to-[#07040c] text-white min-h-screen">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gold-300 mb-2 leading-tight">
                    Banquet & Event Spaces
                </h1>
                <p className="text-center text-navy-200 max-w-md mx-auto mb-8 text-sm sm:text-base font-light">
                    Book magnificent ballrooms, open-air lawns, and high-tech boardrooms customized to your seating and catering desires.
                </p>

                {/* Main Item Gallery */}
                <ItemGallery
                    items={banquets}
                    itemType="banquet"
                    onCustomise={handleOpenCustomizer}
                    emptyMessage="No event halls or banquet spaces available."
                />

                {/* Customizer Dialog Modal */}
                {isCustomizerOpen && customizingItem && (
                    <BanquetConfigModal
                        item={{
                            id: customizingItem.id,
                            heading: customizingItem.heading,
                            image: customizingItem.image,
                            newPrice: customizingItem.newPrice,
                            itemType: customizingItem.itemType,
                        }}
                        onClose={() => setIsCustomizerOpen(false)}
                        onConfirm={handleConfirmCustomizer}
                    />
                )}
            </div>
        </section>
    );
};

export default Banquet;
