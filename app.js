// Global state
const state = {
    achievements: [],
    funMode: false,
    visitCount: 0,
    snakeHighScore: 0,
    gamesPlayed: 0
};

// Typing animation for hero section
const typingText = document.getElementById('typing-text');
const textToType = 'Tech Enthusiast | Developer | Problem Solver';
let charIndex = 0;

function typeText() {
    if (charIndex < textToType.length) {
        typingText.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, 100);
    } else {
        setTimeout(() => {
            typingText.textContent = '';
            charIndex = 0;
            typeText();
        }, 3000);
    }
}

// Particle system for hero background
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.3})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 - distance / 500})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Navigation active state
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Game modal functions
function openGame(gameName) {
    const modal = document.getElementById(`${gameName}-modal`);
    modal.classList.add('active');
    state.gamesPlayed++;
    
    if (state.gamesPlayed === 1) {
        unlockAchievement('First Game Played! 🎮');
    }
    if (state.gamesPlayed === 3) {
        unlockAchievement('Game Master! 🏆');
    }
}

function closeGame(gameName) {
    const modal = document.getElementById(`${gameName}-modal`);
    modal.classList.remove('active');
    
    // Stop any running games
    if (gameName === 'snake' && snakeGame.running) {
        snakeGame.running = false;
    }
    if (gameName === 'typing' && typingGame.running) {
        typingGame.running = false;
    }
    if (gameName === 'memory' && memoryGame.running) {
        memoryGame.timer && clearInterval(memoryGame.timer);
    }
}

// SNAKE GAME
const snakeGame = {
    canvas: null,
    ctx: null,
    gridSize: 20,
    snake: [],
    food: {},
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    running: false,
    speed: 100
};

function initSnakeGame() {
    snakeGame.canvas = document.getElementById('snake-canvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = 'right';
    snakeGame.nextDirection = 'right';
    snakeGame.score = 0;
    snakeGame.speed = 100;
    generateFood();
    updateSnakeScore();
}

function generateFood() {
    snakeGame.food = {
        x: Math.floor(Math.random() * (snakeGame.canvas.width / snakeGame.gridSize)),
        y: Math.floor(Math.random() * (snakeGame.canvas.height / snakeGame.gridSize))
    };
}

function drawSnakeGame() {
    const ctx = snakeGame.ctx;
    const canvas = snakeGame.canvas;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#00FF00';
    ctx.shadowColor = '#00FF00';
    ctx.shadowBlur = 10;
    
    snakeGame.snake.forEach((segment, index) => {
        ctx.fillRect(
            segment.x * snakeGame.gridSize,
            segment.y * snakeGame.gridSize,
            snakeGame.gridSize - 2,
            snakeGame.gridSize - 2
        );
    });
    
    // Draw food
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 15;
    ctx.fillRect(
        snakeGame.food.x * snakeGame.gridSize,
        snakeGame.food.y * snakeGame.gridSize,
        snakeGame.gridSize - 2,
        snakeGame.gridSize - 2
    );
    
    ctx.shadowBlur = 0;
}

function updateSnake() {
    if (!snakeGame.running) return;
    
    snakeGame.direction = snakeGame.nextDirection;
    
    const head = {...snakeGame.snake[0]};
    
    switch(snakeGame.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= snakeGame.canvas.width / snakeGame.gridSize ||
        head.y < 0 || head.y >= snakeGame.canvas.height / snakeGame.gridSize) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snakeGame.snake.unshift(head);
    
    // Check food collision
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        updateSnakeScore();
        generateFood();
        
        if (snakeGame.score === 50) {
            unlockAchievement('Snake Apprentice! 🐍');
        }
        if (snakeGame.score === 100) {
            unlockAchievement('Snake Master! 🏆');
        }
    } else {
        snakeGame.snake.pop();
    }
    
    drawSnakeGame();
    setTimeout(updateSnake, snakeGame.speed);
}

function gameOver() {
    snakeGame.running = false;
    
    if (snakeGame.score > state.snakeHighScore) {
        state.snakeHighScore = snakeGame.score;
        document.getElementById('snake-high-score').textContent = state.snakeHighScore;
        unlockAchievement('New High Score! 🎉');
    }
    
    document.getElementById('snake-start-btn').style.display = 'none';
    document.getElementById('snake-restart-btn').style.display = 'inline-block';
    
    const ctx = snakeGame.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    ctx.fillStyle = '#FF0000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 - 20);
    ctx.fillStyle = '#00FFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${snakeGame.score}`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 20);
}

function updateSnakeScore() {
    document.getElementById('snake-score').textContent = snakeGame.score;
    document.getElementById('snake-high-score').textContent = state.snakeHighScore;
}

