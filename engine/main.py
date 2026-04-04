from agents.planner import generate_subtopics
from agents.researcher import tavily_search, extract_content
from agents.diagram_finder import find_diagrams
from agents.writer import generate_markdown

def run_pipeline(question: str):
    print("🔍 Planning...")
    topics = generate_subtopics(question)

    all_research = ""

    for topic in topics:
        print(f"📚 Researching: {topic}")

        results = tavily_search(topic)

        topic_content = ""
        for r in results:
            content = extract_content(r["url"])
            topic_content += content + "\n"

        diagrams = find_diagrams(topic)

        topic_block = f"""
        ## {topic}

        {topic_content}

        Diagrams:
        {diagrams}
        """

        all_research += topic_block

    print("✍️ Generating Markdown...")
    markdown = generate_markdown(question, all_research)

    with open("output.md", "w", encoding="utf-8") as f:
        f.write(markdown)

    print("✅ Done! Saved as output.md")


if __name__ == "__main__":
    run_pipeline("Explain TCP/IP model with diagrams")