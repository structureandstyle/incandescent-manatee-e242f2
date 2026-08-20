import React from 'react';

export type ViewState = 'home' | 'portfolio' | 'archive';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  alt: string; // ✅ added for SEO + accessibility
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}