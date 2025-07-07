import os
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Netflix Clone API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/netflix_clone")

try:
    client = MongoClient(MONGO_URL)
    db = client.netflix_clone
    movies_collection = db.movies
    users_collection = db.users
    
    # Test connection
    client.admin.command('ping')
    logger.info("Connected to MongoDB successfully")
except ConnectionFailure as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    db = None

# Pydantic models
class Movie(BaseModel):
    id: str
    title: str
    description: str
    genre: str
    year: int
    duration: int  # in minutes
    rating: float
    poster_url: str
    video_url: str
    trailer_url: Optional[str] = None
    created_at: datetime = datetime.now()

class User(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime = datetime.now()
    favorites: List[str] = []
    watch_history: List[str] = []

# Initialize sample data
async def init_sample_data():
    """Initialize sample movie data"""
    if db is None:
        return
    
    # Check if movies already exist
    if movies_collection.count_documents({}) > 0:
        logger.info("Sample data already exists")
        return
    
    sample_movies = [
        {
            "id": str(uuid.uuid4()),
            "title": "The Matrix",
            "description": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
            "genre": "Action",
            "year": 1999,
            "duration": 136,
            "rating": 8.7,
            "poster_url": "https://images.unsplash.com/photo-1489599349251-79194a773e63?w=400&h=600&fit=crop",
            "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            "trailer_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4",
            "created_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Inception",
            "description": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
            "genre": "Sci-Fi",
            "year": 2010,
            "duration": 148,
            "rating": 8.8,
            "poster_url": "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop",
            "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
            "trailer_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4",
            "created_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Pulp Fiction",
            "description": "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
            "genre": "Crime",
            "year": 1994,
            "duration": 154,
            "rating": 8.9,
            "poster_url": "https://images.unsplash.com/photo-1489599349251-79194a773e63?w=400&h=600&fit=crop",
            "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
            "trailer_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_5mb.mp4",
            "created_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "The Dark Knight",
            "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
            "genre": "Action",
            "year": 2008,
            "duration": 152,
            "rating": 9.0,
            "poster_url": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
            "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            "trailer_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4",
            "created_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Forrest Gump",
            "description": "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.",
            "genre": "Drama",
            "year": 1994,
            "duration": 142,
            "rating": 8.8,
            "poster_url": "https://images.unsplash.com/photo-1489599349251-79194a773e63?w=400&h=600&fit=crop",
            "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
            "trailer_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4",
            "created_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Interstellar",
            "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            "genre": "Sci-Fi",
            "year": 2014,
            "duration": 169,
            "rating": 8.6,
            "poster_url": "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop",
            "video_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
            "trailer_url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_5mb.mp4",
            "created_at": datetime.now()
        }
    ]
    
    try:
        movies_collection.insert_many(sample_movies)
        logger.info(f"Inserted {len(sample_movies)} sample movies")
    except Exception as e:
        logger.error(f"Error inserting sample data: {e}")

# API Routes
@app.get("/")
async def root():
    return {"message": "Netflix Clone API is running!"}

@app.get("/api/movies")
async def get_movies(genre: Optional[str] = None, search: Optional[str] = None, limit: int = 20, offset: int = 0):
    """Get all movies with optional filtering"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        query = {}
        
        if genre:
            query["genre"] = {"$regex": genre, "$options": "i"}
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        movies = list(movies_collection.find(query).skip(offset).limit(limit))
        total_count = movies_collection.count_documents(query)
        
        # Convert ObjectId to string and remove _id
        for movie in movies:
            movie.pop("_id", None)
        
        return {
            "movies": movies,
            "total": total_count,
            "offset": offset,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error fetching movies: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/movies/{movie_id}")
async def get_movie(movie_id: str):
    """Get a specific movie by ID"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        movie = movies_collection.find_one({"id": movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        movie.pop("_id", None)
        return movie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching movie {movie_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/movies/genre/{genre}")
async def get_movies_by_genre(genre: str, limit: int = 10):
    """Get movies by genre"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        movies = list(movies_collection.find({"genre": {"$regex": genre, "$options": "i"}}).limit(limit))
        
        for movie in movies:
            movie.pop("_id", None)
        
        return {"movies": movies, "genre": genre}
    except Exception as e:
        logger.error(f"Error fetching movies by genre {genre}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/genres")
async def get_genres():
    """Get all unique genres"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        genres = movies_collection.distinct("genre")
        return {"genres": genres}
    except Exception as e:
        logger.error(f"Error fetching genres: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/featured")
async def get_featured_movies(limit: int = 5):
    """Get featured movies (highest rated)"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        movies = list(movies_collection.find().sort("rating", -1).limit(limit))
        
        for movie in movies:
            movie.pop("_id", None)
        
        return {"movies": movies}
    except Exception as e:
        logger.error(f"Error fetching featured movies: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/movies")
async def create_movie(movie: Movie):
    """Create a new movie"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        # Generate new ID if not provided
        if not movie.id:
            movie.id = str(uuid.uuid4())
        
        movie_dict = movie.dict()
        movies_collection.insert_one(movie_dict)
        
        return {"message": "Movie created successfully", "movie_id": movie.id}
    except Exception as e:
        logger.error(f"Error creating movie: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if db is not None:
            client.admin.command('ping')
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "unhealthy", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Initialize sample data on startup
@app.on_event("startup")
async def startup_event():
    """Initialize sample data on startup"""
    await init_sample_data()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)