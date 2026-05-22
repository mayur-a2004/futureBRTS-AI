import re

def sanitize_for_xml(text):
    """Removes control characters that break XML-based formats (DOCX/PPTX)."""
    if not text: return ""
    # Remove illegal XML characters
    # Ref: https://stackoverflow.com/questions/1707890/fastway-to-remove-illegal-xml-unicode-characters-from-python-unicode-string
    illegal_chars = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f\ud800-\udfff\ufdd0-\ufdef\ufffe\uffff]')
    return illegal_chars.sub('', str(text))
