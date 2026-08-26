import math
from typing import Optional

def celsius_to_fahrenheit(c: Optional[float]) -> Optional[float]:
    """Converts Celsius to Fahrenheit. Returns None if input is None."""
    if c is None:
        return None
    return round((c * 9.0 / 5.0) + 32.0, 2)

def fahrenheit_to_celsius(f: Optional[float]) -> Optional[float]:
    """Converts Fahrenheit to Celsius. Returns None if input is None."""
    if f is None:
        return None
    return round((f - 32.0) * 5.0 / 9.0, 2)

def mps_to_mph(mps: Optional[float]) -> Optional[float]:
    """Converts meters per second to miles per hour. Returns None if input is None."""
    if mps is None:
        return None
    return round(mps * 2.23694, 2)

def mph_to_mps(mph: Optional[float]) -> Optional[float]:
    """Converts miles per hour to meters per second. Returns None if input is None."""
    if mph is None:
        return None
    return round(mph / 2.23694, 2)

def mps_to_kmh(mps: Optional[float]) -> Optional[float]:
    """Converts meters per second to kilometers per hour. Returns None if input is None."""
    if mps is None:
        return None
    return round(mps * 3.6, 2)

def calculate_apparent_temperature(
    temp_c: float,
    rh_pct: Optional[float] = None,
    wind_mps: Optional[float] = None
) -> Optional[float]:
    """
    Calculates Australian Bureau of Meteorology Apparent Temperature.
    AT = Ta + 0.33 * e - 0.70 * ws - 4.00
    where e is water vapor pressure (hPa).
    Returns None if humidity is missing.
    """
    if rh_pct is None:
        return None
    
    # Vapor pressure (hPa)
    e = (rh_pct / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    ws = wind_mps if wind_mps is not None else 1.5
    at = temp_c + (0.33 * e) - (0.70 * ws) - 4.00
    return round(at, 1)

def calculate_heat_index_c(
    temp_c: float,
    rh_pct: Optional[float] = None
) -> Optional[float]:
    """
    Calculates NOAA Rothfusz Heat Index in Celsius.
    Returns None if humidity is unavailable or temperature is below 27°C.
    """
    if rh_pct is None:
        return None
    
    # Heat Index equation is defined for T >= 80°F (~26.7°C)
    T = (temp_c * 9.0 / 5.0) + 32.0
    R = rh_pct

    if T < 80.0:
        return round(temp_c, 1)

    hi_f = (
        -42.379
        + 2.04901523 * T
        + 10.14333127 * R
        - 0.22475541 * T * R
        - 0.00683783 * T * T
        - 0.05481717 * R * R
        + 0.00122874 * T * T * R
        + 0.00085282 * T * R * R
        - 0.00000199 * T * T * R * R
    )

    # Adjustments
    if R < 13.0 and 80.0 <= T <= 112.0:
        adjustment = ((13.0 - R) / 4.0) * math.sqrt((17.0 - abs(T - 95.0)) / 17.0)
        hi_f -= adjustment
    elif R > 85.0 and 80.0 <= T <= 87.0:
        adjustment = ((R - 85.0) / 10.0) * ((87.0 - T) / 5.0)
        hi_f += adjustment

    hi_c = (hi_f - 32.0) * 5.0 / 9.0
    return round(hi_c, 1)

def calculate_wet_bulb_c(
    temp_c: float,
    rh_pct: Optional[float] = None
) -> Optional[float]:
    """
    Stull (2011) formula for estimating Wet-Bulb temperature (°C).
    Returns None if humidity is missing.
    """
    if rh_pct is None:
        return None
    
    T = temp_c
    RH = rh_pct
    tw = (
        T * math.atan(0.151977 * math.sqrt(RH + 8.313659))
        + math.atan(T + RH)
        - math.atan(RH - 1.676331)
        + 0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH)
        - 4.686035
    )
    return round(tw, 1)
