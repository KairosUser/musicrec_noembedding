// 文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子背景
    initParticles();
    
    // 初始化事件监听
    initEventListeners();
});

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
        results.innerHTML = '<p class="no-results">没有找到匹配的歌曲</p>';
        return;
    }
    
    // 创建结果卡片
    recommendations.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // 格式化相似度分数
        const similarity = (song.similarity * 100).toFixed(1);
        
        card.innerHTML = `
            <h3 class="song-name">${song.name}</h3>
            <p class="singer-name">${song.singer}</p>
            <p class="similarity-score">相似度: ${similarity}%</p>
        `;
        
        results.appendChild(card);
    });
}

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动到结果区域
    function scrollToResults() {
        const resultsSection = document.querySelector('.results-section');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // 监听提交按钮点击，延迟滚动到结果
    document.getElementById('submit-btn').addEventListener('click', function() {
        setTimeout(scrollToResults, 1000);
    });
    
    // 添加鼠标跟随效果（可选）
    let mouseX = 0;
    let mouseY = 0;
    let particlesContainer = document.getElementById('particles-js');
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // 可以在这里添加更多交互效果
});

// 页面加载完成后，为输入框添加焦点效果
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const textInput = document.getElementById('text-input');
        textInput.focus();
    }, 1000);
});