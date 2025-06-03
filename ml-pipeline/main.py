import sys
import json
import nltk
from extractor import extract_audio
from transcriber import transcribe_audio
from summarizer import summarize_text 
from segmenter import VideoSegmenter
from visual_analyser import analyze_video_visually
from pydub.utils import mediainfo

nltk.download('punkt')

def get_audio_duration(filepath):
    info = mediainfo(filepath)
    return float(info['duration'])

def main(video_path):
    segmenter = VideoSegmenter()

    try:
        audio_path = extract_audio(video_path)
        audio_duration = get_audio_duration(audio_path)

        transcript = transcribe_audio(audio_path)
        full_transcript_text = " ".join([seg["text"] for seg in transcript])
        transcript_word_count = len(full_transcript_text.split())

        if transcript_word_count < 20:
            summary_data = analyze_video_visually(video_path)
            segments_with_titles = segmenter.segment_visual_summary(
                " ".join(summary_data["summary_points"]),
                audio_duration,
                num_segments=5
            )
            transcript = []
        else:
            segments_with_titles = segmenter.segment_and_title(transcript, audio_duration)
            summary_data = summarize_text(full_transcript_text)

    except Exception as e:
        transcript = []
        summary_data = analyze_video_visually(video_path)

        from pydub.utils import mediainfo
        info = mediainfo(video_path)
        video_duration = float(info.get("duration", 60))
        audio_duration = video_duration
        segments_with_titles = segmenter.segment_visual_summary(
            " ".join(summary_data["summary_points"]),
            video_duration,
            num_segments=5
        )

    result = {
        "summary_points": summary_data.get("summary_points", []),
        "keywords": summary_data.get("keywords", []),
        "transcript": transcript,
        "segments": segments_with_titles,
        "transcript_word_count": len(" ".join([seg["text"] for seg in transcript]).split()),
        "audio_duration": audio_duration
    }

    print(json.dumps(result, ensure_ascii=False))
    sys.stdout.flush()

if __name__ == "__main__":
    video_path = sys.argv[1]
    main(video_path)
