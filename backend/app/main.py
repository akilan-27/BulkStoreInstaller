from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import create_db_and_tables
from app.routers import apps, categories, bundles, search
from app.services.winget_sync import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database on startup
    create_db_and_tables()
    # Seed mock data if empty
    seed_database()
    yield

# Initialize FastAPI app
app = FastAPI(
    title="AppStore Bulk Installer API",
    description="Backend API for the AppStore Bulk Installer platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the static directory exists before mounting
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(apps.router)
app.include_router(categories.router)
app.include_router(bundles.router)
app.include_router(search.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is running"}
