from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, or_
from typing import List
from app.database import get_session
from app.models import App

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("", response_model=List[App])
def search_apps(
    q: str = Query(..., min_length=1),
    session: Session = Depends(get_session)
):
    search_term = f"%{q}%"
    query = select(App).where(
        or_(
            App.name.ilike(search_term),
            App.publisher.ilike(search_term),
            App.description.ilike(search_term)
        )
    ).limit(50)
    
    apps = session.exec(query).all()
    return apps
