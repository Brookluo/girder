/*jshint esversion: 6 */ 
import $ from 'jquery';
import _ from 'underscore';

import View from 'girder/views/View';
import { restRequest } from 'girder/rest';
import SearchTemplate from '../templates/paginateSearchWidget.pug';
import ResultTemplate from '../templates/SearchResult.pug';
import '../stylesheets/paginateSearchWidget.styl';
import { tmpdir } from 'os';
// import SearchPaginateWidget from 'girder/views/widgets/SearchPaginateWidget';
// import SearchFieldWidget from 'girder/views/widgets/SearchFieldWidget';

var SearchView = View.extend({
    // when click the submit button, render the information
    events: {
        'click .g-submit-search': function (e) {
            // const data = $(event.currentTarget).data('task');
            // here to parse the data and then send the request
            this.$('.g-search-results-header-container').show();
            this.$('.g-search-no-results').hide();
            var query = this.$('.g-mongo-search-form');
            var payload = this._processData(query.serializeArray());
            if(!_.isEmpty(payload)) {
                this.$('.g-search-pending').show();
                this._request = restRequest({
                    url: 'resource/mongo_search',
                    data: {
                        type: 'item',
                        q: JSON.stringify(payload),
                        // mode: this._mode,
                        // limit: this.pageLimit
                    }
                });
                this.render();
            }
            else{
                this.$('.g-search-no-results').show();
            }
        },

        // 'keydown .g-search-table': function (e) {
        //     var key = e.which || e.keyCode;
        //     if(key == 13) {
        //         e.preventDefault();
        //         alert("enter");
        //     }
        // }
    },

    initialize: function () {
        this.$el.html(SearchTemplate({
        //    $('g-search-pending').hide()
        }));
        this.$('.g-search-results-header-container').hide();
        this.$('.g-search-pending').hide();
    },

    _processData: function (arr) {
        var retval = {};
        for(var i = 0; i < arr.length; i++) {
            if(!arr[i].value) continue;

            var temp = arr[i].name.split("_");
            var key = "meta." + temp[0];
            if(!retval[key]) {
                retval[key] = {};
            }
            if(temp[1] == "lower") {
                retval[key]["$gt"] = parseFloat(arr[i].value);
            }
            else if(temp[1] == "upper") {
                retval[key]["$lt"] = parseFloat(arr[i].value);
            }
            // console.log("the array " + key + retval[key]);
        }
        return retval;
    },

    _getTypeOrdering: function (resultTypes) {
        // This ordering places hopefully-more relevant types first
        const builtinOrdering = ['collection', 'folder', 'item', 'group', 'user'];

        // _.intersection will use the ordering of its first argument
        const orderedKnownTypes = _.intersection(builtinOrdering, resultTypes);
        const orderedUnknownTypes =  _.difference(resultTypes, builtinOrdering).sort();

        return orderedKnownTypes.concat(orderedUnknownTypes);
    },

    // add the new page when get the response from the server
    render: function () {
        this._subviews = {};
        this._request
            .done((results) => {
                this.$('.g-search-results-header-container').show();
                this.$('.g-search-pending').hide();
                this.$('.g-search-results-container').empty();
                const resultTypes =  _.keys(results);
                const orderedTypes = this._getTypeOrdering(resultTypes);
                // console.log("results", results, resultTypes, orderedTypes);
                _.each(orderedTypes, (type) => {
                    if (results[type].length) {
                        // console.log("the type: ", type);
                        this._subviews[type] = new SearchResultsTypeView({
                            parentView: this,
                            // query: this._query,
                            // mode: this._mode,
                            type: type,
                            // limit: this.pageLimit,
                            initResults: results[type],
                            // sizeOneElement: this._sizeOneElement
                        })
                            .render();
                        this._subviews[type].$el
                            .appendTo(this.$('.g-search-results-container'));
                    }
                });

                if (_.isEmpty(this._subviews)) {
                    this.$('.g-search-no-results').show();
                }
            });
            return this;

    }
});

const formToJSON = elements => [].reduce.call(elements, (data, element) => {
    // check the empty clause and parse the mass_lower and mass_upper as the $gt, $lt
    data[element.name] = element.value;
    return data;

}, {});

var SearchResultsTypeView = View.extend({
    className: 'g-search-results-type-container',

    initialize: function (settings) {
        // this._query = settings.query;
        // this._mode = settings.mode;
        this._type = settings.type;
        this._initResults = settings.initResults || [];
        this._pageLimit = settings.limit || 10;
        this._sizeOneElement = settings.sizeOneElement || 30;

        // this._paginateWidget = new SearchPaginateWidget({
        //     parentView: this,
        //     type: this._type,
        //     // query: this._query,
        //     // mode: this._mode,
        //     limit: this._pageLimit
        // })
        //     .on('g:changed', () => {
        //         this._results = this._paginateWidget.results;
        //         this.render();
        //     });

        this._results = this._initResults;
    },

    _getTypeName: function (type) {
        const names = {
            'collection': 'Collections',
            'group': 'Groups',
            'user': 'Users',
            'folder': 'Folders',
            'item': 'Items'
        };
        return names[type] || type;
    },

    _getTypeIcon: function (type) {
        const icons = {
            'user': 'user',
            'group': 'users',
            'collection': 'sitemap',
            'folder': 'folder',
            'item': 'doc-text-inv'
        };
        return icons[type] || 'icon-attention-alt';
    },

    render: function () {
        this.$el.html(ResultTemplate({
            results: this._results,
            collectionName: this._getTypeName(this._type),
            type: this._type,
            icon: this._getTypeIcon(this._type)
        }));

        /* This size of the results list cannot be known until after the fetch completes. And we don't want to set
        the 'min-height' to the max results size, because we'd frequently have lots of whitespace for short result
        lists. Do not try to move that set in stylesheet.
        */
        this.$('.g-search-results-type').css('min-height', `${this._initResults.length * this._sizeOneElement}px`);
        // this._paginateWidget
        //     .setElement(this.$(`#${this._type}Paginate`))
        //     .render();

        return this;
    }
});
  

export default SearchView;
