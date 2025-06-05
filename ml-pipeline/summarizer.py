from transformers import BartTokenizer, BartForConditionalGeneration
import torch
from rake_nltk import Rake
import nltk
from nltk.corpus import stopwords
import re

nltk.download('punkt')
nltk.download('stopwords')

class BartSummarizer:
    def __init__(self):
        self.tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
        self.model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
        self.rake = Rake()
        self.stopwords = set(stopwords.words('english'))

    def extract_keywords(self, text, max_keywords=15):
        self.rake.extract_keywords_from_text(text)
        ranked_phrases = self.rake.get_ranked_phrases()

        keywords = []
        for phrase in ranked_phrases:
            words = phrase.split()
            if 1 <= len(words) <= 3:
                for w in words:
                    w_lower = w.lower()

                    if (
                        w_lower in self.stopwords
                        or re.fullmatch(r'\d+', w_lower)  
                        or len(w_lower) <= 2  
                    ):
                        continue

                    if w_lower not in keywords:
                        keywords.append(w_lower)

            if len(keywords) >= max_keywords:
                break

        return keywords[:max_keywords]

    def summarize(self, text):
        inputs = self.tokenizer.encode(text, return_tensors="pt", truncation=True, max_length=1024)
        input_len = inputs.shape[1]

        max_length = max(60, min(1000, int(input_len * 0.75)))
        min_length = max(30, int(max_length * 0.5))

        summary_ids = self.model.generate(
            inputs,
            max_length=max_length,
            min_length=min_length,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        keywords = self.extract_keywords(text, max_keywords=15)

        return {
            "summary_points": [summary], 
            "keywords": keywords
        }

def summarize_text(text):
    summarizer = BartSummarizer()
    return summarizer.summarize(text)
