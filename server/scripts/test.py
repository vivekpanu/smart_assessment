from transformers import AutoModelForQuestionAnswering
model = AutoModelForQuestionAnswering.from_pretrained(
    "/Users/pawan/Desktop/project/project/models/bert-base",
    use_safetensors=True
)
print("Model loaded successfully!")