# TruthGuard AI - Complete Full-Stack Project

## Project Structure
```
truthguard-ai/
├── frontend/                 # Next.js React Frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/                  # FastAPI Main Backend
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── ...
├── ai-service/              # AI Processing Microservice
│   ├── app/
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   ├── requirements.txt
│   └── ...
├── database/                # Database scripts & migrations
│   ├── schema.sql
│   └── seed.sql
├── docs/                    # Documentation
├── .env.example
└── README.md
```

---

# README.md

## TruthGuard AI - AI-Powered Fact-Checking Platform

TruthGuard AI is a comprehensive fact-checking platform that helps users verify information using AI models, official sources, and community feedback. The platform can analyze text claims, URLs, and media files to provide detailed fact-checking reports.

### Features

- **Multi-format Input**: Submit text, URLs, or media files for fact-checking
- **AI-Powered Analysis**: Advanced AI pipeline for content extraction and verification
- **Community Discussion**: Quora-like forum for community engagement
- **RTI Request Generator**: Automated generation of Right to Information requests for government-related claims
- **User Dashboard**: Personal tracking of submitted claims and requests
- **Real-time Processing**: Asynchronous background processing with live status updates

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **pip** (Python package manager)
- **Git**

## Environment Setup

1. **Clone the repository**:
```bash
git clone 
cd truthguard-ai
```

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Configure environment variables** in `.env`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend Configuration
BACKEND_URL=http://localhost:8000
AI_SERVICE_URL=http://localhost:8001

# OpenRouter API (for AI models)
OPENROUTER_API_KEY=your_openrouter_api_key

# Security
JWT_SECRET=your_jwt_secret_key_here
```

## Database Setup (Supabase)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `database/schema.sql`

3. **Configure Row Level Security (RLS)**:
   - Enable RLS on all tables through the Supabase dashboard
   - The schema includes the necessary RLS policies

## Installation & Running

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: http://localhost:3000

### 2. Backend (FastAPI)

Open a new terminal:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at: http://localhost:8000

### 3. AI Service (FastAPI)

Open another new terminal:

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

The AI service will be available at: http://localhost:8001

## Usage

1. **Access the application** at http://localhost:3000
2. **Create an account** or sign in
3. **Submit a claim** using text, URL, or media file
4. **View the analysis** on the generated report page
5. **Participate in discussions** in the community section
6. **Generate RTI requests** for government-related claims
7. **Track your submissions** in the user dashboard

## API Documentation

- **Backend API Docs**: http://localhost:8000/docs
- **AI Service API Docs**: http://localhost:8001/docs

## Development Notes

- The AI service simulates advanced AI capabilities and can be extended with real models
- The platform uses Supabase for authentication and data storage
- All services run independently and communicate via HTTP APIs
- The frontend uses Server-Side Rendering (SSR) for better SEO and performance

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8000, and 8001 are available
2. **Environment variables**: Double-check all required variables are set in `.env`
3. **Database connection**: Verify Supabase credentials and database schema is applied
4. **Dependencies**: Make sure all requirements are installed for each service

### Getting Help

- Check the API documentation for endpoint details
- Review the browser console and server logs for error messages
- Ensure all services are running before testing functionality

## Architecture

The application follows a microservices architecture:

- **Frontend**: User interface and client-side logic
- **Backend**: Main API, authentication, and business logic
- **AI Service**: CPU-intensive AI processing tasks
- **Database**: Supabase for data persistence and auth

This separation ensures scalability and maintainability while keeping the main backend responsive.

---

## License

This project is licensed under the MIT License.
