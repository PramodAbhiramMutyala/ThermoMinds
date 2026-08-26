from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "HeatShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # FortyGuard API Configuration
    FORTYGUARD_API_KEY: Optional[str] = None
    FORTYGUARD_API_BASE_URL: str = "https://api.fortyguard.com/v1"
    
    # Hugging Face Inference API Configuration
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    HUGGINGFACE_API_BASE_URL: str = "https://router.huggingface.co/v1"
    
    # Operational Mode
    DEFAULT_CITY: str = "Phoenix"  # Supported: Phoenix, Dubai, London
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

