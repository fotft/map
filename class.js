class Alley extends Area {
    constructor(name, points) {
        super(name, points, alleyClr);
    }
}

class Building extends Area3D {
    constructor(address, name, details) {
        super(address, name, details, buildingClr);
    }
}

class DetalisedBuilding extends DetalisedArea3D {
    constructor(address, name, extended_details) {
        super(address, name, extended_details);
    }
}

class District extends Area {
    constructor(name, points) {
        super(name, points, districtClr);
        this.labelScreenPos = createVector(0, 0);
        this.center = this.calculateCenter(points);
    }
    calculateCenter(pts) {
        let cx = 0, cz = 0, area = 0;
        for (let i = 0; i < pts.length; i++) {
            let j = (i + 1) % pts.length;
            let f = pts[i].x * pts[j].z - pts[j].x * pts[i].z;
            area += f;
            cx += (pts[i].x + pts[j].x) * f;
            cz += (pts[i].z + pts[j].z) * f;
        }
        area *= 0.5;
        return createVector(cx / (6 * area), 9.5, cz / (6 * area));
    }
    drawPolygonOnly() {
        if (this != activeDistrict) {
            return;
        }
        strokeWeight(Math.sqrt(zoom) / zoom * 2);
        stroke(red(this.clr), green(this.clr), blue(this.clr));
        fill(red(this.clr), green(this.clr), blue(this.clr), 20);  // полупрозрачно
        beginShape();
        for (let p of points) {
            vertex(p.x, p.y - 0.02, p.z);
        }
        endShape(CLOSE);
        noStroke();
    }
    drawLabelOnly() {
        if (zoom < 0.2 || zoom >= 0.5 || this.name == null || this.name.length == 0) {
            return;
        }
        push();
        translate(this.center.x, this.center.y, this.center.z);
        rotateY(-angleY);
        rotateX(-angleX);
        scale(1/zoom);
        gl.disable(gl.DEPTH_TEST);
        textAlign(CENTER, CENTER);
        textFont(font, 20);
        fill(theme === "dark" ? color(40, 40,40, 150) : color(215, 215, 215, 150));
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
            text(this.name, Math.cos(a) * 1.5, sin(a) * 1.5);
        }
        if (theme === "light") fill(95,112,125);
        else fill(146,146,163);
        text(this.name, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        pop();
    }
    isLabelClicked() {
        if (!this.labelValid) {
            return false;
        }
        textFont(font, 20);
        let w = textWidth(this.name) / zoom * 1.2;
        let h = 30 / zoom;
        return mouseX > this.labelScreenPos.x - w/2 &&
               mouseX < this.labelScreenPos.x + w/2 &&
               mouseY > this.labelScreenPos.y - h/2 &&
               mouseY < this.labelScreenPos.y + h/2;
    }
}

class Field extends Area {
    constructor(address, name, points) {
        super(name, points, fieldClr);
    }
}

class Government extends Area3D {
    constructor(address, name, details) {
        super(address, name, details, governmentClr);
    }
}

class GreenArea extends Area {
    constructor(name, points) {
        super(name, points, greenAreaClr);
    }
}

class Hospital extends Area3D {
    constructor(address, name, details) {
        super(address, name, details, hospitalClr);
    }
}

