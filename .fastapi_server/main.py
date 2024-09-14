from fastapi import FastAPI, Query
from typing import List
import chromadb
import cohere
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()

# Database setup
DATABASE_URL = "sqlite:///./test.db"  # Use your actual database URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    bio = Column(String)
    interests = Column(String)

Base.metadata.create_all(bind=engine)

# Initialize Chroma client
chroma_client = chromadb.Client()

# Initialize Cohere client
co = cohere.Client("<<apiKey>>")  # Replace with your actual Cohere API key

# Create a custom embedding function for Chroma
def cohere_embedding_function(texts):
    response = co.embed(texts=texts, model="embed-english-v3.0", input_type="classification")
    return response.embeddings

# Create a collection for storing embeddings
collection = chroma_client.create_collection(name="user_profiles", embedding_function=cohere_embedding_function)

@app.post("/compare_profiles")
async def compare_profiles(
    user_ids: List[int] = Query(..., description="List of user IDs to compare")
):
    db = SessionLocal()
    try:
        # Fetch users from the database
        users = db.query(User).filter(User.id.in_(user_ids)).all()
        
        if len(users) != len(user_ids):
            return {"error": "One or more user IDs not found"}

        # Combine bios and interests
        profiles = [f"Bio: {user.bio}\nInterests: {user.interests}" for user in users]
        
        # Generate embeddings
        response = co.embed(texts=profiles, model="embed-english-v3.0", input_type="classification")
        embeddings = response.embeddings
        
        # Calculate distances between embeddings
        distances = []
        for i in range(len(embeddings)):
            for j in range(i+1, len(embeddings)):
                distance = np.linalg.norm(np.array(embeddings[i]) - np.array(embeddings[j]))
                distances.append({
                    "user1_id": users[i].id,
                    "user2_id": users[j].id,
                    "distance": float(distance)
                })
        
        # Sort distances
        sorted_distances = sorted(distances, key=lambda x: x['distance'])
        
        return {
            "profiles": [{"id": user.id, "profile": profile} for user, profile in zip(users, profiles)],
            "distances": sorted_distances
        }
    finally:
        db.close()

@app.post("/add_user")
async def add_user(bio: str, interests: str):
    db = SessionLocal()
    try:
        new_user = User(bio=bio, interests=interests)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User added successfully", "user_id": new_user.id}
    finally:
        db.close()