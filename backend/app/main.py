from fastapi import FastAPI

from . import models
from .database import Base, SessionLocal, engine
from .routes.fields import router as fields_router
from .routes.machines import router as machines_router
from .seed import seed_initial_fields


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Machine Risk Prediction API",
    description="Backend API for dynamic machine data management and local risk prediction.",
    version="1.0.0",
)


app.include_router(fields_router)
app.include_router(machines_router)


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_initial_fields(db)
    finally:
        db.close()


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