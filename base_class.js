class Detail {
    constructor(down_points, up_points) {
        this.down_points = down_points;
        this.up_points = up_points;
    }
}

class ExtendedDetail {
    constructor(down_points, up_points, lclr, dclr) {
        this.down_points = down_points;
        this.up_points = up_points;
        this.lclr = lclr;
        this.dclr = dclr;
    }
}

class Area {
    constructor(name, points, clr) {
        this.name = name;
        this.points = points;
        this.clr = clr;
    }
    show() {
        noStroke();
        fill(red(this.clr), green(this.clr), blue(this.clr));
        beginShape();
            for (let i = 0; i < this.points.length; i++) {
                vertex(this.points[i].x, this.points[i].y, this.points[i].z);
            }
        endShape(CLOSE);
    }
}

class Area3D {
    constructor(address, name, details, clr) {
        this.address = address;
        this.name = name;
        this.details = details;
        this.clr = clr;
    }
    show() {
        noStroke();
        let isHovered = (this == hoveredArea3D);
        let isSelected = (this == selectedArea3D);
        if (isSelected) {
            fill(100, 150, 255, 220);
        }
        else if (isHovered) {
            fill((red(this.clr) + 75)/2, (green(this.clr) + 100)/2, (blue(this.clr) + 169)/2, 120);
        }
        else {
            fill(red(this.clr), green(this.clr), blue(this.clr), 175);
        }
        for (let i = 0; i < this.details.length; i++) {
            drawPolygon(this.details[i].down_points);
            drawPolygon(this.details[i].up_points);
            for (let j = 0; j < this.details[i].down_points.length; j++) {
                let p1 = this.details[i].down_points[j];
                let p2 = this.details[i].down_points[(j + 1) % this.details[i].down_points.length];
                let p3 = this.details[i].up_points[(j + 1) % this.details[i].up_points.length];
                let p4 = this.details[i].up_points[j];
                beginShape(QUADS);
                vertex(p1.x, p1.y + 0.01, p1.z);
                vertex(p2.x, p2.y + 0.01, p2.z);
                vertex(p3.x, p3.y, p3.z);
                vertex(p4.x, p4.y, p4.z);
                endShape();
            }
        }
    }
}

class DetalisedArea3D {
    constructor(address, name, extended_details) {
        this.address = address;
        this.name = name;
        this.extended_details = extended_details;
    }
    show() {
        noStroke();
        for (let i = 0; i < this.extended_details.length; i++) {
            if (theme === "dark") {
                fill(this.extended_details[i].dclr);
            }
            else if (theme === "light") {
                fill(this.extended_details[i].lclr);
            }
            drawPolygon(this.extended_details[i].down_points);
            drawPolygon(this.extended_details[i].up_points);
            for (let j = 0; j < this.extended_details[i].down_points.length; j++) {
                let p1 = this.extended_details[i].down_points[j];
                let p2 = this.extended_details[i].down_points[(j + 1) % this.extended_details[i].down_points.length];
                let p3 = this.extended_details[i].up_points[(j + 1) % this.extended_details[i].up_points.length];
                let p4 = this.extended_details[i].up_points[j];
                beginShape(QUADS);
                vertex(p1.x, p1.y + 0.01, p1.z);
                vertex(p2.x, p2.y + 0.01, p2.z);
                vertex(p3.x, p3.y, p3.z);
                vertex(p4.x, p4.y, p4.z);
                endShape();
            }
        }
    }
}
