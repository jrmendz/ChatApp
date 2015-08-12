Meteor.clientFn = {};
Meteor.clientFn.addIndexKey = function (obj) {
    return _.map(obj, function(val, indexKey) {
        return {indexKey: indexKey, value: val};
    });
};

Meteor.clientFn.formatNumber = function(number) {
    if(number) {
        number = number.substring(2);
        return '(' + number.substring(0, 3) + ') ' + number.substr(-7, 3) + ' ' + number.substr(-4);
    } else return '';
}

Meteor.clientFn.displayMobileNumber = function(mobileNumber, country) {
    var businessSettings = Settings.findOne({businessId: Meteor.user().profile.businessId});
    var defaultCountry = '';
    if(businessSettings) {
        if(businessSettings.settings) {
            if(businessSettings.settings.defaults) {
                defaultCountry = businessSettings.settings.defaults.businessCountry;
            }
        }
    }
    if(defaultCountry == '') return mobileNumber;
    else if(defaultCountry == country) return Meteor.clientFn.formatNumber(mobileNumber);
    else return mobileNumber;
}

Meteor.clientFn.timeFromNow = function(timestamp) {
    if(timestamp) return moment(timestamp).fromNow();
    else return '';
}

Meteor.clientFn.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

Meteor.clientFn.formatDate = function(date) {
    if(date !== "") {
        date = date.split('-');
        return moment().set('year', parseInt(date[0])).set('month', parseInt(date[1]-1)).set('date', date[2]).format('MMM D, YYYY');
    } return "";
}

Meteor.clientFn.formatTime = function(time) {
    if(time !== "") {
        time = time.split(':');
        return moment().set('hour', parseInt(time[0])).set('minute', parseInt(time[1])).set('second', 0).format('h:mm A');
    } return "";
}

Meteor.clientFn.currentTime = function() {
    return Session.get('currentTime');
}

Meteor.clientFn.isEqual = function(value1, value2, valueIfTrue, valueIfFalse) {
    if(value1 == value2) {
        if(valueIfTrue == ':none') return '';
        else if(valueIfTrue) return valueIfTrue;
        else return true;
    } else {
        if(valueIfFalse == ':none') return '';
        else if(valueIfFalse) return valueIfFalse;
        else return false;
    }
}

Meteor.clientFn.isTrue = function(value, returnValue) {
    if(value) {
        if(returnValue) return returnValue;
        else return true;
    } else return false;
}

Meteor.clientFn.isFalse = function(value, returnValue) {
    if(value) return true;
    else {
        if(returnValue) return returnValue;
        else return false;
    }
}

Meteor.clientFn.userInfo = function(type, id) {
    var user = Meteor.users.findOne(id);
    if(user) {
        if(type == 'username') return user.username;
        else if(type == 'full_name') return user.profile.first + ' ' + user.profile.last;
    } else return '';
}