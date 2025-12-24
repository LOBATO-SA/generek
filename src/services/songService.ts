import { api } from '../lib/api';
import type { ApiSong } from '../types';
import type { Song } from '../contexts/MusicPlayerContext';

interface GetSongsParams {
    search?: string;
    genre?: string;
    artist?: string;
}

interface GetSongsResponse {
    songs: ApiSong[];
}

/**
 * Convert API song format to player Song format
 */
function mapApiSongToPlayerSong(apiSong: ApiSong): Song {
    // Format duration from seconds to "M:SS"
    let durationStr = "0:00";
    if (apiSong.duration) {
        const minutes = Math.floor(apiSong.duration / 60);
        const seconds = apiSong.duration % 60;
        durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return {
        title: apiSong.title,
        artist: apiSong.artist_id?.full_name || 'Artista Desconhecido',
        duration: durationStr,
        cover: apiSong.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=150&h=150',
        source: apiSong.file_url
    };
}

export const songService = {
    /**
     * Get songs from the backend API
     * @param params Optional filters (search, genre, artist)
     * @returns Array of songs in player format
     */
    getSongs: async (params?: GetSongsParams): Promise<Song[]> => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.genre) queryParams.append('genre', params.genre);
        if (params?.artist) queryParams.append('artist', params.artist);

        const queryString = queryParams.toString();
        const url = queryString ? `/songs?${queryString}` : '/songs';

        const response = await api.get<GetSongsResponse>(url);

        // The API returns { songs: [...] }
        const apiSongs = response.data.songs || [];

        // Filter out broken/hidden tracks and ensure source exists
        const filteredApiSongs = apiSongs.filter(s =>
            s.title !== "Hidden Track" &&
            s.title !== "Searchable Hit" &&
            s.file_url // Must have a source link
        );

        return filteredApiSongs.map(mapApiSongToPlayerSong);
    },

    /**
     * Get a single song by ID (if needed)
     */
    getSong: async (id: string): Promise<Song | null> => {
        try {
            const response = await api.get<ApiSong>(`/songs/${id}`);
            return mapApiSongToPlayerSong(response.data);
        } catch {
            return null;
        }
    }
};
