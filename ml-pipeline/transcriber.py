from faster_whisper import WhisperModel

def transcribe_audio(audio_path):
    model = WhisperModel("base", device="cpu", compute_type="int8")

    segments, _ = model.transcribe(audio_path)

    result = []
    for segment in segments:
        result.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text.strip()
        })

    return result
