let gl;

let font, boldFont;

let theme = "dark";
let zoom = 4;

let offsetX = -8;
let offsetZ = 317;
let offsetY = 0;

let angleX = Math.PI/2;
let angleY = 0;

let metro_entrances_level = 5;

let hoveredArea3D = null,
    selectedArea3D = null;

let prevTouch1, prevTouch2;

let dragStartedOnUI = false;
let touchStartedOnUI = false;

let alleys = [],
    buildings = [],
    detalised_buildings = [],
    districts = [],
    fields = [],
    governments = [],
    green_areas = [],
    hospitals = [],
    labels = [],
    metro = [],
    parkings = [],
    railways = [],
    roads = [],
    sidewalks = [],
    underlays = [],
    waters = [];

let json_alleys = [],
    json_buildings = [],
    json_detalised_buildings = [],
    json_districts = [],
    json_fields = [],
    json_governments = [],
    json_green_areas = [],
    json_hospitals = [],
    json_labels = [],
    json_metro = [],
    json_parkings = [],
    json_railways = [],
    json_roads = [],
    json_sidewalks = [],
    json_underlays = [],
    json_waters = [];

let json_alleys_root,
    json_buildings_root,
    json_detalised_buildings_root,
    json_districts_root,
    json_fields_root,
    json_governments_root,
    json_green_areas_root,
    json_hospitals_root,
    json_labels_root,
    json_metro_root,
    json_parkings_root,
    json_railways_root,
    json_roads_root,
    json_sidewalks_root,
    json_underlays_root,
    json_water_root;

const ICONS = {}

let alleyClr,
    buildingClr,
    districtClr,
    fieldClr,
    governmentClr,
    greenAreaClr,
    hospitalClr,
    roadClr,
    parkingClr,
    underlayClr,
    waterClr;

// В файле global.js

function isPointVisible(p) {
    // Получаем экранные координаты
    let sp = screenPosition(p.x, p.y, p.z);

    // Если Z отрицательный, точка часто находится ЗА камерой.
    // Однако в некоторых ситуациях p5 может давать положительный Z сзади.
    // Поэтому самая надежная проверка для WebGL карт:
    // Просто проверяем, не улетела ли точка слишком далеко за пределы экрана по X/Y.
    
    // Большой запас (margin), чтобы метка не исчезала, пока хоть край иконки виден
    let margin = 200; 

    // Проверяем только X и Y. 
    // Если screenPosition выдаст бред из-за того, что точка за спиной, 
    // координаты обычно будут огромными (например, -10000), и этот check их отсеет.
    if (sp.x < -margin || sp.x > width + margin) return false;
    if (sp.y < -margin || sp.y > height + margin) return false;

    return true;
}

// Обертки на случай, если они используются где-то еще в коде по отдельности
function screenX(x, y, z) { return screenPosition(x, y, z).x; }
function screenY(x, y, z) { return screenPosition(x, y, z).y; }
function screenZ(x, y, z) { return screenPosition(x, y, z).z; }

function pointInPolygon2D(poly, x, y) {
    let c = false;
    let n = poly.length;
    for (let i = 0, j = n-1; i < n; j = i++) {
        let pi = poly[i];
        let pj = poly[j];
        if ( ((pi.y>y) != (pj.y>y)) &&
             (x < (pj.x-pi.x) * (y-pi.y) / (pj.y-pi.y) + pi.x) )
            c = !c;
    }
    return c;
}

function drawPolygon(points) {
    beginShape();
    for (let p of points) {
        vertex(p.x, p.y, p.z);
    }
    endShape(CLOSE);
}

