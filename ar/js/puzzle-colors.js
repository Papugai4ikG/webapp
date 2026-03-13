// Головоломка на соответствие цветов
class ColorMatchingPuzzle extends BasePuzzle {
  constructor(container, onComplete) {
    super(container, onComplete);
    this.colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    this.totalItems = this.colors.length;
    this.matchedColors = [];
    this.selectedColor = null;
  }
  
  load() {
    this.clear();
    
    // Создаем цветные шары (для выбора)
    this.colors.forEach((color, index) => {
      // Располагаем по кругу
      const angle = (index / this.colors.length) * Math.PI * 2;
      const radius = 0.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const ball = document.createElement('a-entity');
      ball.setAttribute('geometry', 'primitive: sphere; radius: 0.2');
      ball.setAttribute('material', `color: ${color}; emissive: ${color}; emissiveIntensity: 0.2`);
      ball.setAttribute('position', `${x} 0.3 ${z}`);
      ball.setAttribute('class', 'clickable color-ball');
      ball.setAttribute('data-color', color);
      ball.setAttribute('data-type', 'ball');
      
      // Анимация покачивания
      ball.setAttribute('animation', {
        property: 'position',
        to: `${x} 0.4 ${z}`,
        loop: true,
        dur: 1500,
        dir: 'alternate'
      });
      
      ball.addEventListener('click', () => this.selectColor(color, ball));
      this.container.appendChild(ball);
    });
    
    // Создаем цели (платформы)
    this.colors.forEach((color, index) => {
      // Располагаем цели внутри круга
      const angle = (index / this.colors.length) * Math.PI * 2 + 0.5;
      const radius = 0.4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const target = document.createElement('a-entity');
      target.setAttribute('geometry', 'primitive: cylinder; radius: 0.25; height: 0.1');
      target.setAttribute('material', `color: ${color}; transparent: true; opacity: 0.3`);
      target.setAttribute('position', `${x} 0.1 ${z}`);
      target.setAttribute('class', 'clickable color-target');
      target.setAttribute('data-color', color);
      target.setAttribute('data-type', 'target');
      
      // Добавляем свечение
      const glow = document.createElement('a-entity');
      glow.setAttribute('geometry', 'primitive: ring; radiusInner: 0.2; radiusOuter: 0.3');
      glow.setAttribute('material', `color: ${color}; transparent: true; opacity: 0.5`);
      glow.setAttribute('position', '0 0.05 0');
      glow.setAttribute('rotation', '-90 0 0');
      target.appendChild(glow);
      
      target.addEventListener('click', () => this.placeColor(color, target));
      this.container.appendChild(target);
    });
    
    // Добавляем центральный элемент
    const center = document.createElement('a-entity');
    center.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
    center.setAttribute('material', 'color: white; emissive: #333');
    center.setAttribute('position', '0 0.2 0');
    this.container.appendChild(center);
    
    this.updateProgress();
  }
  
  selectColor(color, element) {
    // Сбрасываем подсветку у всех шаров
    document.querySelectorAll('.color-ball').forEach(ball => {
      ball.setAttribute('material', 'emissiveIntensity', '0.2');
    });
    
    // Подсвечиваем выбранный
    element.setAttribute('material', 'emissiveIntensity', '0.8');
    this.selectedColor = color;
    
    document.getElementById('hint-text').textContent = 
      `Выбран цвет: ${this.getColorName(color)}. Нажми на цель того же цвета`;
  }
  
  placeColor(color, target) {
    if (!this.selectedColor) {
      document.getElementById('hint-text').textContent = 'Сначала выбери шар!';
      return;
    }
    
    if (this.matchedColors.includes(color)) {
      document.getElementById('hint-text').textContent = 'Этот цвет уже подобран!';
      return;
    }
    
    if (this.selectedColor === color) {
      // Правильно!
      this.matchedColors.push(color);
      this.score++;
      
      // Находим соответствующий шар и прячем его
      const ball = document.querySelector(`[data-color="${color}"][data-type="ball"]`);
      if (ball) {
        ball.setAttribute('animation', '');
        ball.setAttribute('scale', '0 0 0');
        this.createSuccessEffect(ball.getAttribute('position'));
      }
      
      // Изменяем внешний вид цели
      target.setAttribute('material', 'opacity', '1');
      target.querySelector('a-entity').setAttribute('material', 'opacity', '1');
      
      this.updateProgress();
      
      if (this.score === this.totalItems) {
        this.complete();
      } else {
        this.selectedColor = null;
        document.getElementById('hint-text').textContent = 'Отлично! Выбери следующий цвет';
      }
    } else {
      // Неправильно
      document.getElementById('hint-text').textContent = 
        `Неправильно! Нужно ${this.getColorName(this.selectedColor)} на цель ${this.getColorName(color)}`;
      
      // Эффект ошибки
      target.setAttribute('material', 'color', 'red');
      setTimeout(() => {
        target.setAttribute('material', `color: ${color}`);
      }, 500);
    }
  }
  
  getColorName(color) {
    const names = {
      red: 'красный',
      blue: 'синий',
      green: 'зеленый',
      yellow: 'желтый',
      purple: 'фиолетовый'
    };
    return names[color] || color;
  }
  
  createSuccessEffect(position) {
    // Эффект частиц
    const particles = document.createElement('a-entity');
    particles.setAttribute('position', position);
    particles.setAttribute('particle-system', {
      preset: 'dust',
      color: '#FFD700',
      particleCount: 20,
      maxAge: 0.5
    });
    this.container.appendChild(particles);
    
    setTimeout(() => particles.remove(), 500);
  }
  
  complete() {
    this.completed = true;
    document.getElementById('hint-text').textContent = '🎉 Поздравляем! Ты собрал все цвета!';
    
    // Создаем финальный эффект
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createSuccessEffect(`${Math.random() - 0.5} 0.5 ${Math.random() - 0.5}`);
      }, i * 100);
    }
    
    if (this.onComplete) this.onComplete();
  }
  
  showHint() {
    // Находим первый неподобранный цвет
    const remaining = this.colors.find(c => !this.matchedColors.includes(c));
    if (remaining) {
      document.getElementById('hint-text').textContent = 
        `Ищи ${this.getColorName(remaining)} шар и цель!`;
      
      // Подсвечиваем нужный шар
      const ball = document.querySelector(`[data-color="${remaining}"][data-type="ball"]`);
      if (ball) {
        ball.setAttribute('material', 'emissiveIntensity', '1');
        ball.setAttribute('material', 'emissive', '#FFFFFF');
        setTimeout(() => {
          ball.setAttribute('material', 'emissive', remaining);
          ball.setAttribute('material', 'emissiveIntensity', '0.2');
        }, 2000);
      }
    }
  }
}