function startSnakeGame() {
    initSnakeGame();
    snakeGame.running = true;
    document.getElementById('snake-start-btn').style.display = 'none';
    drawSnakeGame();
    updateSnake();
}

function restartSnakeGame() {
    document.getElementById('snake-restart-btn').style.display = 'none';
    document.getElementById('snake-start-btn').style.display = 'inline-block';
    initSnakeGame();
    drawSnakeGame();
}

// Snake keyboard controls
document.addEventListener('keydown', (e) => {
    if (!snakeGame.running) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (snakeGame.direction !== 'down') snakeGame.nextDirection = 'up';
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (snakeGame.direction !== 'up') snakeGame.nextDirection = 'down';
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (snakeGame.direction !== 'right') snakeGame.nextDirection = 'left';
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (snakeGame.direction !== 'left') snakeGame.nextDirection = 'right';
            e.preventDefault();
            break;
    }
});

// MEMORY GAME
const memoryGame = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    startTime: null,
    timer: null,
    running: false,
    symbols: ['🚀', '💻', '🎮', '🔥', '⚡', '🌟', '💎', '🎯']
};

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    memoryGame.cards = [];
    memoryGame.flippedCards = [];
    memoryGame.matchedPairs = 0;
    memoryGame.moves = 0;
    memoryGame.startTime = null;
    
    // Create pairs
    const cardValues = [...memoryGame.symbols, ...memoryGame.symbols];
    cardValues.sort(() => Math.random() - 0.5);
    
    cardValues.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
        memoryGame.cards.push(card);
    });
    
    updateMemoryStats();
}

function flipCard(e) {
    if (!memoryGame.running) return;
    if (memoryGame.flippedCards.length >= 2) return;
    
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    card.textContent = card.dataset.symbol;
    memoryGame.flippedCards.push(card);
    
    if (memoryGame.flippedCards.length === 2) {
        memoryGame.moves++;
        updateMemoryStats();
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = memoryGame.flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        memoryGame.matchedPairs++;
        memoryGame.flippedCards = [];
        updateMemoryStats();
        
        if (memoryGame.matchedPairs === 8) {
            setTimeout(() => {
                memoryGame.running = false;
                clearInterval(memoryGame.timer);
                unlockAchievement('Memory Master! 🧠');
                alert(`Congratulations! You won in ${memoryGame.moves} moves!`);
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            memoryGame.flippedCards = [];
        }, 1000);
    }
}

function updateMemoryStats() {
    document.getElementById('memory-moves').textContent = memoryGame.moves;
    document.getElementById('memory-matches').textContent = `${memoryGame.matchedPairs}/8`;
    
    if (memoryGame.startTime) {
        const elapsed = Math.floor((Date.now() - memoryGame.startTime) / 1000);
        document.getElementById('memory-time').textContent = `${elapsed}s`;
    }
}

function startMemoryGame() {
    initMemoryGame();
    memoryGame.running = true;
    memoryGame.startTime = Date.now();
    
    memoryGame.timer = setInterval(() => {
        if (memoryGame.running) {
            updateMemoryStats();
        }
    }, 1000);
}

function restartMemoryGame() {
    if (memoryGame.timer) {
        clearInterval(memoryGame.timer);
    }
    startMemoryGame();
}

// TYPING GAME
const typingGame = {
    words: [
        'JavaScript is awesome',
        'Cloud computing revolution',
        'Automation saves time',
        'Code with passion',
        'Debug like a detective',
        'Algorithms and data structures',
        'Full stack development',
        'Responsive web design',
        'API integration techniques',
        'Version control with Git',
        'Continuous integration pipeline',
        'Microservices architecture',
        'Database optimization strategies',
        'User experience matters',
        'Agile development methodology'
    ],
    currentText: '',
    startTime: null,
    timeLeft: 60,
    running: false,
    timer: null,
    correctChars: 0,
    totalChars: 0
};

function initTypingGame() {
    typingGame.currentText = typingGame.words[Math.floor(Math.random() * typingGame.words.length)];
    typingGame.timeLeft = 60;
    typingGame.correctChars = 0;
    typingGame.totalChars = 0;
    typingGame.running = false;
    
    document.getElementById('typing-text-display').textContent = typingGame.currentText;
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').disabled = false;
    document.getElementById('typing-wpm').textContent = '0';
    document.getElementById('typing-accuracy').textContent = '100%';
    document.getElementById('typing-time').textContent = '60s';
}

function startTypingGame() {
    initTypingGame();
    typingGame.running = true;
    typingGame.startTime = Date.now();
    
    const input = document.getElementById('typing-input');
    input.disabled = false;
    input.focus();
    
    typingGame.timer = setInterval(() => {
        if (typingGame.running) {
            typingGame.timeLeft--;
            document.getElementById('typing-time').textContent = `${typingGame.timeLeft}s`;
            
            if (typingGame.timeLeft <= 0) {
                endTypingGame();
            }
        }
    }, 1000);
}

function endTypingGame() {
    typingGame.running = false;
    clearInterval(typingGame.timer);
    document.getElementById('typing-input').disabled = true;
    
    const wpm = document.getElementById('typing-wpm').textContent;
    const accuracy = document.getElementById('typing-accuracy').textContent;
    
    if (parseInt(wpm) >= 50) {
        unlockAchievement('Speed Demon! ⚡');
    }
    
    alert(`Time's up!\nWPM: ${wpm}\nAccuracy: ${accuracy}`);
}

function restartTypingGame() {
    if (typingGame.timer) {
        clearInterval(typingGame.timer);
    }
    startTypingGame();
}

// Typing input handler
document.getElementById('typing-input').addEventListener('input', (e) => {
    if (!typingGame.running) return;
    
    const typed = e.target.value;
    const target = typingGame.currentText;
    
    typingGame.totalChars = typed.length;
    typingGame.correctChars = 0;
    
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) {
            typingGame.correctChars++;
        }
    }
    
    // Calculate WPM
    const timeElapsed = (Date.now() - typingGame.startTime) / 1000 / 60;
    const wordsTyped = typed.trim().split(/\s+/).length;
    const wpm = Math.round(wordsTyped / timeElapsed);
    
    // Calculate accuracy
    const accuracy = typingGame.totalChars > 0 
        ? Math.round((typingGame.correctChars / typingGame.totalChars) * 100)
        : 100;
    
    document.getElementById('typing-wpm').textContent = wpm || 0;
    document.getElementById('typing-accuracy').textContent = `${accuracy}%`;
    
    // Check if completed
    if (typed === target) {
        typingGame.currentText = typingGame.words[Math.floor(Math.random() * typingGame.words.length)];
        document.getElementById('typing-text-display').textContent = typingGame.currentText;
        e.target.value = '';
        unlockAchievement('Text Completed! 📝');
    }
});

