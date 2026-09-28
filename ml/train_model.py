import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


# Load the training dataset
data = pd.read_csv("training_data.csv")


# Convert vibration levels into numbers
vibration_mapping = {
    "Low": 0,
    "Medium": 1,
    "High": 2,
}

data["vibration"] = data["vibration"].map(vibration_mapping)


# Define input features and target
X = data[["temperature", "pressure", "vibration"]]
y = data["risk"]


# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y,
)


# Create the Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
)


# Train the model
model.fit(X_train, y_train)


# Evaluate the model
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"Model accuracy: {accuracy:.2f}")


# Save the trained model
joblib.dump(model, "risk_model.joblib")

print("Model saved as risk_model.joblib")