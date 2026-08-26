"""
Pre-seeded verified cooling centers, hydration stations, and emergency respite shelters.
All entries are tagged with capacity, amenities, open hours, and coordinates.
"""

COOLING_CENTERS = [
    # Phoenix Cooling Centers
    {
        "id": "cc-phx-1",
        "city": "Phoenix",
        "name": "Burton Barr Central Library Heat Respite",
        "address": "1221 N Central Ave, Phoenix, AZ 85004",
        "lat": 33.4618,
        "lng": -112.0740,
        "type": "Public Library Cooling Center",
        "hours": "09:00 - 20:00 Daily",
        "amenities": ["Air Conditioning", "Free Chilled Water", "Device Charging", "Medical Aid Kit", "Restrooms"],
        "capacity_status": "Normal (45% occupied)",
        "indoor_temp_c": 22.5,
        "wheelchair_accessible": True
    },
    {
        "id": "cc-phx-2",
        "city": "Phoenix",
        "name": "Lincoln Downtown YMCA Cooling Sanctuary",
        "address": "350 N 1st Ave, Phoenix, AZ 85003",
        "lat": 33.4524,
        "lng": -112.0756,
        "type": "Community Respite Facility",
        "hours": "08:00 - 21:00 Daily",
        "amenities": ["Air Conditioning", "Hydration Station", "Electrolytes", "Showers", "Rest Area"],
        "capacity_status": "Moderate (70% occupied)",
        "indoor_temp_c": 21.8,
        "wheelchair_accessible": True
    },
    {
        "id": "cc-phx-3",
        "city": "Phoenix",
        "name": "Harmon Community Center Oasis",
        "address": "1425 S 5th Ave, Phoenix, AZ 85003",
        "lat": 33.4358,
        "lng": -112.0792,
        "type": "Municipal Cooling Station",
        "hours": "10:00 - 19:00 Daily",
        "amenities": ["Air Conditioning", "Cold Water Refill", "Misting Tent Outside", "First Aid"],
        "capacity_status": "Available (30% occupied)",
        "indoor_temp_c": 22.0,
        "wheelchair_accessible": True
    },
    {
        "id": "cc-phx-4",
        "city": "Phoenix",
        "name": "Phoenix Convention Center East Shaded Concourse",
        "address": "100 N 3rd St, Phoenix, AZ 85004",
        "lat": 33.4489,
        "lng": -112.0700,
        "type": "Emergency Transit Cooling Hub",
        "hours": "07:00 - 22:00 Daily",
        "amenities": ["High-Power HVAC", "Water Dispensers", "Paramedic On-Site", "Shade Structures"],
        "capacity_status": "Normal (40% occupied)",
        "indoor_temp_c": 21.5,
        "wheelchair_accessible": True
    },
    # Dubai Cooling Centers
    {
        "id": "cc-dxb-1",
        "city": "Dubai",
        "name": "Dubai Mall Grand Air-Conditioned Atrium Hub",
        "address": "Financial Center Rd, Downtown Dubai",
        "lat": 25.1972,
        "lng": 55.2744,
        "type": "Civic Transit Cooling Concourse",
        "hours": "10:00 - 23:00 Daily",
        "amenities": ["Chilled Air Conditioning", "Free Water Refill", "Paramedic Station", "Seating Pods"],
        "capacity_status": "Spacious (35% occupied)",
        "indoor_temp_c": 21.0,
        "wheelchair_accessible": True
    },
    {
        "id": "cc-dxb-2",
        "city": "Dubai",
        "name": "Burjuman Transit Climate Controlled Corridor",
        "address": "Khalid Bin Al Waleed Rd, Al Mankhool",
        "lat": 25.2532,
        "lng": 55.3021,
        "type": "Metro Intermodal Cooling Hub",
        "hours": "05:30 - 00:00 Daily",
        "amenities": ["Direct Metro HVAC Link", "Cold Water Fountains", "AED Defibrillator", "Restrooms"],
        "capacity_status": "Moderate (65% occupied)",
        "indoor_temp_c": 22.0,
        "wheelchair_accessible": True
    },
    {
        "id": "cc-dxb-3",
        "city": "Dubai",
        "name": "Al Quoz Workers Hydration & Respite Center",
        "address": "Industrial Area 3, Al Quoz, Dubai",
        "lat": 25.1385,
        "lng": 55.2340,
        "type": "Industrial Workforce Respite Base",
        "hours": "06:00 - 20:00 Daily",
        "amenities": ["Industrial Misting Canopies", "Electrolyte Dispensers", "Ice Packs", "Paramedic On-Site"],
        "capacity_status": "High (82% occupied)",
        "indoor_temp_c": 23.0,
        "wheelchair_accessible": True
    },
    # London Cooling Centers
    {
        "id": "cc-ldn-1",
        "city": "London",
        "name": "Southbank Centre Clore Ballroom Climate Sanctuary",
        "address": "Belvedere Rd, London SE1 8XX",
        "lat": 51.5060,
        "lng": -0.1165,
        "type": "Civic Cooling Space",
        "hours": "10:00 - 22:00 Daily",
        "amenities": ["Chilled Ventilation", "Free Drinking Water Tap", "Quiet Seating", "Wi-Fi"],
        "capacity_status": "Normal (40% occupied)",
        "indoor_temp_c": 21.2,
        "wheelchair_accessible": True
    },
    {
        "id": "cc-ldn-2",
        "city": "London",
        "name": "British Library Shaded Piazza & AC Hall",
        "address": "96 Euston Rd, London NW1 2DB",
        "lat": 51.5299,
        "lng": -0.1278,
        "type": "Public Respite Library",
        "hours": "09:30 - 20:00 Daily",
        "amenities": ["Climate Control", "Cold Water Fountains", "Reading Desks", "Cafe"],
        "capacity_status": "Normal (50% occupied)",
        "indoor_temp_c": 20.8,
        "wheelchair_accessible": True
    }
]

def get_cooling_centers_for_city(city: str):
    city_clean = city.strip().lower()
    return [cc for cc in COOLING_CENTERS if cc["city"].lower() == city_clean]
