class ARPuzzle {
  constructor() {
    this.scene = document.querySelector('a-scene');
    this.container = document.querySelector('#puzzle-container');
    this.score = 0;
    this.totalItems = 5;
    this.foundItems = new Array(this.totalItems).fill(false);
    this.currentLevel = 1;
    this.puzzles = {
      1: {
        name: "Найди все геометрические фигуры",
        items: [
          { type: 'box', color: 'red', position: '0 0.5 -1', hint: 'Ищи красный куб' },
          { type: 'sphere', color: 'blue', position: '0.5 0.3 -0.8', hint: 'Голубая сфера где-то справа' },
          { type: 'cylinder', color: 'green', position: '-0.4 0.4 -1.2', hint: 'Зеленый цилиндр слева' },
          { type: 'cone', color: 'yellow', position: '0.2 0.6 -0.5', hint: 'Желтый конус близко' },
          { type: 'torus', color: 'purple', position: '-0.3 0.7 -1.5', hint: 'Фиолетовый тор вдалеке' }
        ]
      },
      2: {
        name: "Собери пирамиду",
        items: [
          { type: 'box', color: 'red', position: '0 0.1 0', size: '0.5 0.5 0.5' },
          { type: 'box', color: 'orange', position: '0 0.7 0', size: '0.4 0.4 0.4' },
          { type: 'box', color: 'yellow', position: '0 1.2 0', size: '0.3 0.3 0.3' },
          { type: 'box', color: 'green', position: '0 1.6 0', size: '0.2 0.2 0.2' },
          { type: 'box', color: 'blue', position: '0 1.9 0', size: '0.1 0.1 0.1' }
        ]
      }
    };
    
    this.init();
  }
  
  init() {
    this.loadLevel(this.currentLevel);
    this.setupEventListeners();
    this.updateUI();
  }
  
  loadLevel(level) {
    const puzzle = this.puzzles[level];
    if (!puzzle) return;
    
    document.querySelector('#hint-text').textContent = puzzle.name;
    this.createItems(puzzle.items);
  }
  
  createItems(items) {
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    items.forEach((item, index) => {
      const entity = document.createElement('a-entity');
      
      // Устанавливаем атрибуты в зависимости от типа
      entity.setAttribute('geometry', `primitive: ${item.type}`);
      entity.setAttribute('material', `color: ${item.color}; transparent: true; opacity: 0.8`);
      entity.setAttribute('position', item.position);
      
      if (item.size) {
        entity.setAttribute('scale', item.size);
      }
      
      // Добавляем анимацию для привлечения внимания
      entity.setAttribute('animation', {
        property: 'rotation',
        to: '0 360 0',
        loop: true,
        dur: 5000
      });
      
      // Добавляем обработчик клика
      entity.setAttribute('class', `clickable puzzle-item-${index}`);
      entity.setAttribute('data-index', index);
      
      this.container.appendChild(entity);
    });
    
    this.setupItemClickHandlers();
  }
  
  setupItemClickHandlers() {
    document.querySelectorAll('.clickable').forEach(item => {
      item.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        this.handleItemFound(index);
      });
    });
  }
  
  handleItemFound(index) {
    if (this.foundItems[index]) return;
    
    this.foundItems[index] = true;
    this.score++;
    
    // Визуальный эффект
    const item = document.querySelector(`[data-index="${index}"]`);
    item.setAttribute('material', 'opacity', 0.3);
    item.setAttribute('animation', '');
    
    // Эффект частиц
    this.createParticleEffect(item.getAttribute('position'));
    
    // Звуковой эффект (если поддерживается)
    this.playSound('success');
    
    this.updateUI();
    
    if (this.score === this.totalItems) {
      this.completeLevel();
    }
  }
  
  createParticleEffect(position) {
    // Создаем простой эффект частиц
    const particles = document.createElement('a-entity');
    particles.setAttribute('position', position);
    particles.setAttribute('particle-system', {
      preset: 'dust',
      color: '#FFD700',
      particleCount: 20,
      maxAge: 1
    });
    
    this.container.appendChild(particles);
    
    setTimeout(() => {
      particles.remove();
    }, 1000);
  }
  
  playSound(type) {
    // Используем Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // До
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }
  
  updateUI() {
    document.querySelector('#score').innerHTML = `🔍 Найдено: ${this.score}/${this.totalItems}`;
    document.querySelector('#progress-bar').style.width = `${(this.score / this.totalItems) * 100}%`;
  }
  
  completeLevel() {
    document.querySelector('#hint-text').textContent = '🎉 Уровень пройден! Переходим к следующему?';
    
    // Создаем конфетти
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        this.createParticleEffect(`${Math.random() - 0.5} ${Math.random()} ${-Math.random()}`);
      }, i * 50);
    }
    
    // Отправляем результат в Telegram
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: 'level_complete',
        level: this.currentLevel,
        score: this.score
      }));
    }
    
    // Переход на следующий уровень через 3 секунды
    setTimeout(() => {
      this.currentLevel++;
      if (this.puzzles[this.currentLevel]) {
        this.foundItems.fill(false);
        this.score = 0;
        this.loadLevel(this.currentLevel);
      } else {
        this.showVictory();
      }
    }, 3000);
  }
  
  showVictory() {
    document.querySelector('#hint-text').textContent = '🏆 Поздравляем! Вы прошли все уровни!';
  }
  
  setupEventListeners() {
    // Обработка ориентации
    window.addEventListener('deviceorientation', (e) => {
      // Можно использовать для дополнительных подсказок
    });
    
    // Обработка видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Пауза игры
      } else {
        // Возобновление
      }
    });
  }
}

// Функции для кнопок
function showHint() {
  const puzzle = window.puzzle;
  const unfoundIndex = puzzle.foundItems.findIndex(found => !found);
  
  if (unfoundIndex !== -1) {
    const hint = puzzle.puzzles[puzzle.currentLevel].items[unfoundIndex].hint;
    document.querySelector('#hint-text').textContent = `💡 ${hint}`;
    
    // Подсветка предмета
    const item = document.querySelector(`[data-index="${unfoundIndex}"]`);
    item.setAttribute('material', 'emissive', '#FFD700');
    item.setAttribute('material', 'emissiveIntensity', '0.5');
    
    setTimeout(() => {
      item.setAttribute('material', 'emissive', '#000000');
    }, 2000);
  }
}

function resetPuzzle() {
  window.puzzle.foundItems.fill(false);
  window.puzzle.score = 0;
  window.puzzle.loadLevel(window.puzzle.currentLevel);
  window.puzzle.updateUI();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
  
  window.puzzle = new ARPuzzle();
});
