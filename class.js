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

class Road extends Area {
    constructor(name, points) {
        super(name, points, roadClr);
        this.calculateRoadCenter();
        this.lastFrameChecked = 0;
        this.currentFrameLabels = [];
        this.cachedSegments = [];
        this.cacheValidForFrames = 0;
    }
    
    calculateRoadCenter() {
        let center = createVector(0, 0, 0);
        for (let point of this.points) {
            center.add(point);
        }
        center.div(this.points.length);
        this.road_center = center;
    }
    
    show() {
        super.show(); 
        if ((zoom >= 1.5) && this.name && this.name.length > 0) {
            this.drawRoadLabel();
        }
    }
    
    drawRoadLabel() {
        // Сбрасываем кэш меток при смене кадра
        if (frameCount !== this.lastFrameChecked) {
            this.currentFrameLabels = [];
            this.lastFrameChecked = frameCount;
        }
        
        // Обновляем кэш сегментов каждые 30 кадров или при изменении зума
        if (frameCount % 30 === 0 || this.cacheValidForFrames < frameCount) {
            this.cachedSegments = this.findVisibleSegments();
            this.cacheValidForFrames = frameCount + 30;
        }
        
        if (zoom <= 2 || this.cachedSegments.length === 0) return;
        
        // Выбираем лучший сегмент для отображения метки
        let bestSegment = this.cachedSegments[0];
        
        // Ищем сегмент, который наиболее горизонтален и длинен
        for (let segment of this.cachedSegments) {
            let screenLength = dist(
                screenX(segment.p1.x, segment.p1.y, segment.p1.z),
                screenY(segment.p1.x, segment.p1.y, segment.p1.z),
                screenX(segment.p2.x, segment.p2.y, segment.p2.z),
                screenY(segment.p2.x, segment.p2.y, segment.p2.z)
            );
            
            // Предпочитаем более горизонтальные сегменты
            let angle = Math.abs(Math.atan2(
                segment.p2.z - segment.p1.z,
                segment.p2.x - segment.p1.x
            ));
            if (angle > Math.PI/4 && angle < 3*Math.PI/4) continue; // Слишком вертикальные
            
            if (screenLength > bestSegment.screenLength) {
                bestSegment = segment;
            }
        }
        
        if (!bestSegment || bestSegment.screenLength < 80) return;
        
        // Позиционируем метку
        let pA = bestSegment.p1.copy();
        let pB = bestSegment.p2.copy();
        
        // Середина сегмента
        let segmentMid = p5.Vector.add(pA, pB).mult(0.5);
        segmentMid.y += 0.1; // Чуть выше дороги
        
        // Вычисляем нормаль, направленную внутрь дороги
        let segmentDir = p5.Vector.sub(pB, pA);
        let normal = createVector(-segmentDir.z, 0, segmentDir.x);
        normal.normalize();
        
        // Проверяем направление нормали
        let testInside = p5.Vector.add(segmentMid, p5.Vector.mult(normal, 0.5));
        if (!this.isPointInside(testInside)) {
            normal.mult(-1);
        }
        
        // Позиция метки - немного внутри дороги
        let labelPos = p5.Vector.add(segmentMid, p5.Vector.mult(normal, 0.5));
        labelPos.y += 0.3;
        
        // Проверяем видимость на экране
        let screenPos = this.getScreenPosition(labelPos);
        if (!screenPos.visible) return;
        
        // Проверка наложения с другими метками
        if (this.isLabelOverlapping(screenPos.x, screenPos.y)) {
            return;
        }
        
        // Рисуем метку
        this.drawLabel(labelPos);
        
        // Сохраняем позицию
        this.currentFrameLabels.push(createVector(screenPos.x, screenPos.y));
    }
    
