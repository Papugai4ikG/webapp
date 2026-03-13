// Базовый класс для всех головоломок
class BasePuzzle {
  constructor(container, onComplete) {
    this.container = container; // Элемент <a-entity id="puzzle-container">
    this.onComplete = onComplete; // Колбэк при завершении
    this.items = [];
    this.score = 0;
    this.totalItems = 0;
    this.completed = false;
  }
  
  // Очистить контейнер перед загрузкой новой головоломки
  clear() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.items = [];
  }
  
  // Обновить прогресс в UI
  updateProgress() {
    document.getElementById('progress-bar').style.width = 
      `${(this.score / this.totalItems) * 100}%`;
    document.getElementById('score').textContent = `${this.score}/${this.totalItems}`;
  }
  
  // Показать подсказку (переопределяется в каждом типе)
  showHint() {
    console.log('Базовая подсказка');
  }
  
  // Сбросить головоломку
  reset() {
    this.score = 0;
    this.completed = false;
    this.updateProgress();
    this.load(); // Перезагружаем
  }
  
  // Загрузить головоломку (должен быть переопределен)
  load() {
    throw new Error('Метод load должен быть реализован!');
  }
}
