from fastapi import FastAPI

app = FastAPI(
    title="Machine Risk Prediction API",
    description="Backend API for dynamic machine data management and local risk prediction.",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Machine Risk Prediction API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }