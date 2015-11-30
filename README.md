# Grails Map Plugin

## Why?

Many ALA applications require mapping features, and to-date all of them have had their own custom implementations.
This results in a mix of implementations, inconsistent code, and inconsistent behaviour. The requirements, particularly
around displaying maps or occurrence data, are basically the same for all apps. This plugin will encourage consistency
across all ALA applications.


### Why a grails plugin instead of a JS library?

So we can support server-side code like looking up regions from the ALA Layers service, or Occurrences from ALA Biocache.

The JS files could be extracted into a standalone, generic mapping library if so desired. In fact, this would be a useful
thing to do at some point.


## Usage instructions

### Creating a map

* Create a ```div``` with an ```id``` (unique id for the map container) and a ```data-leaflet-img``` (location of the leaflet images) attribute.
  * The ```MapTagLib``` gives a tag for this:

```
  <m:map id="myMap"/>
```
* Create a new ALA.Map object:
```
var myMap = new ALA.Map(id, {})
```
* See the API Doco for details of the options.

## API

[See the full API documentation here](doco/ALA.html).

## Custom Leaflet controls and layers

#### SmartWMS Layer

This is a small extension to the standard Leaflet L.TileLayer.WMS layer which adds the ability for the layer to automatically fetch the bounding box for the selected PID.

There should be no need to use this class directly: the ```ALA.Map.addWmsLayer``` function will create a SmartWMS layer: all you need to do is set the URLs in the Map options (```wmsLayerUrl``` and ```wmsFeatureUrl```) and specify the PID in the addWmsLayer call.

This layer lets us call ```ALA.Map.getGeoJSON``` and retrieve a valid GeoJSON object with the bounding polygon and the pid in the properties. See also _WMS Layers & GeoJSON_ below.

#### TwoStepSelector Control

A map control with 2 combo boxes, for two-step selection of a map feature.

Options (default values are in square brackets):

* _id_ [replaceMe]: unique id for the control
* _position_ [topleft]: Position on the Leaflet map
* _title_ [Select...]: Tooltip for the button
* _firstStepItems_ [[]]: array of items (key/value) to be displayed in the first selector (alternatively, use firstStepItemLookup)
* _firstStepItemLookup_ [null]: Function callback to retrieve the list of items to be displayed in the first selector
* _firstStepTitle_ [null]: Tooltip for the first select box
* _firstStepPlaceholder_ ["Select one..."]: Null-value initial item in the first drop-down
* _secondStepItemLookup_ [null]: Function callback to populate the second selector when the first selector is set. The function will be provided with two parameters:
  * _stepOneSelection_: the key of the selected item from the first drown-down
  * _populateStep2Callback_: the function on the control to call in order to populate the second drop-down. This function requires an array of key/value pairs as the only parameter.
* _secondStepPlaceholder_ [Select one...]:  Null-value initial item in the second drop-down
* _secondStepTitle_ [null]: Tooltip for the second select box
* _selectionAction_ [null]: Function callback to invoke when the second selector is set. This callback will be provided with two parameters:
  * _stepTwoSelection_: the key of the selected item from the second drop-down
  * _map_: The underlying Leaflet Map instance. In most cases, you should normally use the ALA.Map class to interact with the map as it provides a cleaner interface.
* _firstStepValue_ [null]: The initial value for the first selector
* _iconClass_ [fa fa-map-marker]: The CSS class(es) for the button

Example:

```
var regionOptions = {
  id: "regionSelection",
  title: "Select a known shape",
  firstStepPlaceholder: "Choose a layer...",
  secondStepPlaceholder: "Choose a shape...",
  firstStepItems: [
      {key: 'cl2111', value: 'NRM'},
      {key: 'cl1048', value: 'IBRA 7 Regions'},
      {key: 'cl1049', value: 'IBRA 7 Subregions'},
      {key: 'cl22', value: 'Australian states'},
      {key: 'cl959', value: 'Local Gov. Areas'}
  ],
  secondStepItemLookup: function (selectedLayerKey, populateStep2Callback) {
      $.ajax({
          url: fcConfig.featuresService + '?layerId=' + selectedLayerKey,
          dataType: 'json'
      }).done(function (data) {
          var layers = [];
          data.forEach(function (layer) {
              layers.push({key: layer.pid, value: layer.name});
          });

          layers = _.sortBy(layers, "value");
          populateStep2Callback(layers);
      });
  },
  selectionAction: function (selectedValue) {
      var wmsOptions = {
          format: "image/png",
          layers: "ALA:Objects",
          version: "1.1.0",
          srs: "EPSG:900913",
          viewparams: "s:" + selectedValue
      };

      spatialFilter.addWmsLayer(fcConfig.spatialWms + "/wms/reflect?", wmsOptions);
  }
};
var regionSelector = new L.Control.TwoStepSelector(regionOptions);

spatialFilter.addControl(regionSelector);
```

## GeoJSON

This plugin works with the standard GeoJSON, as defined at http://geojson.org/, with one exception: it adds support for
Circle types.

This is achieved by adding two items to the ```properties``` object of the feature: ```point_type: "Circle"``` and ```radius: {m}```.
The ```geometry``` object will still represent a Point type.

Using the ```properties``` object allows us to generate valid GeoJSON without losing the circle metadata.

Two utility methods are provided to convert the ```geometry``` object to/from a non-standard representation with ```type: "Circle"``` if you require this structure:

* ```ALA.MapUtils.getGeometryWithCirclesFromGeoJSON```
* ```ALA.MapUtils.getStandardGeoJSONForCircleGeometry```

Note however, that the GeoJSON object MUST be converted back to the standards-compliant form before being passed back into the map.

Furthermore, if you pass a valid GeoJSON object with

```
  ...
  geometry: {
    type: "Point"
    ...
  }
```

and

```
  ...
  properties: {
    point_type: "Circle",
    radius: {m}
}
```

to ```ALA.Map.setGeoJSON```, then the plugin will render that point as a circle.

### WMS Layers & GeoJSON

WMS layers themselves cannot be represented as GeoJSON. However, the ```L.TileLayer.SmartWMS``` custom wms layer provides the ability to create a basic GeoJSON object which represents the layer as a POLYGON, where the points are the bounding box of the region, and the ```properties``` object contains the PID of the layer.

For example, the ACT layer is represented as the following:

```
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "pid": "3742602"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              "148.761582",
              "-35.92208"
            ],
            [
              "148.761582",
              "-35.1119459999999"
            ],
            [
              "150.772781",
              "-35.1119459999999"
            ],
            [
              "150.772781",
              "-35.92208"
            ],
            [
              "148.761582",
              "-35.92208"
            ]
          ]
        ]
      }
    }
  ]
}
```

## Geocoding

The Geocoding widget is provided by https://github.com/perliedman/leaflet-control-geocoder, and is using the defaults from that library.

The default geocoding provider is http://nominatim.openstreetmap.org/.
