# CRM Extractor - Complete Setup Guide
## Prerequisites

### Required
- Node.js 18 or higher
- npm or yarn package manager
- MongoDB 7.0+ (local installation or Docker)
- Google Gemini API key

### Optional
- Docker & Docker Compose (for containerized setup)
- Git
- VS Code (or any code editor)

### Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Generate a new API key
4. Copy and save it

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/CRM_Extractor.git
cd CRM_Extractor
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Update Environment Variables
Edit `.env` and add your Google API key:
```env
GOOGLE_API_KEY=your_key_here_from_google_ai_studio
```

## Local Development

### Option A: Docker Compose (Recommended for beginners)

#### Prerequisites
- Docker installed and running

#### Steps
```bash
# Build and start all services
docker-compose up

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Advantages:**
- ✅ One command setup
- ✅ All dependencies included (MongoDB)
- ✅ Isolated environment
- ✅ Consistent across machines

### Option B: Manual Setup

#### Backend Setup
```bash
cd backend
npm install

# Create .env if not exists
cp .env.example .env

# Update GOOGLE_API_KEY in .env

# Start development server (with hot reload)
npm run dev

# Backend runs on http://localhost:5000
```

#### Frontend Setup (New Terminal)
```bash
cd frontend
npm install

# Create .env.local if not exists
cp .env.example .env.local

# Start development server
npm run dev

# Frontend runs on http://localhost:3000
```

#### MongoDB Setup (New Terminal - if not using Docker)
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7
```

## Testing

### Backend Tests
```bash
cd backend

# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend

# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building for Production

### Backend Build
```bash
cd backend
npm run build
# Output in dist/ folder
npm start
```

### Frontend Build
```bash
cd frontend
npm run build
# Output in .next/ folder
npm start
```

## Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Set environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

#### Backend Deployment (Railway)
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Import GitHub repository
4. Add environment variables:
   - `GOOGLE_API_KEY`
   - `MONGODB_URI`
   - `CORS_ORIGIN`
5. Deploy

### Option 2: Docker to Any Cloud

```bash
# Build Docker image
docker build -t crm-extractor-backend backend/

# Push to Docker Hub or container registry
docker tag crm-extractor-backend yourusername/crm-extractor-backend
docker push yourusername/crm-extractor-backend

# Deploy to your cloud platform
# (AWS, GCP, Azure, Digital Ocean, etc.)
```

## API Reference

### POST /api/import
Import and extract CRM fields from CSV

**Request:**
```bash
curl -X POST http://localhost:5000/api/import \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": [
      {
        "email": "john@example.com",
        "name": "John Doe",
        "phone": "9876543210",
        "company": "ABC Corp"
      }
    ],
    "fileName": "leads.csv"
  }'
```

**Response:**
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
      "company": "ABC Corp",
      "crm_status": "GOOD_LEAD_FOLLOW_UP"
    }
  ]
}
```

### GET /api/health
Health check endpoint

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:00:00.000Z"
}
```

## Troubleshooting

### Backend Issues

#### Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

#### MongoDB connection failed
```bash
# Check MongoDB is running
docker ps | grep mongodb
# or
brew services list

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/crm_extractor
```

#### Google API key error
- Verify key in .env (no extra spaces)
- Check quota in Google Cloud Console
- Ensure API is enabled: https://console.cloud.google.com

### Frontend Issues

#### API connection error
- Ensure backend is running: `curl http://localhost:5000/api/health`
- Verify `NEXT_PUBLIC_API_URL` in .env.local
- Check browser console for CORS errors

#### CSV upload fails
- Verify file is valid CSV format
- Check file size (max 50MB)
- Ensure file has email or phone column

#### Dark mode not working
- Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check local storage

### Docker Issues

#### Container won't start
```bash
# View logs
docker logs container_name

# Rebuild image
docker-compose build --no-cache

# Remove all and restart
docker-compose down -v
docker-compose up --build
```

## Performance Tips

### Frontend Optimization
- Images are auto-optimized with Next.js
- CSS is tree-shaken via Tailwind
- Use React DevTools Profiler for bottlenecks

### Backend Optimization
- Batch size is configurable (default: 10)
- Implement caching for frequently accessed data
- Monitor MongoDB query performance

### Database Optimization
- Add indexes for frequently queried fields
- Implement data archival for old imports
- Regular backups



### Common Questions

**Q: How do I handle large CSV files (>10MB)?**
A: The system is optimized for files up to 50MB. For larger files, consider splitting into chunks.

**Q: Can I customize CRM fields?**
A: CRM fields are standard in this version. Modify `crm-rules.ts` to customize.

**Q: How do I add authentication?**
A: Implement JWT in backend controllers and add AuthContext to frontend.

**Q: Can I use a different LLM?**
A: Yes, modify `ai-extractor.ts` to use OpenAI, Claude, etc.