// Contact form
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (name && email && message) {
        showSuccessMessage();
        e.target.reset();
        unlockAchievement('Message Sent! 📧');
    }
});

function showSuccessMessage() {
    const msg = document.getElementById('success-message');
    msg.classList.add('show');
    setTimeout(() => {
        msg.classList.remove('show');
    }, 3000);
}

// Achievement system
function unlockAchievement(text) {
    if (state.achievements.includes(text)) return;
    
    state.achievements.push(text);
    
    const container = document.getElementById('achievements');
    const achievement = document.createElement('div');
    achievement.className = 'achievement';
    achievement.textContent = `🏆 ${text}`;
    container.appendChild(achievement);
    
    setTimeout(() => {
        achievement.remove();
    }, 5000);
}

// Fun mode toggle
document.getElementById('fun-mode-toggle').addEventListener('click', () => {
    state.funMode = !state.funMode;
    const btn = document.getElementById('fun-mode-toggle');
    btn.textContent = state.funMode ? '🎉 Fun Mode: ON' : '🎉 Fun Mode: OFF';
    
    if (state.funMode) {
        document.body.style.animation = 'rainbow 5s infinite';
        unlockAchievement('Fun Mode Activated! 🎉');
    } else {
        document.body.style.animation = 'none';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'G' to jump to games
    if (e.key === 'g' || e.key === 'G') {
        if (!document.querySelector('.game-modal.active')) {
            document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Greeting based on time
function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';
    
    // Could display this somewhere if desired
    console.log(`${greeting}! Welcome to the portfolio.`);
}

// Initialize on load
window.addEventListener('load', () => {
    // Hide loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
    
    // Start animations
    typeText();
    initParticles();
    setGreeting();
    
    // Track visit
    state.visitCount++;
    if (state.visitCount === 1) {
        setTimeout(() => {
            unlockAchievement('Welcome Visitor! 👋');
        }, 2000);
    }
    
    // Initialize games
    initSnakeGame();
    initMemoryGame();
    initTypingGame();
});

// Scroll event listener
window.addEventListener('scroll', () => {
    updateActiveNav();
});

// Easter egg - click logo 5 times
let logoClicks = 0;
document.querySelector('.logo').addEventListener('click', () => {
    logoClicks++;
    if (logoClicks === 5) {
        unlockAchievement('Secret Discovered! 🎊');
        logoClicks = 0;
    }
});