// Templates predefinidos para el editor Canva
import type { Template } from '../types/canva';

export const PREDEFINED_TEMPLATES: Template[] = [
    // === SOCIAL MEDIA ===
    {
        id: 'instagram-post',
        name: 'Instagram Post',
        description: '1080 x 1080 px - Perfecto para feed de Instagram',
        category: 'social',
        width: 1080,
        height: 1080,
        thumbnail: '📷',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: '#f8fafc',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'instagram-story',
        name: 'Instagram Story',
        description: '1080 x 1920 px - Vertical para stories',
        category: 'social',
        width: 1080,
        height: 1920,
        thumbnail: '📱',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                fill: '#f8fafc',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'facebook-post',
        name: 'Facebook Post',
        description: '1200 x 630 px - Ideal para posts de Facebook',
        category: 'social',
        width: 1200,
        height: 630,
        thumbnail: '👍',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1200,
                height: 630,
                fill: '#f8fafc',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'twitter-post',
        name: 'Twitter/X Post',
        description: '1200 x 675 px - Para tweets con imagen',
        category: 'social',
        width: 1200,
        height: 675,
        thumbnail: '🐦',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1200,
                height: 675,
                fill: '#f8fafc',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'linkedin-post',
        name: 'LinkedIn Post',
        description: '1200 x 627 px - Profesional para LinkedIn',
        category: 'social',
        width: 1200,
        height: 627,
        thumbnail: '💼',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1200,
                height: 627,
                fill: '#f8fafc',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        description: '1280 x 720 px - Miniatura de video',
        category: 'social',
        width: 1280,
        height: 720,
        thumbnail: '▶️',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1280,
                height: 720,
                fill: '#f8fafc',
                stroke: 'transparent'
            }
        ]
    },

    // === PRESENTATIONS ===
    {
        id: 'presentation-16-9',
        name: 'Presentation 16:9',
        description: '1920 x 1080 px - Estándar de presentaciones',
        category: 'presentation',
        width: 1920,
        height: 1080,
        thumbnail: '📊',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1920,
                height: 1080,
                fill: '#ffffff',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'presentation-4-3',
        name: 'Presentation 4:3',
        description: '1024 x 768 px - Formato clásico de presentaciones',
        category: 'presentation',
        width: 1024,
        height: 768,
        thumbnail: '📽️',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1024,
                height: 768,
                fill: '#ffffff',
                stroke: 'transparent'
            }
        ]
    },

    // === PRINT ===
    {
        id: 'a4-portrait',
        name: 'A4 Portrait',
        description: '2480 x 3508 px - Documento A4 vertical',
        category: 'print',
        width: 2480,
        height: 3508,
        thumbnail: '📄',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 2480,
                height: 3508,
                fill: '#ffffff',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'a4-landscape',
        name: 'A4 Landscape',
        description: '3508 x 2480 px - Documento A4 horizontal',
        category: 'print',
        width: 3508,
        height: 2480,
        thumbnail: '📃',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 3508,
                height: 2480,
                fill: '#ffffff',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'business-card',
        name: 'Business Card',
        description: '1050 x 600 px - Tarjeta de presentación',
        category: 'print',
        width: 1050,
        height: 600,
        thumbnail: '🃏',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1050,
                height: 600,
                fill: '#ffffff',
                stroke: '#e2e8f0',
                strokeWidth: 2
            }
        ]
    },
    {
        id: 'flyer',
        name: 'Flyer',
        description: '2550 x 3300 px - Tamaño carta (8.5 x 11 in)',
        category: 'print',
        width: 2550,
        height: 3300,
        thumbnail: '📰',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 2550,
                height: 3300,
                fill: '#ffffff',
                stroke: 'transparent'
            }
        ]
    },

    // === CUSTOM DESIGNS ===
    {
        id: 'instagram-carousel',
        name: 'Instagram Carousel',
        description: '1080 x 1080 px con guías para carrusel',
        category: 'social',
        width: 1080,
        height: 1080,
        thumbnail: '🔄',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: '#f8fafc',
                stroke: 'transparent'
            },
            {
                type: 'rect',
                left: 540,
                top: 0,
                width: 2,
                height: 1080,
                fill: '#e2e8f0',
                stroke: 'transparent'
            },
            {
                type: 'rect',
                left: 1080 / 3,
                top: 0,
                width: 1,
                height: 1080,
                fill: '#cbd5e1',
                stroke: 'transparent'
            },
            {
                type: 'rect',
                left: (1080 / 3) * 2,
                top: 0,
                width: 1,
                height: 1080,
                fill: '#cbd5e1',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'quote-post',
        name: 'Quote Post',
        description: '1080 x 1080 px con área para citas',
        category: 'social',
        width: 1080,
        height: 1080,
        thumbnail: '💬',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1080,
                fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                stroke: 'transparent'
            },
            {
                type: 'text',
                left: 100,
                top: 300,
                text: '"Tu cita aquí"',
                fontSize: 64,
                fill: '#ffffff',
                fontFamily: 'Georgia'
            },
            {
                type: 'rect',
                left: 100,
                top: 700,
                width: 880,
                height: 4,
                fill: '#ffffff',
                stroke: 'transparent'
            }
        ]
    },
    {
        id: 'announcement-banner',
        name: 'Announcement Banner',
        description: '1920 x 400 px - Banner para anuncios',
        category: 'custom',
        width: 1920,
        height: 400,
        thumbnail: '📢',
        objects: [
            {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1920,
                height: 400,
                fill: '#0f172a',
                stroke: 'transparent'
            },
            {
                type: 'rect',
                left: 50,
                top: 50,
                width: 1820,
                height: 2,
                fill: '#38bdf8',
                stroke: 'transparent'
            },
            {
                type: 'rect',
                left: 50,
                top: 348,
                width: 1820,
                height: 2,
                fill: '#38bdf8',
                stroke: 'transparent'
            },
            {
                type: 'text',
                left: 960,
                top: 180,
                text: 'ANUNCIO IMPORTANTE',
                fontSize: 72,
                fill: '#38bdf8',
                fontFamily: 'Arial Black'
            }
        ]
    }
];

export const TEMPLATE_CATEGORIES: { value: string; label: string; icon: string }[] = [
    { value: 'all', label: 'All Templates', icon: '📋' },
    { value: 'social', label: 'Social Media', icon: '📱' },
    { value: 'presentation', label: 'Presentations', icon: '📊' },
    { value: 'print', label: 'Print', icon: '🖨️' },
    { value: 'custom', label: 'Custom', icon: '✨' }
];
