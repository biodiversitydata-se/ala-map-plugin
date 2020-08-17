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
 * Created by Temi on 13/8/20.
 */

/*
 */
L.Control.HorizontalMultiInput = L.Control.extend({
    includes: L.Mixin.Events,
    options: {
        id: "replaceMe",
        position: "topright",
        items: [],
        defaultNoneDisplayText: "None"
    },
    integer: null,
    initialize: function (options) {
        L.setOptions(this, options)
    },

    onAdd: function (map) {
        var self = this;
        self.map = map;
        var container = L.DomUtil.create("div", "leaflet-control-layers leaflet-control");
        self.container = container
        var controlHTML =
            "<table class='horizontal-control'>" +
                "<tbody id='"+self.options.id+"'>" +
                    "<tr>" +
                        self.constructHTMLForItems(self.options.items) +
                    "</tr>" +
                "</tbody>" +
            "</table>";

        self.id = self.options.id;
        $(controlHTML).prependTo(container);
        self.registerListeners();

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    },
    constructHTMLForItems: function (items) {
        var self = this,
            html = "";

        items.forEach(function (item) {
            var itemHTML

            switch (item.type) {
                case 'select':
                    itemHTML = self.selectHTML(item);
                    break;
                case 'slider':
                    itemHTML = self.sliderHTML(item)
                    break;
                default:
                    console.warn("HorizontalMultiInput Control: Unsupported input type - " + item.type);
                    break;
            }

            if (itemHTML) {
                html += "<td>" + itemHTML + "</td>";
            }
        });

        return html;
    },
    selectHTML: function (item) {
        var self = this,
            html =
                "<label for=\""+ item.id +"\">" + item.label + "&nbsp;</label>" +
                "<div class='horizontal-control-item'>" +
                    "<select name=\"" + item.name + "\" id=\"" + item.id + "\">" +
                        self.generateSelectOptions(item.values) +
                    "</select>" +
                "</div>";

        return html;
    },
    generateSelectOptions: function (values) {
        var self =this,
            html = "";
        values = values || [];

        values.forEach(function (item) {
            var selected = item.selected ? "selected" : "";
            if (item.key == "") {
                html += '<option value="" '+ selected +'>' + (item.value || self.options.defaultNoneDisplayText) + '</option>';
            } else {
                html += '<option value="' + item.key +'" '+ selected +'>' + (item.value || item.key) + '</option>';
            }
        });

        return html;
    },
    setSelectOptions: function(id, values){
        var self = this,
            $container = $(self.container),
            $select = $container.find("#"+id),
            optionsHTML = self.generateSelectOptions(values);

        $select.html(optionsHTML);
    },
    registerListeners: function () {
        var self = this,
            $container = $(self.container);

        self.options.items.forEach(function (item) {
            var $item = $container.find("#" +item.id);
            switch (item.type) {
                case 'select':
                    $item.on('change', function () {
                        var value = $item.val();
                        self.fire('change', {value: value, item: item});
                        ga && ga('send', 'event', 'map-horizontal', item.id, value);
                    });
                    break;
                case 'slider':
                    $item.find("div").slider(item.options).on('slidechange', function (ev, ui) {
                        var value;
                        if (self.integer) {
                            value = parseInt(ui.value);
                        } else {
                            // prevent values like 0.30000000004 appearing
                            value = parseFloat(ui.value).toFixed(1);
                        }
                        $item.find("label").html(item.label + ' ' + value + '&nbsp;');
                        self.fire('change', {value: value, item: item});
                        ga && ga('send', 'event', 'map-horizontal', item.label || item.id, value);
                    });
                    break;
            }
        });

    },
    sliderHTML: function (item) {
        var self = this;
        var html =
            "<div id='" + item.id + "' style='" + (item.style || "") + "'>" +
                "<label>" +
                    item.label + ' ' + item.options.value + "&nbsp;" +
                "</label>" +
                "<div class='horizontal-control-item' style='width:" + item.options.length + ";'>" +
                "</div>" +
            "</div>";

        //set integer flag
        var opt = item.options;
        if (self.isInt(opt.min) && self.isInt(opt.max) && self.isInt(opt.step)) {
            self.integer = true;
        } else {
            self.integer = false;
        }

        return html;
    },
    isInt: function (a) {
        if ((parseFloat(a) === parseInt(a)) && !isNaN(a)) {
            return true;
        } else {
            return false;
        }
    }
});
