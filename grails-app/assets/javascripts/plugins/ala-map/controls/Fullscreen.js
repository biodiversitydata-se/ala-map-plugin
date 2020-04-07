L.Control.FullScreen = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Full Screen',
        forceSeparateButton: false,
        forcePseudoFullscreen: false
    },

    onAdd: function (map) {
        var className = 'leaflet-control-zoom-fullscreen', container;

        if (map.zoomControl && !this.options.forceSeparateButton) {
            container = map.zoomControl._container;
        } else {
            container = L.DomUtil.create('div', 'leaflet-bar');
        }

        this._createButton(this.options.title, className, container, this.toogleFullScreen, map);

        return container;
    },

    _createButton: function (title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.href = '#';
        link.title = title;

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stopPropagation)
            .addListener(link, 'click', L.DomEvent.preventDefault)
            .addListener(link, 'click', fn, context);

        L.DomEvent
            .addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
            .addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
            .addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

        L.DomEvent
            .addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
            .addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
            .addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

        return link;
    },

    toogleFullScreen: function () {
        this._exitFired = false;
        var container = this._container;
        if (this._isFullscreen) {
            if (fullScreenApi.supportsFullScreen && !this.options.forcePseudoFullscreen) {
                fullScreenApi.cancelFullScreen(container);
            } else {
                L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
            }
            this.invalidateSize();
            this.fire('exitFullscreen');
            this._exitFired = true;
            this._isFullscreen = false;
        }
        else {
            if (fullScreenApi.supportsFullScreen && !this.options.forcePseudoFullscreen) {
                fullScreenApi.requestFullScreen(container);
            } else {
                L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
            }
            this.invalidateSize();
            this.fire('enterFullscreen');
            this._isFullscreen = true;
        }
    },

    _handleEscKey: function () {
        if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
            this.fire('exitFullscreen');
            this._exitFired = true;
            this._isFullscreen = false;
        }
    }
});

L.Map.addInitHook(function () {
    if (this.options.fullscreenControl) {
        this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
        this.addControl(this.fullscreenControl);
    }
});

L.control.fullscreen = function (options) {
    return new L.Control.FullScreen(options);
};
