// Переменные для хранения запеченных моделей
let staticGroundModel = null;     // Земля, вода, дороги (непрозрачные)
let staticBuildingsModel = null;  // Здания (прозрачные)
let staticRailwaysModel = null;   // ЖД пути (линии)

function drawAlleys() {
    for (let i = 0; i < alleys.length; i++) alleys[i].show();
}
 


function drawLabels() {
    // 1. Предварительный расчет границ видимости в МИРОВЫХ координатах.
    // Ширина области обзора зависит от зума. Чем меньше зум (камера высоко), тем больше область.
    // Эвристический коэффициент 1000 подобран под масштаб вашей карты.
    // Можно увеличить, если метки исчезают слишком рано по краям.
    let viewRadius = (width / zoom) * 1; //0.8; 
    // Квадрат радиуса, чтобы не использовать медленный Math.sqrt в цикле
    let viewRadiusSq = viewRadius * viewRadius;

    gl.disable(gl.DEPTH_TEST);

    for (let i = 0; i < labels.length; i++) {
        let l = labels[i];

        // 2. Быстрая проверка уровня зума (как у вас было)
        if (l.level > zoom) continue;

        // 3. СУПЕР БЫСТРАЯ проверка дистанции (Culling)
        // Проверяем расстояние от центра камеры (offsetX, offsetZ) до метки.
        // Учитываем вращение: так как мы вращаем мир вокруг центра,
        // расстояние от центра экрана до точки остается неизменным при вращении angleY.
        // Нам нужно проверить только X и Z (высоту Y игнорируем для скорости, карта плоская).
        
        // ВНИМАНИЕ: У вас в global.js offsetX/offsetZ используются со знаком минус при трансляции?
        // Обычно translate(offsetX, ...) сдвигает мир. Значит центр экрана смотрит в (-offsetX, -offsetZ).
        // Проверим вашу логику отрисовки: translate(offsetX, 0, offsetZ);
        // Значит центр камеры смотрит на точку (-offsetX, -offsetZ).
        
        let dx = l.location.x + offsetX; // Смещение относительно центра камеры
        let dz = l.location.z + offsetZ;
        
        let distSq = dx*dx + dz*dz;

        // Если точка дальше радиуса обзора — пропускаем
        if (distSq > viewRadiusSq) continue;

        // 4. Если проверка прошла, рисуем. 
        // Тут уже не нужен screenPosition, так как мы отсекли всё лишнее математикой.
        if (!l.icon) l.icon = ICONS[`${l.type}_${theme}`];
        l.show();
    }
    gl.enable(gl.DEPTH_TEST);
}

function drawMetro() {
    for (let i = 0; i < metro.length; i++) metro[i].show();
}

function drawMetroLines() {
    // Метро оставляем динамическим, так как curveVertex плохо запекается
    if ((zoom >= 0.25) && (zoom <= metro_entrances_level)) {
        strokeWeight(1);
        noFill();
        gl.disable(gl.DEPTH_TEST); 
        
        stroke(157, 82, 26, 150);
        beginShape();
        curveVertex(-26, 8, -232); curveVertex(-26, 8, -232);
        curveVertex(-708, 8, -711);
        curveVertex(-1345, 8, -1309); curveVertex(-1345, 8, -1309);
        endShape();

        stroke(237, 1, 21, 150);
        beginShape();
        curveVertex(1133, 8, -1128); curveVertex(1133, 8, -1128);
        curveVertex(755, 8, -951);
        curveVertex(-33, 8, -496);
        curveVertex(-638, 8, -244);
        curveVertex(-849, 8, 90); curveVertex(-849, 8, 90);
        endShape();
        
        gl.enable(gl.DEPTH_TEST);
        noStroke();
    }
}

function drawDistricts() {
    // Рисуем рамки районов. Текст рисуем только для активного.
    for (let d of districts) {
        //d.drawLabelOnly();
    }
}

// --- ГЛАВНАЯ ФУНКЦИЯ ДЛЯ ДИНАМИКИ ---
function drawDynamicElements() {
    // Здесь осталось только то, что НЕЛЬЗЯ запечь
    //drawDistricts();
    drawMetroLines();
    drawLabels();
    drawMetro();
    
    // Названия дорог пока отключены для теста FPS
    // if (zoom > 1.5) ...
}

// --- ФУНКЦИИ ЗАПЕКАНИЯ (ВЫЗЫВАЮТСЯ 1 РАЗ) ---

