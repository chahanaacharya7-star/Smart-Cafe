import api from "./axios.config";

// Get all menu items
export const getMenuItems = async (params = {}) => {
  try {
    const response = await api.get("/menu", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

// Get single menu item by ID
export const getMenuItemById = async (id) => {
  try {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching menu item:", error);
    throw error;
  }
};