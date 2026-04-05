import json
import logging
from config import client, DEFAULT_MODEL

logger = logging.getLogger(__name__)

def generate_subtopics(question: str) -> list:
    """Generate structured subtopics for a given question using GPT"""
    if not client:
        logger.error("LLM client not initialized. Check API keys in .env")
        return []
    
    if not question or not question.strip():
        logger.error("Question cannot be empty")
        return []
    
    try:
        prompt = f"""Break the following question into 4-6 structured subtopics for study material.

Question: {question}

Return ONLY a valid JSON array of strings, like: ["Topic 1", "Topic 2", "Topic 3"]

Do not include any other text or explanations."""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Parse JSON safely
        subtopics = json.loads(response_text)
        
        if not isinstance(subtopics, list):
            logger.warning("Response is not a list, converting to list")
            subtopics = [subtopics]
        
        logger.info(f"Generated {len(subtopics)} subtopics for question: {question}")
        return subtopics
    
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        return []
    except Exception as e:
        logger.error(f"Error generating subtopics: {e}")
        return []
