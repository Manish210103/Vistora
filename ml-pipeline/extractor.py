import ffmpeg
import os

def extract_audio(video_path, output_audio_path="output_audio.wav"):
    try:
        probe = ffmpeg.probe(video_path)
        audio_streams = [stream for stream in probe['streams'] if stream['codec_type'] == 'audio']
        
        if not audio_streams:
            raise ValueError("No audio stream found in the video.")

        (
            ffmpeg
            .input(video_path)
            .output(output_audio_path, acodec='pcm_s16le', vn=None)
            .run(overwrite_output=True)  
        )
        return output_audio_path

    except ffmpeg.Error as e:
        raise RuntimeError(f"FFmpeg error: {e.stderr.decode()}") from e
