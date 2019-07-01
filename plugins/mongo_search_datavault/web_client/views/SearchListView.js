import View from 'girder/views/View';

import MongoSearchWidget from './MongoSearchWidget';

var SearchListView = View.extend({
    initialize: function () {
        this.paginateWidget = new MongoSearchWidget({
            el: this.$el,
            parentView: this,
            // itemUrlFunc: (task) => {
            //     return `#item_task/${task.id}/run`;
            // }
        });
    }
});

export default SearchListView;
