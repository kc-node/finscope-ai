# rule-based NLP (logic-based analysis)

import re

def analyse_financial_text(text: str):
    text_lower = text.lower()

    insights = {
        "revenue_detected": False,
        "expense_detected": False,
        "profit_detected:": False,
        "risk_level": "LOW",
        "keywords": []
    }

    # Keywords detection
    revenue_keywords = ["revenue", "income", "sales"]
    expense_keywords = ["expense", "cost", "operating_cost"]
    profit_keywords = ["profit", "net profit", "earnings"]

    # Find something about revenue
    if any(word in text_lower for word in revenue_keywords):
        insights["revenue_detected"] = True
        insights["keywords"].append("revenue")

    # Find something about expense
    if any(word in text_lower for word in expense_keywords):
        insights["expense_detected"] = True
        insights["keywords"].append("expense")

    # Find something about proft
    if any(word in text_lower for word in profit_keywords):
        insights["profit_detected"] = True
        insights["keywords"].append("proft")

    # Risk scoring logic
    if insights["expense_detected"] and not insights["profit_detected"]:
        insights["risk_level"] = "HIGH"

    elif insights["expense_detected"] and insights["revenue_detected"]:
        insights["risk_level"] = "MEDIUM"

    return insights