import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load your model
model_name = "Qwen/Qwen2.5-0.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16, device_map="auto")

def respond(message, history):
    # Format the conversation for the model
    messages = [{"role": "system", "content": "You are a helpful AI assistant."}]
    for user_msg, assistant_msg in history:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})
    messages.append({"role": "user", "content": message})
    
    # Generate the response
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=256, do_sample=True, temperature=0.7)
    response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
    return response

# Build the UI
demo = gr.ChatInterface(
    respond,
    title="Ultron AI Assistant",
    description="A fine-tuned Qwen model for AI basics.",
    examples=["What is a token?", "Why do models hallucinate?"],
)

if __name__ == "__main__":
    demo.launch()