class Label {
    constructor(address, name, type, level, location) {
        this.address = address;
        this.name = name;
        this.type = type;
        this.level = level;
        this.location = location;
        let iconName = `${this.type}_${theme}`;
        this.icon = ICONS[iconName]; 
        if (!this.icon) {
            console.error("Иконка не найдена: " + iconName);
        }
        switch (this.type) {
            case "bar":
            case "fastfood":
            case "cafe":
            case "restaurant":
                this.clr = color(224, 129, 58);
                break;

            case "church":
            case "flag":
            case "police":
            case "school":
            case "synagogue":
            case "post":
            case "factory":
            case "monument":
            case "fir":
                this.clr = color(142, 145, 149);
                break;

            case "museum":
            case "landmark":
            case "theater":
                this.clr = color(16, 127, 116);
                break;

            case "hospital":
                this.clr = color(233, 121, 107);
                break;

            case "spa":
                this.clr = color(225, 116, 155);
                break;

            case "pharmacy":
                this.clr = color(13, 160, 0);
                break;

            case "business":
            case "office":
            case "barbershop":
            case "sports":
            case "hotel":
            case "bank":
                this.clr = color(112, 123, 230);
                break;

            case "shop":
            case "supermarket":
            case "hypermarket":
            case "clothes":
            case "furniture":
            case "plants":
            case "zoo":
                this.clr = color(12, 127, 170);
                break;

            case "station": 
                this.clr = color(43, 43, 43);
                break;

            case "park":
            case "stadium":
                this.clr = color(59, 156, 88);
                break;

            case "road":
                this.clr = color(224, 224, 226);
                break;

            default:
                this.clr = color(255, 255, 255);
                break;
        }
    }
    show() {
        let iconName = `${this.type}_${theme}`;
        this.icon = ICONS[iconName]; 
        if (this.type === "monument") this.level = 4;
        if (this.type === "station") {
            if (theme === "dark") {
                this.clr = color(215, 215, 215);
            }
            else {
                this.clr = color(43, 43, 43);
            }
        }
        if (this.type !== "road") {
            if (this.level <= zoom) {
                push();
                translate(this.location.x, this.location.y, this.location.z);
                rotateY(-angleY);
                rotateX(-angleX);
                scale(1 / zoom);
                textAlign(CENTER);
                let h = this.icon.height;
                let w = this.icon.width;
                let d = 0;
                if (zoom >= this.level) {
                    textFont(font, 15);
                    if (theme === "dark") {
                        fill(40, 40, 40, 125);
                    }
                    else {
                        fill(215, 215, 215, 125);
                    }
                    for (let r = 0.0; r < 1.5 * Math.PI / 2; r += 3 / 2) {
                        let dx = Math.cos(r) * 2;
                        let dy = Math.sin(r) * 2;
                        if (this.icon != null) {
                            text(this.name, dx, w / 1.5 + d + dy);
                        }
                        else {
                            text(this.name, dx, dy);
                        }
                    }
                    fill(this.clr);
                    if (this.icon != null) text(this.name, 0, w / 1.5 + d);
                    else {
                        text(this.name, 0, 0);
                    }
                }
                if (this.icon != null) {
                    imageMode(CENTER);
                        if ((this.type !== "monument") && (this.type !== "fir")) {
                            if (theme === "dark") {
                                fill(40, 40, 40, 50);
                            }
                            else {
                                fill(215, 215, 215, 125);
                            }
                            if (w != 70) {
                                circle(0, 0, w - 17);
                            }
                            else {
                                circle(0, 0, 52);
                            }
                        }
                        if (this.type === "fir") {
                            image(this.icon, 0, 0, w / 1.5, h / 1.5);
                        }
                        else {
                            image(this.icon, 0, 0, w / 2, h / 2);
                        }
                }
                scale(zoom);
                pop();
            }
        }
    }
}

