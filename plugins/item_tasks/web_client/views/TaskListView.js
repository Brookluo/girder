import router from 'girder/router';
import View from 'girder/views/View';
import PaginateWidget from 'girder/views/widgets/PaginateWidget';
import TaskListWidget from './TaskListWidget';
import ItemTaskCollection from '../collections/ItemTaskCollection';

import template from '../templates/taskList.pug';
import '../stylesheets/taskList.styl';

/**
 * View for a list of tasks. The list can be paged through. The user can search
 * for tasks using a search box. Clicking a task's tag shows a list of tasks which
 * have that tag.
 */
var TaskListView = View.extend({
    events: {
        'submit .g-task-search-form': function (e) {
            e.preventDefault();
            const query = this.$('.g-task-search-field').val().trim();
            if (query) {
                router.navigate(`item_tasks/search?q=${query}`, {trigger: true});
            }
        }
    },

    initialize: function () {
        this.collection = new ItemTaskCollection();

        this.paginateWidget = new PaginateWidget({
            collection: this.collection,
            parentView: this
        });

        this.taskListWidget = new TaskListWidget({
            collection: this.collection,
            parentView: this
        });

        this.collection.fetch()
            .then(() => {
                this.render();

                // Render PaginateWidget when collection changes
                this.listenTo(this.collection, 'reset', () => {
                    this.paginateWidget.render();
                });
            });
    },

    render: function () {
        this.$el.html(template({
            collection: this.collection
        }));

        this.paginateWidget.setElement(this.$('.g-task-pagination')).render();
        this.taskListWidget.setElement(this.$('.g-task-list-widget-container')).render();

        return this;
    }
});

export default TaskListView;
