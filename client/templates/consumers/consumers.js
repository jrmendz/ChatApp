Template.consumers.created = function(){
    Session.set('numberFormat', 'pretty');
};

Template.add.rendered = function(){
    $('.is-intl').change(function() {
        if($(this).is(':checked')) Session.set('numberFormat', 'intl');
        else Session.set('numberFormat', 'pretty');
    });
};

Template.language.helpers({
    defaultLanguage: function() {
        var businessSettings = Settings.findOne({businessId: Meteor.user().profile.businessId});
       if(businessSettings) {
           if(businessSettings.settings) {
               if(businessSettings.settings.defaults) {
                   return businessSettings.settings.defaults.contactLanguage;
               }
           }
       }
        return '';
    }, 
	'languages': function(){
		return LanguageCodes;
	},
   'isSelected': function(defaultCode, currentCode){
       if(Session.get('mode') == 'isAdd') {
           if(defaultCode != '') {
               if(defaultCode == currentCode) return 'selected';
           }
       } else {
            var code = Session.get('languageCode');
            if(code === this.code)
                return 'selected';
       }
       return '';
   }
});

Template.viewer.helpers({
	'info': function(){
        var user = Session.get('currentUser');
		if(user){
			var mobile = Session.get('consumer_no');
			var info = Consumers.findOne({mobile_number: mobile, identity:{$elemMatch:{businessId: user.bid}}})
			if(info){
				for(var i=0; i <info.identity.length; i++){
					if(info.identity[i].businessId == user.bid){
                        info.identity[i].countryCode = info.country;
						info.identity[i].mobile_number = info.mobile_number;
						for(var x=0; x<LanguageCodes.length; x++){
							if(LanguageCodes[x].code === info.language.toLowerCase()){
								info.identity[i].language = LanguageCodes[x].name;
								break;
							}
						}
						for(var y=0; y<CountryCodes.length; y++){
							if(CountryCodes[y].code === info.country){
								info.identity[i].country = CountryCodes[y].name;
								break;
							}
						}
                        
						return [info.identity[i]];
					}
				}
			}
			return [];
		}
		return [];
	},
    displayNumber: function(number, contactCountry) {
        var businessSettings = Settings.findOne({businessId: Meteor.user().profile.businessId});
        var defaultCountry = '';
       if(businessSettings) {
           if(businessSettings.settings) {
               if(businessSettings.settings.defaults) {
                   defaultCountry = businessSettings.settings.defaults.businessCountry;
                   console.log(defaultCountry);
               }
           }
       }
        if(defaultCountry == '') return number;
        else if(defaultCountry == contactCountry) return Meteor.clientFn.formatNumber(number);
        else return number;
    }
});

Template.consumers.helpers({
    isImport : function(){
         if(Session.get('mode') === 'isImport'){
			var bid = Meteor.user().profile.businessId.toString();
			var aid = Meteor.user()._id.toString();
			Meteor.call('clearTempDB');
			Session.set('ImportStatus', {flag: 0, data:' - Upload File'});
			Session.set('currentUser', {bid: bid, aid:aid});
            return true;
         }else{
            return false;
         }
    },
    isAdd : function(){
         if(Session.get('mode') === 'isAdd'){
			Session.set('languageCode', 0);
			Session.set('countryCode', 0);
            return true;
         }else{
            return false;
         }
    },
    isView : function(){
         if(Session.get('mode') === 'isView'){
            return true;
         }else{
            return false;
         }
    },
    isEdit : function(){
         if(Session.get('mode') === 'isEdit'){
            return true;   
         }else{
            return false;
         }
    },
    'getConsumers' : function(){
    	var status = Session.get('ImportStatus');
        var user = Session.get('currentUser');
		if(!user || status.flag == 3)
	        return [];
		else
			return Consumers.find({'identity.businessId': user.bid});
    },
	'profile': function(){
        var user = Session.get('currentUser');
		var list = this.identity;
		for(var i = 0; i < list.length; i++){
			if(list[i].businessId === user.bid){
				var name = list[i].first + " ";
				if(list[i].last)
					name += list[i].last;
				return name;
			}
		};
		return "";
	},
	'count': function(){
        var user = Session.get('currentUser');
		if(!user)
			return 0;
		return Consumers.find({'identity.businessId': user.bid}).count();
	},
	'init': function(){
			var user = Session.get('currentUser');
			if(!user || !user.bid || !user.aid){
				var bid = Meteor.user().profile.businessId.toString();
				var aid = Meteor.user()._id.toString();
				Session.set('currentUser', {bid: bid, aid:aid});
			}
			return '';
		},
    numberFormat: function() {
        return Session.get('numberFormat');
    }
});

Template.edit.helpers({
	'info': function(){
        var user = Session.get('currentUser');
		if(user){
			var mobile = Session.get('consumer_no');
			var info = Consumers.findOne({mobile_number: mobile, identity:{$elemMatch:{businessId: user.bid}}})
			if(info){
				for(var i=0; i <info.identity.length; i++){
					if(info.identity[i].businessId == user.bid){
						info.identity[i].mobile_number = info.mobile_number;
						Session.set('languageCode', info.language.toLowerCase());
						Session.set('countryCode', info.country);
						return [info.identity[i]];
					}
				}
			}
		}
		return {};
	},
    sessionCountryCode: function() {
        return Session.get('countryCode');
    }
//    displayNumber: function(number) {
//        var businessSettings = Settings.findOne({businessId: Meteor.user().profile.businessId});
//        var defaultCountry = '';
//       if(businessSettings) {
//           if(businessSettings.settings) {
//               if(businessSettings.settings.defaults) {
//                   defaultCountry = businessSettings.settings.defaults.businessCountry;
//               }
//           }
//       }
//        if(defaultCountry == '') return number;
//        else if(defaultCountry == Session.get('countryCode')) return Meteor.clientFn.formatNumber(number);
//    }
});

