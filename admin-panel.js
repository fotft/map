// admin-panel.js
class AdminPanel {
    constructor() {
        this.isAuthenticated = false;
        this.currentType = null;
        this.init();
    }
    
    init() {
        this.createAdminUI();
        this.loadFromStorage();
    }
    
    createAdminUI() {
        // Кнопка входа в админку
        const adminBtn = document.createElement('button');
        adminBtn.className = 'btn admin-btn';
        adminBtn.innerHTML = '🔒';
        adminBtn.title = 'Админ-панель';
        adminBtn.onclick = () => this.showLoginModal();
        
        document.querySelector('.controls').appendChild(adminBtn);
        
        // Модальное окно для входа
        this.createLoginModal();
        // Модальное окно для добавления объектов
        this.createAddObjectModal();
    }
    
    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'admin-login-modal';
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <h3>Вход в админ-панель</h3>
                <input type="password" id="admin-password" placeholder="Пароль">
                <div class="admin-modal-buttons">
                    <button onclick="window.adminPanel.login()">Войти</button>
                    <button onclick="window.adminPanel.hideLoginModal()">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    createAddObjectModal() {
        const modal = document.createElement('div');
        modal.id = 'admin-add-modal';
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <h3>Добавить объект</h3>
                <div id="admin-form-container"></div>
                <div class="admin-modal-buttons">
                    <button onclick="window.adminPanel.saveObject()">Сохранить</button>
                    <button onclick="window.adminPanel.hideAddModal()">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showLoginModal() {
        document.getElementById('admin-login-modal').style.display = 'block';
    }
    
    hideLoginModal() {
        document.getElementById('admin-login-modal').style.display = 'none';
    }
    
    login() {
        const password = document.getElementById('admin-password').value;
        // Пароль можно хранить в зашифрованном виде или получать с сервера
        if (password === 'admin123') { // Замените на ваш пароль
            this.isAuthenticated = true;
            this.hideLoginModal();
            this.showAddButton();
            this.saveToStorage();
            alert('Успешный вход!');
        } else {
            alert('Неверный пароль');
        }
    }
    
    showAddButton() {
        let addBtn = document.querySelector('.admin-add-btn');
        if (!addBtn) {
            addBtn = document.createElement('button');
            addBtn.className = 'btn admin-add-btn';
            addBtn.innerHTML = '➕';
            addBtn.title = 'Добавить объект';
            addBtn.onclick = () => this.showTypeSelector();
            document.querySelector('.controls').appendChild(addBtn);
        }
        addBtn.style.display = 'block';
    }
    
    showTypeSelector() {
        const formContainer = document.getElementById('admin-form-container');
        formContainer.innerHTML = `
            <div class="admin-form-section">
                <label>Тип объекта:</label>
                <select id="admin-object-type" onchange="window.adminPanel.onTypeChange(this.value)">
                    <option value="">Выберите тип</option>
                    <option value="label">Метка</option>
                    <option value="road">Дорога</option>
                    <option value="building">Здание</option>
                    <option value="district">Район</option>
                    <option value="water">Водоём</option>
                    <option value="green_area">Зелёная зона</option>
                    <option value="parking">Парковка</option>
                </select>
            </div>
            <div id="admin-dynamic-form"></div>
        `;
        document.getElementById('admin-add-modal').style.display = 'block';
    }
    
    onTypeChange(type) {
        this.currentType = type;
        const formContainer = document.getElementById('admin-dynamic-form');
        
        switch(type) {
            case 'label':
                formContainer.innerHTML = this.getLabelForm();
                break;
            case 'road':
                formContainer.innerHTML = this.getRoadForm();
                break;
            case 'building':
                formContainer.innerHTML = this.getBuildingForm();
                break;
            case 'district':
                formContainer.innerHTML = this.getDistrictForm();
                break;
            case 'water':
                formContainer.innerHTML = this.getWaterForm();
                break;
            case 'green_area':
                formContainer.innerHTML = this.getGreenAreaForm();
                break;
            case 'parking':
                formContainer.innerHTML = this.getParkingForm();
                break;
        }
    }
    
    getLabelForm() {
        return `
            <div class="admin-form-section">
                <label>Название:</label>
                <input type="text" id="label-name" placeholder="Название метки">
            </div>
            <div class="admin-form-section">
                <label>Тип метки:</label>
                <select id="label-type">
                    <option value="shop">Магазин</option>
                    <option value="cafe">Кафе</option>
                    <option value="restaurant">Ресторан</option>
                    <option value="hospital">Больница</option>
                    <option value="school">Школа</option>
                    <option value="park">Парк</option>
                    <!-- Добавьте другие типы -->
                </select>
            </div>
            <div class="admin-form-section">
                <label>Уровень отображения:</label>
                <input type="number" id="label-level" value="1" min="0.1" max="15" step="0.1">
            </div>
            <div class="admin-form-section">
                <label>Координаты (X,Y,Z):</label>
                <div class="coord-input">
                    <input type="number" id="label-x" placeholder="X" step="0.01">
                    <input type="number" id="label-y" placeholder="Y" step="0.01">
                    <input type="number" id="label-z" placeholder="Z" step="0.01">
                </div>
                <button type="button" onclick="window.adminPanel.useCurrentPosition()">Использовать текущую позицию камеры</button>
            </div>
        `;
    }
    
    getRoadForm() {
        return `
            <div class="admin-form-section">
                <label>Название дороги:</label>
                <input type="text" id="road-name" placeholder="Название дороги">
            </div>
            <div class="admin-form-section">
                <label>Точки дороги (формат: x,y,z;x,y,z;...):</label>
                <textarea id="road-points" placeholder="Пример: 100,0,200;150,0,250;200,0,300" rows="4"></textarea>
                <small>Разделяйте точки точкой с запятой, координаты - запятой</small>
            </div>
            <div class="admin-form-section">
                <button type="button" onclick="window.adminPanel.startDrawingMode('road')">Режим рисования на карте</button>
            </div>
        `;
    }
    
    // Аналогичные методы для других типов объектов...
    
    useCurrentPosition() {
        // Используем текущую позицию камеры
        const x = -offsetX;
        const z = -offsetZ;
        const y = 0; // По умолчанию
        
        document.getElementById('label-x').value = x.toFixed(2);
        document.getElementById('label-y').value = y.toFixed(2);
        document.getElementById('label-z').value = z.toFixed(2);
    }
    
    startDrawingMode(type) {
        alert('Перейдите в режим рисования. Кликайте на карте для добавления точек. ESC - завершить.');
        this.drawingMode = type;
        this.drawingPoints = [];
        
        // Здесь нужно добавить обработчики для кликов по карте
        // Для простоты сделаем кнопку для добавления текущей позиции
        const addPointBtn = document.createElement('button');
        addPointBtn.textContent = 'Добавить текущую точку';
        addPointBtn.onclick = () => {
            const point = {
                x: -offsetX,
                y: 0,
                z: -offsetZ
            };
            this.drawingPoints.push(point);
            alert(`Добавлена точка ${this.drawingPoints.length}: ${point.x}, ${point.y}, ${point.z}`);
            
            // Обновляем текстовое поле
            const pointsText = this.drawingPoints.map(p => `${p.x},${p.y},${p.z}`).join(';');
            document.getElementById(`${type}-points`).value = pointsText;
        };
        
        document.getElementById('admin-dynamic-form').appendChild(addPointBtn);
    }
    
    saveObject() {
        if (!this.currentType) {
            alert('Выберите тип объекта');
            return;
        }
        
        switch(this.currentType) {
            case 'label':
                this.saveLabel();
                break;
            case 'road':
                this.saveRoad();
                break;
            // Обработка других типов...
        }
    }
    
    saveLabel() {
        const label = {
            address: "",
            name: document.getElementById('label-name').value,
            type: document.getElementById('label-type').value,
            level: parseFloat(document.getElementById('label-level').value),
            point: [
                parseFloat(document.getElementById('label-x').value),
                parseFloat(document.getElementById('label-y').value),
                parseFloat(document.getElementById('label-z').value)
            ]
        };
        
        // Добавляем в массив labels
        labels.push(new Label(
            label.address,
            label.name,
            label.type,
            label.level,
            createVector(label.point[0], label.point[1], label.point[2])
        ));
        
        // Сохраняем в JSON
        this.saveToJson('labels', label);
        this.hideAddModal();
        alert('Метка добавлена!');
    }
    
    saveRoad() {
        const pointsText = document.getElementById('road-points').value;
        const pointsArray = pointsText.split(';').map(p => {
            const coords = p.split(',').map(Number);
            return [coords[0], 0.01, coords[2]]; // Y всегда 0.01 для дорог
        });
        
        const road = {
            name: document.getElementById('road-name').value,
            points: pointsArray
        };
        
        // Добавляем в массив roads
        roads.push(new Road(
            road.name,
            pointsArray.map(p => createVector(p[0], p[1], p[2]))
        ));
        
        // Сохраняем в JSON
        this.saveToJson('roads', road);
        this.hideAddModal();
        alert('Дорога добавлена!');
        
        // Перестраиваем меш
        buildGlobalMesh();
    }
    
    saveToJson(type, data) {
        // В реальном приложении здесь должен быть запрос к серверу
        // Для демо сохраняем в localStorage
        const key = `new_${type}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        
        // Также можно сгенерировать JSON файл для скачивания
        this.generateJsonFile(type, existing);
    }
    
    generateJsonFile(type, data) {
        const jsonStr = JSON.stringify({ [type]: data }, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_new.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    hideAddModal() {
        document.getElementById('admin-add-modal').style.display = 'none';
    }
    
    loadFromStorage() {
        this.isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
        if (this.isAuthenticated) {
            this.showAddButton();
        }
    }
    
    saveToStorage() {
        localStorage.setItem('admin_authenticated', this.isAuthenticated);
    }
}

// Инициализация админ-панели
window.adminPanel = new AdminPanel();
