import logging
from config import client, DEFAULT_MODEL

logger = logging.getLogger(__name__)


def find_diagrams(topic: str) -> str:
    """Generate Mermaid diagram code for a topic using GPT"""
    if not client:
        logger.error("LLM client not initialized. Check API keys in .env")
        return _get_fallback_diagrams(topic)
    
    if not topic or not topic.strip():
        logger.warning("Topic cannot be empty")
        return _get_fallback_diagrams(topic)
    
    try:
        prompt = f"""Create a helpful Mermaid diagram that explains the key concepts of: {topic}

Pick ONE of these diagram types that best fits the topic:
- flowchart (for processes or workflows)
- graph LR (for hierarchies or relationships)
- mindmap (for concepts and subdivisions)
- sequence (for interactions between components)

Return ONLY the Mermaid diagram code, starting with the diagram type (e.g., 'flowchart TD').
Do not include markdown code blocks or explanations.
Do not use more than 10 nodes/elements.
Keep it simple and student-friendly."""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=800
        )
        
        diagram_code = response.choices[0].message.content.strip()
        
        # Clean up the response if it contains markdown code blocks
        if diagram_code.startswith("```"):
            diagram_code = "\n".join(diagram_code.split("\n")[1:-1])
        
        logger.info(f"Generated diagram for topic: {topic}")
        return _format_diagram(diagram_code)
    
    except Exception as e:
        logger.error(f"Error generating diagram for topic {topic}: {e}")
        return _get_fallback_diagrams(topic)


def _format_diagram(diagram_code: str) -> str:
    """Format diagram code with markdown markers"""
    if not diagram_code.strip():
        return ""
    
    # Ensure proper formatting
    return f"```mermaid\n{diagram_code.strip()}\n```"


def _get_fallback_diagrams(topic: str) -> str:
    """Return fallback diagram options if generation fails"""
    # Return a simple flowchart as fallback
    safe_topic = topic.replace('"', "'")
    fallback = f"""```mermaid
flowchart TD
    A["Understanding {safe_topic}"]
    A --> B["Core Concepts"]
    A --> C["Applications"]
    A --> D["Key Takeaways"]
    B --> E["Definition"]
    B --> F["Principles"]
    C --> G["Real-world Uses"]
    C --> H["Related Topics"]
```"""
    logger.warning(f"Using fallback diagram for: {topic}")
    return fallback


def find_reference_links(topic: str) -> list:
    """Find relevant reference links for a topic"""
    if not topic or not topic.strip():
        return []
    
    try:
        reference_links = [
            f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}",
            f"https://www.google.com/search?q={topic.replace(' ', '+')}",
        ]
        logger.info(f"Generated reference links for topic: {topic}")
        return reference_links
    except Exception as e:
        logger.error(f"Error generating reference links: {e}")
        return []


def get_visual_assets(topic: str) -> dict:
    """Get various visual assets for a topic"""
    return {
        "diagrams": find_diagrams(topic),
        "reference_links": find_reference_links(topic),
        "image_queries": [
            f"{topic} diagram",
            f"{topic} illustration",
            f"{topic} concept"
        ]
    }
