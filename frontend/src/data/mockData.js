export const CITIES = [
  {
    id: 'phoenix',
    name: 'Phoenix',
    region: 'Arizona, USA',
    lat: 33.4484,
    lng: -112.0740,
    zoom: 13,
    climate: 'Hot Desert (BWh)',
    activeAlert: 'Extreme Heat Warning (Level 4/4)',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    region: 'UAE',
    lat: 25.2048,
    lng: 55.2708,
    zoom: 13,
    climate: 'Hyper-Arid Subtropical',
    activeAlert: 'Severe Heat Index Advisory',
  },
  {
    id: 'london',
    name: 'London',
    region: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    zoom: 13,
    climate: 'Urban Heat Island Event',
    activeAlert: 'Heat-Health Level 3 Amber Alert',
  }
];

export const MOCK_DASHBOARD_DATA = {
  phoenix: {
    location: {
      id: 'phx-downtown-01',
      name: 'Phoenix Warehouse District & Downtown Core',
      city: 'Phoenix',
      latitude: 33.4421,
      longitude: -112.0760,
      elevation_m: 331,
      area_km2: 4.8
    },
    risk: {
      risk_score: 88,
      risk_level: 'Extreme',
      disclaimer: 'HeatShield Operational Risk Score is a deterministic decision-support heuristic for operational risk management and is not a medically validated health index.',
      risk_factors: [
        'Extreme ambient air temperature (44.8°C)',
        'Severe radiant surface heat accumulation (61.2°C)',
        'Prolonged heat persistence (9.5 consecutive hours > 35°C)',
        'Extended critical exceedance (6.5 hours > 38°C)',
        'Low canopy cover deficit (4.5% vs 25% target)'
      ],
      contributing_metrics: {
        temperature_points: 33.2,
        forecast_points: 13.5,
        persistence_points: 20.0,
        exceedance_points: 15.0,
        environmental_points: 1.3,
        time_of_day_points: 5.0
      },
      summary: 'Extreme operational heat hazard. Severe cumulative thermal accumulation requiring urgent shaded respite protocols and work stand-down.'
    },
    temperature: {
      ambient_c: 44.8,
      ambient_f: 112.6,
      surface_c: 61.2,
      surface_f: 142.2,
      surface_delta_c: 16.4,
      peak_temp_c: 46.2,
      peak_time: '15:30',
      apparent_c: 47.6,
      heat_index_c: 47.1,
      wet_bulb_c: 24.2,
      wbgt_c: 33.1,
      wbgt_flag: 'Black Flag',
      humidity_pct: 14.0,
      solar_radiation_wm2: 960.0,
      wind_speed_mps: 1.4,
      canopy_cover_pct: 4.5,
      albedo: 0.12,
      timestamp: '2026-08-26T14:30:00Z',
      source: 'LIVE - FortyGuard Hyperlocal Intelligence'
    },
    persistence: {
      threshold_c: 35.0,
      continuous_hours: 9.5,
      max_continuous_hours: 12.0,
      nighttime_deficit_c: 4.8,
      is_persistent_hotspot: true,
      description: 'The Warehouse District exhibits intense thermal inertia due to low-albedo tar roofs and heavy asphalt, creating a 9.5-hour continuous run above 35°C.'
    },
    exceedance: {
      threshold_c: 38.0,
      cumulative_hours: 6.5,
      severity_index: 38.4,
      osha_alert_level: 'High Hazard (> 4 hrs > 38°C)',
      description: '6.5 cumulative hours exceeding 38°C danger threshold, representing dangerous physiological heat load for outdoor workers.'
    },
    timeline: [
      { hour: '06:00', ambient: 32.5, surface: 31.0, risk_score: 38, is_peak_window: false },
      { hour: '08:00', ambient: 35.2, surface: 38.4, risk_score: 48, is_peak_window: false },
      { hour: '10:00', ambient: 38.8, surface: 48.0, risk_score: 66, is_peak_window: false },
      { hour: '12:00', ambient: 42.1, surface: 56.5, risk_score: 80, is_peak_window: true },
      { hour: '14:00', ambient: 44.8, surface: 61.2, risk_score: 88, is_peak_window: true },
      { hour: '16:00', ambient: 45.9, surface: 62.0, risk_score: 91, is_peak_window: true },
      { hour: '18:00', ambient: 43.4, surface: 54.0, risk_score: 76, is_peak_window: false },
      { hour: '20:00', ambient: 39.8, surface: 46.2, risk_score: 58, is_peak_window: false },
      { hour: '22:00', ambient: 37.0, surface: 41.5, risk_score: 49, is_peak_window: false }
    ],
    hotspots: [
      {
        rank: 1,
        id: 'hs_phx_01',
        name: 'Warehouse District Rail Yards',
        category: 'Industrial / Logistics',
        centroid: { latitude: 33.4421, longitude: -112.0760 },
        ambient_c: 45.2,
        surface_c: 62.8,
        surface_delta_c: 17.6,
        persistence_hours: 9.5,
        exceedance_hours: 6.5,
        risk_score: 92,
        risk_level: 'Extreme',
        active_workers: 48,
        primary_risk_factors: ['Severe asphalt heat trap', '9.5h persistence > 35°C', 'Zero canopy shade'],
        recommended_action: 'Enforce 15m work / 45m rest schedule; deploy mobile misting trailers.'
      },
      {
        rank: 2,
        id: 'hs_phx_02',
        name: 'South Central Transit Hub & Bus Plaza',
        category: 'Public Transit Terminal',
        centroid: { latitude: 33.4360, longitude: -112.0710 },
        ambient_c: 44.6,
        surface_c: 60.5,
        surface_delta_c: 15.9,
        persistence_hours: 8.0,
        exceedance_hours: 5.0,
        risk_score: 86,
        risk_level: 'Extreme',
        active_workers: 12,
        primary_risk_factors: ['High pedestrian vulnerability', 'Unshaded boarding platforms', 'Reflected bus engine heat'],
        recommended_action: 'Activate high-pressure canopy misting at Bay 3 & distribute hydration packets.'
      },
      {
        rank: 3,
        id: 'hs_phx_03',
        name: 'Downtown Financial Corridor & Concrete Plaza',
        category: 'Commercial District',
        centroid: { latitude: 33.4484, longitude: -112.0740 },
        ambient_c: 42.8,
        surface_c: 56.4,
        surface_delta_c: 13.6,
        persistence_hours: 6.5,
        exceedance_hours: 3.5,
        risk_score: 75,
        risk_level: 'Very High',
        active_workers: 24,
        primary_risk_factors: ['Urban canyon masonry trap', 'Low albedo paved corridors'],
        recommended_action: 'Reroute pedestrians through 1st St shaded Cool Corridor.'
      },
      {
        rank: 4,
        id: 'hs_phx_04',
        name: 'Roosevelt Row Cultural District',
        category: 'Mixed-Use Commercial',
        centroid: { latitude: 33.4570, longitude: -112.0700 },
        ambient_c: 40.5,
        surface_c: 51.2,
        surface_delta_c: 10.7,
        persistence_hours: 4.5,
        exceedance_hours: 2.0,
        risk_score: 64,
        risk_level: 'High',
        active_workers: 8,
        primary_risk_factors: ['Moderate tree canopy (18%)', 'Outdoor patio exposure'],
        recommended_action: 'Keep hydration stations operational; schedule outdoor events after 19:30.'
      }
    ],
    map_zones: [
      {
        id: 'zone-1',
        name: 'Warehouse District',
        coords: [
          [33.4400, -112.0800],
          [33.4400, -112.0720],
          [33.4460, -112.0720],
          [33.4460, -112.0800]
        ],
        temp: 45.2,
        surface: 62.8,
        risk_score: 92,
        level: 'Extreme'
      },
      {
        id: 'zone-2',
        name: 'Transit Hub',
        coords: [
          [33.4340, -112.0750],
          [33.4340, -112.0670],
          [33.4400, -112.0670],
          [33.4400, -112.0750]
        ],
        temp: 44.6,
        surface: 60.5,
        risk_score: 86,
        level: 'Extreme'
      },
      {
        id: 'zone-3',
        name: 'Downtown Core',
        coords: [
          [33.4460, -112.0780],
          [33.4460, -112.0700],
          [33.4520, -112.0700],
          [33.4520, -112.0780]
        ],
        temp: 42.8,
        surface: 56.4,
        risk_score: 75,
        level: 'Very High'
      },
      {
        id: 'zone-4',
        name: 'Roosevelt Row Arts',
        coords: [
          [33.4540, -112.0740],
          [33.4540, -112.0660],
          [33.4600, -112.0660],
          [33.4600, -112.0740]
        ],
        temp: 40.5,
        surface: 51.2,
        risk_score: 64,
        level: 'High'
      }
    ]
  },
  dubai: {
    location: {
      id: 'dxb-industrial-01',
      name: 'Al Quoz Industrial Concrete Zone',
      city: 'Dubai',
      latitude: 25.1320,
      longitude: 55.2340,
      elevation_m: 12,
      area_km2: 6.2
    },
    risk: {
      risk_score: 93,
      risk_level: 'Extreme',
      disclaimer: 'HeatShield Operational Risk Score is a deterministic decision-support heuristic for operational risk management and is not a medically validated health index.',
      risk_factors: [
        'Extreme air temperature (46.2°C)',
        'Severe industrial roof radiant heating (64.5°C)',
        'Combined thermal + humidity index (51.0°C Apparent)',
        'Prolonged persistence (10.0 continuous hours > 35°C)'
      ],
      contributing_metrics: {
        temperature_points: 34.0,
        forecast_points: 14.5,
        persistence_points: 20.0,
        exceedance_points: 15.0,
        environmental_points: 4.5,
        time_of_day_points: 5.0
      },
      summary: 'Extreme thermal risk. Simultaneous radiative accumulation and humidity limiting evaporative perspiration.'
    },
    temperature: {
      ambient_c: 46.2,
      ambient_f: 115.2,
      surface_c: 64.5,
      surface_f: 148.1,
      surface_delta_c: 18.3,
      peak_temp_c: 47.8,
      peak_time: '14:45',
      apparent_c: 51.0,
      heat_index_c: 52.4,
      wet_bulb_c: 28.5,
      wbgt_c: 34.2,
      wbgt_flag: 'Black Flag',
      humidity_pct: 38.0,
      solar_radiation_wm2: 990.0,
      wind_speed_mps: 1.8,
      canopy_cover_pct: 2.0,
      albedo: 0.14,
      timestamp: '2026-08-26T14:30:00Z',
      source: 'LIVE - FortyGuard Hyperlocal Intelligence'
    },
    persistence: {
      threshold_c: 35.0,
      continuous_hours: 10.0,
      max_continuous_hours: 14.0,
      nighttime_deficit_c: 5.4,
      is_persistent_hotspot: true,
      description: 'Industrial aluminum sheeting and concrete yard retain extensive thermal mass with very slow nocturnal radiative discharge.'
    },
    exceedance: {
      threshold_c: 38.0,
      cumulative_hours: 8.0,
      severity_index: 44.2,
      osha_alert_level: 'Emergency Stand-Down Required',
      description: '8.0 continuous hours exceeding 38°C combined with elevated coastal humidity.'
    },
    timeline: [
      { hour: '06:00', ambient: 34.0, surface: 32.5, risk_score: 42, is_peak_window: false },
      { hour: '08:00', ambient: 37.8, surface: 42.0, risk_score: 55, is_peak_window: false },
      { hour: '10:00', ambient: 41.5, surface: 52.0, risk_score: 72, is_peak_window: false },
      { hour: '12:00', ambient: 44.5, surface: 60.5, risk_score: 86, is_peak_window: true },
      { hour: '14:00', ambient: 46.2, surface: 64.5, risk_score: 93, is_peak_window: true },
      { hour: '16:00', ambient: 47.0, surface: 63.8, risk_score: 95, is_peak_window: true },
      { hour: '18:00', ambient: 44.0, surface: 56.0, risk_score: 82, is_peak_window: false },
      { hour: '20:00', ambient: 40.5, surface: 49.0, risk_score: 65, is_peak_window: false },
      { hour: '22:00', ambient: 38.0, surface: 43.5, risk_score: 52, is_peak_window: false }
    ],
    hotspots: [
      {
        rank: 1,
        id: 'hs_dxb_01',
        name: 'Al Quoz Industrial Basin',
        category: 'Heavy Industrial Fabrication',
        centroid: { latitude: 25.1320, longitude: 55.2340 },
        ambient_c: 46.2,
        surface_c: 64.5,
        surface_delta_c: 18.3,
        persistence_hours: 10.0,
        exceedance_hours: 8.0,
        risk_score: 95,
        risk_level: 'Extreme',
        active_workers: 110,
        primary_risk_factors: ['64.5°C roof surface radiation', 'Severe humidity trap (38% at 46°C)', 'High WBGT (34.2°C)'],
        recommended_action: 'Immediate mid-day break enforcement (12:30-15:00); indoor air-conditioned refuge mandatory.'
      },
      {
        rank: 2,
        id: 'hs_dxb_02',
        name: 'Deira Commercial Asphalt Corridor',
        category: 'Dense Commercial Souk',
        centroid: { latitude: 25.2690, longitude: 55.3090 },
        ambient_c: 44.8,
        surface_c: 61.0,
        surface_delta_c: 16.2,
        persistence_hours: 8.5,
        exceedance_hours: 6.0,
        risk_score: 89,
        risk_level: 'Extreme',
        active_workers: 45,
        primary_risk_factors: ['Narrow street canyon trap', 'Heavy delivery traffic heat emission'],
        recommended_action: 'Activate tensile shading canopy over pedestrian alleys.'
      }
    ],
    map_zones: [
      {
        id: 'dxb-1',
        name: 'Al Quoz Industrial',
        coords: [
          [25.1280, 55.2280],
          [25.1280, 55.2400],
          [25.1360, 55.2400],
          [25.1360, 55.2280]
        ],
        temp: 46.2,
        surface: 64.5,
        risk_score: 95,
        level: 'Extreme'
      },
      {
        id: 'dxb-2',
        name: 'Deira Commercial',
        coords: [
          [25.2650, 55.3040],
          [25.2650, 55.3140],
          [25.2730, 55.3140],
          [25.2730, 55.3040]
        ],
        temp: 44.8,
        surface: 61.0,
        risk_score: 89,
        level: 'Extreme'
      }
    ]
  },
  london: {
    location: {
      id: 'ldn-city-01',
      name: 'City of London Masonry Financial Basin',
      city: 'London',
      latitude: 51.5134,
      longitude: -0.0890,
      elevation_m: 18,
      area_km2: 2.9
    },
    risk: {
      risk_score: 64,
      risk_level: 'High',
      disclaimer: 'HeatShield Operational Risk Score is a deterministic decision-support heuristic for operational risk management and is not a medically validated health index.',
      risk_factors: [
        'Urban masonry heat retention (36.2°C)',
        'Low domestic AC penetration causing building heat stress',
        'Elevated nocturnal temperature trapping (3.2°C deficit)'
      ],
      contributing_metrics: {
        temperature_points: 23.5,
        forecast_points: 8.5,
        persistence_points: 11.0,
        exceedance_points: 6.0,
        environmental_points: 1.0,
        time_of_day_points: 5.0
      },
      summary: 'High heat stress in an unadapted urban environment with dense masonry and limited cross-ventilation.'
    },
    temperature: {
      ambient_c: 36.2,
      ambient_f: 97.2,
      surface_c: 46.5,
      surface_f: 115.7,
      surface_delta_c: 10.3,
      peak_temp_c: 37.4,
      peak_time: '16:15',
      apparent_c: 37.8,
      heat_index_c: 38.0,
      wet_bulb_c: 21.8,
      wbgt_c: 27.5,
      wbgt_flag: 'Yellow Flag',
      humidity_pct: 42.0,
      solar_radiation_wm2: 810.0,
      wind_speed_mps: 2.1,
      canopy_cover_pct: 11.0,
      albedo: 0.18,
      timestamp: '2026-08-26T14:30:00Z',
      source: 'LIVE - FortyGuard Hyperlocal Intelligence'
    },
    persistence: {
      threshold_c: 35.0,
      continuous_hours: 4.5,
      max_continuous_hours: 6.0,
      nighttime_deficit_c: 3.2,
      is_persistent_hotspot: true,
      description: 'Historical masonry brick structures absorb afternoon solar flux, maintaining elevated indoor and canyon temperatures overnight.'
    },
    exceedance: {
      threshold_c: 38.0,
      cumulative_hours: 1.5,
      severity_index: 8.5,
      osha_alert_level: 'Moderate Heat Advisory',
      description: '1.5 hours exceeding 38°C during peak solar alignment.'
    },
    timeline: [
      { hour: '06:00', ambient: 21.0, surface: 20.0, risk_score: 15, is_peak_window: false },
      { hour: '08:00', ambient: 25.5, surface: 27.0, risk_score: 28, is_peak_window: false },
      { hour: '10:00', ambient: 30.0, surface: 35.0, risk_score: 42, is_peak_window: false },
      { hour: '12:00', ambient: 33.8, surface: 41.5, risk_score: 55, is_peak_window: true },
      { hour: '14:00', ambient: 36.2, surface: 46.5, risk_score: 64, is_peak_window: true },
      { hour: '16:00', ambient: 37.2, surface: 47.0, risk_score: 68, is_peak_window: true },
      { hour: '18:00', ambient: 34.5, surface: 40.0, risk_score: 52, is_peak_window: false },
      { hour: '20:00', ambient: 30.0, surface: 33.0, risk_score: 38, is_peak_window: false },
      { hour: '22:00', ambient: 26.5, surface: 28.0, risk_score: 25, is_peak_window: false }
    ],
    hotspots: [
      {
        rank: 1,
        id: 'hs_ldn_01',
        name: 'Bank Junction Financial Canyon',
        category: 'Dense Commercial Masonry',
        centroid: { latitude: 51.5134, longitude: -0.0890 },
        ambient_c: 36.2,
        surface_c: 46.5,
        surface_delta_c: 10.3,
        persistence_hours: 4.5,
        exceedance_hours: 1.5,
        risk_score: 68,
        risk_level: 'High',
        active_workers: 18,
        primary_risk_factors: ['Dark pavement radiation', 'Narrow street solar trap', 'Heavy pedestrian footfall'],
        recommended_action: 'Direct pedestrians to shaded churchyards & open public hydration refill points.'
      }
    ],
    map_zones: [
      {
        id: 'ldn-1',
        name: 'Bank Junction Canyon',
        coords: [
          [51.5100, -0.0940],
          [51.5100, -0.0840],
          [51.5160, -0.0840],
          [51.5160, -0.0940]
        ],
        temp: 36.2,
        surface: 46.5,
        risk_score: 68,
        level: 'High'
      }
    ]
  }
};
