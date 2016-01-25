describe("ALA.Map tests", function () {

    var ID = "mapId";
    var html = "<div id='" + ID + "' data-leaflet-img='pathToLeafletImages'/>";
    var geoJson = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [
                        149.11927700042725,
                        -35.28069489877521
                    ],
                    [
                        149.11927700042725,
                        -35.27775205824131
                    ],
                    [
                        149.12567138671875,
                        -35.27775205824131
                    ],
                    [
                        149.12567138671875,
                        -35.28069489877521
                    ],
                    [
                        149.11927700042725,
                        -35.28069489877521
                    ]
                ]
            ]
        }
    };

    beforeAll(function () {
        console.log("****** ALA.Map layer/marker clearing test ******");
    });

    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        $('#mapId').remove();
        $(document.body).html(html)
    });

    it("should should remove existing drawn items on setGeoJson when adding a new one if options.singleDraw = true", function() {
        var map = new ALA.Map(ID, {singleDraw: true});

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(1);

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(1);
    });

    it("should should not remove existing drawn items on setGeoJson when adding a new one if options.singleDraw = true", function() {
        var map = new ALA.Map(ID, {singleDraw: false});

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(1);

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(2);
    });

    it("should should remove existing markers on setGeoJson when adding a new one if options.singleDraw = true and options.markerOrShapeNotBoth = true", function() {
        var map = new ALA.Map(ID, {singleDraw: true, markerOrShapeNotBoth: true});

        map.addMarker(-28, 150);

        expect(map.countFeatures()).toBe(1);

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(1);
    });

    it("should should not remove existing markers on setGeoJson when adding a new one if options.singleDraw = true and options.markerOrShapeNotBoth = false", function() {
        var map = new ALA.Map(ID, {singleDraw: false, markerOrShapeNotBoth: false});

        map.addMarker(-28, 150);

        expect(map.countFeatures()).toBe(1);

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(2);
    });

    it("should should remove existing markers on addMarker when adding a new one if options.singleMarker = true", function() {
        var map = new ALA.Map(ID, {singleMarker: true});

        map.addMarker(23, 149);

        expect(map.countFeatures()).toBe(1);

        map.addMarker(25, 150);

        expect(map.countFeatures()).toBe(1);
    });

    it("should should not remove existing markers on addMarker when adding a new one if options.singleMarker = true", function() {
        var map = new ALA.Map(ID, {singleMarker: false});

        map.addMarker(23, 149);

        expect(map.countFeatures()).toBe(1);

        map.addMarker(25, 150);

        expect(map.countFeatures()).toBe(2);
    });

    it("should should remove existing layers on addMarker if options.singleDraw = true and options.markerOrShapeNotBoth = true", function() {
        var map = new ALA.Map(ID, {singleDraw: true, markerOrShapeNotBoth: true});

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(1);

        map.addMarker(-28, 150);

        expect(map.countFeatures()).toBe(1);
    });

    it("should should not remove existing layers on addMarker if options.singleDraw = true and options.markerOrShapeNotBoth = false", function() {
        var map = new ALA.Map(ID, {singleDraw: false, markerOrShapeNotBoth: false});

        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(1);

        map.addMarker(-28, 150);

        expect(map.countFeatures()).toBe(2);
    });

    it("should remove all layers but leave all markers when clearLayers() is invoked", function() {
        var map = new ALA.Map(ID, {singleDraw: false, markerOrShapeNotBoth: false});

        map.addMarker(-28, 150);
        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(2);
        expect(map.getMarkerLocations().length).toBe(1);

        map.clearLayers();

        expect(map.countFeatures()).toBe(1);
        expect(map.getMarkerLocations().length).toBe(1);
    });

    it("should remove all markers but leave all layers when clearMarkers() is invoked", function() {
        var map = new ALA.Map(ID, {singleDraw: false, markerOrShapeNotBoth: false});

        map.addMarker(-28, 150);
        map.setGeoJSON(geoJson);

        expect(map.countFeatures()).toBe(2);
        expect(map.getMarkerLocations().length).toBe(1);

        map.clearMarkers();

        expect(map.countFeatures()).toBe(1);
        expect(map.getMarkerLocations().length).toBe(0);
    });

    it("should should remove existing drawn items on addClusteredPoints when adding a new one if options.singleDraw = true", function() {
        var map = new ALA.Map(ID, {singleDraw: true});

        map.addClusteredPoints([{lat: 23, lng: 159}, {lat: -23, lng: 147}]);

        expect(map.countFeatures()).toBe(1);

        map.addClusteredPoints([{lat: 23, lng: 159}, {lat: -23, lng: 147}]);

        expect(map.countFeatures()).toBe(1);
    });

    it("should should not remove existing drawn items on addClusteredPoints when adding a new one if options.singleDraw = true", function() {
        var map = new ALA.Map(ID, {singleDraw: false});

        map.addClusteredPoints([{lat: 23, lng: 159}, {lat: -23, lng: 147}]);

        expect(map.countFeatures()).toBe(1);

        map.addClusteredPoints([{lat: 23, lng: 159}, {lat: -23, lng: 147}]);

        expect(map.countFeatures()).toBe(2);
    });

    it("should should remove existing layers on addClusteredPoints when adding a new one if options.singleDraw = true and options.markerOrShapeNotBoth = true", function() {
        var map = new ALA.Map(ID, {singleDraw: true, markerOrShapeNotBoth: true});

        map.addMarker(-28, 150);

        expect(map.countFeatures()).toBe(1);

        map.addClusteredPoints([{lat: 23, lng: 159}, {lat: -23, lng: 147}]);

        expect(map.countFeatures()).toBe(1);
    });

    it("should should not remove existing markers on addClusteredPoints when adding a new one if options.singleDraw = true and options.markerOrShapeNotBoth = false", function() {
        var map = new ALA.Map(ID, {singleDraw: false, markerOrShapeNotBoth: false});

        map.addMarker(-28, 150);

        expect(map.countFeatures()).toBe(1);

        map.addClusteredPoints([{lat: 23, lng: 159}, {lat: -23, lng: 147}]);

        expect(map.countFeatures()).toBe(2);
    });
});