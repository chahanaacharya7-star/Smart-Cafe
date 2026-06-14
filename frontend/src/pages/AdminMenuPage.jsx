import { useEffect, useState } from "react";

import api from "../services/api";

function AdminMenuPage() {

    const [items, setItems] = useState([]);

    useEffect(() => {

        fetchItems();

    }, []);

    const fetchItems = async () => {

        const response = await api.get("/menu");

        setItems(response.data.data);
    };

    const deleteItem = async (id) => {

        await api.delete(`/menu/${id}`);

        fetchItems();
    };

    return (

        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Manage Menu
            </h1>

            <table className="w-full bg-white">

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Price</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {items.map((item) => (

                        <tr key={item._id}>

                            <td>{item.name}</td>

                            <td>{item.price}</td>

                            <td>

                                <button className="bg-blue-500 text-white px-4 py-1 rounded mr-2">

                                    Edit

                                </button>

                                <button
                                    onClick={() =>
                                        deleteItem(item._id)
                                    }
                                    className="bg-red-500 text-white px-4 py-1 rounded"
                                >

                                    Delete

                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default AdminMenuPage;