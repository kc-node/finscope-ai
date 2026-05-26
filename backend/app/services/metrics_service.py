import re
from typing import List, Dict, Optional


# Currency detection
def detect_currency(token: Optional[str]) -> str:
    if not token:
        return "UNKNOWN"

    token = token.strip().upper()

    mapping = {
        "$": "USD",
        "USD": "USD",
        "€": "EUR",
        "EUR": "EUR",
        "R": "ZAR",
        "ZAR": "ZAR"
    }

    return mapping.get(token, "UNKNOWN")


# Safe number parsing
def parse_money(value: str) -> Optional[int]:
    if not value:
        return None
    try:
        value = value.replace(",", "").strip()
        return int(round(float(value)))
    except:
        return None


# Sentence splitting
def split_sentences(text: str) -> List[str]:
    return re.split(r'(?<=[.!?])\s+|\n+', text.strip())



# Metric patterns
METRIC_PATTERNS = {
    "revenue": [
        r"\brevenue\b",
        r"\bsales\b",
        r"\bincome\b"
    ],
    "expenses": [
        r"\bexpenses?\b",
        r"\bcosts?\b",
        r"\boperating cost\b",
        r"\boperating costs\b",
        r"\btotal operating cost\b",
        r"\bopex\b"
    ],
    "profit": [
        r"\bprofit\b",
        r"\bnet profit\b",
        r"\bearnings\b",
        r"\bnet earnings\b"
    ]
}


# Money regex
MONEY_REGEX = re.compile(
    r"(?P<currency>\$|€|R|USD|EUR|ZAR)?\s*"
    r"(?P<amount>\d{1,3}(?:,\d{3})*(?:\.\d+)?)"
)


PERCENT_REGEX = re.compile(
    r"(?P<value>\d+(?:\.\d+)?)\s*%"
)



def classify_sentence(sentence: str) -> Optional[str]:
    s = sentence.lower()

    # normalize punctuation
    s = re.sub(r"[:\-–]", " ", s)

    for metric, patterns in METRIC_PATTERNS.items():
        for p in patterns:
            if re.search(p, s, re.IGNORECASE):
                return metric

    return None

# Classify percent context 
def classify_percent_context(sentence: str) -> str:
    s = sentence.lower()

    if "revenue" in s or "sales" in s or "income" in s:
        return "revenue_change"

    if "cost" in s or "expense" in s or "operating" in s:
        return "cost_change"

    if "profit" in s or "earnings" in s:
        return "profit_change"

    return "general_change"


# Extract financial metrics
def extract_financial_metrics(text: str) -> Dict:

    results = {
        "revenue": [],
        "expenses": [],
        "profit": [],
        "percent_changes": []   # NEW
    }

    sentences = split_sentences(text)

    i = 0
    while i < len(sentences):

        sentence = sentences[i].strip()
        metric_type = classify_sentence(sentence)

        # CASE 1: Metric line with NO value 
        if metric_type and not MONEY_REGEX.search(sentence):

            if i + 1 < len(sentences):
                next_line = sentences[i + 1]
                match = MONEY_REGEX.search(next_line)

                if match:
                    currency = detect_currency(match.group("currency"))
                    amount = parse_money(match.group("amount"))

                    if amount is not None:
                        results[metric_type].append({
                            "currency": currency,
                            "value": amount,
                            "raw": match.group(0).strip(),
                            "sentence": next_line.strip()
                        })

                    i += 2
                    continue

        # CASE 2: Normal money extraction
        if metric_type:
            for match in MONEY_REGEX.finditer(sentence):
                currency = detect_currency(match.group("currency"))
                amount = parse_money(match.group("amount"))

                if amount is not None:
                    results[metric_type].append({
                        "currency": currency,
                        "value": amount,
                        "raw": match.group(0).strip(),
                        "sentence": sentence.strip()
                    })

        # CASE 3: Percentage extraction (NEW)
        for match in PERCENT_REGEX.finditer(sentence):
            value = float(match.group("value"))

            results["percent_changes"].append({
                "type": classify_percent_context(sentence),
                "value": value,
                "raw": match.group(0).strip(),
                "sentence": sentence.strip()
            })

        i += 1



    summary = {
        "revenue": results["revenue"][-1] if results["revenue"] else None,
        "expenses": results["expenses"][-1] if results["expenses"] else None,
        "profit": results["profit"][-1] if results["profit"] else None,
        "percent_changes": results["percent_changes"],
        "all_matches": results
    }

    return summary