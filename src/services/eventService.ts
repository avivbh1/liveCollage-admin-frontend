import { v4 as uuidv4 } from 'uuid';

export interface Event {
    id: string;
    name: string;
    description?: string;
    date: string;
    publicUrl: string; // The Guest App URL
    status?: 'draft' | 'active';
}

// Initial mock data
const MOCK_EVENTS: Event[] = [
    {
        id: 'evt_1',
        name: 'Tech Conference 2026',
        description: 'Annual developer meetup',
        date: new Date().toISOString(),
        publicUrl: 'https://guest-app.example.com/evt_1',
        status: 'draft'
    },
    {
        id: 'evt_2',
        name: 'Summer Wedding',
        description: 'Celebrating love',
        date: new Date(Date.now() - 86400000).toISOString(),
        publicUrl: 'https://guest-app.example.com/evt_2',
        status: 'draft'
    },
];

export const eventService = {
    getEvents: async (): Promise<Event[]> => {
        await new Promise(r => setTimeout(r, 500));
        const stored = localStorage.getItem('lc_events');
        if (stored) return JSON.parse(stored);

        // Initialize if empty
        localStorage.setItem('lc_events', JSON.stringify(MOCK_EVENTS));
        return MOCK_EVENTS;
    },

    getEventById: async (id: string): Promise<Event | undefined> => {
        await new Promise(r => setTimeout(r, 300));
        const events = await eventService.getEvents();
        return events.find(e => e.id === id);
    },

    createEvent: async (name: string, description?: string): Promise<Event> => {
        await new Promise(r => setTimeout(r, 600));
        const events = await eventService.getEvents();

        const newEvent: Event = {
            id: uuidv4(),
            name,
            description,
            date: new Date().toISOString(),
            publicUrl: `https://guest-app.example.com/${uuidv4()}`,
            status: 'draft'
        };

        const updated = [newEvent, ...events];
        localStorage.setItem('lc_events', JSON.stringify(updated));
        return newEvent;
    },

    updateEvent: async (id: string, name: string, description?: string): Promise<Event | null> => {
        await new Promise(r => setTimeout(r, 400));
        const events = await eventService.getEvents();
        const index = events.findIndex(e => e.id === id);
        if (index === -1) return null;

        const updatedEvent = { ...events[index], name, description };
        events[index] = updatedEvent;
        localStorage.setItem('lc_events', JSON.stringify(events));
        return updatedEvent;
    },

    updateEventStatus: async (id: string, status: 'draft' | 'active'): Promise<Event | null> => {
        await new Promise(r => setTimeout(r, 400));
        const events = await eventService.getEvents();
        const index = events.findIndex(e => e.id === id);
        if (index === -1) return null;

        const updatedEvent = { ...events[index], status };
        events[index] = updatedEvent;
        localStorage.setItem('lc_events', JSON.stringify(events));
        return updatedEvent;
    }
};
