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
    alert("finished");
    this.render();
};