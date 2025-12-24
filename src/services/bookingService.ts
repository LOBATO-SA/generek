import { api } from '../lib/api';
import type { Booking, CreateBookingDTO } from '../types';

export const bookingService = {
    // Create a new booking
    createBooking: async (data: CreateBookingDTO): Promise<Booking> => {
        const response = await api.post<any>('/bookings', data);
        return mapBooking(response.data);
    },

    // Get a single booking
    getBooking: async (id: string): Promise<Booking> => {
        const response = await api.get<any>(`/bookings/${id}`);
        return mapBooking(response.data);
    },

    // List bookings for the current user (Artist or Listener)
    getMyBookings: async (_role: 'artist' | 'listener' = 'listener'): Promise<Booking[]> => {
        const response = await api.get<any[]>('/bookings');
        return response.data.map(mapBooking);
    },

    // Artist accepts a booking
    acceptBooking: async (id: string): Promise<Booking> => {
        const response = await api.post<any>(`/bookings/${id}/accept`);
        return mapBooking(response.data);
    },

    // Artist rejects a booking
    rejectBooking: async (id: string): Promise<Booking> => {
        const response = await api.post<any>(`/bookings/${id}/reject`);
        return mapBooking(response.data);
    },

    // Listener pays for booking
    payBooking: async (id: string): Promise<Booking> => {
        const response = await api.patch<any>(`/bookings/${id}/pay`);
        return mapBooking(response.data);
    },

    // Both confirm final execution
    confirmFinal: async (id: string): Promise<Booking> => {
        const response = await api.patch<any>(`/bookings/${id}/final-confirm`);
        return mapBooking(response.data);
    },

    // Cancel booking
    cancelBooking: async (id: string, reason?: string): Promise<Booking> => {
        const response = await api.patch<any>(`/bookings/${id}/cancel`, { reason });
        return mapBooking(response.data);
    }
};

// Helper to map backend format (mixed/camelCase + nested objects) to Frontend Booking Interface (snake_case)
function mapBooking(b: any): Booking {
    const artistMeta = b.artistId?.user_metadata || {};
    // const listenerMeta = b.listenerId?.user_metadata || {};

    return {
        id: b.id || b._id,
        artist_id: b.artistId?._id || (typeof b.artistId === 'string' ? b.artistId : ''),
        artist_name: artistMeta.full_name || 'Desconhecido',
        // Check for avatar in artistId (populated object) or top-level or meta (fallback)
        artist_avatar: b.artistId?.avatar_url || b.artist_avatar || artistMeta.avatar_url || '',

        listener_id: b.listenerId?._id || (typeof b.listenerId === 'string' ? b.listenerId : ''),
        listener_name: b.listenerId?.user_metadata?.full_name || 'Desconhecido',
        listener_avatar: b.listenerId?.avatar_url || b.listenerId?.user_metadata?.avatar_url || '',

        event_type: b.eventType || b.event_type,
        event_date: b.eventDate || b.event_date,
        event_time: b.eventTime || b.event_time,
        duration_hours: b.duration || b.duration_hours,
        location: b.location,
        notes: b.notes,

        status: b.status,
        total_price: b.totalPrice || b.total_price || 0,
        created_at: b.created_at,

        listener_confirmed: b.listenerConfirmed || b.listener_confirmed,
        artist_confirmed: b.artistConfirmed || b.artist_confirmed,
        payment_done: b.paymentDone || b.payment_done,
        listener_final_confirmed: b.listenerFinalConfirmed || b.listener_final_confirmed,
        artist_final_confirmed: b.artistFinalConfirmed || b.artist_final_confirmed
    };
}
