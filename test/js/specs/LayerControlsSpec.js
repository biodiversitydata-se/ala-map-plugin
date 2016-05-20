describe("ALA.Map tests", function () {

    var ID = "mapId";
    var map;
    var html = "<div id='" + ID + "' data-leaflet-img='pathToLeafletImages'/>";

    beforeAll(function () {
        console.log("****** ALA.Map with default configuration ******");
    });

    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        $('#mapId').remove();
        $(document.body).html(html)
    });

    it("should render a polygon when given a valid Polygon GeoJSON", function() {
        var map = new ALA.Map(ID);

        var geoJson = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [[[133.06640625, -22.10599879975055],
                    [124.8046875,  -28.998531814051795],
                    [144.580078125, -30.06909396443886],
                    [133.06640625,  -22.10599879975055]]]
            }
        };
        map.setGeoJSON(geoJson);

        expect(map.getBounds()).toEqual({
            _southWest: {
                lat: -30.06909396443886, lng: 124.8046875
            },
            _northEast: {
                lat: -22.10599879975055, lng: 144.580078125
            }
        });
    });



});