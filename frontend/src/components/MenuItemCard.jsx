import { useDispatch } from "react-redux";

import { addItem } from "../redux/cartSlice";

function MenuItemCard({ item }) {
    const dispatch = useDispatch();

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

            <img
                src={item.imageUrl}
                alt={item.name}
                className="h-48 w-full object-cover"
            />

            <div className="p-4">

                <h3 className="font-bold text-lg">
                    {item.name}
                </h3>

                <p className="text-gray-500">
                    {item.category}
                </p>

                <p className="font-semibold mt-2">
                    Rs. {item.price}
                </p>

                <button
                    onClick={() => dispatch(addItem(item))}
                    className="mt-4 w-full bg-orange-500 text-white py-2 rounded"
                >
                    Add to Cart
                </button>

            </div>

        </div>
    );
}

export default MenuItemCard;