from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from typing import List, Dict
from app.database import get_session
from app.models import App

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("", response_model=List[dict])
def get_categories(session: Session = Depends(get_session)):
    query = select(App.category).distinct()
    categories = session.exec(query).all()
    # Mock format returns id, name, icon
    return [{"id": c.lower().replace(" ", "-"), "name": c, "icon": "Folder"} for c in categories if c]

@router.get("/counts", response_model=Dict[str, int])
def get_category_counts(session: Session = Depends(get_session)):
    query = select(App.category, func.count(App.id)).group_by(App.category)
    results = session.exec(query).all()
    counts = {category: count for category, count in results if category}
    return counts
