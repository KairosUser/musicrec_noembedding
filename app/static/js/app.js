// 文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子背景
    initParticles();
    
    // 初始化导航功能
    initNavigation();
    
    // 初始化事件监听
    initEventListeners();
    
    // 初始化本地存储
    initLocalStorage();
    
    // 更新个人中心统计
    updateProfileStats();
});

// 初始化导航功能
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标板块
            const targetSection = this.getAttribute('data-section');
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// 初始化粒子背景
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#ffffff"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 6,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });
}

// 初始化本地存储
function initLocalStorage() {
    if (!localStorage.getItem('musicHistory')) {
        localStorage.setItem('musicHistory', JSON.stringify([]));
    }
    if (!localStorage.getItem('favoriteSongs')) {
        localStorage.setItem('favoriteSongs', JSON.stringify([]));
    }
}

// 初始化事件监听
function initEventListeners() {
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-btn');
    
    // 字符计数
    textInput.addEventListener('input', function() {
        const count = this.value.length;
        const max = 500;
        charCount.textContent = `${count}/${max}`;
        
        // 超过最大字符数时显示警告
        if (count > max) {
            charCount.style.color = '#e53e3e';
            this.value = this.value.substring(0, max);
            charCount.textContent = `${max}/${max}`;
        } else {
            charCount.style.color = '#a0aec0';
        }
    });
    
    // 提交按钮点击事件
    submitBtn.addEventListener('click', function() {
        submitForm();
    });
    
    // 回车键提交（需要按住Shift+Enter换行）
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitForm();
        }
    });
}

// 表单提交
function submitForm() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();
    
    // 验证输入
    if (!text) {
        alert('请输入文本内容');
        return;
    }
    
    // 显示加载状态
    showLoading();
    
    // 发送请求
    fetch('/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            top_n: 10
        })
    })
    .then(response => response.json())
    .then(data => {
        // 隐藏加载状态
        hideLoading();
        
        // 处理响应
        if (data.error) {
            alert('发生错误: ' + data.error);
            return;
        }
        
        // 显示结果
        displayResults(data.recommendations);
        
        // 添加到历史记录
        addToHistory(data.recommendations);
        
        // 滚动到结果区域
        scrollToResults();
    })
    .catch(error => {
        hideLoading();
        alert('请求失败: ' + error.message);
    });
}

// 显示加载状态
function showLoading() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    
    loading.classList.remove('hidden');
    results.innerHTML = '';
}

// 隐藏加载状态
function hideLoading() {
    const loading = document.getElementById('loading');
    loading.classList.add('hidden');
}

// 显示结果
function displayResults(recommendations) {
    const results = document.getElementById('results');
    
    // 清空之前的结果
    results.innerHTML = '';
    
    // 如果没有结果
    if (recommendations.length === 0) {
        results.innerHTML = '<p class="empty-state">没有找到匹配的歌曲</p>';
        return;
    }
    
    // 获取收藏列表
    const favorites = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    
    // 创建结果卡片
    recommendations.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // 格式化相似度分数
        const similarity = (song.similarity * 100).toFixed(1);
        
        // 检查是否已收藏
        const isFavorite = favorites.some(fav => fav.name === song.name && fav.singer === song.singer);
        
        card.innerHTML = `
            <div class="song-name">
                <span>${song.name}</span>
                <button class="fav-btn ${isFavorite ? 'active' : ''}" data-song="${song.name}" data-singer="${song.singer}">
                    ❤️
                </button>
            </div>
            <p class="singer-name">🎤 ${song.singer}</p>
            <p class="similarity-score">相似度: ${similarity}%</p>
        `;
        
        results.appendChild(card);
    });
    
    // 为收藏按钮添加事件监听
    addFavBtnListeners();
}

// 为收藏按钮添加事件监听
function addFavBtnListeners() {
    const favBtns = document.querySelectorAll('.fav-btn');
    
    favBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const song = this.getAttribute('data-song');
            const singer = this.getAttribute('data-singer');
            
            toggleFavorite(song, singer);
            this.classList.toggle('active');
        });
    });
}

