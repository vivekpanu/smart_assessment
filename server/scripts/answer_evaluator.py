from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from sentence_transformers import SentenceTransformer, util
import torch

app = Flask(__name__)

# Load models once during startup
MODEL_PATH = "/Users/pawan/Desktop/project/project/models/bert-base"
qa_tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
qa_model = AutoModelForQuestionAnswering.from_pretrained(MODEL_PATH, use_safetensors=True)
similarity_model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_answer(context, question):
    inputs = qa_tokenizer(question, context, return_tensors="pt", 
                        truncation=True, max_length=512)
    with torch.no_grad():
        outputs = qa_model(**inputs)
    
    start_idx = torch.argmax(outputs.start_logits)
    end_idx = torch.argmax(outputs.end_logits) + 1
    answer_tokens = inputs.input_ids[0][start_idx:end_idx]
    return qa_tokenizer.decode(answer_tokens, skip_special_tokens=True)

def evaluate_similarity(model_answer, user_answer):
    embeddings = similarity_model.encode([model_answer, user_answer], 
                                       convert_to_tensor=True)
    return util.cos_sim(embeddings[0], embeddings[1]).item()

@app.route('/evaluate', methods=['POST'])
def evaluate_answer():
    data = request.get_json()
    context = data['context']
    question = data['question']
    user_answer = data['userAnswer'].strip()
    
    try:
        # Generate model answer
        model_answer = generate_answer(context, question)
        
        # Calculate similarity score
        similarity = evaluate_similarity(model_answer, user_answer)
        score = round(similarity * 100, 2)
        
        # Generate feedback
        if score >= 90:
            feedback = "Excellent match with the expected answer!"
        elif score >= 70:
            feedback = "Good answer, but could be more precise."
        elif score >= 50:
            feedback = "Partial match. Review key concepts."
        else:
            feedback = "Significant differences detected. Needs improvement."
        
        return jsonify({
            "modelAnswer": model_answer,
            "userAnswer": user_answer,
            "score": score,
            "feedback": feedback,
            "similarityScore": score  # Explicit similarity score
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)