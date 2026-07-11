# CRM Extractor - AI-Powered CSV Importer

## link: https://crm-extractor-jet.vercel.app/

An intelligent CSV importer that uses Google Gemini AI to extract and map CRM lead information from any CSV format.

## 🎯 Features

- ✅ **Drag & Drop Upload** - Easy CSV file upload
- ✅ **Smart CSV Preview** - View data with sticky headers and horizontal/vertical scrolling
- ✅ **AI-Powered Extraction** - Intelligent field mapping using Google Gemini
- ✅ **Batch Processing** - Process large files efficiently
- ✅ **Retry Mechanism** - Automatic retry for failed batches
- ✅ **Dark Mode** - Beautiful dark theme support
- ✅ **Responsive Design** - Works on all devices
- ✅ **Real-time Progress** - Visual feedback during processing
- ✅ **Error Handling** - Comprehensive error messages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Docker)
- Google Gemini API key

### Local Development

1. **Clone and setup**
```bash
cd CRM_Extractor
cp .env.example .env
```

2. **Update .env with your Google API key**
```bash
GOOGLE_API_KEY=your_key_here
```

3. **Option A: Using Docker Compose (Recommended)**
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

4. **Option B: Manual Setup**

**Backend:**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📊 Supported CSV Formats

- Facebook Lead Exports
- Google Ads Exports
- Excel Sheets (exported as CSV)
- Real Estate CRM Exports
- Sales Reports
- Marketing Agency CSVs
- Manually created Spreadsheets
- Any CSV with email/phone columns

## 🤖 AI Extraction Rules

### CRM Status Values (Must be one of):
- `GOOD_LEAD_FOLLOW_UP`
- `DID_NOT_CONNECT`
- `BAD_LEAD`
- `SALE_DONE`

### Data Source Values (Must be one of):
- `leads_on_demand`
- `meridian_tower`
- `eden_park`
- `varah_swamy`
- `sarjapur_plots`

### Extraction Rules:
- Records without email AND phone are skipped
- Multiple emails: first in email field, rest in crm_note
- Multiple phones: first in mobile field, rest in crm_note
- Dates converted to ISO format
- CSV compatibility: single row per record with proper escaping

## 📦 CRM Fields

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | DateTime | Lead creation date |
| `name` | String | Lead name |
| `email` | String | Primary email address |
| `country_code` | String | Country code (e.g., +91) |
| `mobile_without_country_code` | String | Phone number |
| `company` | String | Company name |
| `city` | String | City |
| `state` | String | State/Province |
| `country` | String | Country |
| `lead_owner` | String | Sales rep or owner |
| `crm_status` | String | Lead status |
| `crm_note` | String | Remarks and notes |
| `data_source` | String | Import source |
| `possession_time` | String | Property timeline |
| `description` | String | Additional info |

## 🏗️ Architecture

### Frontend (Next.js)
- Modern React components
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- PapaParse for CSV parsing
- React Hot Toast for notifications

### Backend (Express.js)
- RESTful API design
- Google Gemini AI integration
- Batch processing with retries
- CORS enabled
- Error handling middleware

### Database (MongoDB - Optional)
- Import history tracking
- Stateless by default

## 🔧 API Endpoints

### POST `/api/import`
Extract and map CSV data to CRM format

**Request:**
```json
{
  "csvData": [
    {
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "9876543210"
    }
  ],
  "fileName": "leads.csv"
}
```

**Response:**
```json
{
  "success": true,
  "total": 100,
  "imported": 95,
  "skipped": 5,
  "records": [
    {
      "created_at": "2026-05-13T10:00:00Z",
      "name": "John Doe",
      "email": "john@example.com",
      "mobile_without_country_code": "9876543210",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      ...
    }
  ]
}
```

### GET `/api/health`
Health check endpoint

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy automatically on push

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Add MongoDB service
3. Set environment variables:
   - `GOOGLE_API_KEY`
   - `MONGODB_URI`
   - `CORS_ORIGIN`
4. Deploy automatically on push

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:coverage

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```