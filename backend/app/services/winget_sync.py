import json
import os
from sqlmodel import Session, select
from app.database import engine
from app.models import App

def seed_database():
    """Seed the database using the frontend mock data to get started."""
    with Session(engine) as session:
        # Check if we already have apps
        existing_apps = session.exec(select(App)).first()
        if existing_apps:
            print("Database already seeded.")
            return

        print("Seeding database with initial apps...")
        
        # Determine path to mock data (since we run from backend/app/services/)
        mock_file_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "mock", "apps.json")
        
        if not os.path.exists(mock_file_path):
            print(f"Mock file not found at {os.path.abspath(mock_file_path)}")
            return
            
        with open(mock_file_path, "r", encoding="utf-8") as f:
            apps_data = json.load(f)
            
        for app_data in apps_data:
            # Map mock fields to our DB model
            app = App(
                id=app_data.get("id"),
                wingetId=app_data.get("wingetId") or app_data.get("id"),
                name=app_data.get("name"),
                publisher=app_data.get("publisher"),
                description=app_data.get("description"),
                category=app_data.get("category"),
                iconPlaceholder=app_data.get("iconPlaceholder")
            )
            session.add(app)
            
        session.commit()
        print("Database seeding complete!")

if __name__ == "__main__":
    seed_database()