// 切换收藏状态
function toggleFavorite(songName, singerName) {
    let favorites = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    
    // 检查是否已收藏
    const index = favorites.findIndex(fav => fav.name === songName && fav.singer === singerName);
    
    if (index > -1) {
        // 移除收藏
        favorites.splice(index, 1);
    } else {
        // 添加收藏
        favorites.push({ name: songName, singer: singerName, addedAt: new Date().toISOString() });
    }
    
    // 保存到本地存储
    localStorage.setItem('favoriteSongs', JSON.stringify(favorites));
    
    // 更新个人中心
    updateProfileStats();
    renderFavorites();
}

// 添加到历史记录
function addToHistory(songs) {
    let history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
    
    // 添加新记录
    const newHistory = songs.map(song => ({
        name: song.name,
        singer: song.singer,
        timestamp: new Date().toISOString()
    }));
    
    // 合并并去重
    history = [...newHistory, ...history];
    
    // 移除重复项（保留最新）
    const uniqueHistory = [];
    const seen = new Set();
    
    for (const item of history) {
        const key = `${item.name}-${item.singer}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueHistory.push(item);
        }
    }
    
    // 保留最近50条记录
    history = uniqueHistory.slice(0, 50);
    
    // 保存到本地存储
    localStorage.setItem('musicHistory', JSON.stringify(history));
    
    // 更新个人中心
    updateProfileStats();
    renderHistory();
}

// 渲染历史记录
function renderHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">暂无历史记录</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp).toLocaleString('zh-CN');
        return `
            <div class="history-item">
                <div class="item-info">
                    <div class="item-song">${item.name}</div>
                    <div class="item-singer">${item.singer}</div>
                    <div class="item-date">${date}</div>
                </div>
                <button class="remove-btn" onclick="removeFromHistory('${item.name}', '${item.singer}')">删除</button>
            </div>
        `;
    }).join('');
}

// 渲染收藏列表
function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    const favorites = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-state">暂无收藏歌曲</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map(item => {
        return `
            <div class="favorite-item">
                <div class="item-info">
                    <div class="item-song">${item.name}</div>
                    <div class="item-singer">${item.singer}</div>
                </div>
                <button class="remove-btn" onclick="removeFromFavorites('${item.name}', '${item.singer}')">取消收藏</button>
            </div>
        `;
    }).join('');
}

// 从历史记录中移除
function removeFromHistory(songName, singerName) {
    let history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
    history = history.filter(item => !(item.name === songName && item.singer === singerName));
    localStorage.setItem('musicHistory', JSON.stringify(history));
    updateProfileStats();
    renderHistory();
}

// 从收藏中移除
function removeFromFavorites(songName, singerName) {
    let favorites = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    favorites = favorites.filter(item => !(item.name === songName && item.singer === singerName));
    localStorage.setItem('favoriteSongs', JSON.stringify(favorites));
    updateProfileStats();
    renderFavorites();
}

// 更新个人中心统计
function updateProfileStats() {
    const history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
    
    // 更新统计数字
    document.getElementById('total-songs').textContent = new Set(history.map(item => `${item.name}-${item.singer}`)).size;
    document.getElementById('fav-songs').textContent = favorites.length;
    
    // 渲染列表
    renderHistory();
    renderFavorites();
}

// 滚动到结果区域
function scrollToResults() {
    const resultsSection = document.querySelector('.results-section');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 初始化本地存储
function initLocalStorage() {
    if (!localStorage.getItem('musicHistory')) {
        localStorage.setItem('musicHistory', JSON.stringify([]));
    }
    if (!localStorage.getItem('favoriteSongs')) {
        localStorage.setItem('favoriteSongs', JSON.stringify([]));
    }
}

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', function() {
    // 添加鼠标跟随效果（可选）
    let mouseX = 0;
    let mouseY = 0;
    let particlesContainer = document.getElementById('particles-js');
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// 页面加载完成后，为输入框添加焦点效果
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const textInput = document.getElementById('text-input');
        textInput.focus();
    }, 1000);
});