from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import notes
from app.db import engine, Base
from app import models
import os
import time

app = FastAPI(title="NotepadPro", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

def create_tables():
    max_retries = 10
    for attempt in range(max_retries):
        try:
            print(f"Attempting to create tables (attempt {attempt + 1}/{max_retries})")
            Base.metadata.create_all(bind=engine)
            print("Tables created successfully!")
            break
        except Exception as e:
            print(f"Failed to create tables: {e}")
            if attempt < max_retries - 1:
                print("Retrying in 3 seconds...")
                time.sleep(3)
            else:
                print("Max retries reached. Continuing without tables...")

create_tables()

app.include_router(notes.router, prefix="/api/notes", tags=["notes"])

if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
