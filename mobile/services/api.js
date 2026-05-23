import axios from "axios";

const API_BASE_URL = "https://blockscore.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function getReportCard(zipCode) {
  const response = await api.get(`/neighborhoods/report-card/${zipCode}`);
  return response.data;
}

export async function getTopComplaints() {
  const response = await api.get("/complaints/top");
  return response.data;
}

export async function getLiveComplaints() {
  const response = await axios.get(
    `${API_BASE_URL}/live-complaints`
  );

  return response.data;
}