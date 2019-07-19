/* eslint-disable import/first, import/order */
/*jshint esversion: 6 */ 
import $ from 'jquery';
import _ from 'underscore';

import { wrap } from 'girder/utilities/PluginUtils';
import GlobalNavView from 'girder/views/layout/GlobalNavView';
import { registerPluginNamespace } from 'girder/pluginUtils';
import * as mongoSearch from 'girder_plugins/mongo_search_datavault';
import router from 'girder/router';
import SearchView from './views/SearchView';
import events from 'girder/events';
import { restRequest } from 'girder/rest';

import './routes';

registerPluginNamespace('mongo_search', mongoSearch);

// Add a new global nav item for running analyses
wrap(GlobalNavView, 'initialize', function (initialize) {
    initialize.apply(this, arguments);

    this.defaultNavItems.push({
        name: 'Search',
        icon: 'icon-search',
        target: 'mongo_search'
    });
});

SearchView.prototype.events['click .g-search-submit'] = function (event) {
    // alert("finished");
    this.render();
};

SearchView.prototype.events['keydown .g-search-table'] = function (event) {
    var key = event.which || event.keyCode;
    if(key == 13) {
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
        }
};