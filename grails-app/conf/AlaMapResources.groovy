modules = {
    map {
        dependsOn "underscore"
        dependsOn "jquery"
        dependsOn "leaflet"
        dependsOn "leaflet_draw"
        dependsOn "leaflet_coords"
        dependsOn "leaflet_easyButton"
        dependsOn "leaflet_geocoder"
        dependsOn "custom_controls"
        dependsOn "font-awesome"
        resource url: [dir: "js", file: "Map.js", plugin: "grails-map"]
        resource url: [dir: "js/layers", file: "SmartWmsLayer.js", plugin: "grails-map"]
        resource url: [dir: "css", file: "map.css", plugin: "grails-map"]
    }

    custom_controls {
        dependsOn "leaflet"
        resource url: [dir: "js/controls", file: "Checkbox.js", plugin: "grails-map"]
        resource url: [dir: "js/controls", file: "Slider.js", plugin: "grails-map"]
        resource url: [dir: "js/controls", file: "TwoStepSelector.js", plugin: "grails-map"]
    }

    leaflet {
        resource url: [dir: "vendor/leaflet-0.7.7", file: "leaflet.js", plugin: "grails-map"]
        resource url: [dir: "vendor/leaflet-0.7.7", file: "leaflet.css", plugin: "grails-map"]
    }

    leaflet_draw {
        dependsOn "leaflet"
        resource url: [dir: "vendor/leaflet.draw-0.2.4", file: "leaflet.draw.css", plugin: "grails-map"]
        resource url: [dir: "vendor/leaflet.draw-0.2.4", file: "leaflet.draw.js", plugin: "grails-map"]
    }

    leaflet_coords {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.Coordinates-0.1.5", file: "Leaflet.Coordinates-0.1.5.css", plugin: "grails-map"]
        resource url: [dir: "vendor/Leaflet.Coordinates-0.1.5", file: "Leaflet.Coordinates-0.1.5.ie.css", plugin: "grails-map"]
        resource url: [dir: "vendor/Leaflet.Coordinates-0.1.5", file: "Leaflet.Coordinates-0.1.5.min.js", plugin: "grails-map"]
    }

    leaflet_easyButton {
        dependsOn "leaflet"
        resource url: [dir: "vendor/Leaflet.EasyButton-1.2.0", file: "easy-button.css", plugin: "grails-map"]
        resource url: [dir: "vendor/Leaflet.EasyButton-1.2.0", file: "easy-button.js", plugin: "grails-map"]
    }

    leaflet_geocoder {
        dependsOn "leaflet"
        resource url: [dir: "vendor/leaflet-control-geocoder-1.3.2", file: "Control.Geocoder.js", plugin: "grails-map"]
        resource url: [dir: "vendor/leaflet-control-geocoder-1.3.2", file: "Control.Geocoder.css", plugin: "grails-map"]
    }

    googleMaps {
        dependsOn "leaflet"
        resource url: [dir: "vendor/leaflet-google-plugin", file: "Google.js", plugin: "grails-map"]
    }

    underscore {
        resource url: [dir: "vendor/underscore-1.8.3", file: "underscore.min.js", plugin: "grails-map"]
    }

    jquery {
        resource url: [dir: "vendor/jquery-2.1.4", file: "jquery-2.1.4.min.js", plugin: "grails-map"]
    }
}