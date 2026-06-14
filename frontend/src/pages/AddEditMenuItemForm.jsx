import { useState } from "react";

import api from "../services/api";

function AddEditMenuItemForm() {

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        description: "",
        imageUrl: "",
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        await api.post("/menu", formData);

        alert("Menu Item Added");
    };

    return (

        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto p-6 bg-white rounded"
        >

            <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                className="w-full border p-2 mb-4"
            />

            <input
                type="text"
                name="category"
                placeholder="Category"
                onChange={handleChange}
                className="w-full border p-2 mb-4"
            />

            <input
                type="number"
                name="price"
                placeholder="Price"
                onChange={handleChange}
                className="w-full border p-2 mb-4"
            />

            <textarea
                name="description"
                placeholder="Description"
                onChange={handleChange}
                className="w-full border p-2 mb-4"
            />

            <input
                type="text"
                name="imageUrl"
                placeholder="Image URL"
                onChange={handleChange}
                className="w-full border p-2 mb-4"
            />

            <button
                className="w-full bg-green-500 text-white py-2 rounded"
            >

                Save

            </button>

        </form>
    );
}

export default AddEditMenuItemForm;