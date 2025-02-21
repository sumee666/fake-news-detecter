import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    model_name = "facebook/bart-large-mnli"
    local_model_path = "local_model"
    
    logger.info("Starting model download process...")
    
    if not os.path.exists(local_model_path):
        os.makedirs(local_model_path)
    
    logger.info("Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.save_pretrained(local_model_path)
    
    logger.info("Downloading model...")
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    model.save_pretrained(local_model_path)
    
    logger.info("Model and tokenizer downloaded and saved successfully!")

except Exception as e:
    logger.error(f"Error during model download: {e}")