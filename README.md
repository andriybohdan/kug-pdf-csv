# Parses KUG pdf file to CSV

Requirements

```bash
brew install poppler-utils
```

Convert 

```bash
pdftotext -layout ./berechnung-des-kurzarbeitergeldes-2024-67-60-prozent_ba046237.pdf input.txt
node index.js
```

