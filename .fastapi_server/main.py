from fastapi import FastAPI, Body
from typing import List
import chromadb
import cohere
import numpy as np
from sqlalchemy import create_engine, Column, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from chromadb.api.types import Documents, Embeddings

app = FastAPI()

# Database setup
DATABASE_URL = "postgresql://rachitai_owner:4tJLvyqmFWl8@ep-restless-surf-a6sxbfe9-pooler.us-west-2.aws.neon.tech/hackthenorth?sslmode=require"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    bio = Column(String)
    interests = Column(String)

Base.metadata.create_all(bind=engine)

# Initialize Chroma client
chroma_client = chromadb.Client()

# Initialize Cohere client
co = cohere.Client("rYG2zq1ULkE2wlPT5qAfkDu29g81DDTwNWDh5RoI")  # Replace with your actual Cohere API key

# Create a custom embedding function for Chroma
class CohereEmbeddingFunction:
    def __call__(self, input: Documents) -> Embeddings:
        response = co.embed(texts=input, model="embed-english-v3.0", input_type="classification")
        return response.embeddings

# Create a collection for storing embeddings
collection = chroma_client.create_collection(name="user_profiles", embedding_function=CohereEmbeddingFunction())

class UserProfile(BaseModel):
    bio: str
    email: str
    id: str
    interests: List[str]

@app.post("/compare_profiles")
async def compare_profiles(
    profiles: List[UserProfile] = Body(..., description="List of user profiles to compare")
):
    db = SessionLocal()
    try:
        # Combine bios and interests
        combined_profiles = [f"Bio: {profile.bio}\nInterests: {', '.join(profile.interests)}" for profile in profiles]
        
        # Generate embeddings
        response = co.embed(texts=combined_profiles, model="embed-english-v3.0", input_type="classification")
        embeddings = response.embeddings
        
        # Calculate distances between embeddings
        distances = []
        for i in range(len(embeddings)):
            for j in range(i+1, len(embeddings)):
                distance = np.linalg.norm(np.array(embeddings[i]) - np.array(embeddings[j]))
                distances.append({
                    "user1_id": profiles[i].id,
                    "user2_id": profiles[j].id,
                    "distance": float(distance)
                })
        
        # Sort distances
        sorted_distances = sorted(distances, key=lambda x: x['distance'])
        
        return {
            "profiles": [{"id": profile.id, "profile": combined_profile} for profile, combined_profile in zip(profiles, combined_profiles)],
            "distances": sorted_distances
        }
    finally:
        db.close()

@app.post("/add_user")
async def add_user(profile: UserProfile):
    db = SessionLocal()
    try:
        new_user = User(
            id=profile.id,
            email=profile.email,
            bio=profile.bio,
            interests=", ".join(profile.interests)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User added successfully", "user_id": new_user.id}
    finally:
        db.close()

@app.post("/find_furthest_pair")
async def find_furthest_pair(
    profiles: List[UserProfile] = Body(..., description="List of user profiles to compare")
):
    db = SessionLocal()
    try:
        # Combine bios and interests
        combined_profiles = [f"Bio: {profile.bio}\nInterests: {', '.join(profile.interests)}" for profile in profiles]
        
        # Generate embeddings
        response = co.embed(texts=combined_profiles, model="embed-english-v3.0", input_type="classification")
        embeddings = response.embeddings
        
        # Calculate distances between all pairs
        distances = {}
        for i in range(len(embeddings)):
            for j in range(i+1, len(embeddings)):
                distance = np.linalg.norm(np.array(embeddings[i]) - np.array(embeddings[j]))
                distances[(profiles[i].id, profiles[j].id)] = distance
        
        # Sort distances
        sorted_distances = sorted(distances.items(), key=lambda x: x[1], reverse=True)
        
        # Create pairs maximizing diversity
        paired_users = set()
        result = []
        
        for (user1, user2), _ in sorted_distances:
            if user1 not in paired_users and user2 not in paired_users:
                result.append([user1, user2])
                paired_users.add(user1)
                paired_users.add(user2)
            
            if len(paired_users) == len(profiles):
                break
        
        return result
    finally:
        db.close()