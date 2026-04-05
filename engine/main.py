import logging
import sys
from pathlib import Path
from datetime import datetime

from agents.planner import generate_subtopics
from agents.researcher import search_and_extract
from agents.diagram_finder import find_diagrams
from agents.writer import generate_markdown, generate_summary
from config import OPENAI_API_KEY, TAVILY_API_KEY

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def validate_input(question: str) -> bool:
    """Validate user input"""
    if not question or not question.strip():
        logger.error("Question cannot be empty")
        return False
    if len(question) < 5:
        logger.error("Question is too short (minimum 5 characters)")
        return False
    if len(question) > 500:
        logger.error("Question is too long (maximum 500 characters)")
        return False
    return True


def run_pipeline(question: str, output_dir: str = "output") -> str:
    """
    Run the complete study material generation pipeline
    
    Args:
        question: The topic or question to generate material for
        output_dir: Directory to save output file
    
    Returns:
        Path to the generated markdown file
    """
    
    # Validate input
    if not validate_input(question):
        return None
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    logger.info("=" * 60)
    logger.info(f"Starting Study Material Generation Pipeline")
    logger.info(f"Question: {question}")
    logger.info("=" * 60)
    
    # Step 1: Planning
    logger.info("\n🔍 Step 1: Planning subtopics...")
    topics = generate_subtopics(question)
    
    if not topics:
        logger.error("Failed to generate subtopics")
        return None
    
    logger.info(f"✅ Generated {len(topics)} subtopics: {topics}")
    
    # Step 2: Research
    logger.info("\n📚 Step 2: Researching each topic...")
    all_research = ""
    
    for i, topic in enumerate(topics, 1):
        logger.info(f"   [{i}/{len(topics)}] Researching: {topic}")
        
        # Search and extract content
        research_results = search_and_extract(topic, max_results=3)
        
        if not research_results:
            logger.warning(f"   No research results found for: {topic}")
            continue
        
        # Extract content
        topic_content = "\n".join([
            f"- {r.get('title', 'Unknown')}: {r.get('snippet', '')}"
            for r in research_results
        ])
        
        # Find diagrams
        logger.info(f"   Generating diagram for: {topic}")
        diagrams = find_diagrams(topic)
        
        # Combine into topic block
        topic_block = f"""
## {topic}

### Overview
{topic_content}

### Visual Reference
{diagrams}

---
"""
        
        all_research += topic_block
    
    if not all_research:
        logger.error("No research content generated")
        return None
    
    # Step 3: Generate Markdown
    logger.info("\n✍️ Step 3: Generating comprehensive markdown...")
    markdown = generate_markdown(question, all_research)
    
    if not markdown:
        logger.error("Failed to generate markdown")
        return None
    
    # Step 4: Save output
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"study_material_{timestamp}.md"
    filepath = output_path / filename
    
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(markdown)
        logger.info(f"✅ Saved to: {filepath}")
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        return None
    
    # Step 5: Generate summary
    logger.info("\n📋 Step 4: Generating summary...")
    summary = generate_summary(all_research, max_points=5)
    
    if summary:
        summary_file = output_path / f"summary_{timestamp}.md"
        try:
            with open(summary_file, "w", encoding="utf-8") as f:
                f.write(f"# Summary: {question}\n\n")
                f.write(summary)
            logger.info(f"✅ Saved summary to: {summary_file}")
        except Exception as e:
            logger.error(f"Failed to save summary: {e}")
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ Pipeline completed successfully!")
    logger.info("=" * 60)
    
    return str(filepath)


def interactive_mode():
    """Run in interactive mode"""
    print("\n" + "=" * 60)
    print("Welcome to Study Material Maker!")
    print("Generate comprehensive study materials using AI")
    print("=" * 60 + "\n")
    
    while True:
        try:
            question = input("Enter your question or topic (or 'quit' to exit): ").strip()
            
            if question.lower() == 'quit':
                print("Goodbye!")
                break
            
            if not question:
                print("Please enter a valid question.")
                continue
            
            output_file = run_pipeline(question)
            
            if output_file:
                print(f"\n✅ Study material saved to: {output_file}")
            else:
                print("\n❌ Failed to generate study material. Please check the logs.")
            
            print("\n")
        
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            print(f"An error occurred: {e}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run with command-line argument
        question = " ".join(sys.argv[1:])
        output_file = run_pipeline(question)
        if not output_file:
            sys.exit(1)
    else:
        # Run in interactive mode
        interactive_mode()
