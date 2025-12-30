function preload() {
    font = loadFont("data/YandexSansText-Medium.ttf");
    boldFont = loadFont("data/YandexSansText-Bold.ttf");

    json_alleys_root = loadJSON("data/alleys.json");
    json_buildings_root = loadJSON("data/buildings.json");
    json_detalised_buildings_root = loadJSON("data/detalised_buildings.json");
    json_districts_root = loadJSON("data/districts.json");
    json_fields_root = loadJSON("data/fields.json");
    json_governments_root = loadJSON("data/governments.json");
    json_green_areas_root = loadJSON("data/green_areas.json");
    json_hospitals_root = loadJSON("data/hospitals.json");
    json_labels_root = loadJSON("data/labels.json");
    json_metro_root = loadJSON("data/metro.json");
    json_parkings_root = loadJSON("data/parkings.json");
    json_railways_root = loadJSON("data/railways.json");
    json_roads_root = loadJSON("data/roads.json");
    json_sidewalks_root = loadJSON("data/sidewalks.json");
    json_underlays_root = loadJSON("data/underlays.json");
    json_waters_root = loadJSON("data/water.json");

    ICONS.bank_dark = loadImage("data/bank_dark.png");
    ICONS.bank_light = loadImage("data/bank_light.png");
    ICONS.bar_dark = loadImage("data/bar_dark.png");
    ICONS.bar_light = loadImage("data/bar_light.png");
    ICONS.barbershop_dark = loadImage("data/barbershop_dark.png");
    ICONS.barbershop_light = loadImage("data/barbershop_light.png");
    ICONS.business_dark = loadImage("data/business_dark.png");
    ICONS.business_light = loadImage("data/business_light.png");
    ICONS.cafe_dark = loadImage("data/cafe_dark.png");
    ICONS.cafe_light = loadImage("data/cafe_light.png");
    ICONS.church_dark = loadImage("data/church_dark.png");
    ICONS.church_light = loadImage("data/church_light.png");
    ICONS.clothes_dark = loadImage("data/clothes_dark.png");
    ICONS.clothes_light = loadImage("data/clothes_light.png");
    ICONS.factory_dark = loadImage("data/factory_dark.png");
    ICONS.factory_light = loadImage("data/factory_light.png");
    ICONS.fastfood_dark = loadImage("data/fastfood_dark.png");
    ICONS.fastfood_light = loadImage("data/fastfood_light.png");
    ICONS.fir_dark = loadImage("data/fir_dark.png");
    ICONS.fir_light = loadImage("data/fir_light.png");
    ICONS.flag_dark = loadImage("data/flag_dark.png");
    ICONS.flag_light = loadImage("data/flag_light.png");
    ICONS.furniture_dark = loadImage("data/furniture_dark.png");
    ICONS.furniture_light = loadImage("data/furniture_light.png");
    ICONS.hospital_dark = loadImage("data/hospital_dark.png");
    ICONS.hospital_light = loadImage("data/hospital_light.png");
    ICONS.hotel_dark = loadImage("data/hotel_dark.png");
    ICONS.hotel_light = loadImage("data/hotel_light.png");
    ICONS.hypermarket_dark = loadImage("data/hypermarket_dark.png");
    ICONS.hypermarket_light = loadImage("data/hypermarket_light.png");
    ICONS.landmark_dark = loadImage("data/landmark_dark.png");
    ICONS.landmark_light = loadImage("data/landmark_light.png");
    ICONS.metro_dark = loadImage("data/metro_dark.png");
    ICONS.metro_light = loadImage("data/metro_light.png");
    ICONS.monument_dark = loadImage("data/monument_dark.png");
    ICONS.monument_light = loadImage("data/monument_light.png");
    ICONS.museum_dark = loadImage("data/museum_dark.png");
    ICONS.museum_light = loadImage("data/museum_light.png");
    ICONS.office_dark = loadImage("data/office_dark.png");
    ICONS.office_light = loadImage("data/office_light.png");
    ICONS.park_dark = loadImage("data/park_dark.png");
    ICONS.park_light = loadImage("data/park_light.png");
    ICONS.pharmacy_dark = loadImage("data/pharmacy_dark.png");
    ICONS.pharmacy_light = loadImage("data/pharmacy_light.png");
    ICONS.plants_dark = loadImage("data/plants_dark.png");
    ICONS.plants_light = loadImage("data/plants_light.png");
    ICONS.police_dark = loadImage("data/police_dark.png");
    ICONS.police_light = loadImage("data/police_light.png");
    ICONS.post_dark = loadImage("data/post_dark.png");
    ICONS.post_light = loadImage("data/post_light.png");
    ICONS.restaurant_dark = loadImage("data/restaurant_dark.png");
    ICONS.restaurant_light = loadImage("data/restaurant_light.png");
    ICONS.road_dark = loadImage("data/road_dark.png");
    ICONS.road_light = loadImage("data/road_light.png");
    ICONS.school_dark = loadImage("data/school_dark.png");
    ICONS.school_light = loadImage("data/school_light.png");
    ICONS.shop_dark = loadImage("data/shop_dark.png");
    ICONS.shop_light = loadImage("data/shop_light.png");
    ICONS.spa_dark = loadImage("data/spa_dark.png");
    ICONS.spa_light = loadImage("data/spa_light.png");
    ICONS.sports_dark = loadImage("data/sports_dark.png");
    ICONS.sports_light = loadImage("data/sports_light.png");
    ICONS.stadium_dark = loadImage("data/stadium_dark.png");
    ICONS.stadium_light = loadImage("data/stadium_light.png");
    ICONS.station_dark = loadImage("data/station_dark.png");
    ICONS.station_light = loadImage("data/station_light.png");
    ICONS.supermarket_dark = loadImage("data/supermarket_dark.png");
    ICONS.supermarket_light = loadImage("data/supermarket_light.png");
    ICONS.synagogue_dark = loadImage("data/synagogue_dark.png");
    ICONS.synagogue_light = loadImage("data/synagogue_light.png");
    ICONS.theater_dark = loadImage("data/theater_dark.png");
    ICONS.theater_light = loadImage("data/theater_light.png");
    ICONS.zoo_dark = loadImage("data/zoo_dark.png");
    ICONS.zoo_light = loadImage("data/zoo_light.png");
}

