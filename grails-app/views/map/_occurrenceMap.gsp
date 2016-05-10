<div class="row">
    <div class="col-md-3">
        <div id="${id}Facets" class="facet-list">
            <div><span class="fa fa-spinner fa-spin">&nbsp;</span>Loading facets...</div>
            <!-- populated by Handlebars: facetsTemplate -->
        </div>
    </div>

    <div class="col-md-9">
        <div id="${id}" style="${style}" data-leaflet-img="${leafletImageLocation}"></div>
    </div>
</div>


<div class="modal fade" id="chooseMoreModal" tabindex="-1" role="dialog" aria-labelledby="Choose more facets modal">
    <div class="modal-dialog" role="document">
        <div id="chooseMoreModalBody" class="modal-content">
            <!-- populated by Handlebars: chooseMoreModalBodyTemplate -->
        </div>
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
            <a data-toggle="collapse" data-group="{{@key}}" data-target="#group{{@key}}" target="_self"
               class="collapsed">{{@key}}</a>
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
                        <a class="facet-item" data-fq="{{fq}}" data-label="{{label}}" data-count="{{count}}"
                           data-field-name="{{../fieldName}}">
                            <span class="fa fa-square-o">&nbsp;&nbsp;</span>{{label}} ({{count}})
                        </a>
                    </li>
                    {{/each}}
                </ul>
                <a class="facet-choose-more" data-toggle="modal" data-target="#chooseMoreModal"
                   data-facet-id="{{facetId}}" data-facet-group="{{@../key}}">
                    <span class="fa fa-hand-o-right">&nbsp;&nbsp;</span>Choose more...
                </a>
            </li>
            {{/each}}
        </ul>

    </div>
</div>
{{/each}}
</script>

<script id="chooseMoreModalBodyTemplate" type="text/x-handlebars-template">
<div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
            aria-hidden="true">&times;</span></button>
    <h4 class="modal-title" id="myModalLabel">Refine your search</h4>
</div>

<div class="modal-body">
    <div class="table-responsive">
        <table class="facet-table table table-striped">
            <thead>
            <tr>
                <th>Select</th>
                <th>{{fieldName}}</th>
                <th>Count</th>
            </tr>
            </thead>
            <tbody>
            {{#each fieldResult}}
            <tr>
                <td>
                    <input type="checkbox" name="fqs" class="facet-item-select" value="{{fq}}"
                           data-fq="{{fq}}" data-label="{{label}}" data-field-name="{{../facetId}}"
                           title="Add {{label}} to the list of selected facets">
                </td>
                <td>
                    <a class="facet-item" data-fq="{{fq}}" data-label="{{label}}" data-count="{{count}}"
                       data-field-name="{{../fieldName}}">
                        {{label}}
                    </a>
                </td>
                <td>{{count}}</td>
            </tr>
            {{/each}}
            </tbody>
        </table>
    </div>
</div>

<div class="modal-footer">
    <div class="btn-group">
        <a id="include" class="submit btn btn-default btn-sm" target="_self" data-label="{{fieldName}}"
           data-field-name="{{facetId}}">INCLUDE selected items</a>
        <a class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" target="_self">
            <span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li>
                <a id="includeAll" class="wildcard" target="_self" data-label="{{fieldName}}" data-field-name="{{facetId}}">INCLUDE all values (wildcard include)</a>
            </li>
        </ul>
    </div>

    <div class="btn-group">
        <a id="exclude" class="submit btn btn-default btn-sm" target="_self" data-label="{{fieldName}}"
           data-field-name="{{facetId}}">EXCLUDE selected items</a>
        <a class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" target="_self">
            <span class="caret"></span>
        </a>
        <ul class="dropdown-menu">
            <li>
                <a id="excludeAll" target="_self" class="wildcard" data-label="{{fieldName}}" data-field-name="{{facetId}}">EXCLUDE all values (wildcard exclude)</a>
            </li>
        </ul>
    </div>
    <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Close</button>
</div>

</script>