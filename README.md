# Study Material Maker

An intelligent study material generator that uses AI and web research to create comprehensive, well-structured learning materials.

## Features

- 🤖 **AI-Powered Generation**: Uses LLMs (OpenAI, OpenRouter, etc.) to create high-quality study materials
- 🔍 **Web Research**: Integrates Tavily search for accurate, up-to-date information
- 📊 **Visual Diagrams**: Automatically generates Mermaid diagrams to explain concepts
- 📝 **Structured Content**: Organizes material with proper headings, bullet points, and summaries
- 💾 **Markdown Output**: Generates clean, portable Markdown files
- 🎯 **Interactive Mode**: Built-in command-line interface for easy use
- 🔄 **Multi-Provider Support**: Works with OpenAI, OpenRouter (100+ models), and more

## Prerequisites

- Python 3.10 or higher
- **LLM API Key** - Choose one:
  - OpenAI: https://platform.openai.com/account/api-keys
  - **OpenRouter** (recommended): https://openrouter.ai/keys (supports 100+ models)
- Tavily API key (for web search): https://tavily.com/

## Installation

## Workspace Setup (Root Level)

From the repository root, run:

```bash
npm run install:workspace
```

This command will:
- Create `backend/.env` from `backend/.env.example` if missing
- Create `engine/.env` from `engine/.env.example` if missing
- Install backend dependencies
- Install web dependencies
- Sync engine dependencies with `uv`

To run the workspace from root:

```bash
npm run run:workspace
```

This launches backend and web dev servers in separate terminal windows.
The Python engine service should be running on the URL configured in `backend/.env` (default: `http://localhost:8000`).

### 1. Clone or download the project

```bash
cd engine
```

### 2. Create a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -e .
```

Or manually:

```bash
pip install openai requests beautifulsoup4 tavily-python python-dotenv
```

### 4. Set up API keys

Create a `.env` file in the `engine` directory:

**Option A: Using OpenRouter (Recommended)**
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
TAVILY_API_KEY=your_tavily_api_key_here
LOG_LEVEL=INFO
```

**Option B: Using OpenAI Direct**
```
OPENAI_API_KEY=sk-your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
LOG_LEVEL=INFO
```

**Getting API Keys:**

- **OpenAI**: Visit https://platform.openai.com/account/api-keys
- **OpenRouter** (supports 100+ LLM models, often cheaper): Visit https://openrouter.ai/keys
- **Tavily**: Visit https://tavily.com/

**→ [Full OpenRouter Setup Guide](OPENROUTER_SETUP.md)**

## Usage

### Interactive Mode

```bash
python main.py
```

Then simply enter your question or topic when prompted:

```
Enter your question or topic (or 'quit' to exit): Explain the photosynthesis process
```

### Command Line Mode

```bash
python main.py "Your question here"
```

Example:

```bash
python main.py "How does machine learning work?"
```

### Output

The pipeline generates:

1. **output/study_material_YYYYMMDD_HHMMSS.md** - Comprehensive study material
2. **output/summary_YYYYMMDD_HHMMSS.md** - Quick summary of key points

## Project Structure

```
engine/
├── config.py                 # Configuration and API keys
├── main.py                   # Main pipeline orchestrator
├── pyproject.toml            # Project dependencies
├── README.md                 # This file
├── agents/
│   ├── planner.py           # Generates study topic subtopics
│   ├── researcher.py        # Searches and extracts web content
│   ├── diagram_finder.py    # Generates Mermaid diagrams
│   └── writer.py            # Generates markdown content
└── utils/
    ├── markdown.py          # Markdown formatting utilities
    └── scraper.py           # Web scraping and content extraction
```

## How It Works

### Pipeline Steps

1. **Planning** 🔍
   - Analyzes the input question
   - Breaks it down into 4-6 logical subtopics
   - Creates a structured learning plan

2. **Research** 📚
   - Searches for relevant information on each subtopic
   - Extracts content from web sources using Tavily API
   - Organizes findings by topic

3. **Visualization** 📊
   - Generates Mermaid diagrams for each subtopic
   - Creates flowcharts, mindmaps, or graphs based on content
   - Provides visual understanding of concepts

