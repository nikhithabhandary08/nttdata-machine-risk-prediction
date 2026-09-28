from fastapi import FastAPI

from .database import Base, engine
from . import models
from .routes.fields import router as fields_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Machine Risk Prediction API",
    description="Backend API for dynamic machine data management and local risk prediction.",
    version="1.0.0",
)


app.include_router(fields_router)


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