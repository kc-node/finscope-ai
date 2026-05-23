import pandas as pd # is used to organize data into tables
from sklearn.tree import DecisionTreeClassifier 

# training data 
# Each row is one example the model learns from.
data = {
    "revenue_detected": [1, 1, 1, 0, 0, 1],
    "expense_detected": [1, 1, 0, 1, 1, 0],
    "profit_detected": [1, 0, 1, 0, 0, 1],
    "risk": ["MEDIUM", "HIGH", "LOW", "HIGH", "HIGH", "LOW"]
}

# Explaining rows
# e.g. revenue exist, expenses exist and no profit found => risk is HIGH 

# Machine learning models work best with data in table format.
# convert to dataframe 
# Pandas converts raw data into table format.
# why?

df = pd.DataFrame(data)

# X contains the input features.
# The features are:
# revenue_detected
# expense_detected
# profit_detected

# Each value is:
# 1 = detected
# 0 = not detected

X = df [[
    "revenue_detected",
    "expense_detected",
    "profit_detected"
]]

# y contains the answers the model should learn. (labels)
y = df["risk"]

# create model
model = DecisionTreeClassifier()
# Train the model using examples.
model.fit(X, y)

def predict_risk(revenue, expense, profit):
    prediction = model.predict([[
        revenue, 
        expense,
        profit
    ]])

    return prediction[0]


# This code is building a very small machine learning classifier using a Decision Tree.
# The goal is to predict a risk level (LOW, MEDIUM, or HIGH) based on whether:

# revenue was detected
# expenses were detected
# profit was detected