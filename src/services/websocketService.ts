export interface Photo {
    id: string;
    url: string;
    author: string;
    timestamp: string;
    isBoosted: boolean;
}

type Listener = (photo: Photo) => void;

import { photoService } from './photoService';
import { eventService } from './eventService';

class MockWebSocketService {
    private listeners: Map<string, Listener[]> = new Map();
    private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

    connect(eventId: string, onPhotoReceived: Listener) {
        if (!this.listeners.has(eventId)) {
            this.listeners.set(eventId, []);
        }
        this.listeners.get(eventId)?.push(onPhotoReceived);

        // Start simulating traffic if not already
        if (!this.intervals.has(eventId)) {
            console.log(`[WS] Connected to event ${eventId}`);

            // Simulate incoming photos
            const interval = setInterval(() => {
                this.emitRandomPhoto(eventId);
            }, 4000); // New photo every 4 seconds

            this.intervals.set(eventId, interval);
        }
    }

    disconnect(eventId: string, listener: Listener) {
        const list = this.listeners.get(eventId);
        if (list) {
            this.listeners.set(eventId, list.filter(l => l !== listener));
        }

        // If no listeners, stop simulation
        if (this.listeners.get(eventId)?.length === 0) {
            const interval = this.intervals.get(eventId);
            if (interval) clearInterval(interval);
            this.intervals.delete(eventId);
            console.log(`[WS] Disconnected from event ${eventId}`);
        }
    }

    private async emitRandomPhoto(eventId: string) {
        // Check if event is active
        const event = await eventService.getEventById(eventId);
        if (!event || event.status !== 'active') return;

        const isBoosted = Math.random() > 0.7; // 30% chance of boosted
        const id = Math.random().toString(36).substr(2, 9);

        // Use picsum for random diverse photos
        const url = `https://picsum.photos/seed/${id}/600/800`;

        const photo: Photo = {
            id,
            url,
            author: 'Guest User',
            timestamp: new Date().toISOString(),
            isBoosted,
        };

        // Persist photo
        photoService.addPhoto(eventId, photo);

        console.log(`[WS] New photo for ${eventId}:`, photo.id, isBoosted ? '(BOOSTED)' : '');

        this.listeners.get(eventId)?.forEach(fn => fn(photo));
    }
}

export const webSocketService = new MockWebSocketService();
