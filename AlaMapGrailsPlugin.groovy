class AlaMapGrailsPlugin {
    // the plugin version
    def version = "2.0.1"
    // the version or versions of Grails the plugin is designed for
    def grailsVersion = "2.4 > *"
    // resources that are excluded from plugin packaging
    def pluginExcludes = [
            "grails-app/views/error.gsp"
    ]

    def title = "ALA Map Plugin" // Headline display name of the plugin
    def author = "AtlasOfLivingAustralia"
    def authorEmail = "support@ala.org.au"
    def description = "Standard ALA Map implementation"

}
