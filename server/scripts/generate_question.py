import os
import sys
import base64
import json
import logging
import random
from transformers import T5ForConditionalGeneration, T5Tokenizer

os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
logging.getLogger("transformers").setLevel(logging.ERROR)

def decode_context(context_str):
    """Handle base64 encoded context with proper validation"""
    try:
        # First try direct decoding
        decoded = base64.b64decode(context_str).decode('utf-8')
        if len(decoded) > len(context_str) * 0.7:  # Valid base64 tends to be longer
            return decoded
    except (base64.binascii.Error, UnicodeDecodeError):
        pass
    return context_str
def read_context(file_path):
    """Read context from file with proper encoding handling"""
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read()
            
        # Try UTF-8 first
        try:
            return raw_data.decode('utf-8')
        except UnicodeDecodeError:
            # Fallback to base64 if UTF-8 fails
            return base64.b64decode(raw_data).decode('utf-8')
            
    except Exception as e:
        raise ValueError(f"Failed to read context file: {str(e)}")

def generate_mcqs(context, num_questions, model, tokenizer):
    # Generate initial questions
    input_text = f"Generate {num_questions} multiple choice questions about: {context}"
    inputs = tokenizer(
        input_text,
        max_length=512,
        truncation=True,
        padding="max_length",
        return_tensors="pt"
    )
    outputs = model.generate(
        inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_new_tokens=100,
        num_return_sequences=num_questions,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=0.7,
        repetition_penalty=1.2
    )
    questions = list(set([
        tokenizer.decode(output, skip_special_tokens=True).strip().split("?")[0] + "?"
        for output in outputs
    ]))[:num_questions]

    mcqs = []
    for question in questions:
        # Generate correct answer
        answer_input = f"question: {question} context: {context} What is the correct answer?"
        answer_ids = tokenizer(
            answer_input,
            max_length=512,
            truncation=True,
            padding="max_length",
            return_tensors="pt"
        )
        answer_output = model.generate(
            answer_ids.input_ids,
            attention_mask=answer_ids.attention_mask,
            max_new_tokens=50,
            num_return_sequences=1
        )
        correct_answer = tokenizer.decode(answer_output[0], skip_special_tokens=True).strip()

        # Generate distractors
        distractor_input = f"Generate 3 wrong answers for: {question} context: {context}"
        distractor_ids = tokenizer(
            distractor_input,
            max_length=512,
            truncation=True,
            padding="max_length",
            return_tensors="pt"
        )
        distractor_outputs = model.generate(
            distractor_ids.input_ids,
            attention_mask=distractor_ids.attention_mask,
            max_new_tokens=50,
            num_return_sequences=3,
            do_sample=True
        )
        distractors = list(set([
            tokenizer.decode(output, skip_special_tokens=True).strip()
            for output in distractor_outputs
            if tokenizer.decode(output, skip_special_tokens=True).strip().lower() != correct_answer.lower()
        ]))[:3]

        # Build MCQ
        options = [correct_answer] + distractors
        random.shuffle(options)
        mcqs.append({
            "question": question,
            "options": options,
            "answer": correct_answer
        })
    
    return mcqs

def main():
    try:
        if len(sys.argv) < 4:
            raise ValueError("Missing arguments: context, num_questions, and question_type required")
        
        context_file = sys.argv[1]
        num_questions = int(sys.argv[2])
        question_type = sys.argv[3]
        
        context = read_context(context_file)
        if not context.strip():
            raise ValueError("Context is empty after processing")

        model_path = "D:\\FYP\\final project1\\project\\models\\flan-t5"

        tokenizer = T5Tokenizer.from_pretrained(model_path)
        model = T5ForConditionalGeneration.from_pretrained(model_path)

        if question_type == "mcq":
            mcqs = generate_mcqs(context, num_questions, model, tokenizer)
            print(json.dumps({"mcqs": mcqs}))
        else:
            input_text = f"Generate {num_questions} questions about: {context}"
            inputs = tokenizer(
                input_text,
                max_length=512,
                truncation=True,
                padding="max_length",
                return_tensors="pt"
            )
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=100,
                num_return_sequences=num_questions,
                do_sample=True
            )
            questions = list(set([
                tokenizer.decode(output, skip_special_tokens=True).strip()
                for output in outputs
            ]))[:num_questions]
            print(json.dumps({"questions": questions}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()