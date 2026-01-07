// mobile-ui-fix.js - ОБНОВЛЕННАЯ ВЕРСИЯ
(function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return;
  
  let isKeyboardVisible = false;
  let searchInput = null;
  let searchResults = null;
  
  document.addEventListener('DOMContentLoaded', function() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    
    // 1. ОБНОВЛЕНИЕ: Правильная обработка кнопок
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      // Удаляем старые обработчики
      btn.removeAttribute('onclick');
      btn.removeAttribute('ontouchstart');
      btn.removeAttribute('ontouchend');
      
      // Добавляем новые обработчики событий
      btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.transform = 'scale(0.95)';
        this.style.opacity = '0.8';
      }, { passive: false });
      
      btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.transform = '';
        this.style.opacity = '';
        
        // Выполняем действие кнопки
        const action = this.getAttribute('title');
        setTimeout(() => {
          if (action === 'Сменить тему') {
            toggleMapTheme();
          } else if (action === 'На спаун') {
            resetView();
          } else if (action === 'На север') {
            rotateNorth();
          }
        }, 50);
      }, { passive: false });
    });
    
    // 2. ОБНОВЛЕНИЕ: Исправление выпадающего списка
    searchResults.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    }, { passive: false });
    
    searchResults.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    }, { passive: false });
    
    // 3. Обработка фокуса/потери фокуса
    searchInput.addEventListener('focus', function() {
      isKeyboardVisible = true;
      if (searchInput.value.length >= 2) {
        searchResults.style.display = 'block';
      }
    });
    
    searchInput.addEventListener('blur', function() {
      isKeyboardVisible = false;
      setTimeout(() => {
        if (!isKeyboardVisible) {
          searchResults.style.display = 'none';
        }
      }, 300); // Увеличиваем задержку для клика по результатам
    });
    
    // 4. Обработка касания вне поля ввода
    document.addEventListener('touchstart', function(e) {
      const isSearchClick = e.target.closest('.search-container') || 
                           e.target.closest('#search-results') ||
                           e.target === searchInput ||
                           e.target.closest('.btn'); // Добавляем кнопки
      
      if (!isSearchClick) {
        closeKeyboard();
      }
    });
    
    // 5. ОБНОВЛЕНИЕ: Обработка кликов по результатам поиска
    document.addEventListener('touchstart', function(e) {
      const resultItem = e.target.closest('.result-item');
      if (resultItem) {
        e.preventDefault();
        e.stopPropagation();
        
        // Визуальный фидбэк
        resultItem.style.backgroundColor = 'var(--ui-hover)';
        
        // Находим индекс элемента
        const items = Array.from(searchResults.querySelectorAll('.result-item'));
        const index = items.indexOf(resultItem);
        
        if (index !== -1 && window.selectSearchResult) {
          // Восстанавливаем цвет через время
          setTimeout(() => {
            resultItem.style.backgroundColor = '';
          }, 200);
          
          // Вызываем функцию выбора с небольшой задержкой
          setTimeout(() => {
            window.selectSearchResult(index);
          }, 100);
        }
      }
    }, { passive: false });
    
    // 6. Предотвращаем масштабирование страницы жестами
    document.addEventListener('touchmove', function(e) {
      if (e.scale !== 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 7. Обработка клавиши "Готово" на клавиатуре
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        this.blur();
      }
    });
  });
  
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
  
  window.isKeyboardOpen = function() {
    return isKeyboardVisible;
  };
})();