class Metro {
    constructor(name, base_location, locations) {
        this.name = name;
        this.base_location = base_location;
        this.locations = locations;
        this.base_level = 0.8;
        this.entrances_level = metro_entrances_level;
        this.clr = color(83, 178, 62);
        this.icon = ICONS["metro_"+theme];
    }
    show_base() {
        push();
        translate(this.base_location.x, this.base_location.y, this.base_location.z);
        rotateY(-angleY);
        rotateX(-angleX);
        scale(1/zoom);
        gl.disable(gl.DEPTH_TEST);
        textAlign(CENTER);
        let h = this.icon.height;
        let w = this.icon.width;
        let d = 0;
        if (zoom >= 0) {
            if (theme === "dark") {
                fill(40, 40, 40, 125);
            }
            else {
                fill(215, 215, 215, 125);
            }
            for (let r = 0; r < Math.PI * 2; r += 3 / 2) {
                let dx = Math.cos(r) * 2;
                let dy = Math.sin(r) * 2;
                if (this.icon != null) {
                    text(this.name, dx, w / 1.5 + d + dy);
                }
                else {
                    text(this.name, dx, dy);
                }
            }
            fill(this.clr);
            if (this.icon != null) {
                text(this.name, 0, w / 1.5 + d);
            }
            else {
                text(this.name, 0, 0);
            }
        }
        if (this.icon != null) {
            imageMode(CENTER);
            image(this.icon, 0, 0, w / 1.7, h / 1.7);
        }
        gl.enable(gl.DEPTH_TEST);
        scale(zoom);
        pop();
    }
    show_entrances() {
        for (let i = 0; i < this.locations.length; i++) {
            push();
            translate(this.locations[i].x, this.locations[i].y, this.locations[i].z);
            rotateY(-angleY);
            rotateX(-angleX);
            scale(1/zoom);
            gl.disable(gl.DEPTH_TEST);
            textAlign(CENTER);
            let h = this.icon.height;
            let w = this.icon.width;
            let d = 0;
            if (zoom >= 0) {
                if (theme === "dark") {
                    fill(40, 40, 40, 125);
                }
                else {
                    fill(215, 215, 215, 125);
                }
                for (let r = 0; r < Math.PI * 2; r += 3 / 2) {
                    let dx = Math.cos(r) * 2;
                    let dy = Math.sin(r) * 2;
                    if (this.icon != null) {
                        text(this.name + "\nвход " +(i+1), dx, w / 1.5 + d + dy);
                    }
                    else {
                        text(this.name + "\nвход " +(i+1), dx, dy);
                    }
                }
                textFont(font, 17);
                fill(83, 178, 62);
                if (this.icon != null) {
                    text(this.name + "\nвход " + (i+1), 0, w / 1.5 + d);
                }
                else {
                    text(this.name + "\nвход " + (i+1), 0, 0);
                }
            }
            if (this.icon != null) {
                imageMode(CENTER);
                image(this.icon, 0, 0, w / 1.7, h / 1.7);
            }
            gl.enable(gl.DEPTH_TEST);
            scale(zoom);
            pop();
        }
    }
    show() {
        this.icon = ICONS["metro_"+theme];
        textFont(font, 17);
        fill(this.clr);
        if ((zoom >= this.base_level) && (zoom < this.entrances_level)) {
            this.show_base();
        }
        else if (zoom >= this.entrances_level) {
            this.show_entrances();
        }
    }
}

class Parking extends Area {
    constructor(points) {
        super("", points, parkingClr);
    }
}

