# BlockScore Starter Backend

This is the first build package for your VS Code setup.

## Run in VS Code

Open the folder, then run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

## Test

Open:

```text
http://127.0.0.1:8000/docs
```

Try:

```text
/health
/complaints/top
/complaints/electric
/neighborhoods/report-card/10001
/noise/peak-hours/10001
/rankings/quietest
/map/pins?category=noise
```
