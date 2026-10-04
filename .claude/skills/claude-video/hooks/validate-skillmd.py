#!/usr/bin/env python3
"""Post-edit SKILL.md validation hook for Claude Code.

Validates SKILL.md frontmatter after file edits. Returns exit code 2 to block
if critical validation errors found.

Hook configuration in ~/.claude/settings.json:
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/skills/claude-video/hooks/validate-skillmd.py \"$FILE_PATH\"",
            "exitCodes": { "2": "block" }
          }
        ]
      }
    ]
  }
}

Checks:
- Valid YAML frontmatter with --- delimiters
- Required fields: name, description
- Line count under 500 (convention)
- No hardcoded user paths (/home/username/...)
- No API keys or tokens in content
"""

import re
import sys
import os


def validate_skillmd(filepath: str) -> tuple[list[str], list[str]]:
    """Validate a SKILL.md file. Returns (errors, warnings)."""
    errors = []
    warnings = []

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            lines = content.split("\n")
    except (OSError, IOError):
        return [], []

    # Check frontmatter exists
    if not content.startswith("---"):
        errors.append("Missing YAML frontmatter (must start with ---)")
        return errors, warnings

    # Find closing ---
    second_delim = content.find("---", 3)
    if second_delim == -1:
        errors.append("Unclosed YAML frontmatter (missing closing ---)")
        return errors, warnings

    frontmatter = content[3:second_delim].strip()

    # Check required fields
    if not re.search(r"^name:\s*\S", frontmatter, re.MULTILINE):
        errors.append("Missing required field: name")
    if not re.search(r"^description:", frontmatter, re.MULTILINE):
        errors.append("Missing required field: description")

    # Line count check
    line_count = len(lines)
    if line_count > 500:
        warnings.append(f"SKILL.md is {line_count} lines (convention: <500)")

    # Hardcoded path check
    home_pattern = re.compile(r"/home/\w+/|/Users/\w+/|C:\\Users\\\w+\\")
    for i, line in enumerate(lines, 1):
        if home_pattern.search(line):
            # Allow paths in comments explaining examples
            if not line.strip().startswith("#"):
                errors.append(
                    f"Line {i}: Hardcoded user path found. "
                    "Use relative paths or ~ instead"
                )

    # Credential check
    secret_patterns = [
        (r"['\"][A-Za-z0-9]{32,}['\"]", "Possible API key/token"),
        (r"(password|secret|token)\s*[:=]\s*['\"][^'\"]+['\"]", "Hardcoded credential"),
    ]
    for pattern, label in secret_patterns:
        for i, line in enumerate(lines, 1):
            if re.search(pattern, line, re.IGNORECASE):
                # Skip if it looks like an env var reference
                if "$" in line or "env" in line.lower() or "ENV" in line:
                    continue
                warnings.append(f"Line {i}: {label} detected. Use env vars instead")

    return errors, warnings


def main():
    if len(sys.argv) < 2:
        sys.exit(0)

    filepath = sys.argv[1]

    if not os.path.isfile(filepath):
        sys.exit(0)

    # Only validate SKILL.md files
    if not filepath.endswith("SKILL.md"):
        sys.exit(0)

    errors, warnings = validate_skillmd(filepath)

    if warnings:
        for w in warnings:
            print(f"  ~ {w}")

    if errors:
        print("SKILL.md validation errors (blocking):")
        for e in errors:
            print(f"  x {e}")
        sys.exit(2)

    if not warnings:
        sys.exit(0)

    sys.exit(1)  # Warnings only, proceed


if __name__ == "__main__":
    main()
