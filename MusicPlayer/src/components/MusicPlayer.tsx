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

  // 📥 Subir canciones
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

  return (
    <div className="music-player-container w-full h-full min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden">
      <div className="glass-effect w-full max-w-6xl mx-auto p-6 sm:p-8 md:p-10 lg:p-12 rounded-3xl shadow-2xl">
        {/* Título Principal - Más Grande */}
        <h2 className="gradient-text text-5xl sm:text-6xl md:text-7xl font-bold mb-10 sm:mb-12 text-center">
          🎶 Music Player
        </h2>

        {/* Upload Area - Más Grande */}
        <div 
          className={`upload-area p-8 sm:p-10 mb-10 sm:mb-12 rounded-2xl text-center ${isDragOver ? 'drag-over' : ''}`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const validFiles = Array.from(e.dataTransfer.files).filter(file => 
              file.type === "audio/mpeg" || file.type === "audio/mp3" || file.name.toLowerCase().endsWith('.mp3')
            );
            if (validFiles.length > 0) {
              MusicPlayerUtils.handleFileUpload(validFiles, playlist, setSongs, setCurrentSong, currentSong);
            }
          }}
        >
          <div className="border-3 border-dashed border-purple-500 p-10 sm:p-12 rounded-2xl bg-opacity-15 bg-purple-900">
            <input 
              type="file" 
              accept=".mp3,audio/mp3,audio/mpeg" 
              onChange={handleUpload}
              className="custom-focus mb-6 block w-full text-center text-lg sm:text-xl"
              multiple 
            />
            <p className="text-gray-300 text-xl sm:text-2xl">
              <span className="block mb-4">📁 Drag & Drop MP3 files here</span>
              <span className="text-lg sm:text-xl opacity-80">or click to browse</span>
            </p>
          </div>
        </div>

        {/* Current Song - Más Grande */}
        {currentSong && (
          <div className="mb-10 sm:mb-12 text-center">
            <h3 className="gradient-text text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
              {MusicPlayerUtils.getCleanSongName(currentSong.file.name)}
            </h3>
            <audio 
              ref={audioRef} 
              controls 
              className="w-full mb-6 scale-110" 
              style={{ transform: 'scale(1.1)' }}
            />
            <p className="text-gray-300 text-xl sm:text-2xl">
              {MusicPlayerUtils.formatTime(currentTime)} /{" "}
              {MusicPlayerUtils.formatTime(duration)}
            </p>
          </div>
        )}

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
        </div>

        {/* Playlist - Más Grande */}
        <div className="custom-scrollbar max-h-[calc(100vh-20rem)] sm:max-h-96 overflow-y-auto mb-8">
          <ul className="space-y-3 sm:space-y-4">
            {songs.map((song) => (
              <li 
                key={song.id} 
                className={`song-item p-4 sm:p-5 md:p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ${
                  currentSong?.id === song.id ? 'current-song' : 'glass-effect'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-semibold truncate">
                    {MusicPlayerUtils.getCleanSongName(song.file.name)}
                  </div>
                  <div className="text-lg sm:text-xl text-gray-400 mt-1">
                    {MusicPlayerUtils.formatFileSize(song.file.size)} MB
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  <button 
                    className="btn-secondary px-5 py-3 sm:px-6 sm:py-4 rounded-xl tooltip flex items-center gap-3 text-lg sm:text-xl"
                    data-tooltip="Play"
                    onClick={() => MusicPlayerUtils.playSong(song, audioRef, setCurrentSong)}
                  >
                    <span className="text-xl sm:text-2xl">▶</span>
                    <span className="sm:hidden">Play</span>
                  </button>
                  <button 
                    className="btn-secondary px-5 py-3 sm:px-6 sm:py-4 rounded-xl tooltip flex items-center gap-3 text-lg sm:text-xl"
                    data-tooltip="Remove"
                    onClick={() => MusicPlayerUtils.removeSong(song, playlist, currentSong, setSongs, setCurrentSong, setIsPlaying, audioRef)}
                  >
                    <span className="text-xl sm:text-2xl">❌</span>
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Extra Controls - Más Grandes */}
        <div className="flex justify-center gap-6 sm:gap-8">
          <button 
            className="btn-primary px-6 py-4 sm:px-8 sm:py-5 rounded-xl tooltip text-lg sm:text-xl md:text-2xl"
            data-tooltip="Shuffle Playlist"
            onClick={() => MusicPlayerUtils.shufflePlaylist(playlist, setSongs)}
          >
            🔀 Shuffle
          </button>
          <button 
            className="btn-primary px-6 py-4 sm:px-8 sm:py-5 rounded-xl tooltip text-lg sm:text-xl md:text-2xl"
            data-tooltip="Clear Playlist"
            onClick={() => MusicPlayerUtils.clearPlaylist(playlist, setSongs, setCurrentSong, setIsPlaying, audioRef)}
          >
            🗑 Clear
          </button>
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