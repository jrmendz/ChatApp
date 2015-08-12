Template.poundcode.created = function() {
    var business = Settings.findOne({businessId: Meteor.user().profile.businessId});
    if(business) return Session.set('poundcodes', business.settings.poundcodes);
    else Session.set('poundcodes', [{code: '', message: '', expiration: ''}]);
};

Template.poundcode.rendered = function() {
    $('#poundcodeForm .datepicker').pickadate({
        format: 'MMM D, YYYY',
        formatSubmit: 'yyyy-mm-dd',
        onSet: setExpiration
    });
};

Template.poundcode.helpers({
    poundcodes: function() {
        return Session.get('poundcodes');
    },
});

Template.poundcode.events({
    'click .add-poundcode': function() {
        var poundcodes = Session.get('poundcodes');
        poundcodes.push({code: '', message: '', expiration: ''});
        Session.set('poundcodes', poundcodes);
        setTimeout(function() {
            $('#poundcodeForm .datepicker').pickadate({
                format: 'MMM D, YYYY',
                formatSubmit: 'yyyy-mm-dd',
                onSet: setExpiration
            });
        }, 100);
    },
    'click .remove-poundcode': function(event) {
        var index = event.currentTarget.dataset.idx;
        var poundcodes = Session.get('poundcodes');
        poundcodes.splice(index, 1);
        Session.set('poundcodes', poundcodes);
    },
    'change .code': function(event) {
        var index = event.currentTarget.dataset.idx;
        var poundcodes = Session.get('poundcodes');
        poundcodes[index].code = event.target.value;
        Session.set('poundcodes', poundcodes);
    },
    'change .message': function(event) {
        console.log(event);
        var index = event.currentTarget.dataset.idx;
        var poundcodes = Session.get('poundcodes');
        poundcodes[index].message = event.target.value;
        Session.set('poundcodes', poundcodes);
    },
    'change .expiration': function(event) {
        console.log(event);
        var index = event.currentTarget.dataset.idx;
        var poundcodes = Session.get('poundcodes');
        poundcodes[index].expiration = $('input[name="expiration' + index + '_submit"]').val();
        Session.set('poundcodes', poundcodes);
    },
    'change input[name^="expiration"]': function(event) {
        console.log(event);
    },
    'submit #poundcodeForm': function(event) {
        event.preventDefault();
        var poundcodes = Session.get('poundcodes');
        var poundcodesValid = true;
        for(var x = 0; x < poundcodes.length; x++) {
            if(poundcodes[x].code[0] != '#') poundcodesValid = false;
        }
        if(poundcodesValid) {
            Meteor.call('poundcodes', Meteor.user().profile.businessId, poundcodes);
            alert('Settings Saved.');
        } else alert('One or more codes are not valid.');
    },
});

function setExpiration(value) {
    console.log()
    var index = this.$node[0].dataset.idx;
    var poundcodes = Session.get('poundcodes');
    poundcodes[index].expiration = this._hidden.value;
    Session.set('poundcodes', poundcodes);
}