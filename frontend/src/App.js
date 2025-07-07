import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Movie Card Component
const MovieCard = ({ movie, onPlay }) => {
  return (
    <div className="group relative cursor-pointer transform transition-transform duration-300 hover:scale-105">
      <div className="aspect-w-2 aspect-h-3 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x600/1a1a1a/white?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onPlay(movie)}
            className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform scale-90 group-hover:scale-100"
          >
            ▶ Play
          </button>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
        <p className="text-gray-400 text-xs">{movie.year} • {movie.genre}</p>
        <div className="flex items-center mt-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-gray-300 text-xs ml-1">{movie.rating}</span>
        </div>
      </div>
    </div>
  );
};

// Movie Player Component
const MoviePlayer = ({ movie, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  const handlePlayPause = () => {
    const video = document.getElementById('movie-video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (e) => {
    const video = document.getElementById('movie-video');
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const video = document.getElementById('movie-video');
    if (video) {
      video.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        <video
          id="movie-video"
          src={movie.video_url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onMouseMove={() => setShowControls(true)}
          autoPlay
        />
        
        {/* Player Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
        >
          {/* Progress Bar */}
          <div
            className="w-full bg-gray-700 h-2 rounded-full mb-4 cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 text-2xl"
              >
                {isPlaying ? '⏸' : '▶️'}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Movie Info */}
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-white text-2xl font-bold mb-2">{movie.title}</h2>
          <p className="text-gray-300 text-sm">{movie.year} • {movie.genre} • {movie.duration} min</p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMovie, setCurrentMovie] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, searchQuery]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [moviesRes, featuredRes, genresRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/movies`),
        axios.get(`${BACKEND_URL}/api/featured`),
        axios.get(`${BACKEND_URL}/api/genres`)
      ]);

      setMovies(moviesRes.data.movies || []);
      setFeaturedMovies(featuredRes.data.movies || []);
      setGenres(genresRes.data.genres || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedGenre) params.append('genre', selectedGenre);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await axios.get(`${BACKEND_URL}/api/movies?${params}`);
      setMovies(response.data.movies || []);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load movies. Please try again later.');
    }
  };

  const handlePlayMovie = (movie) => {
    setCurrentMovie(movie);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setCurrentMovie(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Netflix Clone...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black bg-opacity-90 backdrop-blur-sm z-40 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-red-600 text-2xl font-bold">NETFLIX CLONE</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-lg transition-colors"
              >
                🔍
              </button>
            </form>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Featured Section */}
        {featuredMovies.length > 0 && (
          <section className="relative mb-12">
            <div className="relative h-96 bg-gradient-to-r from-black via-transparent to-black">
              <img
                src={featuredMovies[0].poster_url}
                alt={featuredMovies[0].title}
                className="w-full h-full object-cover opacity-50"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1920x1080/1a1a1a/white?text=Featured+Movie';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 max-w-md">
                <h2 className="text-white text-4xl font-bold mb-4">{featuredMovies[0].title}</h2>
                <p className="text-gray-300 text-lg mb-6">{featuredMovies[0].description}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handlePlayMovie(featuredMovies[0])}
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <span>▶</span>
                    <span>Play</span>
                  </button>
                  <button className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="px-8 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <span className="text-gray-400">
              {movies.length} movies found
            </span>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="px-8 pb-12">
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={handlePlayMovie}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <h3 className="text-xl mb-4">No movies found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Movie Player */}
      {isPlayerOpen && currentMovie && (
        <MoviePlayer
          movie={currentMovie}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}

export default App;