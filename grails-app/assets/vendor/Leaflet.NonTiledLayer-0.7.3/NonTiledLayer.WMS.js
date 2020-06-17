/**
 * Copyright (c) 2016-17, PTV Group
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
/*
 * L.NonTiledLayer.WMS is used for putting WMS non-tiled layers on the map.
 */

L.NonTiledLayer.WMS = L.NonTiledLayer.extend({

	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/jpeg',
		transparent: false
	},

	initialize: function (url, options) { // (String, Object)
		this._wmsUrl = url;

		var wmsParams = L.extend({}, this.defaultWmsParams);

		// all keys that are not NonTiledLayer options go to WMS params
		for (var i in options) {
			if (!L.NonTiledLayer.prototype.options.hasOwnProperty(i)) {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		var projectionKey = parseFloat(this.wmsParams.version) >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = map.options.crs.code;

		L.NonTiledLayer.prototype.onAdd.call(this, map);
	},

	getImageUrl: function (world1, world2, width, height) {
		var wmsParams = this.wmsParams;
		wmsParams.width = width;
		wmsParams.height = height;

		var crs = this._map.options.crs;

		var p1 = crs.project(world1);
		var p2 = crs.project(world2);

		var url = this._wmsUrl + L.Util.getParamString(wmsParams, this._wmsUrl) + '&bbox=' + p1.x + ',' + p2.y + ',' + p2.x + ',' + p1.y;
		return url;
	},

	setParams: function (params, noRedraw) {

		L.extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});

L.nonTiledLayer.wms = function (url, options) {
	return new L.NonTiledLayer.WMS(url, options);
};
