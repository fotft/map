// mobile-ui-fix.js
(function() {
  // Проверяем мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return;
  
  // Переменные для управления состоянием UI
  let isKeyboardVisible = false;
  let searchInput = null;
  let searchResults = null;
  
  // Инициализация при загрузке
  document.addEventListener('DOMContentLoaded', function() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // 1. Обработка кликов по результатам поиска
    document.addEventListener('click', function(e) {
      const resultItem = e.target.closest('.result-item');
      if (resultItem) {
        e.preventDefault();
        e.stopPropagation();
        
        // Находим индекс элемента
        const items = Array.from(searchResults.querySelectorAll('.result-item'));
        const index = items.indexOf(resultItem);
        
        if (index !== -1) {
          // Вызываем функцию выбора
          if (window.selectSearchResult) {
            window.selectSearchResult(index);
          }
        }
      }
    }, true); // Используем capture phase
    
    // 2. Обработка касаний для прокрутки результатов
    searchResults.addEventListener('touchstart', function(e) {
      e.stopPropagation(); // Останавливаем всплытие
    }, { passive: true });
    
    searchResults.addEventListener('touchmove', function(e) {
      e.stopPropagation(); // Останавливаем всплытие
    }, { passive: true });
    
    // 3. Обработка фокуса/потери фокуса поля ввода
    searchInput.addEventListener('focus', function() {
      isKeyboardVisible = true;
      // Показываем результаты если есть текст
      if (searchInput.value.length >= 2) {
        searchResults.style.display = 'block';
      }
    });
    
    searchInput.addEventListener('blur', function() {
      isKeyboardVisible = false;
      // Не скрываем сразу, даем время для клика по результатам
      setTimeout(() => {
        if (!isKeyboardVisible) {
          searchResults.style.display = 'none';
        }
      }, 200);
    });
    
    // 4. Обработка касания вне поля ввода
    document.addEventListener('touchstart', function(e) {
      const isSearchClick = e.target.closest('.search-container') || 
                           e.target.closest('#search-results') ||
                           e.target === searchInput;
      
      if (!isSearchClick) {
        // Скрываем клавиатуру и результаты
        searchInput.blur();
        searchResults.style.display = 'none';
        isKeyboardVisible = false;
      }
    });
    
    // 5. Обработка кнопок
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Визуальный фидбэк
        this.style.transform = 'scale(0.95)';
        this.style.opacity = '0.8';
        
        // Выполняем действие через короткую задержку
        setTimeout(() => {
          const action = this.getAttribute('onclick');
          if (action) {
            // Извлекаем имя функции из onclick
            const match = action.match(/^(\w+)\(/);
            if (match && window[match[1]]) {
              window[match[1]](e);
            }
          }
          
          // Возвращаем нормальное состояние
          setTimeout(() => {
            this.style.transform = '';
            this.style.opacity = '';
          }, 150);
        }, 50);
      }, { passive: false });
      
      btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
    });
    
    // 6. Предотвращаем масштабирование страницы жестами
    document.addEventListener('touchmove', function(e) {
      if (e.target.closest('#search-results') || 
          e.target.closest('.search-container') ||
          e.target.closest('.controls')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 7. Обработка клавиши "Готово" на клавиатуре
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        // Скрываем клавиатуру
        this.blur();
      }
    });
  });
  
  // Функция для закрытия клавиатуры
  window.closeKeyboard = function() {
    if (searchInput) {
      searchInput.blur();
      document.activeElement?.blur();
    }
    if (searchResults) {
      searchResults.style.display = 'none';
    }
    isKeyboardVisible = false;
  };
  
  // Функция для проверки, открыта ли клавиатура
  window.isKeyboardOpen = function() {
    return isKeyboardVisible;
  };
})();
