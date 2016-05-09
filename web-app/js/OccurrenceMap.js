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
 * @param {String} baseQuery The initial query string to use to populate map (it will be passed to the Biocache's search service). This property must include the <code>q=</code> parameter at a minimum. Mandatory.
 * @param {Object} options Configuration options for the map. Optional - sensible defaults will be used if not provided. See the list above.
 */
ALA.OccurrenceMap = function (id, biocacheBaseUrl, baseQuery, options) {
    var self = this;

    if (!biocacheBaseUrl || _.isUndefined(biocacheBaseUrl) || _.isEmpty(biocacheBaseUrl)) {
        console.error("You must define the base URL for the Biocache instance you wish to use.");
    }

    if (!baseQuery || _.isUndefined(baseQuery) || _.isEmpty(baseQuery) || "q=" === baseQuery) {
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

    populateDefaultOptions(options);

    self.map = null;
    self.biocacheQuery = baseQuery;
    var selectedFacets = [];
    var wmsLayer = null;
    var facetGroups = null;
    var fieldsToGroups = null;
    var expandedGroups = {};

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
        return self.biocacheQuery;
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

        baseQuery = queryString;

        update();
    };

    /**
     * Select a particular facet and update the occurrence map and facet list.
     *
     * @memberOf ALA.OccurrenceMap
     * @function selectFacet
     * @param facet {Object} An object containing a minimum of 'label' and 'fq': the 'fq' property will be used to identify the facet.
     */
    self.selectFacet = function (facet) {
        selectedFacets.push(facet);

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
        // remove all fq= filters from the query string
        baseQuery = baseQuery.replace(/fq=.*(&|$)/g, "").replace(/&$/, "");

        update();
    };

    //
    // Private functions
    //

    function initialiseMap() {
        self.map = new ALA.Map(id, options.mapOptions);

        update();
    }

    function update() {
        self.map.startLoading();

        if (options.wms) {
            populateFacetGroups();

            updateWMS();
        } else {

        }

        self.map.finishLoading();
    }

    function updateWMS() {
        if (wmsLayer != null) {
            self.map.removeLayer(wmsLayer);
        }

        var query = constructBiocacheQuery();
        var wmsLayerUrl = WMS_LAYER_URL + query;

        wmsLayer = L.tileLayer.smartWms(wmsLayerUrl, {
            layers: 'ALA:occurrences',
            format: 'image/png',
            attribution: options.mapAttribution,
            outline: "true",
            ENV: "color:" + options.point.colour + ";name:" + options.point.name + ";size:" + options.point.size + ";opacity:" + options.point.opacity
        });
        wmsLayer.setZIndex(99);

        self.map.addLayer(wmsLayer, {});
    }

    function constructBiocacheQuery() {
        var newQuery = baseQuery;

        selectedFacets.forEach(function (facet) {
            newQuery += "&fq=" + facet.fq;
        });

        return newQuery;
    }

    function populateFacetGroups() {
        if (_.isUndefined(facetGroups) || _.isEmpty(facetGroups)) {
            $.ajax({
                url: FACET_GROUP_URL,
                dataType: "json"
            }).done(function (data) {
                if (data) {
                    facetGroups = data;
                    fieldsToGroups = mapFacetFieldsToGroups(facetGroups);

                    populateFacets();
                }
            });
        } else {
            populateFacets();
        }
    }

    function populateFacets() {
        var query = constructBiocacheQuery();

        $.ajax({
            url: SEARCH_URL_PREFIX + query,
            dataType: "json"
        }).done(function (facetsForQuery) {
            if (facetsForQuery) {
                self.biocacheQuery = query;

                var facets = constructFacetList(fieldsToGroups, facetsForQuery);

                updateSelectedFacets(facetsForQuery);

                updateFacetDOM(facets);
            }
        });
    }

    function updateSelectedFacets(facetsForQuery) {
        $.each(facetsForQuery.activeFacetMap, function (fieldName, facet) {
            var selectedFacet = {
                label: formatFacetName(facet.name) + ": " + formatFacetName(facet.value),
                fq: facet.name + ":" + facet.value
            };

            if (_.isUndefined(_.find(selectedFacets, function (f) {
                    return f.fq == selectedFacet.fq
                }))) {
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

                    facets[title].push({fieldName: formatFacetName(facet.fieldName), fieldResult: fieldResults});
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

    function updateFacetDOM(facets) {
        var source = $("#facetsTemplate").html();
        var template = Handlebars.compile(source);
        var container = $("#" + id + "Facets");
        container.empty();

        var content = {
            facets: facets,
            selectedFacets: selectedFacets,
            expandedGroups: expandedGroups
        };

        container.append(template(content));

        $("#" + id + "Facets li .facet-item").click(function () {
            self.selectFacet(constructFacetFromElement($(this)));
        });

        $("#" + id + "Facets li .selected-facet-item").click(function () {
            self.clearFacet(constructFacetFromElement($(this)));
        });

        $("#" + id + "Facets .facet-group-name a").click(function () {
            var group = $(this).attr("data-group");
            if (_.isUndefined(expandedGroups[group])) {
                expandedGroups[group] = {expanded: false};
            }
            expandedGroups[group].expanded = !expandedGroups[group].expanded;
        });

        $("#" + id + "Facets .remove-all-facets").click(function () {
            self.clearAllFacets();
        });
    }

    function constructFacetFromElement(elem) {
        var fieldName = elem.attr("data-field-name");
        var fq = elem.attr("data-fq");
        var label = elem.attr("data-label");

        return {label: fieldName + ": " + label, fq: fq}
    }

    function formatFacetName(name) {
        var mappedDisplayName = options.facetNameMapping[name];

        if (_.isUndefined(mappedDisplayName)) {
            if (name && !_.isUndefined(name)) {
                name = name.replace(/[^a-zA-Z0-9\-\\\/\.]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/ +/g, " ");
            } else {
                name = "Unknown";
            }
        } else {
            name = mappedDisplayName;
        }

        name = name.charAt(0).toUpperCase() + name.substring(1);

        return name;
    }

    // Populate any missing configuration items with the default values
    function populateDefaultOptions(options) {
        _.defaults(options, DEFAULT_OPTIONS);
        _.defaults(options.point, DEFAULT_OPTIONS.point);
        _.defaults(options.mapOptions, DEFAULT_OPTIONS.mapOptions);
        _.defaults(options.facetNameMapping, DEFAULT_OPTIONS.facetNameMapping);
    }

    initialiseMap();
};
