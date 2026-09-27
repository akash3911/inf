from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from io import BytesIO
import cv2 as cv
import numpy as np
from PIL import Image

from scoliotect.yolov8_detector import get_yolov8_model, predict_image_to_api_format

@asynccontextmanager
async def lifespan(app: FastAPI):
    # load model once at startup
    get_yolov8_model()
    print("YOLOv8 model loaded")
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "OK"}

@app.get("/")
def root():
    return {"message": "Scoliotect API", "predict": "POST /v1/getprediction with image file"}

@app.post("/v1/getprediction")
async def get_prediction(image: UploadFile):
    pil = Image.open(BytesIO(await image.read())).convert("RGB")
    bgr = cv.cvtColor(np.array(pil), cv.COLOR_RGB2BGR)
    return predict_image_to_api_format(bgr)
