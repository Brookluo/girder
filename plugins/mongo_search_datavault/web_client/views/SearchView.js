import View from 'girder/views/View';


import template from '../templates/paginateSearchWidget.pug';
import '../stylesheets/paginateSearchWidget.styl';


var SearchView = View.extend({
    // when click the submit button, render the information
    event: {
        'submit form': function (event) {
            alert("submitted")
        }
    },

    initialize: function () {
        this.$el.html(template({
            // prepdata: function () {
            //     alert("ready to submit")
            // }
        }));
    },

    // add the new page when get the response from the server
    render: function () {

    }
});

export default SearchView;
