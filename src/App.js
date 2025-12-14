import React, { useState, useEffect, useRef } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Home, Music } from 'lucide-react';
import './App.css';

const SoundStorm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [popularTracks, setPopularTracks] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPopularTracks();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const fetchPopularTracks = async () => {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=top+songs+2024&limit=25&media=music&entity=song`);
      const data = await response.json();
      console.log('Fetched tracks:', data);
      if (data.results) {
        const tracks = data.results.map((track) => ({
          id: track.trackId,
          title: track.trackName,
          preview: track.previewUrl,
          duration: Math.floor(track.trackTimeMillis / 1000),
          artist: { name: track.artistName },
          album: { 
            title: track.collectionName,
            cover_small: track.artworkUrl100
          },
          cover_small: track.artworkUrl100
        }));
        setPopularTracks(tracks);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&limit=25&media=music&entity=song`);
      const data = await response.json();
      console.log('Search results:', data);
      if (data.results) {
        const tracks = data.results.map((track) => ({
          id: track.trackId,
          title: track.trackName,
          preview: track.previewUrl,
          duration: Math.floor(track.trackTimeMillis / 1000),
          artist: { name: track.artistName },
          album: { 
            title: track.collectionName,
            cover_small: track.artworkUrl100
          },
          cover_small: track.artworkUrl100
        }));
        setSearchResults(tracks);
        setCurrentView('search');
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFavorite = (track) => {
    setFavorites(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) {
        return prev.filter(t => t.id !== track.id);
      }
      return [...prev, track];
    });
  };

  const isFavorite = (trackId) => {
    return favorites.some(t => t.id === trackId);
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.preview;
        audioRef.current.play();
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <Music className="logo-icon" />
            <h1>SoundStorm</h1>
            <p>Music for everyone</p>
          </div>

          {!showRegister ? (
            <div className="auth-form">
              <h2>Log in to SoundStorm</h2>
              <div className="form-group">
                <label>Email or username</label>
                <input type="text" placeholder="Email or username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Password" />
              </div>
              <button onClick={() => setIsLoggedIn(true)} className="btn-primary">
                Log In
              </button>
              <div className="auth-switch">
                <button onClick={() => setShowRegister(true)}>
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Sign up for free</h2>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="name@domain.com" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Password" />
              </div>
              <button onClick={() => setIsLoggedIn(true)} className="btn-primary">
                Sign Up
              </button>
              <div className="auth-switch">
                <button onClick={() => setShowRegister(false)}>
                  Already have an account? Log in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const TrackRow = ({ track, index }) => (
    <div className="track-row">
      <div className="track-number">
        {currentTrack?.id === track.id && isPlaying ? (
          <div className="playing-indicator"></div>
        ) : (
          <span className="number">{index + 1}</span>
        )}
        <button onClick={() => playTrack(track)} className="play-btn-small">
          {currentTrack?.id === track.id && isPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
      </div>
      <div className="track-info">
        <img src={track.album?.cover_small || track.cover_small} alt={track.title} />
        <div className="track-details">
          <div className="track-title">{track.title}</div>
          <div className="track-artist">{track.artist?.name}</div>
        </div>
      </div>
      <div className="track-album">{track.album?.title || 'Single'}</div>
      <div className="track-duration">{formatTime(track.duration)}</div>
      <div className="track-actions">
        <button
          onClick={() => toggleFavorite(track)}
          className={`favorite-btn ${isFavorite(track.id) ? 'active' : ''}`}
        >
          <Heart size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <Music size={40} />
            <h1>SoundStorm</h1>
          </div>

          <nav className="sidebar-nav">
            <button
              onClick={() => setCurrentView('home')}
              className={currentView === 'home' ? 'active' : ''}
            >
              <Home size={24} />
              <span>Home</span>
            </button>
            <button
              onClick={() => setCurrentView('favorites')}
              className={currentView === 'favorites' ? 'active' : ''}
            >
              <Heart size={24} />
              <span>Favorites</span>
            </button>
          </nav>
        </div>

        <div className="content">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search for songs, artists..."
              />
            </div>
          </div>

          <div className="content-body">
            {currentView === 'home' && (
              <div>
                <h2>Popular Right Now</h2>
                <div className="track-list">
                  {popularTracks.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'search' && (
              <div>
                <h2>Search Results</h2>
                <div className="track-list">
                  {searchResults.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'favorites' && (
              <div>
                <h2>Your Favorites</h2>
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <Heart size={64} />
                    <p>No favorites yet. Start adding songs you love!</p>
                  </div>
                ) : (
                  <div className="track-list">
                    {favorites.map((track, index) => (
                      <TrackRow key={track.id} track={track} index={index} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentTrack && (
        <div className="player">
          <audio
            ref={audioRef}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="player-track-info">
            <img src={currentTrack.album?.cover_small || currentTrack.cover_small} alt={currentTrack.title} />
            <div className="player-track-details">
              <div className="player-track-title">{currentTrack.title}</div>
              <div className="player-track-artist">{currentTrack.artist?.name}</div>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`favorite-btn ${isFavorite(currentTrack.id) ? 'active' : ''}`}
            >
              <Heart size={20} />
            </button>
          </div>

          <div className="player-controls">
            <div className="player-buttons">
              <button><SkipBack size={20} /></button>
              <button onClick={togglePlayPause} className="play-btn">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button><SkipForward size={20} /></button>
            </div>
            <div className="player-progress">
              <span>{formatTime(currentTime)}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-volume">
            <button onClick={() => setIsMuted(!isMuted)}>
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundStorm;