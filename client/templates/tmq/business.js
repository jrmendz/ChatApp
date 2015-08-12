Template.tmqBusinesses.created = function() {
    Session.set('mode', 'Add');
    Session.set('businessNumbers', [{type: '', number: ''}]);
    Session.set('businessAgents', []);
};

Template.tmqBusinesses.helpers({
    businessesList: function() {
        return Businesses.find({suspended: {$ne: '1'}});
    },
    businessNumbers: function() {
        return Session.get('businessNumbers');
    },
    showRemove: function(index) {
        var businessNumbers = Session.get('businessNumbers');
        if(index == '0' && businessNumbers.length == 1) return false;
        else return true;
    },
    mode: function() {
        return Session.get('mode');
    },
    addMode: function() {
        if(Session.get('mode') == 'Add') return true;
        else return false;
    },
    addNumber: function(type, number) {
        if(type == '' || number == '') return true;
        else return false;
    },
    disabled: function(type, number) {
        if(Session.get('mode') == 'Add') return '';
        else {
            if(type == '' || number == '') return '';
            else return 'disabled';
        }
    },
    isRetired: function(retired) {
        if(retired == '1') return 'disabled';
        else return '';
    },
    grayBtn: function(retired) {
        if(retired == '1') return 'background: gray !important';
        else return '';
    }
});

Template.tmqBusinesses.events({
    'click .add-business': function() {
        Session.set('mode', 'Add');
        Session.set('businessNumbers', [{type: '', number: ''}]);
        Session.set('businessAgents', []);
        $('#tmqBusinessForm')[0].reset();
    },
    'click .edit-business': function(event) {
        Session.set('mode', 'Edit');
        Session.set('currentBusinessId', event.currentTarget.dataset.id);
        var business = Businesses.findOne(event.currentTarget.dataset.id);
        $('#tmqBusinessForm .name').val(business.name);
        $('#tmqBusinessForm .email').val(business.email);
        $('#tmqBusinessForm .address').val(business.address);
        $('#tmqBusinessForm .city').val(business.city);
        $('#tmqBusinessForm .state').val(business.state);
        $('#tmqBusinessForm .country').val(business.country);
        $('#tmqBusinessForm .zip').val(business.zip);
        for(var x = 0; x < business.numbers.length; x++) {
            business.numbers[x].number = business.numbers[x].number.replace('+1','');
        }
        Session.set('businessNumbers', business.numbers);
    },
    'click .suspend-business': function(event) {
        if(confirm('Are you sure you want to suspend this business?')) {
            Meteor.call('suspendBusiness', event.currentTarget.dataset.id);
            Session.set('mode', 'Add');
            $('#tmqBusinessForm')[0].reset();
            alert('Business suspended.');
        }
    },
    'click .add-number': function() {
        var businessNumbers = Session.get('businessNumbers');
        businessNumbers.push({type: '', number: ''});
        Session.set('businessNumbers', businessNumbers);
    },
    'click .retire-number': function(event) {
        if(confirm('Are you sure you want to retire this number?')) {
            var index = parseInt(event.currentTarget.dataset.idx);
            var businessNumbers = Session.get('businessNumbers');
            businessNumbers[index].retired = '1';
            Session.set('businessNumbers', businessNumbers);
        }
    },
    'click .remove-number': function(event) {
        var index = parseInt(event.currentTarget.dataset.idx);
        var businessNumbers = Session.get('businessNumbers');
        businessNumbers.splice(index, 1);
        Session.set('businessNumbers', businessNumbers);
    },
    'click .business-cancel': function(event) {
        Session.set('mode', 'Add');
        Session.set('businessNumbers', [{type: '', number: ''}]);
        Session.set('businessAgents', []);
        $('#tmqBusinessForm')[0].reset();
    },
    'change .type-input': function(event) {
        var index = parseInt(event.currentTarget.dataset.idx);
        var businessNumbers = Session.get('businessNumbers');
        businessNumbers[index].type = event.currentTarget.value;
        Session.set('businessNumbers', businessNumbers);
    },
    'change .number-input': function(event) {
        var index = parseInt(event.currentTarget.dataset.idx);
        var businessNumbers = Session.get('businessNumbers');
        businessNumbers[index].number = event.currentTarget.value;
        Session.set('businessNumbers', businessNumbers);
    },
    'submit #tmqBusinessForm': function(event) {
        event.preventDefault();
        var values = event.target;
        var mode = Session.get('mode');
        var business = {
            name: values.name.value,
            email: values.email.value,
            address: values.address.value,
            city: values.city.value,
            state: values.state.value,
            country: values.country.value,
            zip: values.zip.value
        };
        
        var businessNumbers = Session.get('businessNumbers');
        var businessNumbersValid = true;
        for(var x = 0; x < businessNumbers.length; x++) {
            if(businessNumbers[x].number.replace(/\D/g,'').length != 10) businessNumbersValid = false;
            else businessNumbers[x].number = '+1' + businessNumbers[x].number;
        }
        business.numbers = businessNumbers;
        
        if(businessNumbersValid) {
            if(mode == 'Add') {
                Meteor.call('insertBusiness', business, function(err, businessId) {
                    var agents = Session.get('businessAgents');
                    for(var x = 0; x < agents.length; x++) {
                        var agent = agents[x];
                        agent.profile.businessId = businessId;
                        Meteor.call('insertUser', agent, function() {
                            Meteor.call('sendLoginDetails', agent.profile.email, agent.username);
                        });
                    }
                });
            } else if(mode == 'Edit') Meteor.call('updateBusiness', Session.get('currentBusinessId'), business);
            alert('Business saved.');
            $('#tmqBusinessForm')[0].reset();
            Session.set('mode', 'Add');
            Session.set('businessNumbers', [{type: '', number: ''}]);
            Session.set('businessAgents', []);
        } else alert('One or more of the business numbers are not valid.');
    }
});