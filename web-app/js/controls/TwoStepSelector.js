/**
 * Custom Leaflet control which will display two select boxes. Selecing an item in the first box will populate the second.
 * Selecting an item in the second box will update the map.
 *
 * <p/>
 * <b>Options:</b>
 * <ul>
 *     <li><pre>id</pre> - Unique id for the control</li>
 *     <li><pre>position</pre> - The location on the map (using leaflet's standard control positions). Default: topleft</li>
 *     <li><pre>title</pre> - The tooltip for the button. Default: 'Select...'</li>
 *     <li><pre>firstStepItems</pre> - array of items (key/value) to be displayed in the first selector (alternatively, use firstStepItemLookup)</li>
 *     <li><pre>firstStepItemLookup</pre> - Function callback to retrieve the list of items to be displayed in the first selector</li>
 *     <li><pre>firstStepTitle</pre> - Tooltip for the first select box</li>
 *     <li><pre>firstStepPlaceholder</pre> - Placeholder text for the first (null) item in the first selector. Default: 'Select one...'</li>
 *     <li><pre>secondStepItemLookup</pre> - Function callback to populate the second selector when the first selector is set</li>
 *     <li><pre>secondStepPlaceholder</pre> - Placeholder text for the first (null) item in the second selector. Default: 'Select one...'</li>
 *     <li><pre>secondStepTitle</pre> - Tooltip for the second select box</li>
 *     <li><pre>selectionAction</pre> - Function callback to invoke when the second selector is set</li>
 *     <li><pre>firstStepValue</pre> - The initial value for the first selector</li>
 *     <li><pre>iconClass</pre> - The CSS class(es) for the button icon. Default: 'fa fa-globe'</li>
 * </ul>
 *
 * @class
 */
L.Control.TwoStepSelector = L.Control.extend({
    options: {
        id: "replaceMe",
        position: "topleft",
        title: "Select...",
        firstStepItems: [],
        firstStepItemLookup: null,
        firstStepTitle: null,
        firstStepPlaceholder: "Select one...",
        secondStepItemLookup: null,
        secondStepPlaceholder: "Select one...",
        secondStepTitle: null,
        selectionAction: null,
        firstStepValue: null, //
        iconClass: "fa fa-globe"
    },

    initialize: function (options) {
        L.setOptions(this, options)
    },

    onAdd: function (map) {
        var self = this;

        self.map = map;

        self.id = self.options.id;
        var className = "two-step-selector leaflet-bar leaflet-control";
        var container = L.DomUtil.create("div", className);
        container.id = self.options.id;

        var icon = L.DomUtil.create("button", self.options.iconClass + " leaflet-bar-part", container);
        icon.title = self.options.title;

        var selectContainer = L.DomUtil.create("div", "selectors hide", container);
        self.step1 = L.DomUtil.create("select", "selector selector-one", selectContainer);
        self.step1.title = self.options.firstStepTitle || self.options.firstStepPlaceholder;
        if (self.options.firstStepPlaceholder) {
            var step1Placeholder = L.DomUtil.create("option", "", self.step1);
            step1Placeholder.value = null;
            step1Placeholder.innerHTML = self.options.firstStepPlaceholder;
        }

        if (self.options.firstStepItems) {
            self.options.firstStepItems.forEach(function (item) {
                var option = L.DomUtil.create("option", "", self.step1);
                option.value = item.key;
                option.innerHTML = item.value;
            });
        }

        self.step2 = L.DomUtil.create("select", "selector selector-two", selectContainer);
        self.step2.disabled = true;
        self.step2.title = self.options.secondStepTitle || self.options.secondStepPlaceholder;
        if (self.options.secondStepPlaceholder) {
            var step2Placeholder = L.DomUtil.create("option", "", self.step2);
            step2Placeholder.value = null;
            step2Placeholder.innerHTML = self.options.secondStepPlaceholder;
        }

        L.DomEvent.addListener(icon, 'click', function () {
            $("#" + self.id + " .selectors").toggleClass("hide inline-block")
        });


        L.DomEvent.addListener(self.step1, "change", function () {
            self.step1Changed(self)
        }, self);
        L.DomEvent.addListener(self.step2, "change", function () {
            self.step2Changed(self)
        }, self);

        L.DomEvent.disableClickPropagation(container);

        return container;
    },

    step1Changed: function (self) {
        var step1Selection = $("#" + this.options.id + " .selector-one").val();
        $("#" + this.options.id + " .selector-two").empty();
        self.step2.disabled = true;
        if (self.options.secondStepPlaceholder) {
            var step2Placeholder = L.DomUtil.create("option", "", self.step2);
            step2Placeholder.value = null;
            step2Placeholder.innerHTML = self.options.secondStepPlaceholder;
        }
        this.options.secondStepItemLookup(step1Selection, function (keyValuePairs) {
            self.populateStep2(self, keyValuePairs)
        });
    },

    populateStep2: function (self, keyValuePairs) {
        var step2 = self.step2;

        keyValuePairs.forEach(function (item) {
            var option = L.DomUtil.create("option", "", step2);
            option.value = item.key;
            option.innerHTML = item.value;
        });

        this.step2.removeAttribute("disabled");
    },

    step2Changed: function (self) {
        var step2Selection = $("#" + self.id + " .selector-two").val();
        self.options.selectionAction(step2Selection, self.map);
        $("#" + self.id + " .selectors").toggleClass("hide inline-block")
    }
});