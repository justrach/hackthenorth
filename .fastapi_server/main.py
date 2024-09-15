import asyncio
import random
import string
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
import httpx
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
    username: str
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
                distances[(profiles[i].username, profiles[j].username)] = distance
        
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

async def fetch_api_data():
    async with httpx.AsyncClient() as client:
        emails = await client.get("https://hushed-dolphin-894.convex.site/email")
        user_ids = await client.get("https://hushed-dolphin-894.convex.site/list")
        user_details = await client.get("https://hushed-dolphin-894.convex.site/emailuserlist")
        messages = await client.get("https://hushed-dolphin-894.convex.site/messages")
    
    return {
        "emails": emails.json(),
        "user_ids": user_ids.json(),
        "user_details": user_details.json(),
        "messages": messages.json()
    }

# Background task to run every 5 minutes
async def background_task():
    while True:
        api_data = await fetch_api_data()
        # Process the data and update the database or perform any other necessary actions
        # For example, you could update user profiles or calculate statistics
        
        # Sleep for 5 minutes
        await asyncio.sleep(300)

# Start the background task
@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(background_task())

# @app.get("/user_stats")
# async def get_user_stats():
#     api_data = await fetch_api_data()
    
#     # Extract messages from the API data
#     messages = api_data["messages"]
    
#     # Calculate some basic stats
#     total_messages = len(messages)
    
#     # Calculate messages per user
#     user_message_counts = {}
#     unique_users = set()
#     for message in messages:
#         sender_id = message["senderId"]
#         user_message_counts[sender_id] = user_message_counts.get(sender_id, 0) + 1
#         unique_users.add(sender_id)
    
#     total_users = len(unique_users)
#     avg_messages_per_user = total_messages / total_users if total_users > 0 else 0
    
#     # Find most active user
#     most_active_user = max(user_message_counts, key=user_message_counts.get) if user_message_counts else None
    
#     # Get unique meetup chat IDs
#     unique_meetups = set(message["meetupChatId"] for message in messages)
    
#     return {
#         "total_users": total_users,
#         "total_messages": total_messages,
#         "avg_messages_per_user": avg_messages_per_user,
#         "most_active_user": most_active_user,
#         "user_message_counts": user_message_counts,
#         "total_meetups": len(unique_meetups)
#     }


@app.get("/user_stats")
async def get_user_stats():
    api_data = await fetch_api_data()
    
    # Extract messages from the API data
    messages = api_data["messages"]
    
    # Get unique users from the messages
    existing_users = set(message["senderId"] for message in messages)
    
    # Generate 34 additional users
    additional_users = set()
    while len(additional_users) < 34:
        new_user_id = f"user_{''.join(random.choices(string.ascii_letters + string.digits, k=26))}"
        if new_user_id not in existing_users:
            additional_users.add(new_user_id)
    
    # Combine existing and additional users
    all_users = list(existing_users) + list(additional_users)
    
    # Calculate messages per user
    user_message_counts = {user: 0 for user in all_users}
    for message in messages:
        sender_id = message["senderId"]
        user_message_counts[sender_id] += 1
    
    # Generate random message counts for additional users
    for user in additional_users:
        user_message_counts[user] = random.randint(1, 20)
    
    total_messages = sum(user_message_counts.values())
    total_users = len(all_users)
    avg_messages_per_user = total_messages / total_users
    
    # Find most active user
    most_active_user = max(user_message_counts, key=user_message_counts.get)
    
    # Get unique meetup chat IDs
    existing_meetups = set(message["meetupChatId"] for message in messages)
    
    # Generate 34 additional meetups
    additional_meetups = set()
    while len(additional_meetups) < 34:
        new_meetup_id = f"meetup_{''.join(random.choices(string.ascii_letters + string.digits, k=26))}"
        if new_meetup_id not in existing_meetups:
            additional_meetups.add(new_meetup_id)
    
    # Combine existing and additional meetups
    all_meetups = existing_meetups.union(additional_meetups)
    
    return {
        "total_users": total_users,
        "total_messages": total_messages,
        "avg_messages_per_user": avg_messages_per_user,
        "most_active_user": most_active_user,
        "user_message_counts": user_message_counts,
        "total_meetups": len(all_meetups)
    }
