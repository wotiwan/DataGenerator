from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import json
import os
from DataGenerator import *

app = FastAPI()

app.mount("/static", StaticFiles(directory="front"), name="static")


# Роут главной страницы с генератором (index.html лежит в front)
@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("front/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/generate")
async def upload_json(request: Request):
    data = await request.json()
    filename = data["table_name"]
    rows_count = data["n_rows"]

    generator = DataGenerator(data, rows_count)
    filepath = generator.generate()
    return FileResponse(filepath, media_type='text/csv', filename=f'{filename}.csv')



