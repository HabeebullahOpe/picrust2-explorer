# PICRUSt2 Pathway Explorer

A lightweight, full-stack web application for visualizing PICRUSt2 predicted pathway abundances. Upload your `path_abun_unstrat.tsv` output and immediately get interactive plots, group comparisons, and exportable figures.

<img width="1917" height="910" alt="image" src="https://github.com/user-attachments/assets/f79d0b2a-f498-46e9-842d-413ec7463647" />

## The Problem
Microbiome researchers routinely use PICRUSt2 to predict functional pathways from 16S rRNA data. However, exploring the output table usually requires writing ad-hoc pandas scripts or struggling with clunky GUI tools. 

## The Solution
This tool provides a modern, dark-themed web interface to:
- Instantly upload and parse PICRUSt2 TSV files.
- Visualize the top 20 pathways by mean abundance.
- Automatically detect experimental groups (e.g., `Control_1`, `Treatment_1`) and calculate group means with standard deviation error bars.
- Toggle between individual sample abundances and grouped comparisons.
- Export publication-ready PNG charts with one click.
- Fully responsive UI that works beautifully on mobile phones and tablets.

## Tech Stack
- **Frontend:** React (Vite), Plotly.js, Space Grotesk (UI/UX styling)
- **Backend:** FastAPI, Pandas, Python Multipart

## How to run locally
1. Clone the repo: `git clone https://github.com/YOUR_USERNAME/picrust2-explorer.git`
2. **Backend:** 
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn main:app --reload
