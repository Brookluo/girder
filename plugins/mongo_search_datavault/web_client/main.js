/* eslint-disable import/first, import/order */

import $ from 'jquery';
import _ from 'underscore';

import { wrap } from 'girder/utilities/PluginUtils';
import GlobalNavView from 'girder/views/layout/GlobalNavView';
import { registerPluginNamespace } from 'girder/pluginUtils';
import * as mongoSearch from 'girder_plugins/mongo_search_datavault';
import router from 'girder/router';

import './routes';

registerPluginNamespace('mongo_search', mongoSearch);

// Add a new global nav item for running analyses
wrap(GlobalNavView, 'initialize', function (initialize) {
    initialize.apply(this, arguments);

    this.defaultNavItems.push({
        name: 'Search',
        icon: 'icon-cog-alt',
        target: 'mongo_search'
    });
});
