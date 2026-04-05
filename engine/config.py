import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
MODEL_NAME = os.getenv("MODEL_NAME")  # User-configured model name

# Logging configuration
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Initialize LLM client (OpenRouter or OpenAI)
if OPENROUTER_API_KEY:
    logger.info("Using OpenRouter API")
    client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )
    LLM_PROVIDER = "openrouter"
    # Use env MODEL_NAME, fallback to default for OpenRouter
    DEFAULT_MODEL = MODEL_NAME or "openai/gpt-3.5-turbo"
elif OPENAI_API_KEY:
    logger.info("Using OpenAI API")
    client = OpenAI(api_key=OPENAI_API_KEY)
    LLM_PROVIDER = "openai"
    # Use env MODEL_NAME, fallback to default for OpenAI
    DEFAULT_MODEL = MODEL_NAME or "gpt-3.5-turbo"
else:
    logger.warning("Neither OPENAI_API_KEY nor OPENROUTER_API_KEY set!")
    client = None
    LLM_PROVIDER = None
    DEFAULT_MODEL = None

# Log the model being used
if DEFAULT_MODEL and LLM_PROVIDER:
    logger.info(f"LLM Provider: {LLM_PROVIDER}, Model: {DEFAULT_MODEL}")

# Validate required API keys
if not OPENAI_API_KEY and not OPENROUTER_API_KEY:
    logger.warning("No LLM API key found. Please set OPENAI_API_KEY or OPENROUTER_API_KEY in .env")

if not TAVILY_API_KEY:
    logger.warning("TAVILY_API_KEY not set. Please set it in environment or .env file")