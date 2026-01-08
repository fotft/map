// ui-logic.js
// Цели для плавной анимации камеры
window.targetX = null;
window.targetZ = null;
window.isAnimating = false;
window.currentSearchResults = [];

// ui-logic.js - исправления для мобильных
(function() {
  // Глобальная переменная для отслеживания состояния касания
  let isTouchInteracting = false;
  
  // Переопределяем функцию navigateToObject для мобильных
  const originalNavigateToObject = window.navigateToObject;
  
  window.navigateToObject = function(obj) {
    console.log('Навигация к объекту на мобильном:', obj);
    
    if (!obj) return;
    
    // Устанавливаем флаг, что это взаимодействие с UI
    isTouchInteracting = true;
    
    // Определяем целевые координаты
    let targetX, targetZ;
    let targetZoom = 4; // Значение по умолчанию для мобильных
    
    if (obj.location) {
      targetX = -obj.location.x;
      targetZ = -obj.location.z;
      targetZoom = Math.max(3, Math.min(10, obj.level || 4));
    } else if (obj.center) {
      targetX = -obj.center.x;
      targetZ = -obj.center.z;
      targetZoom = 2;
    } else if (obj.base_location) {
      targetX = -obj.base_location.x;
      targetZ = -obj.base_location.z;
      targetZoom = 4;
    } else if (obj.road_center) {
      targetX = -obj.road_center.x;
      targetZ = -obj.road_center.z;
      targetZoom = 6;
    }
    
    // Немедленно устанавливаем значения камеры
    offsetX = targetX;
    offsetZ = targetZ;
    zoom = targetZoom;
    
    console.log('Камера установлена на мобильном:', { offsetX, offsetZ, zoom });
    
    // Сбрасываем флаг через короткое время
    setTimeout(() => {
      isTouchInteracting = false;
    }, 500);
  };
  
  // Отслеживаем события касания на карте
  if (typeof canvas !== 'undefined') {
    canvas.addEventListener('touchstart', function(e) {
      // Если было взаимодействие с UI, игнорируем первое движение
      if (isTouchInteracting) {
        isTouchInteracting = false;
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
  }
})();

// ui-logic.js - Дополнения для мобильных
(function() {
  // Проверяем мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // На мобильных устройствах увеличиваем минимальную высоту для клика
    document.addEventListener('DOMContentLoaded', function() {
      const style = document.createElement('style');
      style.textContent = `
        .result-item {
          min-height: 44px !important;
          cursor: pointer !important;
        }
        .result-item:active {
          background-color: var(--ui-hover) !important;
        }
      `;
      document.head.appendChild(style);
    });
  }
})();

// Обновление подсказок поиска
window.updateSearchSuggestions = function(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    const q = query.toLowerCase().trim();
    window.currentSearchResults = [];

    // Ищем во всех доступных массивах
    [labels, districts, metro, roads].forEach((arr, index) => {
        let type = '';
        if (index === 0) type = 'Метка';
        else if (index === 1) type = 'Район';
        else if (index === 2) type = 'Метро';
        else if (index === 3) type = 'Дорога';
        
        arr.forEach(item => {
            if (item.name && item.name.toLowerCase().includes(q)) {
                window.currentSearchResults.push({
                    name: item.name,
                    type: type,
                    object: item
                });
            }
        });
    });

    // Сортировка по релевантности
    window.currentSearchResults.sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q);
        const bStarts = b.name.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.length - b.name.length;
    });

    // Ограничиваем 10 результатами
    const suggestions = window.currentSearchResults.slice(0, 10);

    if (suggestions.length > 0) {
        resultsDiv.innerHTML = suggestions.map((s, index) => {
            return `
                <div class="result-item" 
                     onmousedown="event.stopPropagation(); selectSearchResult(${index})">
                    <div class="result-name">${highlightText(s.name, q)}</div>
                    <div class="result-type">${s.type}</div>
                </div>
            `;
        }).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
};

// Подсветка текста в результатах
function highlightText(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Обработчик выбора результата
window.selectSearchResult = function(index) {
    const item = window.currentSearchResults[index];
    if (!item) return;
    
    console.log('Выбран объект:', item.name, item.type);
    navigateToObject(item.object);
    
    // Закрываем выпадающий список
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-input').value = item.name;
};

// В функции navigateToObject найти это:
window.navigateToObject = function(obj) {
    console.log('Навигация к объекту:', obj);
    
    let targetX, targetZ;
    let targetZoom = 8; // Значение по умолчанию
    
    // Определяем координаты в зависимости от типа объекта
    if (obj.location) {
        // Метки
        targetX = -obj.location.x;
        targetZ = -obj.location.z;
        
        // Устанавливаем уровень зума в зависимости от level метки
        if (obj.level !== undefined && obj.level !== null) {
            if(obj.level <= 4) targetZoom = 4; else targetZoom = obj.level; // ← ВОТ ТУТ УСТАНАВЛИВАЕМ ЗУМ ИЗ УРОВНЯ МЕТКИ
            console.log('Установлен уровень зума из метки:', targetZoom);
        }
    } else if (obj.center) {
        // Районы
        targetX = -obj.center.x;
        targetZ = -obj.center.z;
        targetZoom = 1; // Для районов приближаем меньше
    } else if (obj.base_location) {
        targetX = -obj.base_location.x;
        targetZ = -obj.base_location.z;
        targetZoom = 4;
    } else if (obj.road_center) {
        targetX = -obj.road_center.x;
        targetZ = -obj.road_center.z;
        targetZoom = 8;
    } else {
        console.log('Не удалось определить координаты объекта');
        return;
    }
    
    // Ограничиваем целевой зум допустимыми пределами
    targetZoom = Math.max(0.1, Math.min(15.0, targetZoom));
    
    // УСТАНАВЛИВАЕМ НЕПОСРЕДСТВЕННО БЕЗ АНИМАЦИИ:
    offsetX = targetX;
    offsetZ = targetZ;
    zoom = targetZoom; // ← ВОТ ТУТ НЕПОСРЕДСТВЕННО УСТАНАВЛИВАЕМ ЗУМ
    
    console.log('Камера установлена:', { offsetX, offsetZ, zoom });
};

// Функция для обработки Enter в поле поиска
window.handleSearchEnter = function(event) {
    if (event.key === 'Enter') {
        const query = document.getElementById('search-input').value.trim();
        if (query.length < 2) return;
        
        // Находим первый подходящий объект
        let obj = null;
        
        // Сначала ищем точное совпадение
        obj = [...labels, ...districts, ...metro, ...roads]
            .find(item => item.name && item.name.toLowerCase() === query.toLowerCase());
        
        // Если нет точного, ищем частичное
        if (!obj) {
            obj = [...labels, ...districts, ...metro, ...roads]
                .find(item => item.name && item.name.toLowerCase().includes(query.toLowerCase()));
        }
        
        if (obj) {
            navigateToObject(obj);
            document.getElementById('search-results').style.display = 'none';
        } else {
            alert('Объект не найден');
        }
    }
};

// Обновляем анимацию камеры в основном цикле
window.updateCameraAnimation = function() {
    // Убрали плавность для гарантированного перемещения
};
