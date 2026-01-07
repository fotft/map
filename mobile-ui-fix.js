// mobile-ui-fix.js - ОБНОВЛЕННАЯ ВЕРСИЯ
(function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return;
  
  let isKeyboardVisible = false;
  let searchInput = null;
  let searchResults = null;
  let ignoreNextBlur = false;
  
  document.addEventListener('DOMContentLoaded', function() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // 1. ПРАВИЛЬНАЯ ОБРАБОТКА КНОПОК - предотвращаем случайное движение карты
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      // Удаляем старые обработчики событий
      btn.removeAttribute('onclick');
      btn.removeAttribute('ontouchstart');
      btn.removeAttribute('ontouchend');
      
      // Добавляем новые обработчики с предотвращением всех действий карты
      btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        this.style.transform = 'scale(0.95)';
        this.style.opacity = '0.8';
      }, { passive: false });
      
      btn.addEventListener('touchmove', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }, { passive: false });
      
      btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        this.style.transform = '';
        this.style.opacity = '';
        
        // Определяем действие кнопки и выполняем
        const action = this.getAttribute('title');
        setTimeout(() => {
          if (action === 'Сменить тему') {
            toggleMapTheme();
          } else if (action === 'На спаун') {
            resetView();
          } else if (action === 'На север') {
            rotateNorth();
          }
        }, 10);
      }, { passive: false });
      
      // Блокируем все остальные события
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      });
      
      btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      });
    });
    
    // 2. ОБРАБОТКА ВЫПАДАЮЩЕГО СПИСКА
    // Используем делегирование событий для результатов поиска
    searchResults.addEventListener('touchstart', function(e) {
      e.stopPropagation();
      const resultItem = e.target.closest('.result-item');
      if (resultItem) {
        e.preventDefault();
        resultItem.style.backgroundColor = 'var(--ui-hover)';
        // Пока не скрываем клавиатуру при касании
      }
    }, { passive: false });
    
    searchResults.addEventListener('touchmove', function(e) {
      e.stopPropagation();
      e.preventDefault(); // Предотвращаем скролл карты при прокрутке списка
    }, { passive: false });
    
    searchResults.addEventListener('touchend', function(e) {
      e.stopPropagation();
      const resultItem = e.target.closest('.result-item');
      if (resultItem) {
        e.preventDefault();
        
        // Находим индекс элемента
        const items = Array.from(searchResults.querySelectorAll('.result-item'));
        const index = items.indexOf(resultItem);
        
        if (index !== -1 && window.selectSearchResult) {
          // Восстанавливаем цвет
          resultItem.style.backgroundColor = '';
          
          // Устанавливаем флаг, чтобы blur не скрыл результаты сразу
          ignoreNextBlur = true;
          
          // Вызываем функцию выбора с небольшой задержкой
          setTimeout(() => {
            window.selectSearchResult(index);
            // Закрываем клавиатуру после выбора
            closeKeyboard();
          }, 50);
        }
      }
    }, { passive: false });
    
    // 3. Обработка фокуса/потери фокуса
    searchInput.addEventListener('focus', function() {
      isKeyboardVisible = true;
      ignoreNextBlur = false;
      if (searchInput.value.length >= 2) {
        searchResults.style.display = 'block';
      }
    });
    
    searchInput.addEventListener('blur', function() {
      if (ignoreNextBlur) {
        ignoreNextBlur = false;
        return;
      }
      
      isKeyboardVisible = false;
      // Даем время для выбора результата перед скрытием
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
                           e.target === searchInput ||
                           e.target.closest('.btn');
      
      if (!isSearchClick) {
        closeKeyboard();
      }
    });
    
    // 5. Предотвращаем масштабирование страницы жестами в элементах UI
    document.addEventListener('touchmove', function(e) {
      if (e.target.closest('.search-container') || 
          e.target.closest('#search-results') ||
          e.target.closest('.controls')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 6. Обработка клавиши "Готово" на клавиатуре
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        // Выполняем поиск и закрываем клавиатуру
        window.handleSearchEnter(e);
        this.blur();
      }
    });
  });
  
  window.closeKeyboard = function() {
    if (searchInput) {
      searchInput.blur();
    }
    if (searchResults) {
      searchResults.style.display = 'none';
    }
    isKeyboardVisible = false;
  };
  
  window.isKeyboardOpen = function() {
    return isKeyboardVisible;
  };
})();
