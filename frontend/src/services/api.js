const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchHeatmapGeoJSON(city = 'Phoenix', granularity = 80) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/heatmap?city=${encodeURIComponent(city)}&granularity=${granularity}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.result || data;
  } catch (err) {
    console.warn(`[HeatShield API] Live heatmap fetch failed (${err.message}). Using local fallback.`);
    return null;
  }
}

export async function fetchHotspots(city = 'Phoenix', limit = 10) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hotspots?city=${encodeURIComponent(city)}&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.hotspots || [];
  } catch (err) {
    console.warn(`[HeatShield API] Hotspot query failed (${err.message}). Using fallback.`);
    return null;
  }
}

export async function fetchLocationSummary(city = 'Phoenix', zoneId = null) {
  try {
    const url = zoneId
      ? `${API_BASE_URL}/api/location-summary?city=${encodeURIComponent(city)}&zone_id=${encodeURIComponent(zoneId)}`
      : `${API_BASE_URL}/api/location-summary?city=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[HeatShield API] Location summary query failed (${err.message}). Using fallback.`);
    return null;
  }
}

export async function fetchOperationalRisk(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/risk?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[HeatShield API] Risk calculation failed (${err.message}). Using fallback.`);
    return null;
  }
}

export async function fetchPersonaRecommendations(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/recommendations?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[HeatShield API] Recommendation query failed (${err.message}). Using fallback.`);
    return null;
  }
}
