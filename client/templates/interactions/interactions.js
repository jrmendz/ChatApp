Template.interactions.created = function() {
    Session.set('newMessage', true);
    Session.set('currentConsumerInfo', null);
    Session.set('claimedLimit', 3);
    Session.set('inboxSearchKeyword', '');
    Session.set('inboxSearchType', 'mobile');
};

Template.interactions.events({
    'keyup .search-input': function(event) {
        Session.set('inboxSearchKeyword', event.target.value);
    },
    'change .search-type': function(event) {
        Session.set('inboxSearchType', event.target.value);
    },
});

