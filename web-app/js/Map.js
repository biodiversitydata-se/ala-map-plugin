/**
 * @namespace
 */
var ALA = {};

/**
 * @class
 * @memberOf ALA
 */
ALA.MapConstants = {
    /**
     * Types of drawing objects
     */
    DRAW_TYPE: {
        POINT_TYPE: "Point",
        CIRCLE_TYPE: "Circle",
        POLYGON_TYPE: "Polygon"
    },

    /**
     * Types of layers
     */
    LAYER_TYPE: {
        MARKER: "marker"
    }
};

/**
 * Object for interacting with the map.
 *
 * <p/>
 * <b>Options</b>
 * <ul>
 *  <li><pre>center</pre> - Centre position of the map. Default: -28, 134</li>
 *  <li><pre>zoom</pre> - the initial zoom level. Default: 4</li>
 *  <li><pre>scrollWheelZoom</pre> - whether to enable zooming in/out by scrolling the mouse. Default: false</li>
 *  <li><pre>fullscreenControl</pre> - whether to include a full-screen option. Default: true</li>
 *  <li><pre>fullscreenControlOptions:</pre>
 *      <ul>
 *          <li><pre>position</pre> - position of the button on the map. Default: topleft</li>
 *      </ul>
 *  <li><pre>drawControl</pre> - whether to include drawing controls or not. Default: true</li>
 *  <li><pre>singleDraw</pre> - whether to allow more than 1 shape or region to be drawn at a time. This does NOT apply to markers - only layers and other shapes. See also singleMarker and markerOrShapeNotBoth. Default: true</li>
 *  <li><pre>singleMarker</pre> - whether to allow more than 1 marker to be drawn at a time.. Default: true</li>
 *  <li><pre>markerOrShapeNotBoth</pre> - whether to allow users to draw both markers and regions/shapes at the same time. Default: true</li>
 *  <li><pre>useMyLocation</pre> - whether to include a "Use My Location" button to place a marker on the map at the user's location. Default: true</li>
 *  <li><pre>allowSearchByAddress</pre> - whether to allow the user to search by address to place a marker on the map. Default: true</li>
 *  <li><pre>zoomToObject</pre> - whether to automatically fit the map to the bounds of a new object when added. Default: true</li>
 *  <li><pre>draggableMarkers</pre> - whether to allow point markers to be draggable by default. Default: true</li>
 *  <li><pre>wmsFeatureUrl</pre> - the URL to call to fetch features of a WMS layer (e.g. http://spatial-dev.ala.org.au/geoserver/wms/reflect?). The PID will be appended to this URL.. Default: </li>
 *  <li><pre>wmsLayerUrl</pre> - the URL to call to retrieve a WMS layer. The PID will be appended to this URL.. Default: </li>
 * </ul>
 *
 * @class
 * @param {String} id Unique id of the map container div. Mandatory.
 * @param {Object} options Configuration options for the map. Optional - sensible defaults will be used if not provided. See the list above.
 */
