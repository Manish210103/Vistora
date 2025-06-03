import contextlib
import os

def transcribe_audio(audio_path):
    import whisper
    model = whisper.load_model("base")
    with open(os.devnull, "w") as devnull:
        with contextlib.redirect_stdout(devnull), contextlib.redirect_stderr(devnull):
            result = model.transcribe(audio_path, verbose=False)

    segments = [
        {"start": segment["start"], "end": segment["end"], "text": segment["text"]}
        for segment in result["segments"]
    ]
    return segments
