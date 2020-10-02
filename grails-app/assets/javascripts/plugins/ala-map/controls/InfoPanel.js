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
 * Created by Temi on 1/10/20.
 */
L.Control.InfoPanel = L.Control.extend({
    options: {
        id: "replaceMe",
        position: "bottomright",
        title: 'Show info',
        closeTitle: 'Close',
        collapse: false,
        label: null,
        infoPanelClass: "info-panel-container",
        iconClass: "icon-info-sign",
        closeClass: "icon-remove",
        content: '',
        width: 200,
        height: 200
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

        self.infoPanel = L.DomUtil.create("div", "legend-container " + self.options.infoPanelClass, container)
        self.infoPanel.id = self.options.id;

        self.closeBtn = L.DomUtil.create("button", " leaflet-bar-part pull-right", self.infoPanel);
        self.closeBtn.title = self.options.closeTitle;
        L.DomUtil.create("i", self.options.closeClass , self.closeBtn);

        self.infoPanelTitle = L.DomUtil.create("h6", "", self.infoPanel);

        self.contentPanel = L.DomUtil.create("div", "info-content-panel", self.infoPanel);
        self.contentPanel.style = 'width: 100%; box-sizing: border-box;';

        self.setContent(self.options.content, self.options.title);
        if (self.options.collapse) {
            $(self.closeBtn).hide();
            $(self.contentPanel).hide();
            $(self.infoPanelTitle).hide();
        }
        else {
            $(self.expandBtn).hide();
        }

        L.DomEvent.addListener(self.expandBtn, 'click', function(event) {
            $(self.closeBtn).show();
            $(self.infoPanel).show();
            $(self.expandBtn).hide();
            event.preventDefault();
            if(typeof ga !== 'undefined')
                ga('send', 'event', 'map-info', 'info-open');
        });

        L.DomEvent.addListener(self.closeBtn, 'click', function(event) {
            $(self.closeBtn).hide();
            $(self.infoPanel).hide();
            $(self.expandBtn).show();
            event.preventDefault();
            if(typeof ga !== 'undefined')
                ga('send', 'event', 'map-info', 'info-close');
        });

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    },

    setTitle: function (title) {
        var self = this;
        if (title) {
            self.infoPanelTitle.innerText = title;
            $(self.infoPanelTitle).show();
        } else {
            $(self.infoPanelTitle).hide();
        }
    },
    setContent: function (content, title) {
        var self = this;
        if (content) {
            self.contentPanel.innerText = content;
            $(self.contentPanel).show();
        } else {
            $(self.contentPanel).hide();
        }

        if (title) {
            self.setTitle(title);
        }
    }
});