ALA.Map = function (id, options) {
    var self = this;

    var DEFAULT_CENTER = {
        lat: -28,
        lng: 134
    };

    var DEFAULT_ZOOM = 4;
    var SINGLE_POINT_ZOOM = 10;
    var MAX_AUTO_ZOOM = 15;
    var DEFAULT_MAX_ZOOM = 20;

    var DEFAULT_BASE_LAYER = {
        url: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: "abcd",
        attribution: "Map data &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, imagery &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>"
    };

    var DEFAULT_DRAW_OPTIONS = {
        polyline: false,
        edit: true
    };

    /**
     * Default Map options
     *
     * @memberOf ALA.Map
     * @var
     */
    var DEFAULT_OPTIONS = {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        maxZoom: DEFAULT_MAX_ZOOM,
        scrollWheelZoom: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: 'topleft'
        },
        drawControl: true,
        singleDraw: true,
        singleMarker: true,
        markerOrShapeNotBoth: true,
        useMyLocation: true,
        allowSearchByAddress: true,
        zoomToObject: true,
        worldCopyJump: true,
        draggableMarkers: true,
        showReset: true,
        wmsLayerUrl: null,
        wmsFeatureUrl: null,
        myLocationControlTitle: "Use my location",
        drawOptions: DEFAULT_DRAW_OPTIONS
    };

    if (!id) {
        console.error("You must define a unique id for your map.")
    }

    if (_.isUndefined(options)) {
        options = {};
    }
    populateDefaultOptions(options);

    var mapImpl = null;
    var drawControl = null;
    var drawnItems = new L.FeatureGroup();
    var markers = [];
    var subscribers = [];

    /**
     * Subscribe to all update events on the map.
     *
     * To listen for specific events, use {@link #registerListener} instead.
     *
     * @memberOf ALA.Map
     * @function subscribe
     * @param callback {function} the callback function to be invoked when the map is updated
     */
    self.subscribe = function (callback) {
        subscribers.push(callback);
    };

    /**
     * Stop listening to map update events.
     *
     * @memberOf ALA.Map
     * @function unsubscribe
     * @param callback {function} the callback function used to subscribe to events
     */
    self.unsubscribe = function (callback) {
        subscribers.removeItem(callback);
    };

    /**
     * Notify all subscribers of an update to the map
     *
     * @memberOf ALA.Map
     * @function notifyAll
     */
    self.notifyAll = function () {
        subscribers.forEach(function (sub) {
            sub();
        });
    };

    /**
     * Adds a listener for the specified event
     *
     * @memberOf ALA.Map
     * @function registerListener
     * @param eventName {String} the Leaflet event to listen to. Mandatory.
     * @param callback {function} The function to invoke when the event occurs. Mandatory.
     */
    self.registerListener = function (eventName, callback) {
        if (!eventName || !callback) {
            console.error("You must specify the eventName and callback when registering a listener");
        }

        mapImpl.on(eventName, callback);
    };

    /**
     * Removes a listener for the specified event. Leaflet identifies listeners by references, so the original
     * callback needs to be provided in order to find the listener to remove.
     *
     * @memberOf ALA.Map
     * @function removeListener
     * @param eventName {String} the Leaflet event being listened to. Mandatory.
     * @param callback {function} The function to invoke when the event occurs. Mandatory.
     */
    self.removeListener = function (eventName, callback) {
        mapImpl.off(eventName, callback)
    };

    /**
     * Retrieves the standard GeoJSON representation of all features that have been drawn on the map.
     *
     * Note that Circle objects are not supported by GeoJSON. Therefore, they are represented as Points in the resulting
     * geometry. A workaround has been added to include 'point_type' = 'circle' and 'radius' properties in the feature's
     * property object (this is still valid GeoJSON).
     *
     * @memberOf ALA.Map
     * @function getGeoJSON
     * @return {GeoJSON} Standard GeoJSON representation of the map's drawn features
     */
    self.getGeoJSON = function () {
        return drawnItems.toGeoJSON();
    };

    /**
     * Populate the map with the provided GeoJSON data.
     *
     * If a Point feature's properties object contains "point_type: 'Circle' and "radius: {m}", then the point will be
     * rendered as a circle.
     *
     * If the properties object of a feature includes a 'pid', then a new WMS layer will be added to the map instead of
     * a polygon layer.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function setGeoJSON
     * @param geoJSON {GeoJSON} Standard GeoJSON metadata for map features. This can be a JSON string, or a GeoJSON object.
     */
    self.setGeoJSON = function (geoJSON) {
        if (typeof geoJSON === 'string') {
            geoJSON = JSON.parse(geoJSON);
        }

        L.geoJson(geoJSON, {
            pointToLayer: pointToLayerCircleSupport,
            onEachFeature: function (feature, layer) {
                if (feature.properties.pid) {
                    self.addWmsLayer(feature.properties.pid);
                } else {
                    drawnItems.addLayer(layer);

                    if (options.zoomToObject) {
                        self.fitBounds();
                    }
                }
            }
        });

        self.notifyAll();
    };

    /**
     * Retrieve the unique id for this map
     *
     * @memberOf ALA.Map
     * @function getMapId
     * @returns {String} unique id of the map
     */
    self.getMapId = function () {
        return id;
    };

    /**
     * Retrieve the underlying map implementation
     *
     * @memberOf ALA.Map
     * @function getMapImpl
     * @returns {Object} Leaflet Map object
     */
    self.getMapImpl = function () {
        return mapImpl;
    };

    /**
     * Removes all custom layers, reverts to the initial base layer, resets the zoom level to the default and re-centres
     * the map.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function resetMap
     */
    self.resetMap = function () {
        self.clearLayers();
        self.clearMarkers();
        mapImpl.setZoom(DEFAULT_ZOOM);
        mapImpl.panTo(DEFAULT_CENTER);

        self.notifyAll();
    };

    /**
     * Remove all drawn layers from the map. This does not remove markers: see {@link self#clearMarkers}.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function clearLayers
     */
    self.clearLayers = function () {
        drawnItems.clearLayers();

        self.notifyAll();
    };

    /**
     * Remove all markers from the map. This does not remove other layers or shapes: see {@link self#clearLayers}.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function clearMarkers
     */
    self.clearMarkers = function () {
        markers.forEach(function (marker) {
            drawnItems.removeLayer(marker);
        });
        markers = [];

        self.notifyAll();
    };

    /**
     * Get the lat/lng coordinates of the centre of the map view
     *
     * @memberOf ALA.Map
     * @function getCentre
     * @returns {Object} lat/lng object
     */
    self.getCentre = function() {
        var centre = mapImpl.getCenter();
        return { lat: centre.lat, lng: centre.lng };
    };

    /**
     * Adds a marker at the specified point.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function addMarker
     * @param lat {double} Latitude for the marker
     * @param lng {double} Longitude for the marker
     * @returns {L.Marker} The L.marker object
     */
    self.addMarker = function (lat, lng) {
        var marker = L.marker([lat, lng], {draggable: options.draggableMarkers});

        addMarker(marker, true);

        return marker;
    };

    /**
     * Adds a marker at the user's current location.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function markMyLocation
     */
    self.markMyLocation = function () {
        mapImpl.locate({setView: true});
        mapImpl.on("locationfound", function (locationEvent) {
            self.addMarker(locationEvent.latlng.lat, locationEvent.latlng.lng);
            mapImpl.off("locationfound", this);
        });
    };

    /**
     * Add a new layer to the map.
     *
     * Will notify all subscribers.
     *
     * @memberOf ALA.Map
     * @function addLayer
     * @param {ILayer} layer The Leaflet Layer to add
     */
    self.addLayer = function (layer) {
        addLayer(layer, true);
    };

    /**
     * Utility method to add a WMS layer to the map.
     *
     * Triggers events draw:drawstart and draw:created, and will notify all subscribers
     *
     * @memberOf ALA.Map
     * @function addWmsLayer
     * @param pid {String} the PID of the region to be displayed in the WMS layer
     * @returns {L.TileLayer.SmartWMS} the L.TileLayer.WMS object
     */
    self.addWmsLayer = function (pid) {
        var wmsOptions = {
            tiled: true,
            format: 'image/png',
            opacity: 0.5,
            transparent: true,
            layers: "ALA:Objects",
            version: "1.1.0",
            srs: "EPSG:900913",
            pid: pid,
            viewparams: "s:" + pid,
            wmsFeatureUrl: options.wmsFeatureUrl + pid,
            callback: function () {
                self.fitBounds();
                self.notifyAll();
            }
        };

        if (_.isUndefined(options.wmsLayerUrl)) {
            console.error("You must specify the wmsLayerUrl and wmsFeatureUrl options for this map.")
        }
        var layer = L.tileLayer.smartWms(options.wmsLayerUrl, wmsOptions);

        addLayer(layer, true);
        layer.bringToFront(); // make sure the new layer sits on top of the other tile layers (like the base layer)

        return layer;
    };

    /**
     * Zoom and centre the map to fit the bounds of the current feature(s). If there are no features, then the map will
     * be set to the default zoom and centre.
     *
     * @memberOf ALA.Map
     * @function fitBounds
     */
    self.fitBounds = function () {
        if (self.countFeatures() > 0) {
            var hasGetBounds = true;

            mapImpl.eachLayer(function (layer) {
                hasGetBounds |= _.isUndefined(layer.getBounds);
            });

            if (hasGetBounds) {
                mapImpl.fitBounds(drawnItems.getBounds(), {maxZoom: MAX_AUTO_ZOOM});
            } else {
                // cannot determine the bounds from the layers, set the map centre and zoom level to the defaults
                mapImpl.setZoom(DEFAULT_ZOOM);
                mapImpl.panTo(DEFAULT_CENTER);
            }
        } else {
            mapImpl.setZoom(DEFAULT_ZOOM);
            mapImpl.panTo(DEFAULT_CENTER);
        }
    };

    /**
     * Invalidates the size of the map to trigger a re-draw, then fits the viewport to the current bounds.
     *
     * @memberOf ALA.Map
     * @function redraw
     */
    self.redraw = function() {
        mapImpl.invalidateSize();

        self.fitBounds();
    };

    /**
     * Adds a control widget to the map
     *
     * @memberOf ALA.Map
     * @function addControl
     * @param {L.Control} control The Leaflet Control to add
     */
    self.addControl = function (control) {
        mapImpl.addControl(control);
    };

    /**
     * Adds a button to the map..
     *
     * E.g.
     * <pre>
     *     addButton('fa fa-map-marker', function (button, map) { ... }
     * </pre>
     *
     * @memberOf ALA.Map
     * @function addButton
     * @param {String} style The CSS style, or a HTML string with a span or image etc, for the button
     * @param {function} closure A function pointer for the function to be invoked. The first parameter of the function will be the
     * leaflet button. The second parameter will be the leaflet map. I.e.
     * @param {String} position Leaflet Position value. Defaults to 'topleft'
     */
    self.addButton = function (style, closure, position) {
        var button = L.easyButton(style, closure).addTo(mapImpl);
        if (!_.isUndefined(position)) {
            button.setPosition(position);
        }
    };

    /**
     * Retrieve all leaflet markers on the map
     *
     * @memberOf ALA.Map
     * @function getAllMarkers
     * @returns {Array} of all L.Markers on the map
     */
    self.getAllMarkers = function() {
        return markers;
    };

    /**
     * Retrieve an array of objects of format [lat: x, lng: y] containing the coordinates of all markers on the map
     *
     * @memberOf ALA.Map
     * @function getMarkerLocations
     * @returns {Array} [lat: x, lng: y] of all markers
     */
    self.getMarkerLocations = function() {
        var locations = [];

        markers.forEach(function (marker) {
            locations.push({lat: marker.getLatLng().lat, lng: marker.getLatLng().lng});
        });

        return locations;
    };

    /**
     * Retrieve a count of all features (shapes, layers, markers, etc) on the map
     *
     * @memberOf ALA.Map
     * @function countFeatures
     * @return {Integer} count of all features (shapes, layers, markers, etc) on the map
     */
    self.countFeatures = function() {
        var count = markers.length;

        drawnItems.eachLayer(function () {
            count++;
        });

        return count;
    };

    // ----------------------
    // Private functions
    // ----------------------

    // Main initialiser
    function initialiseMap() {
        var enableDrawing = options.drawControl;

        options.drawControl = false;
        mapImpl = L.map(id, options);
        mapImpl.addLayer(drawnItems);

        addCoordinates();

        L.Icon.Default.imagePath = getLeafletImageLocation();

        mapImpl.addLayer(options.baseLayer);
        L.control.layers(options.otherLayers).addTo(mapImpl);

        if (options.useMyLocation) {
            var title = options.myLocationControlTitle || "Use my location";
            self.addButton("<span class='fa fa-location-arrow' title='" + title + "'></span>", self.markMyLocation, "topleft");
        }

        if (options.allowSearchByAddress) {
            addGeocodeControl();
        }

        if (enableDrawing) {
            initDrawingControls(options)
        }

        if (options.showReset) {
            self.addButton("<span class='fa fa-refresh reset-map' title='Reset map'></span>", self.resetMap, "bottomleft");
        }

        // If the map container is not visible, add a listener to trigger a redraw once it becomes visible.
        // This avoids problems with the map viewport being initialised to an incorrect size because Leaflet could not
        // determine the size of the container.
        var container = $("#" + id)
        if (!container.is(":visible")) {
            container.onImpression({
                callback: self.redraw
            });
        }
    }

    // Populate any missing configuration items with the default values
    function populateDefaultOptions(options) {
        _.defaults(options, DEFAULT_OPTIONS);

        var minimalLayer = L.tileLayer(DEFAULT_BASE_LAYER.url, {
            attribution: DEFAULT_BASE_LAYER.attribution,
            subdomains: DEFAULT_BASE_LAYER.subdomains,
            maxZoom: 21
        });

        if (_.isEmpty(options.otherLayers))
            options.otherLayers = {
                Minimal: minimalLayer,
                WorldImagery: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                    maxZoom: 17
                })
            };
        if (_.isUndefined(options.baseLayer)) {
            options.baseLayer = minimalLayer;
        }
    }

    // Initialise the drawing controls that appear on the left side of the map panel
    function initDrawingControls(options) {
        var drawOptions = options.drawOptions || {};

        _.defaults(drawOptions, DEFAULT_DRAW_OPTIONS);

        drawControl = new L.Control.Draw({
            edit: drawOptions.edit ? {
                featureGroup: drawnItems
            } : false,
            draw: drawOptions
        });
        mapImpl.addControl(drawControl);

        mapImpl.on("draw:created", function (event) {
            if (event.layerType === ALA.MapConstants.LAYER_TYPE.MARKER) {
                if (options.singleMarker) {
                    markers = [];
                }
                markers.push(event.layer);
                if (options.draggableMarkers) {
                    event.layer.options.draggable = true;
                    event.layer.on("dragend", self.notifyAll);
                }

                addMarker(event.layer, true);
            } else {
                addLayer(event.layer, true);
            }
        });
        mapImpl.on("draw:editstop", self.notifyAll);
        mapImpl.on("draw:deletestop", self.notifyAll);

        mapImpl.on("draw:drawstart", function (event) {
            drawingStarted(event.layerType);
        });

        updateCircleFeaturesToIncludeTypeAndRadius();
    }

    // Determines if existing items need to be removed before adding a new item
    function drawingStarted(layerType) {
        if (layerType === ALA.MapConstants.LAYER_TYPE.MARKER) {
            if (options.singleMarker) {
                markers.forEach(function (marker) {
                    drawnItems.removeLayer(marker);
                });
                markers = [];
                if (options.markerOrShapeNotBoth) {
                    drawnItems.clearLayers();
                }
            }
        } else if (options.singleDraw) {
            drawnItems.clearLayers();
            if (options.markerOrShapeNotBoth) {
                markers.forEach(function (marker) {
                    drawnItems.removeLayer(marker);
                });
                markers = [];
            }
        }
    }

    // This is a workaround for https://github.com/Leaflet/Leaflet/issues/2888
    // The GeoJSON standard does not support Circle types, so Leaflet treats circles as points. This workaround adds a
    // 'point_type' attribute to the the feature's properties with value 'Circle', and adds the radius, so at least the
    // feature properties include the circle details. This is still valid GeoJSON.
    function updateCircleFeaturesToIncludeTypeAndRadius() {
        var circleToGeoJSON = L.Circle.prototype.toGeoJSON;
        L.Circle.include({
            toGeoJSON: function () {
                var feature = circleToGeoJSON.call(this);
                feature.properties = {
                    point_type: ALA.MapConstants.DRAW_TYPE.CIRCLE_TYPE,
                    radius: this.getRadius()
                };
                return feature;
            }
        });
    }

    // Render any GeoJSON feature where the geometry type = Point but the properties contains point_type = 'Circle'
    // as a circle instead of a point. This is because GeoJSON does not support Circle types.
    function pointToLayerCircleSupport(feature, latlng) {
        if (feature.properties.point_type === ALA.MapConstants.DRAW_TYPE.CIRCLE_TYPE) {
            return L.circle(latlng, feature.properties.radius, {});
        } else {
            var marker = L.marker(latlng, {draggable: options.draggableMarkers});
            if (options.draggableMarkers) {
                marker.on("dragend", self.notifyAll);
            }
            return marker;
        }
    }

    // Adds the lat/lng coordinates to the bottom of the map panel
    function addCoordinates() {
        L.control.coordinates({
            position: "bottomleft",
            decimals: 2,
            enableUserInput: false,
            useLatLngOrder: true
        }).addTo(mapImpl);
    }

    // The container div is expected to have an attribute 'data-leaflet-img' which contains the path to the Leaflet images.
    // The path is the absolute URL, minus the host/port.
    function getLeafletImageLocation() {
        return $("#" + id).attr("data-leaflet-img");
    }

    // Display an input field and search button to allow the user to enter an address, then perform a geocode address
    // search and place a marker on the map
    function addGeocodeControl() {
        var geocodeControl = L.Control.geocoder({position: "topleft"}).addTo(mapImpl);
        $(".leaflet-control-geocoder-icon").attr("title", "Search for an address or location");
        geocodeControl.markGeocode = function (result) {
            self.addMarker(result.center.lat, result.center.lng);
        }
    }

    // Internal method to add a non-Marker layer to the map, to fit the map bounds if configured to do so, and optionally
    // to notify all subscribers that the map has changed.
    function addLayer(layer, notify) {
        if (options.singleDraw) {
            self.clearLayers();
        }

        layer.addTo(drawnItems);

        if (options.zoomToObject && layer.getBounds) {
            mapImpl.fitBounds(drawnItems.getBounds(), {maxZoom: MAX_AUTO_ZOOM});
        }

        if (notify) {
            self.notifyAll();
        }
    }

    // Internal method to add a Marker to the map, to fit the map bounds if configured to do so, and optionally to notify
    // all subscribers that the map has changed.
    function addMarker(marker, notify) {
        drawingStarted(ALA.MapConstants.LAYER_TYPE.MARKER);

        if (options.draggableMarkers) {
            marker.on("dragend", self.notifyAll);
        }

        marker.addTo(drawnItems);
        markers.push(marker);

        if (options.zoomToObject) {
            mapImpl.panTo(marker.getLatLng());
            mapImpl.fitBounds(new L.LatLngBounds(marker.getLatLng(), marker.getLatLng()), {maxZoom: SINGLE_POINT_ZOOM});
        }

        if (notify) {
            self.notifyAll();
        }
    }

    initialiseMap();
};

