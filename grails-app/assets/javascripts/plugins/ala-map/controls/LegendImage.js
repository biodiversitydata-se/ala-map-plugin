/*
 * Copyright (C) 2020 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 5/3/20.
 */

/*
 * Custom Leaflet control which will display a legend image produced by GeoServer.
 *
 * <p/>
 * <b>Options:</b>
 * <ul>
 *     <li><code>id</code> Unique id for the control</li>
 *     <li><code>position</code> The location on the map (using leaflet's standard control positions). Default: bottomright</li>
 *     <li><code>collapse</code> True to show a button until clicked, then show the legendbox; false to just show the expanded legend box. Default: false</li>
 *     <li><code>label</code> The label to give to the list of legend colours, set to null for no label. Default: null</li>
 *     <li><code>title</code> The title the button when collapse=true. Default: 'Show legend'</li>
 *     <li><code>iconClass</code> The CSS class(es) for the button icon (if collapse=true). Default: 'fa fa-list'</li>
 *     <li><code>legendListClass</code> The CSS class(es) legend list container. Default: none</li>
 * </ul>
 *
 * @class
 */
L.Control.LegendImage = L.Control.extend({
    options: {
        id: "replaceMe",
        position: "bottomright",
        title: 'Show legend',
        closeTitle: 'Close',
        collapse: false,
        label: null,
        iconClass: "icon-list",
        closeClass: "icon-remove",
        legendListClass: "",
        url: "",
        width: null

    },

    initialize: function (options) {
        L.setOptions(this, options)
    },

    onAdd: function (map) {
        var self = this;
        self.map = map;

        self.id = self.options.id;
        var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");

        self.expandBtn = L.DomUtil.create("button", " leaflet-bar-part ", container);
        self.expandBtn.title = self.options.title;
        L.DomUtil.create("i", self.options.iconClass , self.expandBtn);

        self.legend = L.DomUtil.create("div", "legend-container " + self.options.legendListClass, container);
        self.legend.style = 'width: 100%; box-sizing: border-box;';
        self.legend.id = self.options.id;

        self.closeBtn = L.DomUtil.create("button", " leaflet-bar-part pull-right", self.legend);
        self.closeBtn.title = self.options.closeTitle;
        L.DomUtil.create("i", self.options.closeClass , self.closeBtn);

        self.imageContainer = L.DomUtil.create("div", "image-container " , self.legend);
        self.imageContainer.style = 'width: 100%; box-sizing: border-box;';

        self.updateLegend();

        if (self.options.collapse) {
            $(self.closeBtn).hide();
            $(self.legend).hide();
        }
        else {
            $(self.expandBtn).hide();
        }

        L.DomEvent.addListener(self.expandBtn, 'click', function(event) {
            $(self.closeBtn).show();
            $(self.legend).show();
            $(self.expandBtn).hide();
            event.preventDefault();
            ga && ga('send', 'event', 'map-legend', 'legend-open');
        });

        L.DomEvent.addListener(self.closeBtn, 'click', function(event) {
            $(self.closeBtn).hide();
            $(self.legend).hide();
            $(self.expandBtn).show();
            event.preventDefault();
            ga && ga('send', 'event', 'map-legend', 'legend-close');
        });

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    },

    updateLegend: function (url) {
        var self = this;
        var url = url || self.options.url;
        self.clearLegend();

        if (url) {
            var spinner = L.DomUtil.create("span", "fa fa-spin fa-spinner", self.imageContainer);
            var img = L.DomUtil.create("img", "legend-image ", self.imageContainer);
            $(img).hide();
            img.onload = function () {
                $(spinner).toggle();
                $(img).toggle();
            };
            img.src = url;
        }
    },

    clearLegend: function() {
        var self = this;

        while (self.imageContainer.firstChild) {
            self.imageContainer.removeChild(self.imageContainer.firstChild);
        }
    }
});
