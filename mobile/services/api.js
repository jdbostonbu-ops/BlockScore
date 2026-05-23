import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

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