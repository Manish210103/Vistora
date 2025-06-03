from nltk.tokenize import sent_tokenize
from rake_nltk import Rake
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import umap
import nltk

nltk.download('punkt')
nltk.download('vader_lexicon')
nltk.download('stopwords')

class VideoSegmenter:
    def __init__(self):
        self.rake = Rake()
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    def title_for_segment(self, text):
        self.rake.extract_keywords_from_text(text)
        keywords = self.rake.get_ranked_phrases()
        if len(keywords) >= 1:
            return keywords[0].capitalize()
        return text.split('.')[0].strip()[:40] + "..." if text else "Untitled"


    def sentiment_for_segment(self, text):
        scores = self.sentiment_analyzer.polarity_scores(text)
        return scores['compound']

    def cluster_segments(self, segments, num_clusters=4):
        texts = [seg["text"] for seg in segments]
        vectorizer = TfidfVectorizer(stop_words="english")
        X = vectorizer.fit_transform(texts)

        if X.shape[0] < num_clusters:
            num_clusters = max(1, X.shape[0] // 2)

        kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        labels = kmeans.fit_predict(X)

        reducer = umap.UMAP(n_neighbors=5, min_dist=0.3, n_components=2, random_state=42)
        coords = reducer.fit_transform(X.toarray())

        x_vals = coords[:, 0]
        y_vals = coords[:, 1]
        x_min, x_max = x_vals.min(), x_vals.max()
        y_min, y_max = y_vals.min(), y_vals.max()
        x_range = x_max - x_min if x_max != x_min else 1
        y_range = y_max - y_min if y_max != y_min else 1

        for i, seg in enumerate(segments):
            seg["cluster"] = int(labels[i])
            seg["x"] = float((coords[i][0] - x_min) / x_range * 100)
            seg["y"] = float((coords[i][1] - y_min) / y_range * 100)
        return segments

    def segment_and_title(self, transcript_segments, audio_duration, target_segment_count=18, min_segment_count=10, max_segment_count=20):
        all_text = " ".join([seg["text"] for seg in transcript_segments])
        all_sentences = sent_tokenize(all_text)
        total_words = len(all_text.split())

        max_allowed_segments = max(min_segment_count, min(target_segment_count, max_segment_count))
        max_words_per_segment = max(30, total_words // max_allowed_segments)

        segments = []
        current_segment = []
        current_start = None
        word_count = 0
        seg_idx = 0
        flat_segments = [(seg["text"], seg["start"], seg["end"]) for seg in transcript_segments]

        for i, sentence in enumerate(all_sentences):
            words = sentence.split()
            if not words:
                continue
            if current_start is None and seg_idx < len(flat_segments):
                current_start = flat_segments[seg_idx][1]
            current_segment.append(sentence)
            word_count += len(words)

            is_last = (i == len(all_sentences) - 1)
            if word_count >= max_words_per_segment or is_last:
                current_end = flat_segments[seg_idx][2] if seg_idx < len(flat_segments) else audio_duration
                seg_text = " ".join(current_segment)
                title = self.title_for_segment(seg_text)
                sentiment = self.sentiment_for_segment(seg_text)
                segments.append({
                    "title": title,
                    "start": current_start if current_start is not None else 0,
                    "end": current_end,
                    "text": seg_text,
                    "sentiment": sentiment
                })
                current_segment = []
                word_count = 0
                current_start = None
            if seg_idx < len(flat_segments) - 1:
                seg_idx += 1

        segments = segments[:max_allowed_segments]
        return self.cluster_segments(segments)

    def segment_visual_summary(self, summary_text, video_duration, num_segments=5):
        """
        For videos processed visually (no transcript).
        Splits the summary text into num_segments using sentences and distributes time equally.
        """
        sentences = sent_tokenize(summary_text)
        total_sent = len(sentences)
        sent_per_segment = max(1, total_sent // num_segments)
        segments = []

        segment_duration = video_duration / num_segments
        for i in range(num_segments):
            start = round(i * segment_duration, 2)
            end = round((i + 1) * segment_duration, 2)

            seg_sentences = sentences[i * sent_per_segment: (i + 1) * sent_per_segment]
            seg_text = " ".join(seg_sentences).strip()

            if not seg_text:
                continue

            title = self.title_for_segment(seg_text)
            sentiment = self.sentiment_for_segment(seg_text)

            segments.append({
                "title": title,
                "start": start,
                "end": end,
                "text": seg_text,
                "sentiment": sentiment
            })

        return self.cluster_segments(segments)
