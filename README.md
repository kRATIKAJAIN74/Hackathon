# Foodoscope — Recipe + Flavor Intelligence Engine

Backend (FastAPI) and frontend (React) demo.

Backend quick run:

1. Create a Python venv and install requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```


2. Start MongoDB locally or set `MONGODB_URI` env var.

3. Run the backend (Flask):

```powershell
cd backend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

The API will be available at `http://localhost:8000` and docs are not auto-generated like FastAPI, but you can visit endpoints directly.

4. Seed data (example):

GET http://localhost:8000/seed?page=1&limit=20

Frontend quick run:

cd frontend
npm install
npm start
