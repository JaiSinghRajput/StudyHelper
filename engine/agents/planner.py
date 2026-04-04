from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_subtopics(question: str):
    prompt = f"""
    Break the following question into structured subtopics for study material.

    Question: {question}

    Return as JSON list.
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return eval(response.choices[0].message.content)