function updateHover() 
{
    hoveredArea3D = null;
    let bestDist = 1e9;
    // helper to test an area3D (building/hospital/government)
    // returns centroid screen PVector and whether mouse is inside
    for (let bi = 0; bi < buildings.length; bi++) {
        let b = buildings[bi];
        for (let d = 0; d < b.details.length; d++) {
            let down = b.details[d].down_points;
            let up = b.details[d].up_points;
            let poly = [];
            for (let k = 0; k < down.length; k++) {
                let p = down[k];
                poly.push(createVector(screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z)));
            }
            let inside = pointInPolygon2D(poly, mouseX, mouseY);
            if (!inside) {
                poly = [];
                for (let k = 0; k < up.length; k++) {
                    let p = up[k];
                    poly.push(createVector(screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z)));
                }
                inside = pointInPolygon2D(poly, mouseX, mouseY);
            }
            if (!inside) {
                // check walls
                for (let k = 0; k < down.length && !inside; k++) {
                    let p1 = down[k];
                    let p2 = down[(k+1)%down.length];
                    let p3 = up[(k+1)%up.length];
                    let p4 = up[k];
                    let wall = [];
                    wall.push(createVector(screenX(p1.x,p1.y,p1.z), screenY(p1.x,p1.y,p1.z)));
                    wall.push(createVector(screenX(p2.x,p2.y,p2.z), screenY(p2.x,p2.y,p2.z)));
                    wall.push(createVector(screenX(p3.x,p3.y,p3.z), screenY(p3.x,p3.y,p3.z)));
                    wall.push(createVector(screenX(p4.x,p4.y,p4.z), screenY(p4.x,p4.y,p4.z)));
                    if (pointInPolygon2D(wall, mouseX, mouseY)) { inside = true; break; }
                }
            }
            if (inside) {
                // compute centroid screen pos of down polygon
                let cx = 0; let cy = 0;
                for (let k = 0; k < poly.length; k++) { cx += poly[k].x; cy += poly[k].y; }
                if (poly.length > 0) { cx /= poly.length; cy /= poly.length; }
                let d2 = dist(cx, cy, mouseX, mouseY);
                if (d2 < bestDist) { bestDist = d2; hoveredArea3D = b; }
            }
        }
    }
    // hospitals
    for (let bi = 0; bi < hospitals.length; bi++) {
        let b = hospitals[bi];
        for (let d = 0; d < b.details.length; d++) {
            let down = b.details[d].down_points;
            let up = b.details[d].up_points;
            let poly = [];
            for (let k = 0; k < down.length; k++) {
                let p = down[k];
                poly.push(createVector(screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z)));
            }
            let inside = pointInPolygon2D(poly, mouseX, mouseY);
            if (!inside) {
                poly = [];
                for (let k = 0; k < up.length; k++) {
                    let p = up[k];
                    poly.push(createVector(screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z)));
                }
                inside = pointInPolygon2D(poly, mouseX, mouseY);
            }
            if (!inside) {
                for (let k = 0; k < down.length && !inside; k++) {
                    let p1 = down[k];
                    let p2 = down[(k+1)%down.length];
                    let p3 = up[(k+1)%up.length];
                    let p4 = up[k];
                    let wall = [];
                    wall.push(createVector(screenX(p1.x,p1.y,p1.z), screenY(p1.x,p1.y,p1.z)));
                    wall.push(createVector(screenX(p2.x,p2.y,p2.z), screenY(p2.x,p2.y,p2.z)));
                    wall.push(createVector(screenX(p3.x,p3.y,p3.z), screenY(p3.x,p3.y,p3.z)));
                    wall.push(createVector(screenX(p4.x,p4.y,p4.z), screenY(p4.x,p4.y,p4.z)));
                    if (pointInPolygon2D(wall, mouseX, mouseY)) { inside = true; break; }
                }
            }
            if (inside) {
                let cx = 0; let cy = 0;
                for (let k = 0; k < poly.length; k++) { cx += poly[k].x; cy += poly[k].y; }
                if (poly.length > 0) { cx /= poly.length; cy /= poly.length; }
                let d2 = dist(cx, cy, mouseX, mouseY);
                if (d2 < bestDist) { bestDist = d2; hoveredArea3D = b; }
            }
        }
    }
    // governments
    for (let bi = 0; bi < governments.length; bi++) {
        let b = governments[bi];
        for (let d = 0; d < b.details.length; d++) {
            let down = b.details[d].down_points;
            let up = b.details[d].up_points;
            let poly = [];
            for (let k = 0; k < down.length; k++) {
                let p = down[k];
                poly.push(createVector(screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z)));
            }
            let inside = pointInPolygon2D(poly, mouseX, mouseY);
            if (!inside) {
                poly = [];
                for (let k = 0; k < up.length; k++) {
                    let p = up[k];
                    poly.push(createVector(screenX(p.x,p.y,p.z), screenY(p.x,p.y,p.z)));
                }
                inside = pointInPolygon2D(poly, mouseX, mouseY);
            }
            if (!inside) {
                for (let k = 0; k < down.length && !inside; k++) {
                    let p1 = down[k];
                    let p2 = down[(k+1)%down.length];
                    let p3 = up[(k+1)%up.length];
                    let p4 = up[k];
                    let wall = [];
                    wall.push(createVector(screenX(p1.x,p1.y,p1.z), screenY(p1.x,p1.y,p1.z)));
                    wall.push(createVector(screenX(p2.x,p2.y,p2.z), screenY(p2.x,p2.y,p2.z)));
                    wall.push(createVector(screenX(p3.x,p3.y,p3.z), screenY(p3.x,p3.y,p3.z)));
                    wall.push(createVector(screenX(p4.x,p4.y,p4.z), screenY(p4.x,p4.y,p4.z)));
                    if (pointInPolygon2D(wall, mouseX, mouseY)) { inside = true; break; }
                }
            }
            if (inside) {
                let cx = 0; let cy = 0;
                for (let k = 0; k < poly.length; k++) { cx += poly[k].x; cy += poly[k].y; }
                if (poly.length > 0) { cx /= poly.length; cy /= poly.length; }
                let d2 = dist(cx, cy, mouseX, mouseY);
                if (d2 < bestDist) { bestDist = d2; hoveredArea3D = b; }
            }
        }
    }
}

