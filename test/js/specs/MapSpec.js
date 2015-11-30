describe("ALA.Map tests", function () {

    var MAP_ID = "testMap";

    beforeAll(function () {
        console.log("****** ALA.Map Tests ******");

        //jasmine.getFixtures().fixturesPath = 'fixtures';
        //affix("#testMap");
        //jasmine.setFixtures('<div class="testMap"></div>')
    });

    afterAll(function () {
        console.log("----------------------------");
    });

    beforeEach(function () {
        $('#testMap').remove();
        $('body').append('<div id="testMap"></div>');
    });

    it("Should construct a new Leaflet Map when new ALA.Map() is invoked", function() {
        var map = new ALA.Map("mapId");

        expect(map.getMapImpl()).toBeDefined();
    });
});