import React from 'react';
import { Hammer, Ruler, DoorOpen, Home, Layers, Sparkles } from 'lucide-react';
import { Service, Project, Testimonial } from './types';

export const SERVICES: Service[] = [
  {
    id: 'fitted-furniture',
    title: 'Bespoke fitted furniture',
    description: 'Custom wardrobes, alcoves, and media walls made-to-measure for your home.',
    icon: <Layers />
  },
  {
    id: 'kitchens',
    title: 'Kitchen & Interior Joinery',
    description: 'Bespoke kitchen and interior joinery, precisely built and professionally installed.',
    icon: <Home />
  },
  {
    id: 'flooring',
    title: 'Engineered & Solid wood flooring',
    description: 'Expertly installed flooring with clean detailing and a durable finish.',
    icon: <Ruler />
  },
  {
    id: 'finish',
    title: 'Finish carpentry',
    description: 'Skirting, architraves, doors, and fine detailing that complete your interior.',
    icon: <Sparkles />
  },
  {
    id: 'joinery',
    title: 'Feature joinery',
    description: 'Statement joinery pieces designed to add character and definition to your space.',
    icon: <Hammer />
  },
  {
    id: 'storage',
    title: 'Custom Storage',
    description: 'Tailored storage solutions designed to fit your space and lifestyle.',
    icon: <DoorOpen />
  }
];

export const PROJECTS: Project[] = [
  {
   id: 1,
    title: 'Alcove Shelving with LED Lighting — Islington',
    category: 'Alcove Units & Media Walls',
    imageUrl: '/images/portfolio/bespoke-alcove-shelving-with-led-lighting-london.jpg',
    alt: 'Bespoke alcove shelving with LED lighting and fitted joinery in Camden, London'
  },
  {
    id: 2,
    title: 'Media Wall with LED Lighting — Fulham',
    category: 'Alcove Units & Media Walls',
    imageUrl: '/images/portfolio/bespoke-media-wall-led-lighting.jpg',
    alt: 'Bespoke media wall with LED lighting and built-in cabinetry in Fulham, London'
  },
  {
    id: 3,
    title: 'Media Wall with LED Lighting & Alcove Units — Regent’s Park',
    category: 'Alcove Units & Media Walls',
    imageUrl: '/images/portfolio/bespoke-media-wall-with-alcove-shelving-led-lighting-london.jpg',
    alt: 'Custom media wall with alcove shelving and LED lighting in Regent’s Park, London'
  },
  {
    id: 4,
    title: 'Alcove Units — Hackney',
    category: 'Alcove Units & Media Walls',
    imageUrl: '/images/portfolio/alcove-units-media-wall-hackney-london.jpg',
    alt: 'Bespoke alcove units and media wall with built-in shelving in Hackney, London'
  },
  {
    id: 5,
    title: 'Window Seat with Alcove Shelving — Belsize Park',
    category: 'Living Room Joinery',
    imageUrl: '/images/portfolio/bespoke-alcove-shelving-window-seat-london.jpg',
    alt: 'Built-in alcove shelving with window storage and fitted joinery in Belsize Park, London'
  },
  {
    id: 6,
    title: 'Built-In Bookcase & Cupboards — Fulham',
    category: 'Living Room Joinery',
    imageUrl: '/images/portfolio/bespoke-built-in-bookcase-shelving-with-cupboards-london.jpg',
    alt: 'Bespoke built-in bookcase with cupboards and shelving in Fulham, London'
  },
  {
    id: 7,
    title: 'Built-In Wardrobe with LED Lighting — Hammersmith',
    category: 'Fitted Wardrobes & Storage',
    imageUrl: '/images/portfolio/bespoke-built-in-wardrobe-with-led-lighting.jpg',
    alt: 'Bespoke built-in wardrobe with LED lighting and fitted storage in Hammersmith, London'
  },
  {
    id: 8,
    title: 'Fitted Wardrobe with Desk & Shelving — Primrose Hill',
    category: 'Fitted Wardrobes & Storage',
    imageUrl: '/images/portfolio/bespoke-built-in-wardrobe-desk-shelving-london.jpg',
    alt: 'Custom fitted wardrobe with integrated desk and shelving in Primrose Hill, London'
  },
  {
    id: 9,
    title: 'Walk-In Wardrobe with Integrated LED Lighting — King’s Cross',
    category: 'Fitted Wardrobes & Storage',
    imageUrl: '/images/portfolio/bespoke-walk-in-wardrobe-built-in-shelving-led-lighting-london.jpg',
    alt: 'Bespoke walk-in wardrobe with shelving and LED lighting in King’s Cross, London'
  },
  {
    id: 10,
    title: 'Drying Room Storage Units — Holborn',
    category: 'Bespoke Storage Solutions',
    imageUrl: '/images/portfolio/bespoke-drying-room-storage-holborn-london.jpg',
    alt: 'Bespoke drying room storage with built-in joinery in Holborn, London'
  },
  {
    id: 11,
    title: 'Modern Handleless Kitchen — Hackney',
    category: 'Kitchens',
    imageUrl: '/images/portfolio/modern-handleless-kitchen-hackney-london.jpg',
    alt: 'Modern handleless kitchen installation with bespoke joinery in Hackney, London'
  },
  {
    id: 12,
    title: 'Internal Patio Doors Installation — Kensington',
    category: 'Doors & Finish Carpentry',
    imageUrl: '/images/portfolio/patio-doors-internal.jpg',
    alt: 'Internal patio doors installation and finish carpentry in Kensington, London'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Raimondas G',
    role: 'Fitted Wardrobe & Shelving',
    content: 'Kas and Uwe paid great attention to detail. The wardrobe looks fantastic and feels solid and well built.',
    rating: 5
  },
  {
    id: 2,
    name: 'Julia Himmrich',
    role: 'Living Room Transformation',
    content: 'Everything was coordinated perfectly and delivered on time. We are very happy with the result.',
    rating: 5
  },
  {
    id: 3,
    name: 'Andrejs Andzans',
    role: 'Custom Wardrobe Installation',
    content: 'Excellent finish and craftsmanship. They made sure everything was perfect. Highly recommended.',
    rating: 5
  },
  {
    id: 4,
    name: 'Barber Skenda',
    role: 'Doors & Herringbone Flooring',
    content: 'Doors and flooring were installed beautifully. Professional finish and great workmanship.',
    rating: 5
  }
];