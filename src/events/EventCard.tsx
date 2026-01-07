import React, { useState } from 'react';
import { type Event } from '../services/eventService';
import { Link } from 'react-router-dom';
import { Edit2, Check, X, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';

interface EventCardProps {
    event?: Event; // Undefined if new
    isNew?: boolean;
    isEditing: boolean;
    onEditStart: () => void;
    onEditCancel: () => void;
    onSave: (name: string, desc: string) => Promise<void>;
}

export const EventCard: React.FC<EventCardProps> = ({
    event,
    isNew,
    isEditing,
    onEditStart,
    onEditCancel,
    onSave
}) => {
    const [name, setName] = useState(event?.name || '');
    const [desc, setDesc] = useState(event?.description || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        await onSave(name, desc);
        setSaving(false);
    };

    if (isEditing) {
        return (
            <div className="card" style={{ border: '2px solid var(--primary)' }}>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-primary" style={{ color: 'var(--primary)' }}>
                            {isNew ? 'New Event' : 'Editing Event'}
                        </span>
                    </div>

                    <div>
                        <input
                            className="input"
                            placeholder="Event Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <textarea
                            className="input"
                            placeholder="Description"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="flex gap-2 justify-end mt-2">
                        <button
                            className="btn btn-outline"
                            onClick={onEditCancel}
                            disabled={saving}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            <X size={14} className="mr-1" />
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            <Check size={14} className="mr-1" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) return null; // Should not happen if not isEditing and not event

    return (
        <div className="card relative group" style={{ transition: 'all 0.2s' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                    <CalendarIcon size={16} />
                    {new Date(event.date).toLocaleDateString()}
                </div>

                {/* Low opacity edit button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditStart();
                    }}
                    className="btn btn-outline opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        border: 'none',
                        background: 'rgba(0,0,0,0.05)'
                    }}
                    title="Edit"
                >
                    <Edit2 size={12} />
                </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{event.name}</h3>
            <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {event.description || 'No description provided.'}
            </p>

            <Link
                to={`/events/${event.id}`}
                className="flex items-center text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
            >
                Manage Dashboard <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
            </Link>
        </div>
    );
};
