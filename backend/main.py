# backend/main.py
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PICRUSt2 Explorer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_pathway_table(file: UploadFile = File(...)):
    if not file.filename.endswith((".tsv", ".csv", ".txt")):
        raise HTTPException(400, "Upload a TSV or CSV file")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content), sep="\t", index_col=0)
    except Exception as e:
        raise HTTPException(400, f"Could not parse file: {e}")

    if df.empty:
        raise HTTPException(400, "File contains no data rows")

    # --- NEW VALIDATION LOGIC ---
    # Check if at least one of the first 5 index names contains "PWY"
    first_few_rows = [str(idx) for idx in df.index[:5]]
    if not any("PWY" in row for row in first_few_rows):
        raise HTTPException(
            400, 
            "This does not look like a PICRUSt2 pathway file. Expected pathway IDs (e.g., 'PWY-1234') in the first column."
        )
    # ----------------------------

    return {
        "pathways": df.index.tolist(),
        "samples": df.columns.tolist(),
        "abundances": df.values.tolist(),
    }