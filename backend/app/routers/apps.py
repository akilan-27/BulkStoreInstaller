from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.database import get_session
from app.models import App

router = APIRouter(prefix="/api/apps", tags=["apps"])

@router.get("", response_model=List[App])
def get_apps(
    category: Optional[str] = None,
    sort: Optional[str] = None,
    order: Optional[str] = "asc",
    page: int = 1,
    pageSize: int = 1000,
    session: Session = Depends(get_session)
):
    query = select(App)
    
    if category:
        query = query.where(App.category == category)
        
    if sort:
        sort_attr = getattr(App, sort, None)
        if sort_attr:
            if order == "desc":
                query = query.order_by(sort_attr.desc())
            else:
                query = query.order_by(sort_attr.asc())
                
    offset = (page - 1) * pageSize
    query = query.offset(offset).limit(pageSize)
    
    apps = session.exec(query).all()
    return apps

@router.get("/batch", response_model=List[App])
def get_apps_batch(
    ids: str = Query(..., description="Comma separated list of App IDs"),
    session: Session = Depends(get_session)
):
    app_ids = [id.strip() for id in ids.split(",")]
    query = select(App).where(App.id.in_(app_ids))
    apps = session.exec(query).all()
    return apps
