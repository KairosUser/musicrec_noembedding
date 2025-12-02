import numpy as np
import pandas as pd
from transformers import BertTokenizer, AlbertModel
import torch
import os

# 加载模型和数据
class SongRecommender:
    def __init__(self):
        # 加载预训练ALBERT模型
        print("加载ALBERT模型...")
        self.tokenizer = BertTokenizer.from_pretrained('voidful/albert_chinese_tiny')
        self.model = AlbertModel.from_pretrained('voidful/albert_chinese_tiny')
        
        # 设置设备
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()
        
        # 加载预计算的嵌入和歌曲信息
        print("加载歌词嵌入和歌曲信息...")
        self.embeddings = np.load('./data/lyrics_embeddings.npy')
        self.song_info = pd.read_csv('./data/song_info.csv')
        
        print(f"加载完成，共 {len(self.song_info)} 首歌曲")
        print(f"嵌入形状: {self.embeddings.shape}")
    
    def get_text_embedding(self, text):
        """
        获取文本的ALBERT嵌入
        """
        inputs = self.tokenizer(
            text,
            return_tensors='pt',
            max_length=512,
            truncation=True,
            padding='max_length'
        )
        
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        embedding = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
        return embedding
    
    def cosine_similarity(self, vec1, vec2):
        """
        计算两个向量的余弦相似度
        """
        if len(vec2.shape) == 2:
            vec1 = vec1.reshape(1, -1)
            # 使用广播机制计算批量相似度
            similarity = np.dot(vec1, vec2.T) / (np.linalg.norm(vec1) * np.linalg.norm(vec2, axis=1))
            return similarity.flatten()
        else:
            return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def recommend_songs(self, text, top_n=10):
        """
        根据文本推荐歌曲
        """
        # 获取查询文本的嵌入
        query_embedding = self.get_text_embedding(text)
        
        # 计算与所有歌曲的相似度
        similarities = self.cosine_similarity(query_embedding, self.embeddings)
        
        # 获取Top N结果的索引
        top_indices = similarities.argsort()[::-1][:top_n]
        
        # 获取推荐歌曲信息
        recommendations = []
        for idx in top_indices:
            song = self.song_info.iloc[idx]
            recommendations.append({
                'name': song['name'],
                'singer': song['singer'],
                'similarity': round(float(similarities[idx]), 3)
            })
        
        return recommendations

# 初始化推荐器
song_recommender = SongRecommender()