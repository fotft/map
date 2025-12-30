// ui-logic.js
// Цели для плавной анимации камеры
window.targetX = null;
window.targetZ = null;
window.isAnimating = false;
window.currentSearchResults = [];

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
    [labels, districts, buildings].forEach((arr, index) => {
        let type = '';
        if (index === 0) type = 'Метка';
        else if (index === 1) type = 'Район';
        else if (index === 2) type = 'Здание';
        
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
    } else if (obj.details && obj.details[0] && obj.details[0].down_points) {
        // Здания
        const firstPoint = obj.details[0].down_points[0];
        targetX = -firstPoint.x;
        targetZ = -firstPoint.z;
        targetZoom = 8; // Для зданий приближаем сильнее
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
        obj = [...labels, ...districts, ...buildings]
            .find(item => item.name && item.name.toLowerCase() === query.toLowerCase());
        
        // Если нет точного, ищем частичное
        if (!obj) {
            obj = [...labels, ...districts, ...buildings]
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