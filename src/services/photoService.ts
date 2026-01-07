import { type Photo } from './websocketService';

export interface PaginatedPhotos {
    data: Photo[];
    total: number;
    page: number;
    limit: number;
}

export const photoService = {
    addPhoto: (eventId: string, photo: Photo) => {
        const key = `lc_photos_${eventId}`;
        const stored = localStorage.getItem(key);
        const photos: Photo[] = stored ? JSON.parse(stored) : [];
        const updated = [photo, ...photos];
        localStorage.setItem(key, JSON.stringify(updated));
    },

    getPhotos: async (eventId: string, page: number = 1, limit: number = 10): Promise<PaginatedPhotos> => {
        // Mock async delay
        await new Promise(r => setTimeout(r, 300));

        const key = `lc_photos_${eventId}`;
        const stored = localStorage.getItem(key);
        const photos: Photo[] = stored ? JSON.parse(stored) : [];

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const data = photos.slice(startIndex, endIndex);

        return {
            data,
            total: photos.length,
            page,
            limit
        };
    },

    // Clear photos (optional, for testing)
    clearPhotos: (eventId: string) => {
        localStorage.removeItem(`lc_photos_${eventId}`);
    }
};
