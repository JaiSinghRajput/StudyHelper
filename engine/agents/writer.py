from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_markdown(question, research_data):
    prompt = f"""
    Create structured study material in Markdown.

    Requirements:
    - Proper headings
    - Clear explanations
    - Add Mermaid diagrams where useful
    - Insert image links where relevant
    - Student-friendly language

    Question: {question}

    Research:
    {research_data}
    """

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content