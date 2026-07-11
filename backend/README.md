# Backend API Documentation

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crm_extractor
GOOGLE_API_KEY=your_google_api_key
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### POST /api/import
Import CSV and extract CRM fields

Request:
```json
{
  "csvData": [
    {"email": "john@example.com", "name": "John Doe", "phone": "9876543210"}
  ],
  "fileName": "leads.csv"
}
```

Response:
```json
{
  "success": true,
  "total": 1,
  "imported": 1,
  "skipped": 0,
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

### GET /api/health
Health check endpoint
