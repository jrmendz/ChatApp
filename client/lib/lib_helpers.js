UI.registerHelper('addIndexKey', Meteor.clientFn.addIndexKey);

UI.registerHelper('attachType', function () {
    return Session.get('attachType');
});

UI.registerHelper('formatNumber', Meteor.clientFn.formatNumber);

UI.registerHelper('displayMobileNumber', Meteor.clientFn.displayMobileNumber);

UI.registerHelper('timeFromNow', Meteor.clientFn.timeFromNow);

UI.registerHelper('capitalize', Meteor.clientFn.capitalize);

UI.registerHelper('formatDate', Meteor.clientFn.formatDate);

UI.registerHelper('formatTime', Meteor.clientFn.formatTime);

UI.registerHelper('currentTime', Meteor.clientFn.currentTime);

UI.registerHelper('isEqual', Meteor.clientFn.isEqual);

UI.registerHelper('isTrue', Meteor.clientFn.isTrue);

UI.registerHelper('isFalse', Meteor.clientFn.isFalse);

UI.registerHelper('userInfo', Meteor.clientFn.userInfo);