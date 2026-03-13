// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentPuzzle = null;
let selectedPuzzleId = 1;
let telegramIntegration = null;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
  // Инициализация Telegram
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.MainButton.hide();
    
    telegramIntegration = new TelegramIntegration();
  }
  
  // Выбираем первую головоломку по умолчанию
  selectPuzzle(1);
});

// ========== ВЫБОР ГОЛОВОЛОМКИ ==========
function selectPuzzle(id) {
  selectedPuzzleId = id;
  
  // Убираем выделение со всех карточек
  document.querySelectorAll('.puzzle-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Выделяем выбранную
  document.getElementById(`puzzle-${id}`).classList.add('selected');
}

// ========== ЗАПУСК ИГРЫ ==========
function startGame() {
  // Прячем меню
  document.getElementById('puzzle-menu').style.display = 'none';
  
  // Показываем игровой интерфейс
  document.getElementById('game-ui').style.display = 'block';
  
  // Получаем контейнер для головоломки
  const container = document.getElementById('puzzle-container');
  
  // Создаем нужную головоломку
  switch(selectedPuzzleId) {
    case 1:
      // Поиск предметов (базовая)
      currentPuzzle = new BasePuzzle(container, onPuzzleComplete);
      currentPuzzle.totalItems = 5;
      currentPuzzle.load = function() {
        this.clear();
        // Здесь код для создания предметов поиска
        const items = [
          { type: 'box', color: 'red', pos: '0 0.5 -1' },
          { type: 'sphere', color: 'blue', pos: '0.5 0.3 -0.8' },
          { type: 'cylinder', color: 'green', pos: '-0.4 0.4 -1.2' },
          { type: 'cone', color: 'yellow', pos: '0.2 0.6 -0.5' },
          { type: 'torus', color: 'purple', pos: '-0.3 0.7 -1.5' }
        ];
        
        items.forEach((item, index) => {
          const entity = document.createElement('a-entity');
          entity.setAttribute('geometry', `primitive: ${item.type}`);
          entity.setAttribute('material', `color: ${item.color}`);
          entity.setAttribute('position', item.pos);
          entity.setAttribute('class', 'clickable');
          entity.setAttribute('data-index', index);
          
          entity.addEventListener('click', () => {
            this.score++;
            entity.setAttribute('visible', false);
            this.updateProgress();
            
            if (this.score === this.totalItems) {
              this.complete();
            }
          });
          
          this.container.appendChild(entity);
        });
      };
      currentPuzzle.load();
      break;
      
    case 2:
      // Головоломка с вращением
      currentPuzzle = new RotationPuzzle(container, onPuzzleComplete);
      currentPuzzle.load();
      break;
      
    case 3:
      // Головоломка с цветами
      currentPuzzle = new ColorMatchingPuzzle(container, onPuzzleComplete);
      currentPuzzle.load();
      break;
      
    case 4:
      // Лабиринт
      currentPuzzle = new MazePuzzle(container, onPuzzleComplete);
      currentPuzzle.load();
      break;
  }
  
  // Обновляем подсказку
  document.getElementById('hint-text').textContent = 
    currentPuzzle.hintText || 'Начинаем игру!';
}

// ========== КОЛБЭК ЗАВЕРШЕНИЯ ==========
function onPuzzleComplete() {
  // Отправляем результат в Telegram
  if (telegramIntegration) {
    telegramIntegration.shareProgress(selectedPuzzleId, 100);
  }
  
  // Показываем кнопку возврата в меню
  setTimeout(() => {
    if (confirm('Головоломка пройдена! Хочешь попробовать другую?')) {
      backToMenu();
    }
  }, 2000);
}

// ========== УПРАВЛЕНИЕ ==========
function showHint() {
  if (currentPuzzle) {
    currentPuzzle.showHint();
  }
}

function resetPuzzle() {
  if (currentPuzzle) {
    currentPuzzle.reset();
  }
}

function backToMenu() {
  // Показываем меню
  document.getElementById('puzzle-menu').style.display = 'block';
  
  // Прячем игровой интерфейс
  document.getElementById('game-ui').style.display = 'none';
  
  // Очищаем AR сцену
  const container = document.getElementById('puzzle-container');
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  currentPuzzle = null;
}
