import sys
import json
from extractor import extract_audio
from transcriber import transcribe_audio
from summarizer import summarize_text 
from segmenter import VideoSegmenter

def main(video_path):
    audio_path = extract_audio(video_path)
    transcript = transcribe_audio(audio_path) 
    
    full_transcript_text = " ".join([seg["text"] for seg in transcript])  

    segmenter = VideoSegmenter()
    segments_with_titles = segmenter.segment_and_title(transcript) 

    summary_data = summarize_text(full_transcript_text) 

    result = {
        "summary_points": summary_data["summary_points"],
        "keywords": summary_data["keywords"],
        "transcript": transcript,
        "segments": segments_with_titles
    }

    print(json.dumps(result))
    sys.stdout.flush()

if __name__ == "__main__":
    video_path = sys.argv[1]
    main(video_path)