class Railway {
    constructor(points) {
        this.points = points;
    }
    show() {
        let totalLength = this.calculateTotalLength();
        let segmentLength = 10;
        let distance = 0;
        strokeWeight(2);
        while (distance < totalLength) {
            let start = this.getPoint3DAtDistance(distance);
            let end = this.getPoint3DAtDistance(distance + segmentLength);
            if ((distance / (2 * segmentLength)) % 1 < 0.5) {
                if (theme === "dark") {
                    stroke(97, 114, 154);
                }
                else {
                    stroke(200, 210, 210);
                }
                line(start.x, start.y-1, start.z, end.x, end.y-1, end.z);
            }
            else {
                if (theme === "dark") {
                    stroke(67, 80, 109);
                }
                else {
                    stroke(152, 176, 176);
                }
                line(start.x, start.y-1, start.z, end.x, end.y-1, end.z);
            }
            distance += segmentLength;
        }
        noStroke();
    }
    calculateTotalLength() {
        let len = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            let p1 = createVector(this.points[i].x, this.points[i].y, this.points[i].z);
            let p2 = createVector(this.points[i + 1].x, this.points[i + 1].y, this.points[i + 1].z);
            len += p5.Vector.dist(p1, p2);
        }
        return len;
    }
    getPoint3DAtDistance(distance) {
        let remaining = distance;
        for (let i = 0; i < this.points.length - 1; i++) {
            let p1 = createVector(this.points[i].x, this.points[i].y, this.points[i].z);
            let p2 = createVector(this.points[i + 1].x, this.points[i + 1].y, this.points[i + 1].z);
            let segmentDist = p5.Vector.dist(p1, p2);
            if (remaining <= segmentDist) {
                let t = remaining / segmentDist;
                return p5.Vector.lerp(p1, p2, t);
            }
            remaining -= segmentDist;
        }
        return createVector(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, this.points[this.points.length - 1].z);
    }
}
/*
class Road extends Area {
    constructor(name, points) {
        super(name, points, roadClr); // roadClr глобальная
        this.calculateRoadCenter();
        
        // Кэширование
        this.lastFrameChecked = 0;
        this.cachedLabelData = null; // Храним позицию И угол
        this.cacheValidUntil = 0;
        
        // Настройки отрисовки
        this.labelUpdateInterval = 10; // Обновлять позицию каждые N кадров
    }
    
    calculateRoadCenter() {
        let center = createVector(0, 0, 0);
        if (this.points.length === 0) return;
        for (let point of this.points) center.add(point);
        center.div(this.points.length);
        this.road_center = center;
    }
    
    show() {
        super.show(); 
        
        // Проверка зума и наличия имени
        if ((zoom >= 1.5) && this.name && this.name.length > 0) {
            //this.drawRoadLabel();
        }
    }
    
    drawRoadLabel() {/*
        // 1. Проверяем кэш
        if (frameCount > this.cacheValidUntil || !this.cachedLabelData) {
            this.cachedLabelData = this.calculateLabelTransform();
            this.cacheValidUntil = frameCount + this.labelUpdateInterval;
        }
        
        // Если данных нет (дорога не видна), выходим
        if (!this.cachedLabelData) return;

        let { pos, angle } = this.cachedLabelData;

        // 2. Проверка видимости центральной точки метки на экране
        // Мы не проверяем overlap здесь для скорости, но можно добавить
        let sx = screenX(pos.x, pos.y, pos.z);
        let sy = screenY(pos.x, pos.y, pos.z);
        
        if (sx < -100 || sx > width + 100 || sy < -100 || sy > height + 100) return;

        // 3. Отрисовка
        push();
        
        // Перемещаем в центр видимого участка
        translate(pos.x, pos.y + 2, pos.z); // +2 чтобы приподнять над асфальтом (z-fighting fix)

        // ЛОГИКА ПОВОРОТА:
        
        // А. Определяем вектор от текста к камере
        let camPos = createVector(cameraX, cameraY, cameraZ); // Убедитесь, что эти переменные доступны
        let toCam = p5.Vector.sub(camPos, pos);
        
        // Б. Проверяем читаемость ("вверх ногами" или нет)
        // Вектор направления дороги
        let roadDir = createVector(cos(angle), 0, sin(angle));
        
        // Используем скалярное произведение, чтобы понять, смотрит ли текст на нас "правильно"
        // Проецируем вектор "к камере" на направление дороги
        let angleDiff = p5.Vector.angleBetween(roadDir, createVector(toCam.x, 0, toCam.z));
        
        // Если угол острый по отношению к движению, возможно, стоит развернуть текст
        // Но проще проверить проекцию на "перпендикуляр" дороги (вектор чтения текста)
        // Если текст читается слева направо, его вектор (cos(angle), sin(angle))
        
        // Простая эвристика: Сравниваем угол дороги и угол камеры
        let camAngle = atan2(toCam.z, toCam.x);
        let deltaAngle = camAngle - angle;
        
        // Нормализация угла (-PI to PI)
        while (deltaAngle > PI) deltaAngle -= TWO_PI;
        while (deltaAngle < -PI) deltaAngle += TWO_PI;

        // Если разница углов по модулю > 90 градусов, текст "убегает" от нас или перевернут
        // нужно развернуть его на 180
        if (abs(deltaAngle) > HALF_PI) {
            angle += PI;
        }

        rotateY(-angle); // Поворот вокруг вертикальной оси (align with road)
        rotateX(HALF_PI); // Поворот вокруг X, чтобы "положить" текст на землю
        
        // Стилизация текста
        textAlign(CENTER, CENTER);
        textSize(14); // Размер шрифта можно скейлить от зума, если нужно
        
        // Рисуем текст (без плашки, чтобы выглядело как разметка, или с плашкой)
        // fill(255); 
        // Если нужна обводка для контраста на асфальте:
        fill(255);
        noStroke();
        
        // Опционально: тень для читаемости
        push();
        translate(1, 1, -1); // Тень чуть ниже
        fill(0, 150);
        text(this.name, 0, 0);
        pop();

        text(this.name, 0, 0);
        
        pop();
    }

    // Вычисляет позицию и угол наклона текста на основе ВИДИМЫХ точек
    calculateLabelTransform() {
        let visiblePoints = [];
        let avgX = 0, avgZ = 0;
        
        // 1. Собираем точки, попадающие в (расширенный) экран
        // Используем screenX/Y/Z p5.js
        for (let p of this.points) {
            let sx = screenX(p.x, p.y, p.z);
            let sy = screenY(p.x, p.y, p.z);
            
            // Большой паддинг, чтобы учитывать сегменты, уходящие за экран
            if (sx > -200 && sx < width + 200 && sy > -200 && sy < height + 200) {
                visiblePoints.push(p);
                avgX += p.x;
                avgZ += p.z;
            }
        }

        // Если видимых точек слишком мало, считаем дорогу невидимой для подписи
        if (visiblePoints.length < 3) return null;

        // 2. Центроид (средняя точка видимого участка)
        avgX /= visiblePoints.length;
        avgZ /= visiblePoints.length;
        
        // Высота (Y) берется средней, или константной, если дорога плоская
        let avgY = visiblePoints[0].y; 

        let centerPos = createVector(avgX, avgY, avgZ);

        // 3. Вычисление угла дороги (PCA / Ковариация)
        // Это позволяет найти ось "вытянутости" облака видимых точек
        // независимо от того, как они соединены в массиве.
        let covXX = 0;
        let covXZ = 0;
        let covZZ = 0;

        for (let p of visiblePoints) {
            let dx = p.x - avgX;
            let dz = p.z - avgZ;
            covXX += dx * dx;
            covXZ += dx * dz;
            covZZ += dz * dz;
        }

        // Формула угла главной оси облака точек
        // 0.5 * atan2(2 * covXY, varX - varY)
        let angle = 0.5 * atan2(2 * covXZ, covXX - covZZ);

        return { pos: centerPos, angle: angle };
    }
}*/

