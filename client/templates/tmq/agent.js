Template.businessAgents.created = function() {
    Session.set('agentMode', 'Add');
};

Template.businessAgents.helpers({
    agentsList: function() {
        if(Session.get('mode') == 'Add') return Session.get('businessAgents');
        else return Meteor.users.find({'profile.businessId': Session.get('currentBusinessId'), 'profile.type': 'agent'}).fetch();
    },
    agentMode: function(index) {
        return Session.get('agentMode');
    },
    addMode: function() {
        if(Session.get('mode') == 'Add') return true;
        else return false;
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

Template.businessAgents.events({
    'click .add-agent': function() {
        Session.set('agentMode', 'Add');
        $('#agentForm')[0].reset();
    },
    'click .edit-agent': function(event) {
        Session.set('agentMode', 'Edit');
        if(Session.get('mode') == 'Add') {
            Session.set('currentAgentIdx', event.currentTarget.dataset.idx);
            var agent = Session.get('businessAgents')[event.currentTarget.dataset.idx];
        } else {
            Session.set('currentAgentId', event.currentTarget.dataset.id);
            var agent = Meteor.users.findOne(event.currentTarget.dataset.id);
        }
        $('#agentModal').modal('show');
        $('#agentForm .first-name').val(agent.profile.firstName);
        $('#agentForm .last-name').val(agent.profile.lastName);
        $('#agentForm .address').val(agent.profile.address);
        $('#agentForm .city').val(agent.profile.city);
        $('#agentForm .state').val(agent.profile.state);
        $('#agentForm .country').val(agent.profile.country);
        $('#agentForm .zip').val(agent.profile.zip);
        $('#agentForm .username').val(agent.username);
        $('#agentForm .email').val(agent.profile.email);
        $('#agentForm .mobile').val(agent.profile.mobile);
    },
    'click .remove-agent': function(event) {
        if(confirm('Are you sure you want to remove this agent?')) {
            var businessAgents = Session.get('businessAgents');
            businessAgents.splice(event.currentTarget.dataset.idx, 1);
            Session.set('businessAgents', businessAgents);
            Session.set('agentMode', 'Add');
            $('#agentForm')[0].reset();
            $('#agentModal').modal('hide');
        }
    },
    'click .retire-agent': function(event) {
        if(confirm('Are you sure you want to retire this agent?')) {
            Meteor.call('retireUser', event.currentTarget.dataset.id);
        }
    },
    'click .agent-cancel': function(event) {
        Session.set('agentMode', 'Add');
        $('#agentForm')[0].reset();
    },
    'submit #agentForm': function(event) {
        event.preventDefault();
        var values = event.target;
        var agentMode = Session.get('agentMode');
        var mode = Session.get('mode');
        var agent = {
            username: values.username.value,
        };
        agent.profile = {
            firstName: values.firstName.value,
            lastName: values.lastName.value,
            address: values.address.value,
            city: values.city.value,
            state: values.state.value,
            country: values.country.value,
            zip: values.zip.value,
            email: values.email.value,
            mobile: values.mobile.value,
            type: 'agent',
        };
        
        if(mode == 'Add') {
            var businessAgents = Session.get('businessAgents');
            if(agentMode == 'Add') {
                businessAgents.push(agent);
                Session.set('businessAgents', businessAgents);
            } else {
                businessAgents[Session.get('currentAgentIdx')] = agent;
                Session.set('businessAgents', businessAgents);
            }
        } else if(mode == 'Edit') {
            agent.profile.businessId = Session.get('currentBusinessId');
            if(agentMode == 'Add') {
                Meteor.call('insertUser', agent, function() {
                    Meteor.call('sendLoginDetails', agent.profile.email, agent.username);
                });
            } else Meteor.call('updateUser', Session.get('currentAgentId'), agent);
        }
        $('#agentModal').modal('hide');
        $('#agentForm')[0].reset();
        Session.set('agentMode', 'Add');
    }
});