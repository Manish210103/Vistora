from nltk.tokenize import sent_tokenize
from rake_nltk import Rake
import nltk
nltk.download('punkt')

class VideoSegmenter:
    def __init__(self):
        self.rake = Rake()

    def title_for_segment(self, text):
        self.rake.extract_keywords_from_text(text)
        keywords = self.rake.get_ranked_phrases()
        return ", ".join(keywords[:2]) if keywords else "Untitled"

    def segment_and_title(self, transcript_segments, target_segment_count=18, min_segment_count=10, max_segment_count=20):
        all_text = " ".join([seg["text"] for seg in transcript_segments])
        all_sentences = sent_tokenize(all_text)

        total_words = len(all_text.split())
        max_allowed_segments = max(min_segment_count, min(target_segment_count, max_segment_count))
        max_words_per_segment = max(30, total_words // max_allowed_segments)

        segments = []
        current_segment = []
        current_start = None
        current_end = None
        word_count = 0

        flat_segments = [(seg["text"], seg["start"], seg["end"]) for seg in transcript_segments]

        seg_idx = 0
        for sentence in all_sentences:
            words = sentence.split()
            if not words:
                continue
            word_count += len(words)
            current_segment.append(sentence)

            if current_start is None and seg_idx < len(flat_segments):
                current_start = flat_segments[seg_idx][1]
            if seg_idx < len(flat_segments):
                current_end = flat_segments[seg_idx][2]

            if word_count >= max_words_per_segment or sentence == all_sentences[-1]:
                seg_text = " ".join(current_segment)
                title = self.title_for_segment(seg_text)
                segments.append({
                    "title": title,
                    "start": current_start,
                    "end": current_end,
                    "text": seg_text
                })
                current_segment = []
                word_count = 0
                current_start = None
                current_end = None

            seg_idx += 1

        return segments[:max_allowed_segments]