function buildGlobalMesh() {
    // Очистка старой памяти
    if (staticGroundModel) freeGeometry(staticGroundModel);
    if (staticBuildingsModel) freeGeometry(staticBuildingsModel);
    if (staticRailwaysModel) freeGeometry(staticRailwaysModel);

    // 1. СЛОЙ ЗЕМЛИ (Непрозрачный)
    staticGroundModel = buildGeometry(function() {
        noStroke();
        
        fill(underlayClr);
        for (let u of underlays) drawSimplePoly(u.points);

        fill(waterClr);
        for (let w of waters) drawSimplePoly(w.points);

        fill(greenAreaClr);
        for (let g of green_areas) drawSimplePoly(g.points);

        fill(fieldClr);
        for (let f of fields) drawSimplePoly(f.points);

        fill(alleyClr);
        for (let a of alleys) drawSimplePoly(a.points);

        fill(parkingClr);
        for (let p of parkings) drawSimplePoly(p.points);

        fill(roadClr);
        for (let r of roads) drawSimplePoly(r.points);

        
    });

    // 2. СЛОЙ ЗДАНИЙ (Прозрачный)
    staticBuildingsModel = buildGeometry(function() {
        noStroke();
        
        // Здания
        fill(red(buildingClr), green(buildingClr), blue(buildingClr), 150); // Alpha 150
        for (let b of buildings) drawBuildingGeometry(b);

        // Больницы
        fill(red(hospitalClr), green(hospitalClr), blue(hospitalClr), 150);
        for (let h of hospitals) drawBuildingGeometry(h);

        // Гос. здания
        fill(red(governmentClr), green(governmentClr), blue(governmentClr), 150);
        for (let g of governments) drawBuildingGeometry(g);

        // Детализированные здания (обычно непрозрачные, но можно настроить)
        for (let db of detalised_buildings) {
             for (let detail of db.extended_details) {
                 let c = (theme === "dark") ? detail.dclr : detail.lclr;
                 fill(c); 
                 drawBuildingGeometry({details: [detail]}); // Используем ту же логику
             }
        }
    });

    // 3. СЛОЙ ЛИНИЙ (ЖД Пути)
    // Запекаем их отдельно в режиме LINES, чтобы не было заливки
    
    staticRailwaysModel = buildGeometry(function() {
        noStroke(); // Линии не нужны, мы рисуем геометрией
        let halfWidth = 0.5;//1.0; // Половина ширины пути (аналог strokeWeight)

        for (let rw of railways) {
            let totalLength = rw.calculateTotalLength();
            let segmentLength = 10;
            let distance = 0;

            while (distance < totalLength) {
                // Получаем точки начала и конца сегмента
                let start = rw.getPoint3DAtDistance(distance);
                let end = rw.getPoint3DAtDistance(min(distance + segmentLength, totalLength));
                
                // Вычисляем направление и перпендикуляр для толщины
                let dir = p5.Vector.sub(end, start);
                // Если сегмент слишком короткий, пропускаем
                if (dir.magSq() < 0.0001) {
                    distance += segmentLength;
                    continue;
                }
                dir.normalize();
                
                // Перпендикуляр в плоскости XZ (поворот на 90 градусов)
                let perp = createVector(-dir.z, 0, dir.x).mult(halfWidth);

                // Выбор цвета (пунктир)
                if ((distance / (2 * segmentLength)) % 1 < 0.5) {
                    fill(theme === "dark" ? color(97, 114, 154) : color(200, 210, 210));
                } else {
                    fill(theme === "dark" ? color(67, 80, 109) : color(152, 176, 176));
                }

                // Рисуем прямоугольник (шпалу/сегмент пути) вместо линии
                beginShape();
                // Немного поднимаем (y - 1.05), чтобы не сливалось с землей, но было выше дорог
                let yH = -1.05; 
                vertex(start.x + perp.x, start.y + yH, start.z + perp.z);
                vertex(start.x - perp.x, start.y + yH, start.z - perp.z);
                vertex(end.x - perp.x, end.y + yH, end.z - perp.z);
                vertex(end.x + perp.x, end.y + yH, end.z + perp.z);
                endShape(CLOSE);

                distance += segmentLength;
            }
        }
    });
}

function drawSimplePoly(points) {
    beginShape();
    for (let p of points) vertex(p.x, p.y, p.z);
    endShape(CLOSE);
}

function drawBuildingGeometry(obj) {
    for (let detail of obj.details) {
        //drawSimplePoly(detail.down_points);
        drawSimplePoly(detail.up_points);
        
        for (let j = 0; j < detail.down_points.length; j++) {
            let p1 = detail.down_points[j];
            let p2 = detail.down_points[(j + 1) % detail.down_points.length];
            let p3 = detail.up_points[(j + 1) % detail.up_points.length];
            let p4 = detail.up_points[j];
            
            beginShape();
            vertex(p1.x, p1.y, p1.z);
            vertex(p2.x, p2.y, p2.z);
            vertex(p3.x, p3.y, p3.z);
            vertex(p4.x, p4.y, p4.z);
            endShape(CLOSE);
        }
    }
}

function drawCoordinateGrid() {
    push();
    // Немного опускаем сетку под землю, чтобы она не мерцала (Z-fighting)
    translate(0, 10.1, 0); 
    rotateX(PI/2); // Кладем на плоскость XZ
    
    // Определяем прозрачность слоев в зависимости от зума
    // Настраиваем пороги под ваши нужды
    let alpha1000 = map(zoom, 0.1, 1, 50, 100, true);
    let alpha100  = map(zoom, 0.5, 3, 0, 80, true);
    let alpha10   = map(zoom, 4, 10, 0, 50, true);

    // Сетка 1000 единиц (крупная)
    drawGridLayer(1000, 20, color(140, alpha1000));
    
    // Сетка 100 единиц (средняя)
    if (alpha100 > 0) {
        drawGridLayer(90, 100, color(140, alpha100));
    }
    
    // Сетка 10 единиц (мелкая)
    if (alpha10 > 0) {
        drawGridLayer(10, 200, color(140, alpha10));
    }
    pop();
}

function drawGridLayer(step, count, clr) {
    stroke(clr);
    strokeWeight(0.5); // Толщина линии всегда 1 пиксель на экране
    noFill();
    
    let size = (count * step) / 2;
    
    for (let i = -count/2; i <= count/2; i++) {
        let pos = i * step;
        // Линии вдоль X
        line(pos, -size, pos, size);
        // Линии вдоль Z
        line(-size, pos, size, pos);
    }
}