function mouseWheel(event) {
    if (event.target.closest('.search-container') || event.target.closest('.controls')) {
        return;
    }
    let sensitivity = 1.0 / zoom;
    let zoomSpeed = 0.1; // 0.05
    let e = Math.sign(event.delta);
    let oldZoom = zoom;
    zoom *= 1 - e * zoomSpeed;
    zoom = constrain(zoom, 0.1, 15.0);

    let deltaZoom = zoom - oldZoom;

    // Нормализованные координаты мыши относительно центра экрана
    let normX = (mouseX - width / 2.0) / width;
    let normZ = (mouseY - height / 2.0) / height;

    // Сглаживание смещения с более сильным уменьшением при большом zoom
    let smoothingFactor = 1.0 / Math.pow(zoom, 1.5);

    // Считаем относительное смещение по X и Z с учётом масштаба и сглаживания
    let deltaX = -normX * deltaZoom * width * smoothingFactor;
    let deltaZ = -normZ * deltaZoom * height * smoothingFactor;

    // Учёт поворота, чтобы смещения соответствовали углу поворота и не инвертировали управление
    let cosY = Math.cos(angleY);
    let sinY = Math.sin(angleY);
    offsetX += (deltaZ * sinY + deltaX * cosY) * sensitivity;
    offsetZ -= (deltaZ * cosY - deltaX * sinY) * sensitivity;
    
}

let isDragging = false;
let dragThreshold = 1;  // пикселей — порог, чтобы отличить клик от драга
let dragStartX, dragStartY;

function mousePressed() {
    if (event.target.closest('.search-container') || event.target.closest('.controls')) {
        dragStartedOnUI = true;
        return;
    }
    dragStartedOnUI = false;
    if (mouseButton != LEFT) return;

    dragStartX = mouseX;
    dragStartY = mouseY;
    isDragging = false;

    // Проверяем клик по метке района — это всегда приоритет
    for (let d of districts) {
        if (d.isLabelClicked() && (zoom < 1) && (zoom >= 0.25)) {
            activeDistrict = (activeDistrict == d) ? null : d;
            // НЕ ставим return! Пусть дальше идёт логика клика
            // Но помечаем, что это был клик по метке
            isDragging = false;
            return; // ← всё-таки оставляем return, но теперь всё будет ок
        }
    }

    // Если клик не по метке — это потенциальный драг или клик в пустоту
    // Ничего не делаем пока
}

function mouseDragged() {
    if (dragStartedOnUI || event.target.closest('.search-container') || event.target.closest('.controls')) {
        return;
    }
    if (mouseButton != LEFT) return;

    // Если смещение больше порога — это точно драг
    if (!isDragging && dist(dragStartX, dragStartY, mouseX, mouseY) > dragThreshold) {
        isDragging = true;
    }

    // Обычное перетаскивание карты
    let sensitivity = 1 / zoom;
    let deltaX = mouseX - pmouseX;
    let deltaY = mouseY - pmouseY;

    if (keyPressed && keyIsDown(CONTROL)) {
        angleY -= deltaX * 0.005;
        angleX -= deltaY * 0.005;
        angleX = constrain(angleX, Math.PI/2, Math.PI/1.25);
    } else {
        let cosY = Math.cos(angleY);
        let sinY = Math.sin(angleY);
        offsetX += (deltaY * sinY + deltaX * cosY) * sensitivity;
        offsetZ -= (deltaY * cosY - deltaX * sinY) * sensitivity;
    }
}

