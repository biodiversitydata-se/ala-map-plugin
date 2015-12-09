/**
 * Extension to the standard Leaflet WMS layer to add the ability for the layer class to lookup the bounding box
 * from the WMS server, and to construct a polygon geoJSON object, with the pid of the layer in the properties object.
 *
 * For this to work, the options object passed to the initialise method must include a property called wmsFeatureUrl,
 * which contains the FULL url to lookup the features of the associated pid.
 *
 * @class
 *
 */
L.TileLayer.SmartWMS = L.TileLayer.WMS.extend({

    _latLngbounds: null,
    _lngLatbounds: null,
    _wmsFeatureUrl: null,
    _callback: null,
    _pid: null,
    _properties: {},
    _map: null,

    initialize: function(url, options) {
        this._wmsFeatureUrl = options.wmsFeatureUrl;
        this._callback = options.callback;
        this._pid = options.pid;

        L.TileLayer.WMS.prototype.initialize.call(this, url, options);
    },

    onAdd: function (map) {
        var self = this;

        this._map = map;

        L.TileLayer.WMS.prototype.onAdd.call(this, map);

        $.ajax({
            url: this._wmsFeatureUrl,
            dataType: "json"
        }).done(function(data) {
            if (data) {
                self._lngLatBounds = ALA.MapUtils.bboxToPointArray(data.bbox, false);
                self._latLngBounds = ALA.MapUtils.bboxToPointArray(data.bbox, true);
                self._properties = data;

                self.getBounds = function () {
                    return new L.LatLngBounds(self._latLngBounds);
                };
                self.toGeoJSON = function () {
                    return {
                        type: "Feature",
                        properties: self._properties,
                        geometry: {
                            type: "Polygon",
                            coordinates: [self._lngLatBounds]
                        }
                    };
                };

                self._callback();
            }
        });
    },

    getBounds: function() {
        return self._latLngBounds ? new L.LatLngBounds(self._latLngBounds) : this._map ? this._map.getBounds() : new L.LatLng(ALA.Map.DEFAULT_CENTRE.lat, ALA.Map.DEFAULT_CENTRE.lng);
    }
});

/**
 * Construct a new smart WMS layer.
 *
 * @param url The WMS url for the layer
 * @param options The options to pass to the wms server. Must include a pid and wmsFeatureUrl.
 * @returns {L.TileLayer.SmartWMS} the new layer
 */
L.tileLayer.smartWms = function (url, options) {
    return new L.TileLayer.SmartWMS(url, options);
};