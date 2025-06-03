import sys
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
import string
from collections import Counter
from rake_nltk import Rake

nltk.download('punkt')
nltk.download('stopwords')

class CleanSummarizer:
    def __init__(self):
        self.stopwords = set(stopwords.words('english'))
        self.rake = Rake(stopwords=self.stopwords) 

    def preprocess(self, text):
        text = text.strip()
        sentences = sent_tokenize(text)

        text_no_punct = text.translate(str.maketrans('', '', string.punctuation))
        words = word_tokenize(text_no_punct.lower())
        words = [w for w in words if w.isalpha() and w not in self.stopwords]

        return sentences, words

    def get_word_frequencies(self, words):
        freq = Counter(words)
        max_freq = max(freq.values()) if freq else 1
        return {word: count / max_freq for word, count in freq.items()}

    def score_sentences(self, sentences, word_freqs):
        scores = {}
        for sent in sentences:
            words = word_tokenize(sent.lower())
            words = [w for w in words if w.isalpha() and w not in self.stopwords]
            scores[sent] = sum(word_freqs.get(w, 0) for w in words)
        return scores

    def extract_keywords(self, text, keyword_count=None):
        self.rake.extract_keywords_from_text(text)
        ranked_phrases = self.rake.get_ranked_phrases()

        if keyword_count is None:
            length_based_count = max(5, min(15, len(ranked_phrases) // 5))
        else:
            length_based_count = max(5, min(15, keyword_count)) 

        return ranked_phrases[:length_based_count]


    def summarize(self, text, keyword_count=None):
        sentences, words = self.preprocess(text)
        total_words = len(words)
        target_word_count = int(total_words * 4 / 5) 

        word_freqs = self.get_word_frequencies(words)
        sentence_scores = self.score_sentences(sentences, word_freqs)

        ranked_sentences = sorted(sentence_scores.items(), key=lambda kv: kv[1], reverse=True)

        summary_points = []
        summary_word_count = 0

        for sent, score in ranked_sentences:
            sent_word_count = len(word_tokenize(sent))
            if summary_word_count + sent_word_count <= target_word_count or not summary_points:
                summary_points.append(sent.strip())
                summary_word_count += sent_word_count
            else:
                break

        summary_points = sorted(summary_points, key=lambda s: sentences.index(s))

        top_keywords = self.extract_keywords(text, keyword_count)

        return {
            "summary_points": summary_points,
            "keywords": top_keywords
        }


def summarize_text(text):
    summarizer = CleanSummarizer()
    return summarizer.summarize(text)