class Road extends Area {
    constructor(name, points) {
        super(name, points, roadClr); // roadClr должна быть определена глобально
        this.calculateRoadCenter();
        
        // Кэширование для оптимизации
        this.lastFrameChecked = 0;
        this.currentFrameLabels = [];
        this.cachedLabelPosition = null;
        this.cacheValidUntil = 0;
    }
    
    calculateRoadCenter() {
        let center = createVector(0, 0, 0);
        if (this.points.length === 0) return;
        
        for (let point of this.points) {
            center.add(point);
        }
        center.div(this.points.length);
        this.road_center = center;
    }
    
    show() {
        super.show(); 
        // Показываем метку только при достаточном зуме и наличии имени
        if ((zoom >= 1.5) && this.name && this.name.length > 0) {
            //this.drawRoadLabel();
        }
    }
    
    drawRoadLabel() {
        // 1. Очистка старых меток текущего кадра (глобальная логика)
        if (frameCount !== this.lastFrameChecked) {
            this.currentFrameLabels = [];
            this.lastFrameChecked = frameCount;
        }
        
        // 2. Пересчет позиции метки (не каждый кадр, а раз в 15 кадров для производительности)
        // Или если метки вообще нет
        if (frameCount > this.cacheValidUntil || !this.cachedLabelPosition) {
            this.cachedLabelPosition = this.calculateBestLabelPosition();
            this.cacheValidUntil = frameCount + 15;
        }
        
        // Если позиция не найдена (дорога не видна), выходим
        if (!this.cachedLabelPosition) return;

        let worldPos = this.cachedLabelPosition;

        // 3. Проверка: находится ли эта точка на экране
        let screenPos = this.getScreenPosition(worldPos);
        if (!screenPos.visible) return;

        // 4. Проверка наложения с другими метками (Overlap)
        if (this.isLabelOverlapping(screenPos.x, screenPos.y)) {
            return;
        }
        
        // 5. Отрисовка
        this.drawLabel(worldPos);
        
        // Регистрируем позицию, чтобы другие метки не наезжали
        this.currentFrameLabels.push(createVector(screenPos.x, screenPos.y));
    }

