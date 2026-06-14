import { useEffect, useState } from "react";

import api from "../services/api";

import MenuItemCard from "../components/MenuItemCard";

function MenuPage() {

    const [items, setItems] = useState([]);

    useEffect(() => {

        fetchMenu();

    }, []);

    const fetchMenu = async () => {

        try {

            const response = await api.get("/menu");

            setItems(response.data.data);

        } catch (error) {

            console.log(error);

        }
    };

    return (

        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Our Menu
            </h1>

            <div className="grid md:grid-cols-3 gap-6">

                {items.map((item) => (

                    <MenuItemCard
                        key={item._id}
                        item={item}
                    />

                ))}

            </div>

        </div>
    );
}

export default MenuPage;