    findVisibleSegments() {
        let segments = [];
        let n = this.points.length;
        
        for (let i = 0; i < n; i++) {
            let p1 = this.points[i];
            let p2 = this.points[(i + 1) % n];
            
            let sx1 = screenX(p1.x, p1.y, p1.z);
            let sy1 = screenY(p1.x, p1.y, p1.z);
            let sx2 = screenX(p2.x, p2.y, p2.z);
            let sy2 = screenY(p2.x, p2.y, p2.z);
            
            // Проверяем видимость сегмента
            if (!this.isSegmentVisible(sx1, sy1, sx2, sy2)) continue;
            
            let screenLength = dist(sx1, sy1, sx2, sy2);
            if (screenLength < 60) continue; // Слишком короткие
            
            segments.push({
                p1: p1,
                p2: p2,
                screenLength: screenLength,
                index: i
            });
        }
        
        // Сортируем по длине (от самых длинных)
        segments.sort((a, b) => b.screenLength - a.screenLength);
        
        return segments;
    }
    
    isSegmentVisible(sx1, sy1, sx2, sy2) {
        // Если оба конца за пределами экрана в одном направлении
        if ((sx1 < -100 && sx2 < -100) || (sx1 > width + 100 && sx2 > width + 100)) {
            return false;
        }
        if ((sy1 < -100 && sy2 < -100) || (sy1 > height + 100 && sy2 > height + 100)) {
            return false;
        }
        
        return true;
    }
    
    isPointInside(point) {
        // Упрощенная проверка нахождения точки внутри полигона
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
    
    getScreenPosition(worldPos) {
        let sx = screenX(worldPos.x, worldPos.y, worldPos.z);
        let sy = screenY(worldPos.x, worldPos.y, worldPos.z);
        let sz = screenZ(worldPos.x, worldPos.y, worldPos.z);
        
        // Проверяем, видна ли точка на экране и не слишком ли далеко
        let visible = (sx >= -50 && sx <= width + 50 && 
                      sy >= -50 && sy <= height + 50 &&
                      sz > 0 && sz < 1000);
        
        return { x: sx, y: sy, z: sz, visible: visible };
    }
    
    isLabelOverlapping(screenXPos, screenYPos) {
        textFont(font, 16);
        let textWidthVal = textWidth(this.name);
        let textHeight = 18;
        
        // Проверка с глобальными метками
        for (let label of labels) {
            if (label.level > zoom) continue;
            
            let labelScreenPos = this.getScreenPosition(label.location);
            if (!labelScreenPos.visible) continue;
            
            let distance = dist(screenXPos, screenYPos, labelScreenPos.x, labelScreenPos.y);
            if (distance < textWidthVal/2 + 30) {
                return true;
            }
        }
        
        // Проверка с другими метками дорог в текущем кадре
        for (let existingPos of this.currentFrameLabels) {
            let distance = dist(screenXPos, screenYPos, existingPos.x, existingPos.y);
            if (distance < textWidthVal/2 + 20) {
                return true;
            }
        }
        
        return false;
    }
    
    drawLabel(position) {
        push();
        translate(position.x, position.y, position.z);
        
        // Определяем угол для поворота текста вдоль дороги
        let cameraPos = createVector(cameraX, cameraY, cameraZ);
        let toCamera = p5.Vector.sub(cameraPos, position);
        toCamera.normalize();
        
        // Вычисляем угол поворота к камере (billboard эффект)
        let billboardAngle = atan2(toCamera.x, toCamera.z);
        rotateY(billboardAngle);
        
        // Масштабируем в зависимости от зума
        let scaleFactor = 1 / (zoom * 0.7);
        scale(scaleFactor);
        
        // Рисуем фон текста
        textAlign(CENTER, CENTER);
        if (theme === "dark") {
            fill(40, 40, 40, 220);
        } else {
            fill(245, 245, 245, 220);
        }
        
        // Обводка текста
        noStroke();
        rectMode(CENTER);
        let textWidthVal = textWidth(this.name);
        let textHeight = 18;
        rect(0, 0, textWidthVal + 14, textHeight + 8, 6);
        
        // Рисуем текст
        if (theme === "dark") {
            fill(220, 220, 220);
        } else {
            fill(40, 40, 40);
        }
        
        textFont(font, 16);
        text(this.name, 0, 0);
        
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
