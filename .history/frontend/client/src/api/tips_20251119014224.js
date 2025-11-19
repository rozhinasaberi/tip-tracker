import api from "./axios";

export const createTip = (data, token) =>
  api.post("/tips", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTips = (token) =>
  api.get("/tips", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateTip = (id, data, token) =>
  api.put(`/tips/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteTip = (id, token) =>
  api.delete(`/tips/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