function mouseReleased() {
    if (mouseButton != LEFT) return;

    // Если было перетаскивание — ничего не делаем с выделением
    if (isDragging) {
        isDragging = false;
        return;
    }

    // Если не было движения — это был чистый клик
    if (dist(dragStartX, dragStartY, mouseX, mouseY) <= dragThreshold) {
        // И если при этом не кликнули по метке района — снимаем выделение
        // (но если кликнули по метке — мы уже переключили activeDistrict в mousePressed)
        let clickedOnLabel = false;
        for (let d of districts) {
            if (d.isLabelClicked()) {
                clickedOnLabel = true;
                break;
            }
        }
        if (!clickedOnLabel) {
            activeDistrict = null;  // клик в пустоту
        }
    }

    isDragging = false;
}

function keyPressed() {
    if (key === 'q') {
        if (theme === "light") theme = "dark";
        else theme = "light";
        applyTheme();
        buildGlobalMesh();
        /*
        if (darkTheme) {
            buildingR = 55;
            buildingG = 68;
            buildingB = 91;
            hospitalR = 71;
            hospitalG = 66;
            hospitalB = 81;
            governmentR = 54;
            governmentG = 64;
            governmentB = 96;
            greenAreaR = 28;
            greenAreaG = 68;
            greenAreaB = 64;
            fieldR = 42;
            fieldG = 85;
            fieldB = 80;
            waterR = 0;
            waterG = 21;
            waterB = 97;
            roadR = 83;
            roadG = 102;
            roadB = 143;
            parkingR = 38;
            parkingG = 47;
            parkingB = 66;
            underlayR = 43;
            underlayG = 52;
            underlayB = 85;
            alleyR = 68;
            alleyG = 85;
            alleyB = 125;
        } else {
            buildingR = 232;
            buildingG = 223;
            buildingB = 219;
            hospitalR = 244;
            hospitalG = 218;
            hospitalB = 226;
            governmentR = 226;
            governmentG = 224;
            governmentB = 234;
            greenAreaR = 205;
            greenAreaG = 236;
            greenAreaB = 178;
            fieldR = 199;
            fieldG = 219;
            fieldB = 184;
            waterR = 148;
            waterG = 212;
            waterB = 250;
            roadR = 192;
            roadG = 199;
            roadB = 213;
            parkingR = 192;
            parkingG = 199;
            parkingB = 213;
            underlayR = 249;
            underlayG = 248;
            underlayB = 247;
            alleyR = 192;
            alleyG = 199;
            alleyB = 213;
        }*/
    }
    if (key === 'w') {
        activeDistrict = null;  // Скрываем все районы
        key = 0;  // Чтобы Processing не закрыл окно
    }
}

function mouseClicked() {
    // Если клик в области поиска, не блокировать
    if (event.target.closest('.search-container')) {
        return false;
    }
    return true;
}

