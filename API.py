import logging
import os
import time
import hashlib
from threading import Thread
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import replicate
from dotenv import load_dotenv

from musick import VideoGen

# Загрузка переменных окружения
load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise ValueError("API_KEY is not set in the environment variables")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

generator = VideoGen(API_KEY)

class Bank:
    def __init__(self):
        self.obj = {}

    def set_status(self, task_id, status, video_file_path=None):
        self.obj[task_id] = {'status': status, 'video_file_path': video_file_path, 'thread': None}

    def get_status(self, task_id):
        return self.obj.get(task_id, {}).get('status', 'unknown')

    def get_video_file_path(self, task_id):
        return self.obj.get(task_id, {}).get('video_file_path', None)

bank = Bank()

def clear_directories():
    try:
        for folder in ["./images", "./VideoBox"]:
            if os.path.exists(folder):
                shutil.rmtree(folder)
            os.makedirs(folder)
    except Exception as e:
        logging.error(f"Error clearing directories: {e}")

def generate_unique_code():
    current_time = time.time()
    time_str = str(current_time)
    unique_code = hashlib.md5(time_str.encode()).hexdigest()
    return unique_code

@app.post("/generate-video")
async def generate_video(prompt: str = Form(...), image: UploadFile = File(...)):
    logging.info(f"Received request with prompt: {prompt}, image: {image.filename}")
    task_id = generate_unique_code()
    bank.set_status(task_id, 'running')

    try:
        image_path = f"./images/{image.filename}"
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        with open(image_path, "wb") as f:
            f.write(await image.read())

        def generation_task():
            try:
                result = generator.generate(prompt, f"{task_id}.mp4", image_path)
                if result['video_url']:
                    video_url = result['video_url']
                    bank.set_status(task_id, 'completed', video_url)
                    logging.info(f"Видео сгенерировано: {video_url}")
                else:
                    bank.set_status(task_id, 'failed')
            except Exception as e:
                bank.set_status(task_id, 'failed')
                logging.error(f"Ошибка генерации: {e}")
            finally:
                clear_directories()

        thread = Thread(target=generation_task)
        bank.obj[task_id]['thread'] = thread
        thread.start()

        return {"task_id": task_id}
    except Exception as e:
        logging.error(f"Ошибка при обработке запроса: {e}")
        clear_directories()
        raise HTTPException(status_code=500, detail="Ошибка на сервере")

@app.get("/status/{task_id}")
def get_status(task_id: str):
    status = bank.get_status(task_id)
    return {"status": status}

@app.get("/get-video/{task_id}")
def get_video(task_id: str):
    video_url = bank.get_video_file_path(task_id)
    logging.info(f"URL VIDEO GET VIDEO: {video_url}")
    if video_url:
        return {"video_url": video_url}
    else:
        raise HTTPException(status_code=404, detail="Видео не найдено")
