import logging
import os
import replicate
import re

logging.basicConfig(level=logging.DEBUG)

class VideoGen:
    def __init__(self, token):
        self.token = token
        self.media_path = "./VideoBox"

    def extract_url_from_logs(self, log_data):
        url_pattern = r'https://replicate\.delivery/[^\s]+'
        urls = re.findall(url_pattern, log_data)
        return urls[0] if urls else None

    def generate(self, prompt, file_name, image_path):
        try:
            logging.info(f"Начало генерации видео с prompt: {prompt}")
            
            client = replicate.Client(api_token=self.token)
            with open(image_path, "rb") as image_file:
                output = client.run(
                    "minimax/video-01-live",
                    input={
                        "prompt": prompt,
                        "first_frame_image": image_file, 
                    }
                )

            log_data = str(output)
            video_url = self.extract_url_from_logs(log_data)

            if video_url:
                logging.info(f"URL видео: {video_url}")
            else:
                logging.warning("URL видео не найден в логах.")

            return {"file_path": video_url, "video_url": video_url}
        except Exception as e:
            logging.error(f"Ошибка генерации видео: {e}")
            raise