    calculateBestLabelPosition() {
        let visiblePoints = [];
        let avgPos = createVector(0, 0, 0);
        
        // Шаг А: Собираем все точки дороги, которые сейчас на экране
        for (let p of this.points) {
            let sx = screenX(p.x, p.y, p.z);
            let sy = screenY(p.x, p.y, p.z);
            
            // Расширенные границы (padding), чтобы учитывать точки чуть за экраном
            // это помогает метке не прыгать при движении камеры
            if (sx > -100 && sx < width + 100 && sy > -100 && sy < height + 100) {
                visiblePoints.push(p);
                avgPos.add(p);
            }
        }

        // Если видимых точек слишком мало, дорога далеко или не видна
        if (visiblePoints.length < 2) return null;

        // Шаг Б: Считаем среднюю точку (Центроид) видимой части
        // Это автоматически ставит точку в ЦЕНТР полигона, а не на край
        avgPos.div(visiblePoints.length);

        // Шаг В: Проверка "U-поворота"
        // Если дорога изогнута, средняя точка может оказаться вне асфальта (на обочине внутри поворота).
        // Проверяем, лежит ли точка внутри полигона.
        if (this.isPointInside(avgPos)) {
            // Идеально, точка на дороге
            return avgPos;
        } else {
            // Точка вне дороги (крутой поворот). 
            // Fallback: берем "среднюю" точку из списка видимых вершин.
            // Так как точки обычно идут по порядку, средний индекс будет где-то на изгибе дороги.
            let midIndex = Math.floor(visiblePoints.length / 2);
            
            // Чтобы не попасть на самый край (бордюр), попробуем найти точку напротив
            // Но для простоты и надежности просто чуть сместим её к центроиду
            let fallbackPoint = visiblePoints[midIndex].copy();
            
            // Смещаем на 20% от края к центру изгиба (чтобы не писать прямо на бордюре)
            let fixedPos = p5.Vector.lerp(fallbackPoint, avgPos, 0.2);
            
            // Проверяем еще раз, если все еще вне, просто возвращаем точку на вершине
            if(this.isPointInside(fixedPos)) return fixedPos;
            return fallbackPoint;
        }
    }
    
    // Вспомогательный метод для проекции и проверки границ экрана
    getScreenPosition(worldPos) {
        let sx = screenX(worldPos.x, worldPos.y, worldPos.z);
        let sy = screenY(worldPos.x, worldPos.y, worldPos.z);
        let sz = screenZ(worldPos.x, worldPos.y, worldPos.z); // Z-буфер (глубина)
        
        // sz < 1 проверяет, не находится ли точка за камерой
        let visible = (sx >= 0 && sx <= width && 
                       sy >= 0 && sy <= height && 
                       sz > 0 && sz < 1200); // 1200 - макс дальность видимости метки
                       
        return { x: sx, y: sy, z: sz, visible: visible };
    }

