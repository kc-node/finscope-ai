# rule-based NLP (logic-based analysis)

import re

def analyse_financial_text(text: str):
    text_lower = text.lower()

    insights = {
        "revenue_detected": False,
        "expense_detected": False,
        "profit_detected": False,
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

    # Find something about proift
    if any(word in text_lower for word in profit_keywords):
        insights["profit_detected"] = True
        insights["keywords"].append("profit")

    # Risk scoring logic
    if insights["expense_detected"] and not insights["profit_detected"]:
        insights["risk_level"] = "HIGH"

    elif insights["expense_detected"] and insights["revenue_detected"]:
        insights["risk_level"] = "MEDIUM"

    return insights


# Generate human-readable insights 

def generate_financial_summary(insights):

    risk = insights["risk_level"]

    revenue = insights["revenue_detected"]
    expense = insights["expense_detected"]
    profit = insights["profit_detected"]

    # High risk summary
    if risk == "HIGH":
        return (
            "The document indicates rising expenses "
            "without strong evidence of profitability, "
            "suggesting elevated financial risk."
        )

    # Medium risk summary
    elif risk == "MEDIUM":
        return (
            "The company shows both revenue generation "
            "and operational expenses. Financial performance "
            "appears stable but should be monitored carefully."
        )

    # Low risk summary
    elif risk == "LOW":
        return (
            "The document reflects healthy financial indicators "
            "with evidence of profitability and controlled risk."
        )

    return "Unable to generate financial summary."