// Отключаем клики p5.js на UI элементах
function preventP5Mouse() {
    let searchEl = document.querySelector('.search-container');
    if (searchEl) {
        searchEl.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        searchEl.addEventListener('mouseup', function(e) {
            e.stopPropagation();
        });
        searchEl.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

function applyTheme() {

    if (theme === "dark") {
        alleyClr = color(68, 85, 125)
        buildingClr = color(55, 68, 91);
        districtClr = color(148, 57, 80);
        hospitalClr = color(66, 61, 76);
        governmentClr = color(54, 64, 101);
        greenAreaClr = color(28, 68, 64);
        fieldClr = color(42, 85, 80);
        waterClr = color(0, 21, 97);
        parkingClr = color(73, 92, 133);
        roadClr = color(83, 102, 143);
        underlayClr = color(40, 49, 68);
    } else {
        alleyClr = color(202, 209, 223)
        buildingClr = color(227, 218, 214);
        districtClr = color(224, 141, 151);
        hospitalClr = color(239, 213, 221);
        governmentClr = color(221, 219, 229);
        greenAreaClr = color(205, 236, 178);
        fieldClr = color(199, 219, 184);
        waterClr = color(148, 212, 250);
        parkingClr = color(182, 189, 203);
        roadClr = color(192, 199, 213);
        underlayClr = color(249, 248, 247);
    }

    // --- apply new RGB values to all objects ---
    for (let b of buildings) { b.clr = buildingClr }
    for (let d of districts) { d.clr = districtClr }
    for (let h of hospitals) { h.clr = hospitalClr }
    for (let g of governments) { g.clr = governmentClr }
    for (let ga of green_areas) { ga.clr = greenAreaClr }
    for (let f of fields) { f.clr = fieldClr }
    for (let w of waters) { w.clr = waterClr }
    for (let r of roads) { r.clr = roadClr }
    for (let p of parkings) { p.clr = parkingClr }
    for (let u of underlays) { u.clr = underlayClr }
    for (let a of alleys) { a.clr = alleyClr }
}

// Добавьте в начало global.js
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Обновите функцию touchStarted:
function touchStarted() {
    // Исправляем определение элемента под касанием
    if (touches.length > 0) {
        const touch = touches[0];
        // Получаем элемент по координатам касания
        const element = document.elementFromPoint(touch.x, touch.y);
        
        // Проверяем, является ли элемент или его родитель UI-элементом
        if (element && (element.closest('.search-container') || element.closest('.controls') || 
            element.closest('#search-input') || element.closest('#search-results') ||
            element.closest('.btn') || element.closest('.result-item'))) {
            touchStartedOnUI = true;
            
            // Если это кнопка, добавляем визуальный фидбэк
            if (element.closest('.btn')) {
                element.closest('.btn').style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (element.closest('.btn')) {
                        element.closest('.btn').style.transform = '';
                    }
                }, 150);
            }
            
            // Если это поле ввода, фокусируемся на нем
            if (element.closest('#search-input')) {
                element.closest('#search-input').focus();
            }
            
            return false;
        }
    }
    touchStartedOnUI = false;
    
    // Для жестов двумя пальцами
    if (touches.length === 2) {
        prevTouch1 = {x: touches[0].x, y: touches[0].y};
        prevTouch2 = {x: touches[1].x, y: touches[1].y};
    } else {
        prevTouch1 = undefined;
        prevTouch2 = undefined;
    }
    
    // Для одного пальца - начало потенциального drag
    if (touches.length === 1) {
        dragStartX = touches[0].x;
        dragStartY = touches[0].y;
        isDragging = false;
    }
    
    return false;
}

