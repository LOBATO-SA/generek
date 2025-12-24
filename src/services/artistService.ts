import { api } from '../lib/api';
import type { Artist } from '../types';

interface GetArtistsParams {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
}

interface GetArtistsResponse {
    artists: Artist[];
    total: number;
}

export const artistService = {
    // Get list of artists with optional filters
    getArtists: async (params: GetArtistsParams = {}): Promise<GetArtistsResponse> => {
        const { page = 1, limit = 10, search, genre } = params;

        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
        queryParams.append('offset', ((page - 1) * limit).toString());

        if (search) queryParams.append('search', search);
        if (genre && genre !== 'Todos') queryParams.append('genre', genre);

        const response = await api.get<GetArtistsResponse>(`/artists?${queryParams.toString()}`);
        return response.data;
    },

    // Get specific artist by ID
    getArtistById: async (id: string): Promise<Artist> => {
        const response = await api.get<Artist>(`/artists/${id}`);
        return response.data;
    },

    // Update artist bio/profile (for Artist Dashboard)
    updateProfile: async (data: Partial<Artist>): Promise<Artist> => {
        const response = await api.put<Artist>('/artists/bio', data);
        return response.data;
    }
};
