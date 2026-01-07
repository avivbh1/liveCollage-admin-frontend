import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { webSocketService, type Photo } from '../services/websocketService';
import { eventService, type Event } from '../services/eventService';
import { QRCodeCanvas } from 'qrcode.react';

interface DisplayPhoto extends Photo {
    style: React.CSSProperties;
}

export const LiveWallPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
    const [boostedPhoto, setBoostedPhoto] = useState<Photo | null>(null);

    // Track timers to clear boosted photo
    const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!eventId) return;

        eventService.getEventById(eventId).then(e => setEvent(e || null));
        document.body.classList.add('live-wall-body');

        const handlePhoto = (photo: Photo) => {
            setPhotos(prev => {
                // 1. Appending mode: Newest is last.
                // Retention: Keep last 25 (so slice from end if > 25)
                let currentPhotos = prev;
                if (currentPhotos.length >= 25) {
                    currentPhotos = currentPhotos.slice(1); // Remove first (oldest)
                }

                // 2. Smart Spawning (Collision Avoidance)
                let randomX = 50, randomY = 50;
                let attempts = 0;
                // Check against last 3 photos (which are at the end of the array)
                const recentPhotos = currentPhotos.slice(-3);

                while (attempts < 10) {
                    randomY = 20 + Math.random() * 60; // 20-80%
                    randomX = 15 + Math.random() * 70; // 15-85%

                    let tooClose = false;
                    for (const p of recentPhotos) {
                        const styleLeft = p.style.left as string;
                        const styleTop = p.style.top as string;
                        const px = parseFloat(styleLeft);
                        const py = parseFloat(styleTop);

                        const dist = Math.sqrt(Math.pow(px - randomX, 2) + Math.pow(py - randomY, 2));
                        if (dist < 15) {
                            tooClose = true;
                            break;
                        }
                    }

                    if (!tooClose) break;
                    attempts++;
                }

                const rotation = Math.random() * 30 - 15;
                const scale = 0.8 + Math.random() * 0.4;

                // Z-index based on count to ensure stacking order
                const zIndex = 100 + prev.length;

                const newPhoto: DisplayPhoto = {
                    ...photo,
                    style: {
                        borderRadius: '100px',
                        position: 'absolute',
                        left: `${randomX}%`,
                        top: `${randomY}%`,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                        zIndex,
                        maxWidth: '25vw',
                        maxHeight: '35vh',
                    }
                };

                return [...currentPhotos, newPhoto];
            });

            if (photo.isBoosted) {
                setBoostedPhoto(photo);
                if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
                boostTimerRef.current = setTimeout(() => {
                    setBoostedPhoto(null);
                }, 4000);
            }
        };

        webSocketService.connect(eventId, handlePhoto);

        return () => {
            webSocketService.disconnect(eventId, handlePhoto);
            document.body.classList.remove('live-wall-body');
            if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
        };
    }, [eventId]);

    return (
        <div className="relative min-h-screen p-4 overflow-hidden" style={{ background: 'var(--wall-bg)' }}>

            {/* Header with QR Code */}
            {event && (
                <div
                    className="absolute top-0 left-0 right-0 z-40 flex items-start justify-between p-6 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
                >
                    <div className="text-white">
                        <h1 style={{ fontWeight: 800, fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{event.name}</h1>
                    </div>
                    <div className="flex flex-col items-center bg-white p-2 rounded-xl shadow-lg pointer-events-auto">
                        <QRCodeCanvas value={event.publicUrl} size={100} />
                        <div className="text-xs font-bold mt-1 text-black">Scan to Upload</div>
                    </div>
                </div>
            )}

            {/* Scatter Layout */}
            <div className="absolute inset-0 z-0">
                {photos.map((photo, index) => {
                    // Visual Aging Logic
                    // Newest is at index = photos.length - 1
                    // Age 0 = newest. Age 1 = second newest.
                    const age = (photos.length - 1) - index;

                    // Darken starts from 7th photo backwards (age >= 7)
                    // If age < 7: brightness 1
                    // If age >= 7: brightness decreases
                    // Max retention is 25, so max age is 24.
                    // Range 7 to 24 (17 steps).
                    // Let's drop brightness from 1.0 down to ~0.3
                    let brightness = 1;
                    if (age >= 7) {
                        // (age - 6) goes from 1 to 18
                        // 1 - (1 * 0.04) = 0.96
                        // 1 - (18 * 0.04) = 0.28
                        brightness = Math.max(0.3, 1 - (age - 6) * 0.2);
                    }

                    return (
                        <div
                            key={photo.id}
                            className="transition-all duration-500 absolute"
                            style={{
                                ...photo.style,
                                filter: `brightness(${brightness})`,
                                transition: 'filter 1s ease-in-out' // Smooth transition for darkness
                            }}
                        >
                            <div
                                className="rounded-2xl shadow-xl overflow-hidden border-4 border-white"
                                style={{
                                    // Last item (element at photos.length - 1) is new
                                    animation: index === photos.length - 1
                                        ? 'fameEntry 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                                        : 'idle 1s forwards',
                                    width: '100%',
                                    height: '100%'
                                }}
                            >
                                <img
                                    src={photo.url}
                                    alt="Live"
                                    style={{ display: 'block', width: 'auto', height: 'auto', maxWidth: '25vw', maxHeight: '35vh', objectFit: 'cover' }}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Boosted Overlay */}
            {boostedPhoto && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                        background: 'rgba(0,0,0,0.85)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backdropFilter: 'blur(10px) grayscale(0.5)',
                        zIndex: 2147483647,
                        animation: 'fadeIn 0.3s ease-out',
                    }}
                >
                    <div
                        style={{
                            maxWidth: '90vh',
                            maxHeight: '90vh',
                            aspectRatio: '3/4',
                            position: 'relative',
                            animation: 'popInBig 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        <img
                            src={boostedPhoto.url}
                            alt="Boosted"
                            className="rounded-2xl shadow-2xl"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '-4rem',
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            color: 'white',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                        }}>
                            🔥 {boostedPhoto.author} Boosted!
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {photos.length === 0 && (
                <div className="flex items-center justify-center h-screen text-white opacity-50 z-0">
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Waiting for photos...</h2>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fameEntry {
                    0% { transform: scale(0); box-shadow: 0 0 0 rgba(255,255,255,0); }
                    20% { transform: scale(1.3); box-shadow: 0 10px 50px rgba(0,0,0,0.8); z-index: 9999; }
                    80% { transform: scale(1.3); box-shadow: 0 10px 50px rgba(0,0,0,0.8); z-index: 9999; }
                    100% { transform: scale(1); box-shadow: none; /* z-index reverts to style */ }
                }
                @keyframes popInBig {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
