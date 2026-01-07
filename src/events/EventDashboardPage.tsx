import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, type Event } from '../services/eventService';
import { photoService, type PaginatedPhotos } from '../services/photoService'; // Import photoService
import { QRCodeCanvas } from 'qrcode.react';
import { ExternalLink, Copy, MonitorPlay, ChevronLeft, Play, Square, Images } from 'lucide-react';

export const EventDashboardPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [photosData, setPhotosData] = useState<PaginatedPhotos>({ data: [], total: 0, page: 1, limit: 4 });
    const [refreshGallery, setRefreshGallery] = useState(0);
    // const [refresh, setRefreshGallery] = useState(0);

    useEffect(() => {
        if (eventId) {
            refreshEvent();
            loadGallery();
        }
    }, [eventId, refreshGallery]);

    const refreshEvent = async () => {
        if (!eventId) return;
        const e = await eventService.getEventById(eventId);
        setEvent(e || null);
        setLoading(false);
    };

    const loadGallery = async () => {
        if (!eventId) return;
        const data = await photoService.getPhotos(eventId, photosData.page, photosData.limit);
        setPhotosData(data);
    };

    const handleStatusChange = async (newStatus: 'active' | 'draft') => {
        if (!event) return;
        await eventService.updateEventStatus(event.id, newStatus);
        refreshEvent();
    };

    const handlePageChange = (newPage: number) => {
        setPhotosData(prev => ({ ...prev, page: newPage }));
        setRefreshGallery(p => p + 1);
    };

    const copyLink = () => {
        if (event?.publicUrl) {
            navigator.clipboard.writeText(event.publicUrl);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    const isActive = event.status === 'active';

    return (
        <div className="pb-20">
            <Link to="/events" className="flex items-center gap-1 text-sm text-muted mb-4" style={{ color: 'var(--admin-text-muted)' }}>
                <ChevronLeft size={16} /> Back to Events
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{event.name}</h1>
                        <span
                            className={`badge ${isActive ? 'badge-active' : 'badge-outline'}`}
                            style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: isActive ? 'var(--success)' : 'transparent',
                                color: isActive ? 'white' : 'var(--admin-text-muted)',
                                border: isActive ? 'none' : '1px solid var(--admin-border)'
                            }}
                        >
                            {event.status === 'active' ? 'LIVE' : 'DRAFT'}
                        </span>
                    </div>
                    <p style={{ color: 'var(--admin-text-muted)' }}>{new Date(event.date).toLocaleDateString()} • {event.description}</p>
                </div>

                <div className="flex gap-3">
                    {!isActive && (
                        <button
                            type="button"
                            className="btn"
                            style={{ background: 'var(--success)', color: 'white', gap: '0.5rem' }}
                            onClick={() => handleStatusChange('active')}
                        >
                            <Play size={18} /> Start Event
                        </button>
                    )}
                    {isActive && (
                        <button
                            type="button"
                            className="btn bg-destructive text-white"
                            style={{ background: 'var(--destructive)', color: 'white', gap: '0.5rem' }}
                            onClick={() => handleStatusChange('draft')}
                        >
                            <Square size={18} /> Stop Event
                        </button>
                    )}

                    <Link
                        to={`/wall/${event.id}`}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', gap: '0.5rem' }}
                    >
                        <MonitorPlay size={20} /> Launch Live Wall
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '3rem' }}>
                {/* Guest Access Card */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Guest Access</h2>
                    <div className="flex flex-col items-center p-4" style={{ background: 'var(--admin-bg)', borderRadius: 'var(--radius)' }}>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            <QRCodeCanvas value={event.publicUrl} size={180} />
                        </div>
                        <p className="text-sm text-center mb-4" style={{ color: 'var(--admin-text-muted)' }}>
                            {isActive ? 'Scan to upload photos!' : 'Start event to enable uploads'}
                        </p>

                        <div className="flex gap-2 w-full">
                            <input
                                readOnly
                                value={event.publicUrl}
                                className="input"
                                style={{ background: 'white', color: 'var(--admin-text-muted)' }}
                            />
                            <button onClick={copyLink} className="btn btn-outline" title="Copy Link">
                                <Copy size={18} />
                            </button>
                            <a href={event.publicUrl} target="_blank" rel="noreferrer" className="btn btn-outline" title="Open Link">
                                <ExternalLink size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Event Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div style={{ background: 'var(--admin-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{photosData.total}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>Photos Uploaded</div>
                        </div>
                        <div style={{ background: 'var(--admin-bg)', padding: '1.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>{isActive ? 'Active' : 'Offline'}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>Live Status</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Images size={20} className="text-primary" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Event Gallery</h2>
                    </div>
                    <button onClick={() => setRefreshGallery(p => p + 1)} className="btn btn-sm btn-outline">Refresh</button>
                </div>

                {photosData.total === 0 ? (
                    <div className="p-8 text-center text-muted" style={{ background: 'var(--admin-bg)', borderRadius: 'var(--radius)' }}>
                        No photos uploaded yet. Start the event and scan the QR code!
                    </div>
                ) : (
                    <>
                        <div className="flex gap-4 mb-4" style={{ padding: "2rem" }}>
                            {photosData.data.map(photo => (
                                <div
                                    key={photo.id}
                                    className="relative rounded-lg overflow-hidden group shadow-sm bg-gray-100"
                                    style={{
                                        maxHeight: '400px',
                                        width: '25%',
                                    }}
                                >
                                    <img
                                        style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                                        src={photo.url}
                                        alt="Gallery"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />

                                    {photo.isBoosted && (
                                        <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                                            BOOSTED
                                        </span>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                        {new Date(photo.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>

                            ))}
                        </div>

                        {/* Simple Pagination */}
                        <div className="flex justify-between items-center mt-4 border-t pt-4">
                            <span className="text-sm text-muted">
                                Showing {((photosData.page - 1) * photosData.limit) + 1} to {Math.min(photosData.page * photosData.limit, photosData.total)} of {photosData.total}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    disabled={photosData.page === 1}
                                    onClick={() => handlePageChange(photosData.page - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    disabled={photosData.page * photosData.limit >= photosData.total}
                                    onClick={() => handlePageChange(photosData.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};
