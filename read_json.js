function read_json_alleys() {
    if (!json_alleys || !Array.isArray(json_alleys)) {
        console.error("json_alleys не является массивом");
        return;
    }
    for (let alley of json_alleys) {
        let name = alley.name;
        let json_points = alley.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        alleys.push(new Alley(name, points));
    }
}

function read_json_buildings() {
    for (let building of json_buildings) {
        let address = building.address;
        let name = building.name;
        let json_details = building.details;
        let details = [];
        for (let d of json_details) {
            json_down_points = d.down_points;
            down_points = [];
            for (let p of json_down_points) {
                down_points.push(createVector(p[0], p[1], p[2]));
            }
            json_up_points = d.up_points;
            up_points = [];
            for (let p of json_up_points) {
                up_points.push(createVector(p[0], p[1], p[2]));
            }
            details.push(new Detail(down_points, up_points));
        }
        buildings.push(new Building(address, name, details));
    }
}

function read_json_detalised_buildings() {
    for (let detalised_building of json_detalised_buildings) {
        let address = detalised_building.address;
        let name = detalised_building.name;
        let json_details = detalised_building.details;
        let details = [];
        for (let d of json_details) {
            json_down_points = d.down_points;
            down_points = [];
            for (let p of json_down_points) {
                down_points.push(createVector(p[0], p[1], p[2]));
            }
            json_up_points = d.up_points;
            up_points = [];
            for (let p of json_up_points) {
                up_points.push(createVector(p[0], p[1], p[2]));
            }
            let lclr = color(d.light_color[0], d.light_color[1], d.light_color[2]);
            let dclr = color(d.dark_color[0], d.dark_color[1], d.dark_color[2]);
            details.push(new ExtendedDetail(down_points, up_points, lclr, dclr));
        }
        detalised_buildings.push(new DetalisedBuilding(address, name, details));
    }
}

function read_json_districts() {
    for (let district of json_districts) {
        let name = district.name;
        let json_points = district.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        districts.push(new District(name, points));
    }
}

function read_json_fields() {
    for (let field of json_fields) {
        let address = field.address;
        let name = field.name;
        let json_points = field.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        fields.push(new Field(address, name, points));
    }
}

function read_json_governments() {
    for (let government of json_governments) {
        let address = government.address;
        let name = government.name;
        let json_details = government.details;
        let details = [];
        for (let d of json_details) {
            json_down_points = d.down_points;
            down_points = [];
            for (let p of json_down_points) {
                down_points.push(createVector(p[0], p[1], p[2]));
            }
            json_up_points = d.up_points;
            up_points = [];
            for (let p of json_up_points) {
                up_points.push(createVector(p[0], p[1], p[2]));
            }
            details.push(new Detail(down_points, up_points));
        }
        governments.push(new Government(address, name, details));
    }
}

function read_json_green_areas() {
    for (let green_area of json_green_areas) {
        let name = green_area.name;
        let json_points = green_area.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        green_areas.push(new GreenArea(name, points));
    }
}

function read_json_hospitals() {
    for (let hospital of json_hospitals) {
        let address = hospital.address;
        let name = hospital.name;
        let json_details = hospital.details;
        let details = [];
        for (let d of json_details) {
            json_down_points = d.down_points;
            down_points = [];
            for (let p of json_down_points) {
                down_points.push(createVector(p[0], p[1], p[2]));
            }
            json_up_points = d.up_points;
            up_points = [];
            for (let p of json_up_points) {
                up_points.push(createVector(p[0], p[1], p[2]));
            }
            details.push(new Detail(down_points, up_points));
        }
        hospitals.push(new Hospital(address, name, details));
    }
}

function read_json_labels() {
    for (let label of json_labels) {
        let address = label.address;
        let name = label.name;
        let type = label.type;
        let level = label.level;
        let point = label.point;
        labels.push(new Label(address, name, type, level, createVector(point[0], point[1], point[2])));
    }
}

function read_json_metro() {
    for (let metro1 of json_metro) {
        let name = metro1.name;
        let base = metro1.base;
        let json_entrances = metro1.entrances;
        let entrances = [];
        for (let e of json_entrances) {
            entrances.push(createVector(e.x, e.y, e.z));
        }
        metro.push(new Metro(name, createVector(base[0], base[1], base[2]), entrances));
    }
}

function read_json_parkings() {
    for (let parking of json_parkings) {
        let json_points = parking.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        parkings.push(new Parking(points));
    }
}

function read_json_railways() {
    for (let railway of json_railways) {
        let json_points = railway.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        railways.push(new Railway(points));
    }
}

function read_json_roads() {
    for (let road of json_roads) {
        let name = road.name;
        let json_points = road.points;
        let points = [];
        for (let p of json_points) {
        points.push(createVector(p[0], p[1]+0.01, p[2]));
        }
        roads.push(new Road(name, points));
    }
}

function read_json_sidewalks() {
    for (let sidewalk of json_sidewalks) {
        let json_points = sidewalk.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        sidewalks.push(new Sidewalk(points));
    }
}

function read_json_underlays() {
    for (let underlay of json_underlays) {
        let json_points = underlay.points;
        let points = [];
        for (let p of json_points) {
            points.push(createVector(p[0], p[1], p[2]));
        }
        underlays.push(new Underlay(points));
    }
}

function read_json_waters() {
    for (let water of json_waters) {
        let name = water.name;
        let json_points = water.points;
        let points = [];
        for (let p of json_points) {
        points.push(createVector(p[0], p[1], p[2]));
        }
        waters.push(new Water(name, points));
    }
}