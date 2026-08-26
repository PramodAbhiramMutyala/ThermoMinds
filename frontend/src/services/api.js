const API_BASE = '/api';

export async function fetchHyperlocalData(city = 'Phoenix', hour = 14) {
  const res = await fetch(`${API_BASE}/temperature/hyperlocal?city=${encodeURIComponent(city)}&hour=${hour}`);
  if (!res.ok) throw new Error(`Failed to fetch temperature data: ${res.statusText}`);
  return res.json();
}

export async function fetchCitySummary(city = 'Phoenix') {
  const res = await fetch(`${API_BASE}/temperature/city-summary?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`Failed to fetch city summary: ${res.statusText}`);
  return res.json();
}

export async function fetchDiurnalCurve(zoneId = 'phx-zone-1', city = 'Phoenix') {
  const res = await fetch(`${API_BASE}/temperature/diurnal?zone_id=${encodeURIComponent(zoneId)}&city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`Failed to fetch diurnal curve: ${res.statusText}`);
  return res.json();
}

export async function fetchRankedHotspots(city = 'Phoenix', hour = 14) {
  const res = await fetch(`${API_BASE}/hotspots/ranked?city=${encodeURIComponent(city)}&hour=${hour}`);
  if (!res.ok) throw new Error(`Failed to fetch ranked hotspots: ${res.statusText}`);
  return res.json();
}

export async function fetchCoolingCenters(city = 'Phoenix') {
  const res = await fetch(`${API_BASE}/hotspots/cooling-centers?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`Failed to fetch cooling centers: ${res.statusText}`);
  return res.json();
}

export async function fetchWbgtGuidance(ambient, rh, wind = 1.5, solar = 850) {
  let url = `${API_BASE}/risk/wbgt?wind_speed_mps=${wind}&solar_radiation_wm2=${solar}`;
  if (ambient !== undefined && ambient !== null) url += `&ambient_temp_c=${ambient}`;
  if (rh !== undefined && rh !== null) url += `&relative_humidity_pct=${rh}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to calculate WBGT: ${res.statusText}`);
  return res.json();
}

export async function fetchHeatExposure(locationName, ambient, duration, isSun = true) {
  const res = await fetch(
    `${API_BASE}/risk/exposure?location_name=${encodeURIComponent(locationName)}&ambient_temp_c=${ambient}&duration_hours=${duration}&direct_sun_exposure=${isSun}`
  );
  if (!res.ok) throw new Error(`Failed to calculate heat exposure: ${res.statusText}`);
  return res.json();
}

export async function fetchVulnerability(profileName, baseScore) {
  const res = await fetch(
    `${API_BASE}/risk/vulnerability?profile_name=${encodeURIComponent(profileName)}&base_score=${baseScore}`
  );
  if (!res.ok) throw new Error(`Failed to evaluate vulnerability: ${res.statusText}`);
  return res.json();
}

export async function fetchCoolRoute(city = 'Phoenix', origin, destination) {
  let url = `${API_BASE}/routes/cool-corridor?city=${encodeURIComponent(city)}`;
  if (origin) url += `&origin=${encodeURIComponent(origin)}`;
  if (destination) url += `&destination=${encodeURIComponent(destination)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to compute cool route: ${res.statusText}`);
  return res.json();
}

export async function simulateMitigation(scenario, city = 'Phoenix') {
  const res = await fetch(`${API_BASE}/mitigation/simulate?city=${encodeURIComponent(city)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario)
  });
  if (!res.ok) throw new Error(`Failed to simulate mitigation: ${res.statusText}`);
  return res.json();
}

export async function fetchVegetationCorrelation(city = 'Phoenix') {
  const res = await fetch(`${API_BASE}/correlation/ndvi-temperature?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`Failed to fetch correlation data: ${res.statusText}`);
  return res.json();
}

export async function sendAgentMessage(payload) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to communicate with Agentic AI: ${res.statusText}`);
  return res.json();
}