// Улучшенная функция touchMoved для плавных жестов:
function touchMoved() {
    if (touchStartedOnUI) {
        return false;
    }
    
    // 1. Один палец - перемещение карты
    if (touches.length === 1) {
        if (!isDragging && dist(dragStartX, dragStartY, touches[0].x, touches[0].y) > 10) {
            isDragging = true;
        }
        
        if (isDragging) {
            let sensitivity = 1 / zoom * (isMobile ? 1.5 : 1);
            let deltaX = touches[0].x - (pmouseX || touches[0].x);
            let deltaY = touches[0].y - (pmouseY || touches[0].y);
            
            let cosY = Math.cos(angleY);
            let sinY = Math.sin(angleY);
            
            offsetX += (deltaY * sinY + deltaX * cosY) * sensitivity;
            offsetZ -= (deltaY * cosY - deltaX * sinY) * sensitivity;
        }
    }
    // 2. Два пальца - масштабирование и плавный поворот
    else if (touches.length === 2) {
        let t1 = {x: touches[0].x, y: touches[0].y};
        let t2 = {x: touches[1].x, y: touches[1].y};
        
        if (prevTouch1 && prevTouch2) {
            // Масштабирование (пинч) - без изменений
            let prevDist = dist(prevTouch1.x, prevTouch1.y, prevTouch2.x, prevTouch2.y);
            let currDist = dist(t1.x, t1.y, t2.x, t2.y);
            let scaleChange = (currDist - prevDist) * 0.01;
            
            let oldZoom = zoom;
            zoom += scaleChange * zoom;
            zoom = constrain(zoom, 0.1, 15.0);
            
            // Центрирование масштабирования
            let centerX = (t1.x + t2.x) / 2;
            let centerZ = (t1.y + t2.y) / 2;
            
            let normX = (centerX - width / 2.0) / width;
            let normZ = (centerZ - height / 2.0) / height;
            let deltaZoom = zoom - oldZoom;
            let smoothingFactor = 1.0 / Math.pow(zoom, 1.5);
            
            let deltaX = -normX * deltaZoom * width * smoothingFactor;
            let deltaZ = -normZ * deltaZoom * height * smoothingFactor;
            
            let cosY = Math.cos(angleY);
            let sinY = Math.sin(angleY);
            offsetX += (deltaZ * sinY + deltaX * cosY) * (1/oldZoom);
            offsetZ -= (deltaZ * cosY - deltaX * sinY) * (1/oldZoom);
            
            // ПОВОРОТ ВОКРУГ ВЕРТИКАЛЬНОЙ ОСИ (Y) - ИНВЕРТИРОВАН
            // Вычисляем угол между вектором от пальца 1 к пальцу 2
            let prevAngle = Math.atan2(prevTouch2.y - prevTouch1.y, prevTouch2.x - prevTouch1.x);
            let currAngle = Math.atan2(t2.y - t1.y, t2.x - t1.x);
            
            // Вычисляем разницу углов
            let angleDiff = currAngle - prevAngle;
            
            // Корректируем разницу для плавности (устраняем скачки через 180 градусов)
            if (angleDiff > Math.PI) {
                angleDiff -= 2 * Math.PI;
            } else if (angleDiff < -Math.PI) {
                angleDiff += 2 * Math.PI;
            }
            
            // Ограничиваем максимальное изменение угла за один шаг
            let maxAngleChange = Math.PI / 6; // 30 градусов максимум
            angleDiff = Math.max(-maxAngleChange, Math.min(maxAngleChange, angleDiff));
            
            // ПРИМЕНЯЕМ ПОВОРОТ С ИНВЕРСИЕЙ (меняем знак)
            // Было: angleY -= angleDiff * rotationSensitivity
            // Стало: angleY += angleDiff * rotationSensitivity
            let rotationSensitivity = 1;
            angleY += angleDiff * rotationSensitivity; // ИНВЕРСИЯ
            
            // НАКЛОН ВОКРУГ ГОРИЗОНТАЛЬНОЙ ОСИ (X) - ИНВЕРТИРОВАН
            // Наклон при движении обоих пальцев в одном направлении по вертикали
            let prevMidY = (prevTouch1.y + prevTouch2.y) / 2;
            let currMidY = (t1.y + t2.y) / 2;
            
            // Определяем, двигаются ли пальцы в одном направлении по Y
            let y1Diff = t1.y - prevTouch1.y;
            let y2Diff = t2.y - prevTouch2.y;
            
            // Если пальцы двигаются в одном направлении (знак совпадает) - это наклон
            if (y1Diff * y2Diff > 0) {
                let avgYDiff = (y1Diff + y2Diff) / 2;
                let tiltSensitivity = 0.005;
                
                // ПРИМЕНЯЕМ НАКЛОН С ИНВЕРСИЕЙ
                angleX -= avgYDiff * tiltSensitivity; // ИНВЕРСИЯ
                
                // ВАЖНО: Ограничиваем угол наклона чтобы карта не переворачивалась
                angleX = constrain(angleX, Math.PI/2, Math.PI/2+Math.PI/3);
            }
        }
        
        // Обновляем предыдущие позиции
        prevTouch1 = {x: t1.x, y: t1.y};
        prevTouch2 = {x: t2.x, y: t2.y};
    }
    
    return false;
}

// Обновите touchEnded:
function touchEnded() {
    // Сбрасываем состояние drag
    if (touches.length < 2) {
        prevTouch1 = undefined;
        prevTouch2 = undefined;
    }
    
    // Если это был тап (не drag) - обрабатываем клик
    if (!isDragging && touches.length === 0) {
        // Используем mouseX/mouseY для определения клика
        // (p5.js обновляет их при touch-событиях)
        let clickedOnLabel = false;
        for (let d of districts) {
            if (d.isLabelClicked()) {
                clickedOnLabel = true;
                activeDistrict = (activeDistrict == d) ? null : d;
                break;
            }
        }
        if (!clickedOnLabel) {
            activeDistrict = null;
        }
    }
    
    isDragging = false;
    return false;
}

