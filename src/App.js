import React, { useState, useEffect, useRef } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Home, Music, User, LogOut } from 'lucide-react';
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
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
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

  useEffect(() => {
    let interval;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current.currentTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const fetchPopularTracks = async () => {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=top+songs+2024&limit=25&media=music&entity=song`);
      const data = await response.json();
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

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!/[A-Z]/.test(username)) {
      return 'Username must contain at least one uppercase letter';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 5) {
      return 'Password must be at least 5 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*...)';
    }
    return null;
  };

  const handleLogin = () => {
    const newErrors = {};
    
    if (!loginData.username) {
      newErrors.username = 'Username is required';
    }
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    const user = users.find(u => u.username === loginData.username && u.password === loginData.password);
    
    if (!user) {
      newErrors.general = 'User not found. Please register first.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCurrentUser(user);
    setIsLoggedIn(true);
    setErrors({});
  };

  const handleRegister = () => {
    const newErrors = {};
    
    const usernameError = validateUsername(registerData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }

    if (!registerData.email || !registerData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }

    const passwordError = validatePassword(registerData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const userExists = users.find(u => u.username === registerData.username);
    if (userExists) {
      newErrors.username = 'Username already exists';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newUser = {
      id: Date.now(),
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      registeredAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setErrors({});
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('home');
    setCurrentTrack(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
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
    console.log('Playing track:', track.title);
    
    // Если кликнули на ту же песню - просто пауза/плей
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        console.log('Pausing current track');
        setIsPlaying(false);
        audioRef.current?.pause();
      } else {
        console.log('Resuming current track');
        setIsPlaying(true);
        audioRef.current?.play().catch(err => console.error('Play error:', err));
      }
      return;
    }
    
    // Новая песня - останавливаем старую и запускаем новую
    console.log('Switching to new track');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentTime(0);
    setCurrentTrack(track);
    
    setTimeout(() => {
      if (audioRef.current && track.preview) {
        audioRef.current.src = track.preview;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            console.log('Started playing:', track.title);
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Play error:', err);
            setIsPlaying(false);
          });
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(err => console.error('Play error:', err));
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
              {errors.general && <div className="error-message">{errors.general}</div>}
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <button onClick={handleLogin} className="btn-primary">
                Log In
              </button>
              <div className="auth-switch">
                <button onClick={() => { setShowRegister(true); setErrors({}); }}>
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Sign up for free</h2>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  placeholder="Username (min 3 chars, 1 uppercase)" 
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="name@domain.com" 
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Password (min 5 chars, 1 uppercase, 1 special)" 
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <button onClick={handleRegister} className="btn-primary">
                Sign Up
              </button>
              <div className="auth-switch">
                <button onClick={() => { setShowRegister(false); setErrors({}); }}>
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
            <button
              onClick={() => setCurrentView('profile')}
              className={currentView === 'profile' ? 'active' : ''}
            >
              <User size={24} />
              <span>Profile</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
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

            {currentView === 'profile' && currentUser && (
              <div>
                <h2>Profile</h2>
                <div className="profile-card">
                  <div className="profile-avatar">
                    <User size={80} />
                  </div>
                  <div className="profile-info">
                    <div className="profile-item">
                      <label>Username:</label>
                      <span>{currentUser.username}</span>
                    </div>
                    <div className="profile-item">
                      <label>Email:</label>
                      <span>{currentUser.email}</span>
                    </div>
                    <div className="profile-item">
                      <label>Member since:</label>
                      <span>{new Date(currentUser.registeredAt).toLocaleDateString()}</span>
                    </div>
                    <div className="profile-item">
                      <label>Favorite tracks:</label>
                      <span>{favorites.length}</span>
                    </div>
                  </div>
                </div>
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
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