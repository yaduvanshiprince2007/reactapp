import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import ItemLong from "../Components/ItemLongComp/ItemLong";
import { addSubscription } from "../Redux/Reducers/Subscriptions";
import { allMenu } from "../Redux/Reducers/Plans";

const MenuDetail = () => {
    const { id } = useParams();
    const menuItems = useSelector((state: RootState) => state.session.plans.value);
    const [selectedItem, setSelectedItem] = useState<typeof menuItems[0] | null>(null);
    const bookingCart = useSelector((state: RootState) => state.local.subscribtions.value);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(allMenu());
    }, [dispatch]);

    useEffect(() => {
        if (id) {
            const item = menuItems.find((p) => p.id === Number(id));
            setSelectedItem(item || null);
        }
    }, [id, menuItems]);

    if (!selectedItem) {
        return (
            <div className="page-theme-menu py-5 text-center">
                <h2 className="mt-5">Menu Item Not Found</h2>
                <Link to="/menu" className="btn btn-warning mt-3">Back to Menu</Link>
            </div>
        );
    }

    return (
        <div className="page-theme-menu py-5">
            <div className="container">
                <Link to="/menu" className="btn btn-outline-light mb-4">&larr; Back to Menu</Link>
                <ItemLong
                    id={selectedItem.id}
                    image={selectedItem.image}
                    heading={selectedItem.heading}
                    subType={selectedItem.subType}
                    description={selectedItem.description}
                    keyPoints={selectedItem.keyPoints}
                    benefits={selectedItem.benefits}
                    oldPrice={selectedItem.oldPrice}
                    effectivePrice={selectedItem.newPrice}
                    itemType="menu"
                    buttons={
                        !bookingCart.includes(selectedItem.id) ? (
                            <button
                                className="btn btn-warning fw-bold px-4 py-2"
                                onClick={() => dispatch(addSubscription(selectedItem.id))}
                            >
                                Add to Order
                            </button>
                        ) : (
                            <Link to="/bookings" className="btn btn-success fw-bold px-4 py-2">
                                View in Bookings
                            </Link>
                        )
                    }
                />
            </div>
        </div>
    );
};

export default MenuDetail;
