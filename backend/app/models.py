from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class BundleAppLink(SQLModel, table=True):
    bundle_id: str = Field(default=None, foreign_key="bundle.id", primary_key=True)
    app_id: str = Field(default=None, foreign_key="app.id", primary_key=True)

class App(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    wingetId: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    publisher: str
    description: Optional[str] = None
    category: str = Field(index=True)
    iconPlaceholder: Optional[str] = None
    
    # Relationship to bundles
    bundles: List["Bundle"] = Relationship(back_populates="apps", link_model=BundleAppLink)

class Bundle(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to apps
    apps: List[App] = Relationship(back_populates="bundles", link_model=BundleAppLink)

    @property
    def appCount(self) -> int:
        return len(self.apps)
