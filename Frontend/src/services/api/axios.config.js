import api from "./axios.config";

export const getMenuItems = async (params) => {
  const response = await api.get("/menu", {
    params,
  });

  return response.data;
};