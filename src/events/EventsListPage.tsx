import React, { useEffect, useState } from 'react';
import { eventService, type Event } from '../services/eventService';
import { Plus } from 'lucide-react';
import { EventCard } from './EventCard';

export const EventsListPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const loadEvents = async () => {
        const data = await eventService.getEvents();
        setEvents(data);
        setLoading(false);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleCreate = async (name: string, desc: string) => {
        await eventService.createEvent(name, desc);
        setEditingId(null);
        await loadEvents();
    };

    const handleUpdate = async (id: string, name: string, desc: string) => {
        await eventService.updateEvent(id, name, desc);
        setEditingId(null);
        await loadEvents();
    };

    if (loading) return <div>Loading events...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Your Events</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setEditingId('NEW')}
                    disabled={editingId === 'NEW'}
                    style={{ display: editingId === 'NEW' ? 'none' : 'flex' }}
                >
                    <Plus size={20} style={{ marginRight: '0.4rem' }} /> New Event
                </button>
            </div>

            <div className="grid grid-cols-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>

                {/* New Event Card */}
                {editingId === 'NEW' && (
                    <EventCard
                        isNew
                        isEditing={true}
                        onEditStart={() => { }}
                        onEditCancel={() => setEditingId(null)}
                        onSave={handleCreate}
                    />
                )}

                {/* Existing Events */}
                {events.map(evt => (
                    <EventCard
                        key={evt.id}
                        event={evt}
                        isEditing={editingId === evt.id}
                        onEditStart={() => setEditingId(evt.id)}
                        onEditCancel={() => setEditingId(null)}
                        onSave={(name, desc) => handleUpdate(evt.id, name, desc)}
                    />
                ))}

                {events.length === 0 && editingId !== 'NEW' && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)', gridColumn: '1 / -1' }}>
                        No events found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};
