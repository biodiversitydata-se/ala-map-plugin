"use strict";

/**
 * @namespace
 */
var ALA = ALA || {};

/**
 * Object for interacting with an ALA Occurrence map. This map is designed for displaying ALA occurrence records, with the ability for users to control the query facets behind the data.
 * <p/>
 *
 * The resulting query can be extracted and saved for later re-use.
 * </p>
 *
 * The query is used to interact with a biocache instance (the client must provide the base URL for the biocache). Some additional parameters are stored in the query string and used to control the appearance of the map (e.g. colour by options, which are not part of the query itself but are used to colour the results).
 * <p/>
 *
 * <b>Options</b>
 * <ul>
 *  <li><code>mapOptions</code> Object containing configuration options for the underlying map. See ALA.Map for details. If not provided, the defaults from ALA.Map will be used.</li>
 *  <li><code>showFacets</code> True to allow the user to change the facets used for the query. Default: true</li>
 *  <li><code>facetNameMapping</code> Object containing a mapping from the default facet field names to display labels to be used. If not provided then the field names will be formatted into human-readable form (capitalised, camel-case changed to sentence case, underscores replaced with spaces, etc). The format must be <code>{fieldName: "label", ...}</code>. All values displayed in the facet list can be mapped using this construct, regardless of the display level.</li>
 *  <li><code>excludeFacets</code> List of facet names to exclude from dislay. This list can contain items from any level in the facet list. If not provided, all available facets will be displayed.</li>
 *  <li><code>excludeSingles</code> True to hide any facet group which only contains a single option. Default: true</li>
 *  <li><code>maximumFacets</code> The maximum number of facets that can be selected via the 'choose more' dialog. Default: 15</li>
 *  <li><code>wms</code> True to use a WMS layer to display occurrences, false to render individual points as circles on a clustered map. Default: true</li>
 *  <li><code>mapAttribution</code> Attribution text to be displayed on the map. Default: blank</li>
 *  <li><code>points</code>Config options for the points on the map:
 *    <ul>
 *      <li><code>colour</code> The initial colour (in hex, without the #) to use for rendering occurrence points on the map. Default: #FF9900</li>
 *      <li><code>name</code> The point type (circle, etc). Default: circle</li>
 *      <li><code>size</code> The point radius in px. Default: 4px</li>
 *      <li><code>opacity</code> The point opacity (0 - 1). Default: 1</li>
 *    </ul>
 *  </li>
 * </ul>
 *
 * @class
 * @memberOf ALA
 * @param {String} id Unique id of the map container div. Mandatory.
 * @param {String} biocacheBaseUrl The base URL of the Biocache instance that will be used as the source for all data. Mandatory.
 * @param {String} queryString The initial query string to use to populate map (it will be passed to the Biocache's search service). This property must include the <code>q=</code> parameter at a minimum. Mandatory.
 * @param {Object} options Configuration options for the map. Optional - sensible defaults will be used if not provided. See the list above.
 */