4. **Generation** ✍️
   - Uses GPT to synthesize research into coherent explanations
   - Creates proper markdown structure with headings and formatting
   - Adds key points, summary, and references

5. **Output** 💾
   - Saves comprehensive markdown document
   - Generates summary with key takeaways
   - Stores in timestamped files for organization

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `TAVILY_API_KEY`: Your Tavily API key (required)
- `LOG_LEVEL`: Logging level (default: INFO)
  - Options: DEBUG, INFO, WARNING, ERROR, CRITICAL

### Customization

You can modify behavior in `main.py`:

- **Output directory**: Change `output_dir` parameter in `run_pipeline()`
- **Number of subtopics**: Modify the prompt in `agents/planner.py`
- **Search results**: Adjust `max_results` parameter in `search_and_extract()`
- **AI model**: Change `model` parameter in agent files

## Troubleshooting

### Missing API Keys

**Error**: `OPENAI_API_KEY not set`

**Solution**: 
1. Create a `.env` file in the engine directory
2. Add your API keys
3. Ensure python-dotenv is installed (`pip install python-dotenv`)

### Authentication Errors

**Error**: "Invalid API key" or "Unauthorized"

**Solution**:
1. Verify your API keys are correct and not expired
2. Check that you have sufficient credits/quota
3. Visit the respective API provider websites to validate

### Network Errors

**Error**: Connection timeout or failed requests

**Solution**:
1. Check your internet connection
2. Try again (Tavily API sometimes times out)
3. Increase timeout values in `utils/scraper.py` if in slow network

### Empty or Poor Quality Output

**Possible causes**:
- The topic is too vague or too specific
- Insufficient research results available
- API rate limits reached

**Solution**:
- Rephrase the question more clearly
- Add more context to the question
- Wait a bit before trying again (rate limits)

## Examples

### Example 1: Science Topic

```bash
python main.py "Explain photosynthesis and its role in the ecosystem"
```

### Example 2: Technology Topic

```bash
python main.py "How does blockchain technology work?"
```

### Example 3: History Topic

```bash
python main.py "What were the causes and effects of World War II?"
```

## Advanced Usage

### Enable Debug Logging

```bash
# In .env file
LOG_LEVEL=DEBUG
```

Then run:

```bash
python main.py "Your question"
```

### Custom Research Depth

Modify `agents/researcher.py`:

```python
def search_and_extract(query: str, max_results: int = 10):  # Increase max_results
    # ... rest of code
```

## Performance Tips

1. **Faster Generation**: Use questions that are more specific
2. **Better Quality**: Provide detailed questions with context
3. **Network Optimization**: Run during off-peak hours to ensure better API response times

## Limitations

- **API Costs**: Each generation uses OpenAI credits. Monitor your usage at https://platform.openai.com/account/billing/usage
- **Rate Limits**: Both OpenAI and Tavily have rate limits
- **Content Quality**: Depends on available web sources for the topic
- **Processing Time**: Generation can take 2-5 minutes depending on complexity

## Future Enhancements

- [ ] Support for multiple AI models (Claude, etc.)
- [ ] Custom output formatting options
- [ ] Interactive question feedback
- [ ] Batch processing of multiple topics
- [ ] Quiz generation from study material
- [ ] PDF export functionality
- [ ] Image integration with generated diagrams
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to:

1. Report bugs or issues
2. Suggest new features
3. Improve code quality
4. Add documentation

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:

1. Check the Troubleshooting section
2. Review the logs (enable DEBUG mode)
3. Check API provider status pages
4. Verify your API keys and credits

## Changelog

### Version 0.1.0 (Initial Release)

- ✅ Basic pipeline implementation
- ✅ GPT-based content generation
- ✅ Web research integration
- ✅ Markdown formatting
- ✅ Diagram generation
- ✅ Interactive CLI

---

**Made with ❤️ for students and learners everywhere**

For the latest updates, visit the project repository.


[Sample Output](/engine/output/sample_output.md)

[Sample Summary](/engine/output/output_summary.md)
