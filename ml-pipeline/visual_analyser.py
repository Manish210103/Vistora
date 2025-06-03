import cv2
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from torchvision import transforms
from PIL import Image
from rake_nltk import Rake
import nltk
from nltk.tokenize import sent_tokenize

nltk.download('stopwords')
nltk.download('punkt')

device = "cpu"

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

def extract_keyframes(video_path, max_frames=50):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    interval = max(1, total_frames // max_frames)

    frames = []
    for i in range(0, total_frames, interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        success, frame = cap.read()
        if success:
            frames.append(frame)
        if len(frames) >= max_frames:
            break
    cap.release()
    return frames

def generate_captions(frames):
    images = [Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)) for f in frames]
    captions = []

    batch_size = 4
    for i in range(0, len(images), batch_size):
        batch = images[i:i+batch_size]
        inputs = processor(batch, return_tensors="pt", padding=True).to(device)

        with torch.no_grad():
            outputs = model.generate(**inputs, max_new_tokens=30)

        batch_captions = processor.batch_decode(outputs, skip_special_tokens=True)
        captions.extend(batch_captions)
    
    return captions

def clean_keywords(text):
    r = Rake()
    r.extract_keywords_from_text(text)
    keywords = r.get_ranked_phrases()
    return [kw for kw in keywords if len(kw.split()) > 1 or kw.lower() not in nltk.corpus.stopwords.words('english')]

def analyze_video_visually(video_path):
    frames = extract_keyframes(video_path)
    captions = generate_captions(frames)

    cleaned = [cap.strip() + "." if not cap.strip().endswith(".") else cap.strip() for cap in captions]
    
    unique_sentences = []
    seen = set()
    for sentence in cleaned:
        if sentence.lower() not in seen and len(sentence.split()) > 3:
            unique_sentences.append(sentence)
            seen.add(sentence.lower())

    summary_points = unique_sentences[:max(5, min(20, len(unique_sentences)))]

    full_text = " ".join(summary_points)
    keywords = clean_keywords(full_text)

    return {
        "summary_points": summary_points,
        "keywords": keywords[:15]
    }

