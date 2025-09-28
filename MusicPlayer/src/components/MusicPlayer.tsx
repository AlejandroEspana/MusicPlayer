import { useState, useRef, useEffect } from "react";
import { DoublyLinkedList, SongNode } from "../utils/DoublyLinkedList";
import { MusicPlayerUtils } from "../utils/musicPlayerUtils";


const playlist = new DoublyLinkedList();

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songs, setSongs] = useState<SongNode[]>([]);
  const [currentSong, setCurrentSong] = useState<SongNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🎧 Setup listeners
  useEffect(() => {
    const cleanup = MusicPlayerUtils.setupAudioListeners(
      audioRef,
      setDuration,
      setCurrentTime,
      setIsPlaying,
      () => MusicPlayerUtils.skipToNext(currentSong, playlist, audioRef, setCurrentSong)
    );
    return cleanup;
  }, [currentSong]);

  //  Subir canciones
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      MusicPlayerUtils.handleFileUpload(
        e.target.files,
        playlist,
        setSongs,
        setCurrentSong,
        currentSong
      );
    }
  };

  // Correct the shuffle functionality to use the 'file' property of SongNode
  const handleShuffle = () => {
    MusicPlayerUtils.shufflePlaylist(playlist, setSongs);
    const firstSong = playlist.head || null; // Access the head directly
    if (firstSong) {
      MusicPlayerUtils.playSong(firstSong, audioRef, setCurrentSong);
    }
  };

  const filteredSongs = songs.filter((song) =>
    song.file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="music-player-container w-full h-full min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden">
      <div className="glass-effect w-full max-w-6xl mx-auto p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl shadow-2xl">
        {/* Título Principal - Más Grande */}
        <h2 className="gradient-text text-5xl sm:text-6xl md:text-7xl font-bold mb-10 sm:mb-12 text-center">
          🎶 Music Player
        </h2>

        {/* Search Menu at the Top */}
        

        {/* Add Song Button */}
        <div className="add-song-container mb-6">
          <button className="btn-primary px-6 py-4 sm:px-8 sm:py-5 rounded-xl tooltip text-lg sm:text-xl md:text-2xl" onClick={() => document.getElementById('file-upload')?.click()}>
            ➕ Add Song
          </button>
          <input
            id="file-upload"
            type="file"
            accept=".mp3,audio/mp3,audio/mpeg"
            onChange={handleUpload}
            className="hidden"
            multiple
          />
        </div>

        {/* Upload Area - Más Grande */}


        {/* Current Song - Más Grande */}
        {currentSong && (
          <div className="mb-10 sm:mb-12 text-center">
            <audio 
              ref={audioRef} 

            />

          </div>
        )}

        {/* Playback Bar - Nuevo */}
        <div className="playback-bar mb-10 sm:mb-12">
          <div className="song-details text-center mb-4">
            <span className="block text-xl sm:text-2xl font-semibold">
              {currentSong ? MusicPlayerUtils.getCleanSongName(currentSong.file.name) : "No song playing"}
            </span>
            <span className="block text-lg sm:text-xl text-gray-400">
              {MusicPlayerUtils.formatTime(currentTime)} / {MusicPlayerUtils.formatTime(duration)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="playback-slider w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Controls - Más Grandes */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10 sm:mb-12">
          <button 
            className="control-button w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full text-white tooltip"
            data-tooltip="Previous"
            onClick={() => MusicPlayerUtils.skipToPrevious(currentSong, playlist, audioRef, setCurrentSong)}
          >
            <span className="text-3xl sm:text-4xl md:text-5xl">⏮</span>
          </button>
          <button 
            className={`play-button w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full text-white ${isPlaying ? 'pulse-animation' : ''}`}
            onClick={() => MusicPlayerUtils.togglePlayPause(audioRef, isPlaying)}
          >
            <span className="text-4xl sm:text-5xl md:text-6xl">{isPlaying ? "⏸" : "▶"}</span>
          </button>
          <button 
            className="control-button w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full text-white tooltip"
            data-tooltip="Next"
            onClick={() => MusicPlayerUtils.skipToNext(currentSong, playlist, audioRef, setCurrentSong)}
          >
            <span className="text-3xl sm:text-4xl md:text-5xl">⏭</span>
          </button>
          <button 
            className="control-button w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full text-white tooltip"
            data-tooltip="Shuffle"
            onClick={handleShuffle}
          >
            <span className="text-3xl sm:text-4xl md:text-5xl">🔀</span>
          </button>
        </div>
        <div className="search-container mb-6">
          <div className="search-bar relative">
            <span className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-10 pr-4 py-3 rounded-xl w-full text-lg sm:text-xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="clear-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Playlist - Más Grande */}
        <div className="custom-scrollbar max-h-[calc(100vh-20rem)] sm:max-h-96 overflow-y-auto mb-8">
          <ul className="space-y-3 sm:space-y-4">
            {filteredSongs.map((song) => (
              <li 
                key={song.id} 
                className={`song-item p-4 sm:p-5 md:p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ${
                  currentSong?.id === song.id ? 'current-song' : 'glass-effect'
                }`}
                onClick={() => MusicPlayerUtils.playSong(song, audioRef, setCurrentSong)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-semibold truncate">
                    {MusicPlayerUtils.getCleanSongName(song.file.name)}
                  </div>
                  <div className="text-lg sm:text-xl text-gray-400 mt-1">
                    {MusicPlayerUtils.formatFileSize(song.file.size)} MB
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-lg sm:text-xl">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} in playlist
          </p>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;