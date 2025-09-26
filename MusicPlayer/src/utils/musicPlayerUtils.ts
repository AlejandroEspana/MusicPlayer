// utils/musicPlayerUtils.ts
import { SongNode, DoublyLinkedList } from './DoublyLinkedList';

export class MusicPlayerUtils {
  
  /**
   * Format time in MM:SS format
   */
  static formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Validate if file is a valid audio file
   */
  static isValidAudioFile(file: File): boolean {
    return file.type === "audio/mpeg" || 
           file.type === "audio/mp3" || 
           file.name.toLowerCase().endsWith('.mp3');
  }

  /**
   * Format file size in MB
   */
  static formatFileSize(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(1);
  }

  /**
   * Handle file upload and add to playlist
   */
  static handleFileUpload(
    files: FileList | File[], 
    playlist: DoublyLinkedList,
    setSongs: (updater: (prev: SongNode[]) => SongNode[]) => void,
    setCurrentSong: (song: SongNode | null) => void,
    currentSong: SongNode | null
  ): void {
    Array.from(files).forEach(file => {
      if (this.isValidAudioFile(file)) {
        const newSong = playlist.addSong(file);
        setSongs(prev => [...prev, newSong]);
        if (!currentSong) {
          setCurrentSong(newSong);
        }
      }
    });
  }

  /**
   * Play a specific song
   */
  static playSong(
    song: SongNode, 
    audioRef: React.RefObject<HTMLAudioElement | null>,
    setCurrentSong: (song: SongNode) => void
  ): void {
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.play().catch(console.error);
    }
  }

  /**
   * Toggle play/pause state
   */
  static togglePlayPause(
    audioRef: React.RefObject<HTMLAudioElement | null>,
    isPlaying: boolean
  ): void {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  }

  /**
   * Skip to next song
   */
  static skipToNext(
    currentSong: SongNode | null,
    playlist: DoublyLinkedList,
    audioRef: React.RefObject<HTMLAudioElement | null>,
    setCurrentSong: (song: SongNode) => void
  ): void {
    if (currentSong?.next) {
      this.playSong(currentSong.next, audioRef, setCurrentSong);
    } else if (playlist.head) {
      // Loop back to beginning
      this.playSong(playlist.head, audioRef, setCurrentSong);
    }
  }

  /**
   * Skip to previous song
   */
  static skipToPrevious(
    currentSong: SongNode | null,
    playlist: DoublyLinkedList,
    audioRef: React.RefObject<HTMLAudioElement | null>,
    setCurrentSong: (song: SongNode) => void
  ): void {
    if (currentSong?.prev) {
      this.playSong(currentSong.prev, audioRef, setCurrentSong);
    } else if (playlist.tail) {
      // Loop to end
      this.playSong(playlist.tail, audioRef, setCurrentSong);
    }
  }

  /**
   * Remove song from playlist
   */
  static removeSong(
    song: SongNode,
    playlist: DoublyLinkedList,
    currentSong: SongNode | null,
    setSongs: (songs: SongNode[]) => void,
    setCurrentSong: (song: SongNode | null) => void,
    setIsPlaying: (playing: boolean) => void,
    audioRef: React.RefObject<HTMLAudioElement | null>
  ): void {
    playlist.removeSong(song);
    const newSongs = playlist.toArray();
    setSongs(newSongs);

    if (currentSong === song) {
      if (song.next) {
        this.playSong(song.next, audioRef, setCurrentSong);
      } else if (song.prev) {
        this.playSong(song.prev, audioRef, setCurrentSong);
      } else {
        setCurrentSong(null);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
    }
  }

  /**
   * Clear entire playlist
   */
  static clearPlaylist(
    playlist: DoublyLinkedList,
    setSongs: (songs: SongNode[]) => void,
    setCurrentSong: (song: SongNode | null) => void,
    setIsPlaying: (playing: boolean) => void,
    audioRef: React.RefObject<HTMLAudioElement | null>
  ): void {
    playlist.clear();
    setSongs([]);
    setCurrentSong(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }

  /**
   * Handle audio seek
   */
  static handleSeek(
    newTime: number,
    audioRef: React.RefObject<HTMLAudioElement | null>,
    setCurrentTime: (time: number) => void
  ): void {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  /**
   * Setup audio event listeners
   */
  static setupAudioListeners(
    audioRef: React.RefObject<HTMLAudioElement | null>,
    setDuration: (duration: number) => void,
    setCurrentTime: (time: number) => void,
    setIsPlaying: (playing: boolean) => void,
    onSongEnd: () => void
  ): () => void {
    const audio = audioRef.current;
    if (!audio) return () => {};

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onSongEnd();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Return cleanup function
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }

  /**
   * Handle drag and drop reordering
   */
  static handlePlaylistReorder(
    draggedItem: SongNode,
    dropIndex: number,
    playlist: DoublyLinkedList,
    setSongs: (songs: SongNode[]) => void
  ): void {
    playlist.moveToPosition(draggedItem, dropIndex);
    setSongs(playlist.toArray());
  }

  /**
   * Extract clean song name (remove .mp3 extension)
   */
  static getCleanSongName(filename: string): string {
    return filename.replace(/\.(mp3|mpeg)$/i, '');
  }

  /**
   * Generate random song ID
   */
  static generateSongId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Check if playlist is empty
   */
  static isPlaylistEmpty(songs: SongNode[]): boolean {
    return songs.length === 0;
  }

  /**
   * Get song position in playlist
   */
  static getSongPosition(song: SongNode, songs: SongNode[]): number {
    return songs.findIndex(s => s.id === song.id) + 1;
  }

  /**
   * Shuffle playlist (Fisher-Yates algorithm)
   */
  static shufflePlaylist(
    playlist: DoublyLinkedList,
    setSongs: (songs: SongNode[]) => void
  ): void {
    const songsArray = playlist.toArray();
    
    // Fisher-Yates shuffle
    for (let i = songsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songsArray[i], songsArray[j]] = [songsArray[j], songsArray[i]];
    }

    // Rebuild the linked list with shuffled order
    playlist.clear();
    songsArray.forEach(song => {
      const newNode = playlist.addSong(song.file);
      // Copy the old ID to maintain references
      newNode.id = song.id;
    });

    setSongs(playlist.toArray());
  }
}