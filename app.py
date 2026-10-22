import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

model_name = "Qwen/Qwen2.5-0.5B-Instruct"

# Load in 4-bit to fit within Render's 512 MB free tier
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16,
)

def respond(message, history):
    messages = [{"role": "system", "content": "You are a helpful AI assistant."}]
    for user_msg, assistant_msg in history:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})
    messages.append({"role": "user", "content": message})

    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=256, do_sample=True, temperature=0.7)
    response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)
    return response

# Accessible, responsive UI with verified contrast
theme = gr.themes.Soft(
    primary_hue="blue",
    secondary_hue="indigo",
    font=[gr.themes.GoogleFont("Inter"), "ui-sans-serif", "system-ui", "sans-serif"],
)

css = """
.gradio-container { max-width: 800px !important; margin: auto; }
.chatbot-container { height: 60vh !important; }
@media (max-width: 768px) {
    .chatbot-container { height: 50vh !important; }
    .gradio-container { padding: 10px !important; }
}
button { min-height: 44px !important; }
"""

demo = gr.ChatInterface(
    respond,
    title="Ultron AI Assistant",
    description="A fine-tuned Qwen model for AI basics.",
    examples=["What is a token?", "Why do models hallucinate?"],
    theme=theme,
    css=css,
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
