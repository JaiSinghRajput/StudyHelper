"""Markdown formatting utilities for study materials"""

def create_heading(text: str, level: int = 1) -> str:
    """Create a markdown heading"""
    if level < 1 or level > 6:
        level = 1
    return f"{'#' * level} {text}\n"


def create_subheading(text: str) -> str:
    """Create a markdown subheading (level 2)"""
    return create_heading(text, 2)


def create_code_block(code: str, language: str = "") -> str:
    """Create a markdown code block"""
    return f"```{language}\n{code}\n```\n"


def create_blockquote(text: str) -> str:
    """Create a markdown blockquote"""
    lines = text.split("\n")
    quoted = "\n".join(f"> {line}" for line in lines if line.strip())
    return quoted + "\n"


def create_list(items: list, ordered: bool = False) -> str:
    """Create a markdown list (ordered or unordered)"""
    if not items:
        return ""
    
    lines = []
    for i, item in enumerate(items, 1):
        prefix = f"{i}." if ordered else "-"
        lines.append(f"{prefix} {item}")
    
    return "\n".join(lines) + "\n"


def create_image(alt_text: str, url: str, width: int = None) -> str:
    """Create a markdown image link"""
    if width:
        return f"![{alt_text}]({url} \"{alt_text}\")\n"
    return f"![{alt_text}]({url})\n"


def create_link(text: str, url: str) -> str:
    """Create a markdown link"""
    return f"[{text}]({url})"


def create_mermaid_diagram(diagram_code: str) -> str:
    """Create a markdown code block for mermaid diagrams"""
    return f"```mermaid\n{diagram_code}\n```\n"


def create_table(headers: list, rows: list) -> str:
    """Create a markdown table"""
    if not headers or not rows:
        return ""
    
    header_row = "| " + " | ".join(headers) + " |\n"
    separator = "| " + " | ".join(["---"] * len(headers)) + " |\n"
    
    data_rows = []
    for row in rows:
        if isinstance(row, (list, tuple)):
            data_rows.append("| " + " | ".join(str(cell) for cell in row) + " |\n")
        else:
            data_rows.append("| " + " | ".join(str(cell) for cell in [row] * len(headers)) + " |\n")
    
    return header_row + separator + "".join(data_rows)


def escape_markdown(text: str) -> str:
    """Escape special markdown characters"""
    special_chars = ["\\", "`", "*", "_", "{", "}", "[", "]", "(", ")", "#", "+", "-", ".", "!"]
    for char in special_chars:
        text = text.replace(char, f"\\{char}")
    return text


def create_table_of_contents(headings: list) -> str:
    """Create a table of contents from heading titles"""
    toc = "## Table of Contents\n\n"
    for heading in headings:
        anchor = heading.lower().replace(" ", "-").replace(".", "")
        toc += f"- [{heading}](#{anchor})\n"
    return toc + "\n"


def format_study_material(title: str, content: str, author: str = None) -> str:
    """Format a complete study material document"""
    formatting = create_heading(title, 1)
    
    if author:
        formatting += f"*Author: {author}*\n\n"
    
    formatting += content
    
    return formatting
