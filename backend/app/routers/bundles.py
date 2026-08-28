from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel
import uuid

from app.database import get_session
from app.models import Bundle, App, BundleAppLink

router = APIRouter(prefix="/api/bundles", tags=["bundles"])

class BundleCreate(BaseModel):
    name: str
    description: str
    apps: List[str]

class BundleResponse(BaseModel):
    id: str
    name: str
    description: str
    apps: List[str]
    appCount: int
    createdAt: str

@router.get("", response_model=List[BundleResponse])
def get_bundles(session: Session = Depends(get_session)):
    bundles = session.exec(select(Bundle)).all()
    results = []
    for b in bundles:
        results.append(BundleResponse(
            id=b.id,
            name=b.name,
            description=b.description or "",
            apps=[app.id for app in b.apps],
            appCount=len(b.apps),
            createdAt=b.created_at.isoformat()
        ))
    return results

@router.post("", response_model=BundleResponse)
def create_bundle(bundle_in: BundleCreate, session: Session = Depends(get_session)):
    new_id = f"bundle-{uuid.uuid4().hex[:8]}"
    db_bundle = Bundle(
        id=new_id,
        name=bundle_in.name,
        description=bundle_in.description
    )
    session.add(db_bundle)
    
    apps = session.exec(select(App).where(App.id.in_(bundle_in.apps))).all()
    for app in apps:
        link = BundleAppLink(bundle_id=db_bundle.id, app_id=app.id)
        session.add(link)
        
    session.commit()
    session.refresh(db_bundle)
    
    return BundleResponse(
        id=db_bundle.id,
        name=db_bundle.name,
        description=db_bundle.description or "",
        apps=[app.id for app in db_bundle.apps],
        appCount=len(db_bundle.apps),
        createdAt=db_bundle.created_at.isoformat()
    )