// --- Вставьте это в ui_logic.js или в конец global.js ---

// 2. Сброс вида (на спаун)
function resetView() {
    // Возвращаем камеру в исходное положение
    offsetX = -8;
    offsetZ = 317;
    zoom = 4;
    angleY = 0;
    angleX = Math.PI / 2;
}

// 3. Поворот на север
function rotateNorth() {
    angleY = 0;
}

// Функция смены темы теперь обновляет и HTML
function toggleMapTheme() {
    theme = (theme === "light") ? "dark" : "light";
    document.getElementById('ui-layer').setAttribute('data-theme', theme);
    applyTheme();
    buildGlobalMesh();
}

function updateSearchSuggestions(query) {
    const resultsDiv = document.getElementById('search-results');
    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    // Собираем все объекты для поиска
    let allObjects = [
        ...labels.map(l => ({ name: l.name, obj: l, type: 'Метка' })),
        ...districts.map(d => ({ name: d.name, obj: d, type: 'Район' })),
        ...buildings.map(b => ({ name: b.name || b.address, obj: b, type: 'Здание' }))
    ];

    let filtered = allObjects.filter(item => 
        item.name && item.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Ограничим 10 результатами

    if (filtered.length > 0) {
        resultsDiv.innerHTML = filtered.map(item => `
            <div class="result-item" onclick="goToObject('${item.name}')">
                <span style="font-weight:bold">${item.name}</span> 
                <small style="opacity:0.6; float:right">${item.type}</small>
            </div>
        `).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
}

function goToObject(name) {
    let found = findObjectByName(name);
    if (found) {
        // Логика перемещения камеры (как в предыдущем ответе)
        if (found.center) {
            offsetX = -found.center.x;
            offsetZ = -found.center.z;
        } else if (found.location) {
            offsetX = -found.location.x;
            offsetZ = -found.location.z;
        }
        zoom = 3.5;
    }
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-input').value = name;
}


function handleSearch(event) {
    if (event.key === 'Enter') {
        // Получаем текст и убираем пробелы
        let query = document.getElementById('search-input').value.toLowerCase().trim();
        if (query.length < 2) return;

        let foundObj = findObjectByName(query);

        if (foundObj) {
            // Перемещаемся к объекту
            // Учтите: offsetX/Z двигают мир, поэтому знаки инвертируются
            if (foundObj instanceof District) {
                // У районов есть вычисленный центр
                offsetX = -foundObj.center.x;
                offsetZ = -foundObj.center.z;
            } 
            else if (foundObj.location) {
                // У меток (Label) есть location
                offsetX = -foundObj.location.x;
                offsetZ = -foundObj.location.z;
            } 
            else if (foundObj.details && foundObj.details.length > 0) {
                // У зданий берем первую точку фундамента
                let p = foundObj.details[0].down_points[0];
                offsetX = -p.x;
                offsetZ = -p.z;
            }

            zoom = 8; // Приближаем камеру
            document.getElementById('search-input').blur(); // Убираем фокус с поля
        } else {
            alert("Объект не найден");
        }
    }
}

function findObjectByName(query) {
    // 1. Ищем среди меток (Labels) - самый высокий приоритет
    for (let l of labels) {
        if (l.name && l.name.toLowerCase().includes(query)) return l;
    }
    // 2. Ищем среди Районов (Districts)
    for (let d of districts) {
        if (d.name && d.name.toLowerCase().includes(query)) return d;
    }
    // 3. Ищем среди Зданий (Buildings)
    for (let b of buildings) {
        if (b.name && b.name.toLowerCase().includes(query)) return b;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для закрытия клавиатуры при касании вне поля ввода
    document.addEventListener('touchstart', function(e) {
        const searchContainer = document.querySelector('.search-container');
        const isSearchClick = e.target.closest('.search-container') || 
                             e.target.closest('#search-results');
        
        if (!isSearchClick) {
            // Закрываем клавиатуру и скрываем результаты
            const input = document.getElementById('search-input');
            const results = document.getElementById('search-results');
            
            if (input) {
                input.blur();
            }
            if (results) {
                results.style.display = 'none';
            }
        }
    });
});
