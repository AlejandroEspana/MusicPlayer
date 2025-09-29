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
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedSongIndex, setDraggedSongIndex] = useState<number | null>(null);

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

  const handleDragStart = (index: number) => {
    setDraggedSongIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedSongIndex === null || draggedSongIndex === index) return;

    // Obtener el nodo arrastrado
    const draggedNode = songs[draggedSongIndex];

    // Mover el nodo a la nueva posición en la lista doble
    playlist.moveToPosition(draggedNode, index);

    // Sincronizar el estado de las canciones
    const updatedSongs = playlist.toArray();
    setSongs(updatedSongs);

    setDraggedSongIndex(null);
  };

  const filteredSongs = songs.filter((song) =>
    song.file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="music-player-container w-full h-full min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden bg-[#18181b]">
      <div className="w-full max-w-6xl mx-auto p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl shadow-2xl bg-[#23232b] border border-[#bfa76f]">
        {/* Título Principal */}
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

        {/* Controls - Más Grandes */}

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
            {filteredSongs.map((song, index) => (
              <li 
                key={song.id} 
                className={`song-item p-1 sm:p-1.5 md:p-2 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-0.5 sm:gap-1 ${
                  currentSong?.id === song.id ? 'current-song' : 'bg-[var(--bg-card)] border border-[var(--accent-gold)] hover:bg-[var(--accent-burgundy)]'
                }${draggedSongIndex === index ? ' dragging' : ''}`}
                draggable
                aria-grabbed={draggedSongIndex === index}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => e.currentTarget.classList.add('drag-over')}
                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                onDrop={(e) => {
                  e.currentTarget.classList.remove('drag-over');
                  handleDrop(index);
                }}
                onClick={() => MusicPlayerUtils.playSong(song, audioRef, setCurrentSong)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base md:text-lg font-semibold truncate text-[#bfa76f]">
                    {MusicPlayerUtils.getCleanSongName(song.file.name)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-0.5">
                    {MusicPlayerUtils.formatFileSize(song.file.size)} MB
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    className="btn-danger text-xs px-1 py-0.5 rounded mr-4 border border-[#bfa76f] bg-[#7c2342] text-[#f5f5f5] hover:bg-[#bfa76f] hover:text-[#18181b]"
                    onClick={() => MusicPlayerUtils.removeSong(song, playlist, currentSong, setSongs, setCurrentSong, setIsPlaying, audioRef)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="playback-bar fixed bottom-0 left-0 w-full p-6 flex flex-col items-center z-50"
        style={{
          background: "#18181b",
          boxShadow: "0 -2px 24px 0 rgba(44,27,71,0.12)",
          borderTop: "2px solid #bfa76f"
        }}
      >
        {/* Controles de reproducción */}
        <div className="flex items-center gap-6 mb-2">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#bfa76f] bg-[#23232b] border border-[#bfa76f] hover:bg-[#7c2342] hover:text-[#f5f5f5] "
            onClick={handleShuffle}
            aria-label="Shuffle"
          >
            🎲
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#bfa76f] bg-[#23232b] border border-[#bfa76f] hover:bg-[#7c2342] hover:text-[#f5f5f5] "
            onClick={() => MusicPlayerUtils.skipToPrevious(currentSong, playlist, audioRef, setCurrentSong)}
            aria-label="Previous"
          >
            ⏮
          </button>
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full text-[#18181b] bg-[#bfa76f] border border-[#bfa76f] hover:bg-[#7c2342] hover:text-[#f5f5f5] "
            onClick={() => MusicPlayerUtils.togglePlayPause(audioRef, isPlaying)}
            aria-label="Play/Pause"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#bfa76f] bg-[#23232b] border border-[#bfa76f] hover:bg-[#7c2342] hover:text-[#f5f5f5] "
            onClick={() => MusicPlayerUtils.skipToNext(currentSong, playlist, audioRef, setCurrentSong)}
            aria-label="Next"
          >
            ⏭
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#f5f5f5] bg-[#7c2342] border border-[#bfa76f] hover:bg-[#bfa76f] hover:text-[#18181b] "
            onClick={() => MusicPlayerUtils.clearPlaylist(playlist, setSongs, setCurrentSong, setIsPlaying, audioRef)}
            aria-label="Clear Playlist"
          >
            🗑
          </button>
        </div>

        {/* Nombre de la canción */}
        <div className="text-[#f5f5f5] text-lg font-serif font-bold mb-2 text-center">
          {MusicPlayerUtils.getCleanSongName(currentSong?.file.name || "No song playing")}
        </div>

        {/* Barra de progreso */}
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-between w-full text-sm text-[#bfa76f] mb-1 font-mono">
            <span>{MusicPlayerUtils.formatTime(currentTime)}</span>
            <span>{MusicPlayerUtils.formatTime(duration)}</span>
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
            className="w-full h-2 rounded-full appearance-none cursor-pointer playback-slider"
            style={{
              background: "linear-gradient(90deg, #bfa76f 0%, #7c2342 100%)"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;