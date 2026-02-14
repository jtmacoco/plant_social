# services/api/app/ml/clip_embedder.py
from __future__ import annotations
import torch
import open_clip
from PIL import Image

class CLIPEmbedder:
    def __init__(self, model_name: str = "ViT-B-32", pretrained: str = "laion2b_s34b_b79k"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained
        )
        self.tokenizer = open_clip.get_tokenizer(model_name)
        self.model.eval().to(self.device)

    @torch.no_grad()
    def image_embedding(self, img: Image.Image) -> list[float]:
        x = self.preprocess(img).unsqueeze(0).to(self.device)  # (1,3,224,224)
        feats = self.model.encode_image(x)                     # (1,d)
        feats = feats / feats.norm(dim=-1, keepdim=True)       # L2 normalize
        return feats.squeeze(0).float().cpu().tolist()

    @torch.no_grad()
    def text_embedding(self, text: str) -> list[float]:
        tokens = self.tokenizer([text]).to(self.device)
        feats = self.model.encode_text(tokens)
        feats = feats / feats.norm(dim=-1, keepdim=True)
        return feats.squeeze(0).float().cpu().tolist()