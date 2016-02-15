modules = {
    map {
        dependsOn "underscore"
        dependsOn "jquery"
        dependsOn "jqueryScrollView"
        dependsOn "leaflet"
        dependsOn "leaflet_draw"
        dependsOn "leaflet_coords"
        dependsOn "leaflet_easyButton"
        dependsOn "leaflet_geocoder"
        dependsOn "leaflet_cluster"
        dependsOn "leaflet_loading"
        dependsOn "turf"
        dependsOn "custom_controls"
        dependsOn "font-awesome"
        dependsOn "leaflet_sleep"
        resource url: [dir: "js", file: "Map.js", plugin: "ala-map"]
        resource url: [dir: "js/layers", file: "SmartWmsLayer.js", plugin: "ala-map"]
        resource url: [dir: "css", file: "map.css", plugin: "ala-map"]
    }

    custom_controls {
        dependsOn "leaflet"
        resource url: [dir: "js/controls", file: "Checkbox.js", plugin: "ala-map"]
        resource url: [dir: "js/controls", file: "Slider.js", plugin: "ala-map"]
        resource url: [dir: "js/controls", file: "TwoStepSelector.js", plugin: "ala-map"]
        resource url: [dir: "js/controls", file: "Radio.js", plugin: "ala-map"]
    }

    leaflet {
        resource url: [dir: "vendor/leaflet-0.7.7", file: "leaflet.js", plugin: "ala-map"]
        resource url: [dir: "vendor/leaflet-0.7.7", file: "leaflet.css", plugin: "ala-map"]
    }

    leaflet_draw {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.draw-0.2.4", file: "leaflet.draw.css", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.draw-0.2.4", file: "leaflet.draw.js", plugin: "ala-map"]
    }

    leaflet_coords {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.Coordinates-0.1.5", file: "Leaflet.Coordinates-0.1.5.css", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.Coordinates-0.1.5", file: "Leaflet.Coordinates-0.1.5.ie.css", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.Coordinates-0.1.5", file: "Leaflet.Coordinates-0.1.5.min.js", plugin: "ala-map"]
    }

    leaflet_easyButton {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.EasyButton-1.2.0", file: "easy-button.css", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.EasyButton-1.2.0", file: "easy-button.js", plugin: "ala-map"]
    }

    leaflet_geocoder {
        dependsOn "leaflet"
        resource url: [dir: "vendor/leaflet-control-geocoder-1.3.2", file: "Control.Geocoder.js", plugin: "ala-map"]
        resource url: [dir: "vendor/leaflet-control-geocoder-1.3.2", file: "Control.Geocoder.css", plugin: "ala-map"]
    }

    leaflet_cluster {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.markercluster-0.4.0-hotfix.1", file: "leaflet.markercluster.js", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.markercluster-0.4.0-hotfix.1", file: "MarkerCluster.css", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.markercluster-0.4.0-hotfix.1", file: "MarkerCluster.Default.css", plugin: "ala-map"]
    }

    leaflet_loading {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.loading-0.1.16", file: "Control.Loading.js", plugin: "ala-map"]
        resource url: [dir: "vendor/Leaflet.loading-0.1.16", file: "Control.Loading.css", plugin: "ala-map"]
    }

    leaflet_sleep {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.Sleep", file: "Leaflet.Sleep.js", plugin: "ala-map"]
    }

    turf {
        resource url: [dir: "vendor/turf-2.0.2", file: "turf.min.js", plugin: "ala-map"]
    }

    underscore {
        resource url: [dir: "vendor/underscore-1.8.3", file: "underscore.min.js", plugin: "ala-map"]
    }

    jquery {
        resource url: [dir: "vendor/jquery-2.1.4", file: "jquery-2.1.4.min.js", plugin: "ala-map"]
    }

    jqueryScrollView {
        dependsOn "jquery"
        resource url: [dir: "vendor/onImpressions", file: "jquery.onimpression.js", plugin: "ala-map"]
    }
}
