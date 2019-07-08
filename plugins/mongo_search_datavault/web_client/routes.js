/* eslint-disable import/first */

import $ from 'jquery';
import _ from 'underscore';

import router from 'girder/router';
import events from 'girder/events';

import SearchView from './views/SearchView';

router.route('mongo_search', 'itemSearchList', () => {
    events.trigger('g:navigateTo', SearchView);
    events.trigger('g:highlightItem', 'SearchsView');
});
