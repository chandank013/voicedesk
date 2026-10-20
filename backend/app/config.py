from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "VoiceDesk"
    VERSION: str = "1.0.0"
    MCP_PROTOCOL_VERSION: str = "2025-11-25"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./voicedesk.db")
    ENABLE_BEDROCK: bool = os.getenv("ENABLE_BEDROCK", "false").lower() in ("true", "1", "yes")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-micro-v1:0")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    CORS_ORIGINS: list[str] = ["*"]


settings = Settings()
