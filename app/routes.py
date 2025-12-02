from flask import render_template, request, jsonify
from app import app
from app.utils import song_recommender

@app.route('/')
def index():
    """
    首页
    """
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    推荐歌曲API
    """
    data = request.get_json()
    text = data.get('text', '')
    top_n = data.get('top_n', 10)
    
    if not text:
        return jsonify({'error': '请输入文本'}), 400
    
    try:
        # 获取推荐结果
        recommendations = song_recommender.recommend_songs(text, top_n)
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500