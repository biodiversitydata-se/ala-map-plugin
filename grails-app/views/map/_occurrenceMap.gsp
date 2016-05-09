<div class="row">
    <div class="col-md-3">
        <div id="${id}Facets" class="facet-list">
            <div><span class="fa fa-spinner fa-spin">&nbsp;</span>Loading facets...</div>
        </div>
    </div>

    <div class="col-md-9">
        <div id="${id}" style="${style}" data-leaflet-img="${leafletImageLocation}"></div>
    </div>
</div>

<script id="facetsTemplate" type="text/x-handlebars-template">
{{#if selectedFacets}}
<h4>Selected filters</h4>
<ul>
    {{#each selectedFacets}}
    <li>
        <a class="selected-facet-item" data-fq="{{fq}}" data-label="{{label}}" data-count="{{count}}">
            <span class="fa fa-check-square-o">&nbsp;&nbsp;</span>{{label}}
        </a>
    </li>
    {{/each}}
</ul>
<a class="remove-all-facets pull-right"><span class="fa fa-times">&nbsp;&nbsp;</span>Clear all filters</a>
<div class="clearfix"></div>
{{/if}}

{{#each facets}}
<div class="facet-group">
    <div class="facet-group-header">
        <h4 class="facet-group-name">
            <a data-toggle="collapse" data-group="{{@key}}" data-target="#group{{@key}}" target="_self" class="collapsed">{{@key}}</a>
        </h4>
    </div>

    <div id="group{{@key}}" class="panel-collapse collapse">
        <ul class="facet-group-content">
            {{#each this}}
            <li>
                <h5 class="facet-group-item-name">{{fieldName}}</h5>
                <ul class="facet-group-items">
                    {{#each fieldResult}}
                    <li>
                        <a class="facet-item" data-fq="{{fq}}" data-label="{{label}}" data-count="{{count}}" data-field-name="{{../fieldName}}">
                            <span class="fa fa-square-o">&nbsp;&nbsp;</span>{{label}} ({{count}})
                        </a>
                    </li>
                    {{/each}}
                </ul>
            </li>
            {{/each}}
        </ul>
    </div>
</div>
{{/each}}
</script>