Template.defaults.helpers({
    defaults: function(){
		var defaults = Settings.findOne({businessId: Meteor.user().profile.businessId}).settings.defaults;
        if(defaults) return defaults;
        else return {};
	},
    languages: function(){
		return LanguageCodes;
	},
    countries: function(){
		return CountryCodes;
	},
});

Template.defaults.events({
    'submit #defaultsForm': function(event) {
        event.preventDefault();
        var defaults = {
            businessCountry: event.target.businessCountry.value,
            businessLanguage: event.target.businessLanguage.value,
            contactCountry: event.target.contactCountry.value,
            contactLanguage: event.target.contactLanguage.value,
        };
        Meteor.call('defaultSettings', Meteor.user().profile.businessId, defaults);
        alert('Settings Saved.');
    },
});