Template.consumers.events({
    'click .importConsumer' : function(){
        Session.set('mode','isImport');
    },
    'click .consumer-no': function(e){
        var consumer_no = this.mobile_number;
        Session.set('consumer_no',consumer_no);
        Session.set('mode', 'isView');
        $('.editConsumer').prop( "disabled", false );
		e.preventDefault();
    },
	'click #cancelEdit': function(){
        Session.set('mode', 'isView');
        $('.editConsumer').prop( "disabled", false );
		e.preventDefault();
	},
    'click .addConsumer' : function(){
        Session.set('mode','isAdd');  
        Session.set('consumer_no',null);
        $('.editConsumer').prop( "disabled", true );
    },
    'click .editConsumer' : function(){
        Session.set('mode','isEdit');
    },
    'submit #addForm' : function(event){
        event.preventDefault();
        var fname = event.target.fname.value;
        var lname = event.target.lname.value;
        var company = event.target.company.value;
		var accno = event.target.accno.value;
		var add = event.target.address.value;
        var mobile = event.target.mobileNo.value;
		var lang = event.target.language.value;
		var country = event.target.countries.value;
		var state = event.target.state.value;
		var city = event.target.city.value;
		var email = event.target.email.value;
		var link = event.target.link.value;
		var isEmp = event.target.is_employee.value;
        
        var numberFormat = Session.get('numberFormat');
        var valid = false;
        if(numberFormat == 'pretty') {
            var phoneNumber = mobile.replace(/\D/g,'');
            if(phoneNumber.length == 10) {
                valid = true;
                mobile = '+1' + mobile;
            }
        } else if(/^\+?[0-9]\d{1,14}$/.test(mobile)) {
            valid = true;
            var prefix011 = mobile.substring(0, 3);
            var firstChar = mobile[0];
            if(prefix011 == '011') mobile = '+' + mobile.substring(3);
            else if(/^\d+$/.test(firstChar)) mobile = '+' + mobile;
        }
        
		var user = Session.get('currentUser');
		if(!user || !user.bid){
			alert('Session timed out! Please refresh page.');
			return;
		}
        if(valid) {
            data = {
                fname: fname,
                lname: lname,
                company: company,
                accno: accno,
                add: add,
                mobile: mobile,
                bid: user.bid,
                language: lang.toUpperCase(),
                country: country,
                state: state,
                city: city,
                email: email,
                link: link,
                isEmployee: (isEmp == '1') ? '1' : '0'
            };
            var found = Consumers.findOne({'mobile_number':mobile, identity:{$elemMatch:{businessId: user.bid}}});
            if(found){
                alert("Duplicate entry! Please modify existing or create new entry.");
                return;
            }
            found = Consumers.findOne({'mobile_number':mobile});
            if(!found){
                Meteor.call('insertConsumer',data);
            }else{
                Meteor.call('updateDuplicate',data);
            }
            $('#addForm')[0].reset();
            Session.set('mode','isAdd');
            $('.editConsumer').prop( "disabled", true );
        } else alert('Invalid Mobile Number.');
    },
    'submit #editForm' : function(event){
        event.preventDefault();
		var user = Session.get('currentUser');
		if(!user || !user.bid){
			alert('Session timed out! Please refresh page.');
			return;
		}
        var fname = event.target.fname.value;
        var lname = event.target.lname.value;
        var company = event.target.company.value;
		var accno = event.target.accno.value;
		var add = event.target.address.value;
        var mobile = event.target.mobileNo.value;
		var lang = event.target.language.value;
		var country = event.target.countries.value;
		var state = event.target.state.value;
		var city = event.target.city.value;
		var email = event.target.email.value;
		var link = event.target.link.value;
		var isEmp = event.target.is_employee.value;
        data = {
            fname: fname,
            lname: lname,
            company: company,
			accno: accno,
			add: add,
            mobile: mobile,
			bid: user.bid,
			aid: user.aid,
            language: lang.toUpperCase(),
            country: country,
			state: state,
			city: city,
			email: email,
			link: link,
            isEmployee: (isEmp == '1') ? '1' : '0'
        };
        console.log(data);
        Meteor.call('updateConsumers',data);
        Session.set('consumer_no',mobile);
        Session.set('mode', 'isView');
        $('.editConsumer').prop( "disabled", true );
    }
});

Template.countries.helpers({
    defaultCountry: function() {
        var businessSettings = Settings.findOne({businessId: Meteor.user().profile.businessId});
       if(businessSettings) {
           if(businessSettings.settings) {
               if(businessSettings.settings.defaults) {
                   return businessSettings.settings.defaults.contactCountry;
               }
           }
       }
        return '';
    }, 
   'countries': function(){
   		return CountryCodes;
   },
   'isSelected': function(defaultCode, currentCode){
       if(Session.get('mode') == 'isAdd') {
           if(defaultCode != '') {
               if(defaultCode == currentCode) return 'selected';
           }
       } else {
           var code = Session.get('countryCode');
            if(code === this.code)
                return 'selected';
       }
       return '';
   }

});