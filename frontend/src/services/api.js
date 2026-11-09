import axios from 'axios';

// Smart API Base URL:
// 1. If VITE_API_URL is set (e.g. Vercel decoupled deploy), use it.
// 2. In local dev mode, use http://localhost:8000.
// 3. In unified single-service production, use "" (relative path to same origin).
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const res = await apiClient.get('/api/v1/health');
  return res.data;
};

export const getDatasetSummary = async () => {
  const res = await apiClient.get('/api/v1/dataset/summary');
  return res.data;
};

export const getMetricsSweep = async () => {
  const res = await apiClient.get('/api/v1/metrics/k-sweep');
  return res.data;
};

export const getDBSCANAnomalies = async () => {
  const res = await apiClient.get('/api/v1/metrics/dbscan-anomalies');
  return res.data;
};

export const getClusterCentroids = async () => {
  const res = await apiClient.get('/api/v1/clusters/centroids');
  return res.data;
};

export const getPCAProjections = async (limit = 600) => {
  const res = await apiClient.get(`/api/v1/pca/projections?limit=${limit}`);
  return res.data;
};

export const predictRouteCluster = async (flightData) => {
  const res = await apiClient.post('/api/v1/predict/route-cluster', flightData);
  return res.data;
};

export default apiClient;