    // Проверка попадания точки внутрь полигона (Ray casting algorithm)
    isPointInside(point) {
        let inside = false;
        let n = this.points.length;
        
        for (let i = 0, j = n - 1; i < n; j = i++) {
            let pi = this.points[i];
            let pj = this.points[j];
            
            let intersect = ((pi.z > point.z) !== (pj.z > point.z)) &&
                (point.x < (pj.x - pi.x) * (point.z - pi.z) / (pj.z - pi.z) + pi.x);
            
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    isLabelOverlapping(screenXPos, screenYPos) {
        textFont(font, 16);
        let textWidthVal = textWidth(this.name);
        // Минимальная дистанция между центрами меток
        let minDist = textWidthVal / 2 + 40; 
        
        // 1. Проверка с другими дорогами в этом кадре
        for (let existingPos of this.currentFrameLabels) {
            let d = dist(screenXPos, screenYPos, existingPos.x, existingPos.y);
            if (d < minDist) return true;
        }
        
        // 2. (Опционально) Проверка с глобальными метками (города, объекты)
        // Предполагается, что массив labels существует глобально
        if (typeof labels !== 'undefined') {
            for (let label of labels) {
                if (label.level > zoom) continue; // Если метка скрыта зумом, игнорируем
                
                // Проецируем глобальную метку (если она не кэширована)
                let lx = screenX(label.location.x, label.location.y, label.location.z);
                let ly = screenY(label.location.x, label.location.y, label.location.z);
                
                // Грубая проверка нахождения на экране
                if (lx < 0 || lx > width || ly < 0 || ly > height) continue;

                let d = dist(screenXPos, screenYPos, lx, ly);
                if (d < minDist) return true;
            }
        }
        
        return false;
    }
    
    drawLabel(position) {
        push();
        // Поднимаем метку чуть выше дороги (y - это высота?), 
        // предполагаю Y-up или Y-down, добавляем смещение по Y
        let floatHeight = 2.0; 
        translate(position.x, position.y + floatHeight, position.z);
        
        // Billboard эффект: поворачиваем текст к камере
        let cameraPos = createVector(cameraX, cameraY, cameraZ);
        let toCamera = p5.Vector.sub(cameraPos, position);
        let billboardAngle = atan2(toCamera.x, toCamera.z);
        rotateY(billboardAngle);
        
        // Адаптивный масштаб: чем дальше, тем текст сохраняет размер (или уменьшается не так быстро)
        let distToCam = toCamera.mag();
        let scaleFactor = distToCam / 400; // Подберите делитель под свой масштаб
        scaleFactor = constrain(scaleFactor, 0.5, 3.0); 
        scale(scaleFactor);
        
        // Отрисовка фона
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        
        // Стиль
        if (typeof theme !== 'undefined' && theme === "dark") {
            fill(30, 30, 30, 200);
            stroke(200);
        } else {
            fill(250, 250, 250, 200);
            stroke(50);
        }
        strokeWeight(1);
        
        let txt = this.name;
        textSize(16);
        let tw = textWidth(txt);
        let th = 20;
        
        // Плашка
        rect(0, 0, tw + 10, th + 4, 4);
        
        // Текст
        noStroke();
        if (typeof theme !== 'undefined' && theme === "dark") fill(255);
        else fill(0);
        
        text(txt, 0, 0);
        
        pop();
    }
}

class Sidewalk {
    constructor(points) {
        this.points = points;
    }
    show() {
        strokeWeight(Math.sqrt(zoom) / zoom * 2);
        if (theme === "dark") {
            stroke(53, 63, 80);
        }
        else {
            stroke(236, 233, 231);
        } 
        for (let i = 0; i < this.points.length -1; i++) {
            line(this.points[i].x, this.points[i].y+0.02, this.points[i].z, this.points[i+1].x, this.points[i+1].y+0.02, this.points[i+1].z);
        }
        noStroke();
    }
}

class Underlay extends Area {
    constructor(points) {
        super("", points, underlayClr);
    }
}

class Water extends Area {
    constructor(name, points) {
        super(name, points, waterClr);
    }
}