let labelsLayer;

function setup() {
    p5.disableFriendlyErrors = true;
    createCanvas(windowWidth, windowHeight, WEBGL);
    labelsLayer = createGraphics(windowWidth, windowHeight); // Создаем 2D холст
    labelsLayer.textFont(font);
    addScreenPositionFunction();
    gl = this._renderer.GL; 
    // 
    //
    //    П Е Р Е П И С А Т Ь   Н А   P R E L O A D ! ! !
    //
    //
    // Загружаем JSON-файлы и ПРЯМО ПРИСВАИВАЕМ их глобальным переменным
    // ТЕПЕРЬ вызываем функции чтения, когда данные уже загружены

    json_alleys = json_alleys_root.alleys || [];
    json_buildings = json_buildings_root.buildings || [];
    json_detalised_buildings = json_detalised_buildings_root.detalised_buildings || [];
    json_districts = json_districts_root.districts || [];
    json_fields = json_fields_root.fields || [];
    json_governments = json_governments_root.governments || [];
    json_green_areas = json_green_areas_root.green_areas || [];
    json_hospitals = json_hospitals_root.hospitals || [];
    json_labels = json_labels_root.labels || [];
    json_metro = json_metro_root.metro || [];
    json_parkings = json_parkings_root.parkings || [];
    json_railways = json_railways_root.railways || [];
    json_roads = json_roads_root.roads || [];
    json_sidewalks = json_sidewalks_root.sidewalks || [];
    json_underlays = json_underlays_root.underlays || [];
    json_waters = json_waters_root.waters || [];

    read_json_alleys();
    read_json_buildings();
    read_json_detalised_buildings();
    read_json_districts();
    read_json_fields();
    read_json_governments();
    read_json_green_areas();
    read_json_hospitals();
    read_json_metro();
    read_json_labels();
    read_json_parkings();
    read_json_railways();
    read_json_sidewalks();
    read_json_roads();
    read_json_underlays();
    read_json_waters();
    
    noStroke();
    applyTheme();

    buildGlobalMesh();
}
let staticMapModel = null;

// ... (оставьте preload и setup без изменений) ...

// Убираем старую переменную staticMapModel, теперь у нас их три в draw.js

function draw() {
    if (window.isAnimating && window.targetX !== null) {
        offsetX = window.targetX;
        offsetZ = window.targetZ;
        window.isAnimating = false;
        window.targetX = null;
        window.targetZ = null;
    }
    
    // ... остальной код ...
    noStroke();
    background(red(underlayClr), green(underlayClr), blue(underlayClr));
    
    push();
    translate(0, 100, 0);
    scale(zoom);
    rotateX(angleX);
    rotateY(angleY);
    translate(offsetX, 0, offsetZ);

    //drawCoordinateGrid();

    // 1. Рисуем Землю (самая нижняя, непрозрачная)
    if (staticGroundModel) {
        model(staticGroundModel);
    }


    // 2. Рисуем ЖД (линии, поверх земли)
    if (staticRailwaysModel) {
        push();
        model(staticRailwaysModel);
        pop();
    }

    for (let r of roads) {
        r.drawRoadLabel();
    }

    // 3. Рисуем Здания (полупрозрачные, поверх всего)
    // Рисование прозрачных объектов последними важно для корректного смешивания цветов
    if (staticBuildingsModel) {
        model(staticBuildingsModel);
    }

    // 4. Динамические элементы (текст, иконки, выделение)
    drawDynamicElements();
    
    pop();

    // Отладка FPS
    if (frameCount % 30 === 0) console.log("FPS: " + frameRate().toFixed(1));
}
