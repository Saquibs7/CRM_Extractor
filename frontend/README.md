# CRM Extractor Frontend

A modern, responsive web application for uploading and previewing CSV files with AI-powered field extraction.

## Features

- 📁 Drag & drop CSV upload
- 👁️ Real-time CSV preview with sticky headers
- 📊 Responsive tables with scrolling
- 🎨 Dark mode support
- ⚡ Smooth animations and transitions
- 📱 Mobile-friendly design

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- PapaParse
- React Hot Toast
- React Dropzone

## Components

- `FileUploader` - Drag & drop upload component
- `CSVPreview` - Data preview table
- `ImportResults` - Results display
- `DataTable` - Virtualized table with sticky headers
- `Header` - Navigation header with theme toggle