ALA.OccurrenceMap = function (id, biocacheBaseUrl, queryString, options) {
    var self = this;

    if (!biocacheBaseUrl || _.isUndefined(biocacheBaseUrl) || _.isEmpty(biocacheBaseUrl)) {
        console.error("You must define the base URL for the Biocache instance you wish to use.");
    }

    if (!queryString || _.isUndefined(queryString) || _.isEmpty(queryString) || "q=" === queryString) {
        console.error("You must define the base query to use to populate the map.");
    }

    if (_.isUndefined(options)) {
        options = {};
    }

    /**
     * Default Map options
     *
     * @memberOf ALA.OccurrenceMap
     * @var
     */
    var DEFAULT_OPTIONS = {
        mapOptions: {
            useMyLocation: false,
            allowSearchLocationByAddress: false,
            allowSearchRegionByAddress: false,
            drawOptions: {
                marker: false
            },
            drawControl: false // temporary
        },
        facetNameMapping: {
            taxon_name: "Scientific name",
            raw_taxon_name: "Scientific name (unprocessed)",
            "": "Unknown",
            " ": "Unknown",
            "state": "State or Territory",
            "synonym.decade": "occurrence_year",
            "location_id": "Location ID",
            "event_id": "Event ID",
            "elevation_d_rng": "Elevation (in metres)",
            "min_elevation_d_rng": "Minimum elevation (in metres)",
            "cl1048": "IBRA 7 Regions",
            "cl21": "IMCRA Regions",
            "raw_identification_qualifier": "Raw identification qualifier",
            "original_name_usage": "Original name usage",
            "cl2079": "capad 2014 terrestrial",
            "cl2078": "capad 2014 marine",
            "cl925": "Estuary habitat mapping",
            "cl901": "Directory of Important Wetlands",
            "cl958": "Commonwealth Electoral Boundaries",
            "cl1049": "IBRA 7 Subregions",
            "cl1085": "Koppen Climate Classification (All Classes)",
            "cl678": "Land use",
            "cl991": "Geomorphology of the Australian Margin and adjacent seafloor",
            "cl916": "NRM Regions",
            "cl935": "RAMSAR wetland regions",
            "cl1057": "River Regions",
            "cl2013": "ASGS Australian States and Territories",
            "cl927": "States including coastal waters",
            "cl923": "Surface Geology of Australia",
            "cl619": "Vegetation - condition",
            "cl1076": "IGBP Land Cover vegetation classification scheme (2011)",
            "cl918": "National Dynamic Land Cover",
            "occurrence_decade_i": "Year (by decade)",
            "data_resource_uid": "Data resource",
            "data_resource": "Data resource",
            "dataset_name": "Dataset name",
            "species_list_uid": "Species lists",
            "Taxonomic ": " Taxonomic",
            "Taxon ": " Taxon",
            "Geospatial ": " Geospatial",
            "Temporal ": " Temporal",
            "Record\ details ": " Record details",
            "Attribution ": " Attribution",
            "Record\ assertions ": " Record assertions",
            "Ungrouped ": " Miscellaneous",
            "Identification": "Identification",
            "Occurrence": "Occurrence",
            "Location": "Location",
            "Assertions": "Assertions",
            "Record": "Record"
        },
        showFacets: true,
        excludeSingles: true,
        excludeFacets: [],
        includeFacets: [],
        maximumFacets: 15,
        wms: true,
        mapAttribution: "",
        point: {
            colour: "FF9900",
            size: 4,
            opacity: 1,
            name: "circle"
        }
    };

    var FACET_GROUP_URL = biocacheBaseUrl + "/ws/search/grouped/facets";
    var SEARCH_URL_PREFIX = biocacheBaseUrl + "/ws/occurrences/search.json?";
    var WMS_LAYER_URL = biocacheBaseUrl + "/ws/mapping/wms/reflect?";
    var WMS_BOUNDS_URL = biocacheBaseUrl + "/ws/mapping/bounds.json?";

    populateDefaultOptions(options);

    /**
     * The underlying ALA.Map object
     *
     * @memberOf ALA.OccurrenceMap
     * @var
     */
    self.map = null;

    // the biocache query with just the q= parameter, no facets (fq=). Facets are added via the selectedFacets list.
    var baseQuery = null;
    var selectedFacets = [];
    var wmsLayer = null;
    var currentFacets = null;
    var facetGroups = null;
    var fieldsToGroups = null;
    var facetPageSize = 50;
    var facetOffset = 0;
    var facetForModal = null;

    //
    // Public functions
    //

    /**
     * Retrieve the current query (excluding the server) for the occurrence records on the map
     *
     * @memberOf ALA.OccurrenceMap
     * @function getQueryString
     * @return {String} The current biocache query string to retrieve the occurrence records
     */
    self.getQueryString = function () {
        return constructBiocacheQuery();
    };

    /**
     * Set the current query string and update the occurrence map with the results.
     *
     * @memberOf ALA.OccurrenceMap
     * @function setQueryString
     * @param queryString {String} the biocache query string to populate the map and facet list
     */
    self.setQueryString = function (queryString) {
        selectedFacets = [];

        baseQuery = extractBaseQuery(queryString);

        update(queryString);
    };

    /**
     * Select a particular facet and update the occurrence map and facet list.
     *
     * @memberOf ALA.OccurrenceMap
     * @function selectFacet
     * @param facet {Object} An object containing a minimum of 'label' and 'fq': the 'fq' property will be used to identify the facet.
     * @param include True to INCLUDE the specified facet. False to EXCLUDE. Default: true.
     */
    self.selectFacet = function (facet, include) {
        if (_.isUndefined(include)) {
            include = true;
        }

        if (!include) {
            facet.label = "[exclude] " + facet.label;
            facet.fq = "-" + facet.fq;
        }

        selectedFacets.push(facet);

        update();
    };

    /**
     * Select a number of facets, combining them as either AND or OR
     *
     * @memberOf ALA.OccurrenceMap
     * @param facetsList List of facet objects (containing a minimum of 'label' and 'fq') to be added
     * @param and True to combine the facets as a logical AND, false to use a logical OR. Default: true.
     * @param include True to INCLUDE the specified facets. False to EXCLUDE. Default: true.
     */
    self.selectMultipleFacets = function (facetsList, and, include) {
        if (_.isUndefined(and)) {
            and = true;
        }
        if (_.isUndefined(include)) {
            include = true;
        }

        if (and) {
            _.each(facetsList, function (facet) {
                if (!include) {
                    facet.label = "[exclude] " + facet.label;
                    facet.fq = "-" + facet.fq;
                }
                selectedFacets.push(facet);
            });
        } else {
            var fq = include ? "(" : "-(";
            var label = include ? "(" : "[exclude] (";
            _.each(facetsList, function (facet, index) {
                fq += facet.fq;
                label += facet.label;
                if (index < facetsList.length - 1) {
                    fq += " OR ";
                    label += " OR ";
                }
            });

            fq += ")";
            label += ")";

            selectedFacets.push({label: label, fq: fq});
        }

        update();
    };

    /**
     * Remove a particular selected facet and update the occurrence map and facet list.
     *
     * @memberOf ALA.OccurrenceMap
     * @function clearFacet
     * @param facet {Object} An object containing a minimum of 'label' and 'fq': the 'fq' property will be used to identify the facet.
     */
    self.clearFacet = function (facet) {
        var index = _.findIndex(selectedFacets, function (f) {
            return f.fq == facet.fq
        });

        if (index > -1) {
            selectedFacets.splice(index, 1);

            update();
        }
    };

    /**
     * Clear all selected facets and update the occurrence map and facet list.
     *
     * @memberOf ALA.OccurrenceMap
     * @function clearAllFacets
     */
    self.clearAllFacets = function () {
        selectedFacets = [];

        update();
    };

    //
    // Private functions
    //

    function initialiseMap() {
        self.map = new ALA.Map(id, options.mapOptions);

        baseQuery = extractBaseQuery(queryString);

        update(queryString);

        queryString = null;
    }

    function update(queryString) {
        self.map.startLoading();

        populateFacetGroups(queryString);
        if (options.wms) {

            updateWMS(queryString);
        } else {
            console.error("WMS is the only option supported at the moment.");
        }

        self.map.finishLoading();
    }

    function updateWMS(queryString) {
        if (wmsLayer != null) {
            self.map.removeLayer(wmsLayer);
        }

        if (_.isUndefined(queryString)) {
            queryString = constructBiocacheQuery();
        }

        var wmsLayerUrl = WMS_LAYER_URL + queryString;
        var boundsUrl = WMS_BOUNDS_URL + queryString;

        self.map.addWmsLayer(undefined, {
            wmsLayerUrl: wmsLayerUrl,
            layers: 'ALA:occurrences',
            format: 'image/png',
            attribution: options.mapAttribution,
            outline: "true",
            transparent: false,
            opacity: 1,
            ENV: "color:" + options.point.colour + ";name:" + options.point.name + ";size:" + options.point.size + ";opacity:" + options.point.opacity,
            boundsUrl: boundsUrl,
            callback: self.setBounds
        });
    }

    function constructBiocacheQuery() {
        // remove any existing fq= query parameters first.
        var newQuery = baseQuery;

        selectedFacets.forEach(function (facet) {
            newQuery += "&fq=" + encodeURIComponent(facet.fq);
        });

        return newQuery;
    }

    function populateFacetGroups(queryString) {
        $.ajax({
            url: FACET_GROUP_URL,
            dataType: "json"
        }).done(function (data) {
            if (data) {
                facetGroups = data;
                fieldsToGroups = mapFacetFieldsToGroups(facetGroups);

                populateFacets(queryString);
            }
        });
    }

    function populateFacets(queryString) {
        if (_.isUndefined(queryString)) {
            queryString = constructBiocacheQuery();
        }

        $.ajax({
            url: SEARCH_URL_PREFIX + queryString,
            dataType: "json"
        }).done(function (facetsForQuery) {
            if (facetsForQuery) {
                currentFacets = constructFacetList(fieldsToGroups, facetsForQuery);

                updateSelectedFacets(facetsForQuery);

                updateFacetDOM();
            }
        });
    }

    function updateSelectedFacets(facetsForQuery) {
        $.each(facetsForQuery.activeFacetMap, function (fieldName, facet) {
            // ensure the fq is formatted consistently: this library always wraps AND and OR facets with brackets, but
            // the returned activeFacetMap from the biocache does not wrap its 'value' attribute (which is the actual fq
            // value). The biocache also does not include the '-' in the value attribute when using exclusion queries.
            // It does, however put the - and () in the displayName attribute. We need it in the fq.
            var fq = "";

            if (facet.displayName.charAt(0) == "-") {
                fq += "-(" + facet.name + ":" + facet.value + ")";
            } else if (facet.displayName.charAt(0) == "(") {
                fq = "(" + facet.name + ":" + facet.value + ")";
            } else {
                fq = facet.name + ":" + facet.value
            }

            var selectedFacet = {
                label: formatFacetName(facet.name) + ": " + formatFacetName(facet.value),
                fq: fq
            };

            var existingSelectedFacet = _.find(selectedFacets, function (f) {
                return f.fq == selectedFacet.fq
            });
            if (_.isUndefined(existingSelectedFacet)) {
                selectedFacets.push(selectedFacet);
            }
        });
    }

    function mapFacetFieldsToGroups(facetGroups) {
        var fieldsToGroups = {};

        facetGroups.forEach(function (group) {
            if (includeFacet(group.title)) {
                group.facets.forEach(function (facet) {
                    if (includeFacet(group.field)) {
                        fieldsToGroups[facet.field] = formatFacetName(group.title);
                    }
                });
            }
        });

        return fieldsToGroups;
    }

    function constructFacetList(fieldsToGroups, facetsForQuery) {
        var facets = {};

        facetsForQuery.facetResults.forEach(function (facet) {
            var fieldResults = [];

            facet.fieldResult.forEach (function (result) {
                if (result.count > 0 && includeFacet(result.label)) {
                    result.label = formatFacetName(result.label);

                    fieldResults.push(result);
                }
            });

            if (fieldResults.length > 1 || !options.excludeSingles) {
                var title = fieldsToGroups[facet.fieldName];

                if (!_.isUndefined(title)) {
                    if (_.isUndefined(facets[title])) {
                        facets[title] = [];
                    }

                    facets[title].push({
                        facetId: facet.fieldName,
                        fieldName: formatFacetName(facet.fieldName),
                        fieldResult: fieldResults
                    });
                }
            }
        });

        return facets;
    }

    function includeFacet(facet) {
        var include = true;

        if (!_.isEmpty(options.excludeFacets)) {
            include = !_.contains(options.excludeFacets, facet);
        }

        return include;
    }

    function updateFacetDOM() {
        var content = {
            facets: currentFacets,
            selectedFacets: selectedFacets
        };

        renderTemplate("#facetsTemplate", "#" + id + "Facets", content, true);

        $("#chooseMoreModal").off().on("show.bs.modal", function (event) {
            populateModalDialog(event);
        });

        $(".facet-item").off().on("click", function (event) {
            self.selectFacet(constructFacetFromElement($(this)), true);
            event.preventDefault();
        });

        $(".selected-facet-item").off().on("click", function (event) {
            self.clearFacet(constructFacetFromElement($(this)));
            event.preventDefault();
        });

        $("#" + id + "Facets .remove-all-facets").off().on("click", function (event) {
            self.clearAllFacets();
            event.preventDefault();
        });
    }

    function populateModalDialog(event) {
        var trigger = $(event.relatedTarget);
        var group = trigger.data("facet-group");
        var facetId = trigger.data("facet-id");

        var facet = _.find(currentFacets[group], function (f) {
            return f.facetId == facetId
        });

        renderTemplate("#chooseMoreModalBodyTemplate", "#chooseMoreModalBody", facet, true);

        facetOffset = 0;
        facetForModal = facet;
        loadFacetsForModal();

        $("#include").off().on("click", function (event) {
            var selectedFacets = selectionCount();
            if (selectedFacets > 0 && selectedFacets <= options.maximumFacets) {
                self.selectMultipleFacets(getMultiSelectFacets(), false, true);
                hideModal(event);
            } else if (selectedFacets > options.maximumFacets) {
                showTooManyFacetsError(selectedFacets);
            }
        });

        $("#exclude").off().on("click", function (event) {
            var selectedFacets = selectionCount();
            if (selectedFacets > 0 && selectedFacets <= options.maximumFacets) {
                self.selectMultipleFacets(getMultiSelectFacets(), false, false);
                hideModal(event);
            } else if (selectedFacets > options.maximumFacets) {
                showTooManyFacetsError(selectedFacets);
            }
        });

        $("#includeAll").off().on("click", function (event) {
            self.selectFacet({label: $(this).data("label") + ": *", fq: $(this).data("field-name") + ":*"}, true);
            hideModal(event);
        });

        $("#excludeAll").off().on("click", function (event) {
            self.selectFacet({label: $(this).data("label") + ": *", fq: $(this).data("field-name") + ":*"}, false);
            hideModal(event);
        });
    }

    function loadFacetsForModal() {
        var infiniscrollElem = $("#infiniscrollMarker");
        if (infiniscrollElem) {
            infiniscrollElem.remove();
        }

        var query = constructBiocacheQuery();

        $.ajax({
            url: SEARCH_URL_PREFIX + query + "&pageSize=0&fsort=index&facets=" + facetForModal.facetId + "&flimit=" + facetPageSize + "&foffset=" + facetOffset,
            dataType: "json"
        }).done(function (facets) {
            if (facets && facets.facetResults.length > 0) {
                facetOffset = facetOffset + facetPageSize;

                var content = {
                    fieldResult: facets.facetResults[0].fieldResult,
                    facetId: facetForModal.facetId,
                    fieldName: facetForModal.fieldName
                };

                renderTemplate("#chooseMoreTableTemplate", "#facetTableBody", content, false);

                $(".facet-item").off().on("click", function (event) {
                    self.selectFacet(constructFacetFromElement($(this)));
                    hideModal(event);
                });

                if (facets.facetResults[0].fieldResult.length >= facetPageSize) {
                    $('#infiniscrollMarker').off().on('inview', function () {
                        loadFacetsForModal();
                    });
                } else {
                    $("#infiniscrollMarker").remove();
                }
            }
        });
    }

    function hideModal(event) {
        $("#chooseMoreModal").modal('hide');
        facetOffset = 0;
        facetForModal = null;
        if (!_.isUndefined(event)) {
            event.preventDefault();
        }
    }

    function showTooManyFacetsError(numberSelected) {
        alert("Too many options selected - maximum is " + options.maximumFacets + ", you have selected " + numberSelected + ", please de-select " +
            (numberSelected - options.maximumFacets) + " options. \n\nNote: if you want to include/exclude all possible values (wildcard filter), use the drop-down option on the buttons below.");
    }

    function selectionCount() {
        return $(".facet-item-select:checked").length;
    }

    function getMultiSelectFacets() {
        var multiselectItems = [];
        $(".facet-item-select:checked").each(function () {
            multiselectItems.push(constructFacetFromElement($(this)));
        });

        return multiselectItems;
    }

    function renderTemplate(templateId, containerId, contents, emptyFirst) {
        var source = $(templateId).html();
        var template = Handlebars.compile(source);
        var container = $(containerId);

        if (emptyFirst) {
            container.empty();
        }
        container.append(template(contents));
    }

    function constructFacetFromElement(elem) {
        var fieldName = formatFacetName(elem.data("field-name"));
        var fq = elem.data("fq");
        var label = formatFacetName(elem.data("label"));

        return {label: fieldName + ": " + label, fq: fq}
    }

    function formatFacetName(name) {
        if (_.isUndefined(name) || _.isEmpty(name)) {
            name = "Unknown";
        } else {
            if (name.charAt(0) == "-" && name.length > 1) {
                name = name.substring(1);
            }

            var mappedDisplayName = options.facetNameMapping[name];

            if (_.isUndefined(mappedDisplayName)) {
                if (name && !_.isUndefined(name)) {
                    name = name.replace(/[^a-zA-Z0-9\-\\\/\.\?\*]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/ +/g, " ");
                } else {
                    name = "Unknown";
                }
            } else {
                name = mappedDisplayName;
            }

            if (name.length > 1) {
                name = name.charAt(0).toUpperCase() + name.substring(1);
            }
        }

        return name;
    }

    // Populate any missing configuration items with the default values
    function populateDefaultOptions(options) {
        _.defaults(options, DEFAULT_OPTIONS);
        _.defaults(options.point, DEFAULT_OPTIONS.point);
        _.defaults(options.mapOptions, DEFAULT_OPTIONS.mapOptions);
        _.defaults(options.facetNameMapping, DEFAULT_OPTIONS.facetNameMapping);
    }

    function extractBaseQuery(queryString) {
        var queryParams = URI.parseQuery(queryString);
        return "q=" + queryParams.q;
    }

    initialiseMap();
};
