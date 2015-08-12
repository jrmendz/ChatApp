Template.tmqStaffs.created = function() {
    Session.set('mode', 'Add');
};

Template.tmqStaffs.helpers({
    staffsList: function() {
        return Meteor.users.find({'profile.type': 'staff'});
    },
    mode: function(index) {
        return Session.get('mode');
    }
});

Template.tmqStaffs.events({
    'click .add-staff': function() {
        Session.set('mode', 'Add');
    },
    'click .edit-staff': function(event) {
        Session.set('mode', 'Edit');
        Session.set('currentStaffId', event.currentTarget.dataset.id);
        var staff = Meteor.users.findOne(event.currentTarget.dataset.id);
        $('#tmqStaffForm .first-name').val(staff.profile.firstName);
        $('#tmqStaffForm .last-name').val(staff.profile.lastName);
        $('#tmqStaffForm .address').val(staff.profile.address);
        $('#tmqStaffForm .city').val(staff.profile.city);
        $('#tmqStaffForm .state').val(staff.profile.state);
        $('#tmqStaffForm .country').val(staff.profile.country);
        $('#tmqStaffForm .zip').val(staff.profile.zip);
        $('#tmqStaffForm .username').val(staff.username);
        $('#tmqStaffForm .email').val(staff.profile.email);
        $('#tmqStaffForm .mobile').val(staff.profile.mobile);
    },
    'click .remove-staff': function() {
        if(confirm('Are you sure you want to retire this staff?')) {
            Meteor.call('retireUser', event.currentTarget.dataset.id);
            Session.set('mode', 'Add');
            $('#tmqStaffForm')[0].reset();
            alert('Staff retired.');
        }
    },
    'click .staff-cancel': function(event) {
        Session.set('mode', 'Add');
        $('#tmqStaffForm')[0].reset();
    },
    'submit #tmqStaffForm': function(event) {
        event.preventDefault();
        var values = event.target;
        var mode = Session.get('mode');
        var staff = {
            username: values.username.value,
            'profile.firstName': values.firstName.value,
            'profile.lastName': values.lastName.value,
            'profile.address': values.address.value,
            'profile.city': values.city.value,
            'profile.state': values.state.value,
            'profile.country': values.country.value,
            'profile.zip': values.zip.value,
            'profile.email': values.email.value,
            'profile.mobile': values.mobile.value,
            'profile.type': 'staff',
        };
        
        if(mode == 'Add') {
            Meteor.call('insertUser', staff, function() {
                Meteor.call('sendLoginDetails', staff['profile.email'], staff.username);
            });
        } else if(mode == 'Edit') Meteor.call('updateUser', Session.get('currentStaffId'), staff);
        alert('Staff saved.');
        $('#tmqStaffForm')[0].reset();
        Session.set('mode', 'Add');
    }
});