/**
 * @class
 * @memberOf ALA
 */
ALA.MapUtils = {

    /**
     * Utility method to take a standard GeoJSON object and change the geometry of Point types to Circle types (not
     * supported by the GeoJSON standard). This function assumes that the properties object of the circle features has
     * a property of 'point_type' with a value of 'circle', and a property of 'radius'.
     *
     * I.e. this function will convert
     * <pre>
     *      {
     *         "type": "FeatureCollection",
     *         "features": [
     *           {
     *             "type": "Feature",
     *             "properties": {
     *               "point_type": "circle",
     *               "radius": 1027747.8506951465
     *             },
     *             "geometry": {
     *               "type": "Point",
     *               "coordinates": [
     *                 122.51953124999999,
     *                 -13.410994034321702
     *               ]
     *             }
     *           }
     *         ]
     *       }
     * </pre>
     * into
     * <pre>
     * {
     *     "type": "FeatureCollection",
     *     "features": [
     *       {
     *         "type": "Feature",
     *         "properties": {
     *           "point_type": "circle",
     *           "radius": 1027747.8506951465
     *         },
     *         "geometry": {
     *           "type": "Circle",
     *           "coordinates": [
     *             122.51953124999999,
     *             -13.410994034321702
     *           ],
     *           "centre": [
     *             122.51953124999999,
     *             -13.410994034321702
     *           ],
     *           "radius": 1027747.8506951465
     *         }
     *       }
     *     ]
     *   }
     * </pre>
     * @param geoJSON
     * @returns {*}
     */
    getGeometryWithCirclesFromGeoJSON: function (geoJSON) {
        if (!_.isUndefined(geoJSON) && !_.isEmpty(geoJSON.features)) {
            _.each(geoJSON.features, function (feature) {
                if (feature.properties.point_type == ALA.MapConstants.DRAW_TYPE.CIRCLE_TYPE) {
                    feature.geometry.type = ALA.MapConstants.DRAW_TYPE.CIRCLE_TYPE;
                    feature.geometry.centre = feature.geometry.coordinates;
                    feature.geometry.radius = feature.properties.radius;
                }
            })
        }

        return geoJSON;
    },

    /**
     * Performs the opposite of {@link #getGeometryWithCirclesFromGeoJSON} to produce valid standard GeoJSON.
     *
     * @param geoJSON The modified GeoJSON to be converted back to the standard format.
     * @returns {GeoJSON}
     */
    getStandardGeoJSONForCircleGeometry: function (geoJSON) {
        if (!_.isUndefined(geoJSON) && !_.isEmpty(geoJSON.features)) {
            _.each(geoJSON.features, function (feature) {
                if (feature.geometry.type === ALA.MapConstants.DRAW_TYPE.CIRCLE_TYPE) {
                    feature.properties.point_type = ALA.MapConstants.DRAW_TYPE.CIRCLE_TYPE;
                    feature.properties.radius = feature.geometry.radius;
                    delete feature.geometry.radius;
                    feature.geometry.type = ALA.MapConstants.DRAW_TYPE.POINT_TYPE;
                }
            })
        }

        return geoJSON;
    },

    /**
     * Takes a bare geoJSON geometry object, and wraps it in a full GeoJSON structure with type=FeatureCollection
     *
     * @param geometry The geoJSON geometry object to wrap
     * @returns {Object} Full GeoJSON structure with type=FeatureCollection
     */
    wrapGeometryInGeoJSONFeatureCol: function (geometry) {
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {},
                    geometry: geometry
                }
            ]
        };
    },

    /**
     * Converts a bounding box string of format POLYGON((lng1 lat1, lng2 lat2,...)) (POLYGON or LINESTRING) into an
     * array of coordinates. The order of the latitude and longitude can be controlled by the latFirst parameter.
     *
     * @param bboxString Bounding box string to convert
     * @param latFirst True to produce LAT/LNG points, false to produce LNG/LAT points.
     * @returns {Array} array of points
     */
    bboxToPointArray: function (bboxString, latFirst) {
        var coords = bboxString.replace(/POLYGON|LINESTRING/g, "").replace(/[\\(|\\)]/g, "");
        var coordsArray = [];
        coords.split(",").forEach(function (item) {
            coordsArray.push(latFirst ? item.split(" ").reverse() : item.split(" "));
        });

        return coordsArray;
    }

};