Files = new Meteor.Collection(null);
/********************************************************/
Session.setDefault('ImportStatus', {flag: 0, data: ' - Upload File'}); // init
Session.setDefault('currentUser', {bid: 0, aid:0});
Template.registerHelper("equals", function (a, b)
	{
		return (a == b);
	}
);

/********************************************************/
Template.importHandler.helpers(
	{
	'importState': function() {
			var status = Session.get('ImportStatus');
			if(!status)
				return 0;
			return status.flag;
		},
	'importMsg': function() {
			var status = Session.get('ImportStatus');
			if(!status)
				return ' - Upload File';
			return status.data;
		},
	'init': function(){
			var user = Session.get('currentUser');
			if(!user || !user.bid || !user.aid){
				var bid = Meteor.user().profile.businessId.toString();
				var aid = Meteor.user()._id.toString();
				Session.set('currentUser', {bid: bid, aid:aid});
			}
			return "Import Contacts";
		}
	}
);

/********************************************************/
Template.loaderbar.helpers(
	{
	'file': function() {
			var status = Session.get('ImportStatus');
			if(status && status.flag == 1 && status.filename)
				return status.filename;
			return "No File Selected";
		}
	}
);
Template.loaderbar.events(
	{
	}
);

/********************************************************/
Template.uploadInput.rendered = function() {
	Dropzone.forElement("#dropzoneDiv").on('success', function(file, response) {
		var user = Session.get('currentUser');
		if(user){
			Session.set('ImportStatus', {flag: 0, data: ' - Upload Complete', filename: response.filename});
			Meteor.call('uploadFile', response.filename, user.bid, user.aid);
		}
    });
};
Template.uploadInput.helpers(
	{
	'files': function() {
			return Files.find();
		},
	'isUploaded': function() {
			var upload = UploadedCSV.find();
			return (upload && upload.count() > 0);
		}
	}
);
Template.uploadInput.events(
	{
		'click input.next-step': function() {
			Session.set('ImportStatus', {flag: 2, data: ' - Column Mapping'});
		}
		/*'click .start-upload': function() {
			var path = $('.file-upload').val().trim();
			if(path.length>0) {
				var p = path.split('.');
				if(p.length>0) {
					var ext = p[p.length-1];
					if(ext == 'csv') {
						var fsFile = new FS.File($('input.file-upload')[0].files[0]);
						Upload.insert(fsFile, function (err, fileObj)
							{
								if (err) {
									console.log('Error: Error in uploading ' + fileObj.original.name);
								} else {
									var user = Session.get('currentUser');
									Session.set('ImportStatus', {flag: 1, data: ' - Upload Complete', filename: fileObj.original.name});
									Meteor.call('uploadFile', fileObj._id, fileObj.original.name, user.bid, user.aid);
								}
							}
						);
						return;
					}
				}
				$('.upload-msg').html('Invalid CSV file.').removeClass('hidden').hide().fadeIn(1000);
			}else {
				$('.upload-msg').html('Please select a <em>file</em> to upload.').removeClass('hidden').hide().fadeIn(1000);
			}
		}*/
	}
);
/********************************************************/
Template.mapping.helpers(
	{
	'options': function() {
			return DefaultHeader;
		},
	'fields': function() {
			var user = Session.get('currentUser');
			return TempHeaders.find({bid: user.bid, aid: user.aid});
		},
	'ifsubmenu': function() {
			return this.sub;
		}
	}
);
Template.mapping.events(
	{
		'change select.selection': function(event) {
			var user = Session.get('currentUser');
			var value = event.target.value;
			var i = $(event.target).attr('index');
			var prev = $(event.target).attr('prev');
			Meteor.call('removeSelected', i, user.bid, user.aid);
			if(value != 0)
				Meteor.call('insertSelected', value, i, user.bid, user.aid);
			$('select.selection').each(function()
				{
					$(this).find('option').each(function()
						{
							var val = $(this).attr('value');
							if(val != 0) {
								if(val == value) {
									$(this).attr('disabled', 'true');
								}
								if(prev == val) {
									$(this).removeAttr('disabled');
								}
							}
						}
					);
				}
			);
			$(this).find('option[value=' + value + ']').removeAttr('disabled');
			$(event.target).attr('prev', value);
		},
		'click input.next-step': function() {
			var def = SelectedHeaders.findOne({value: 'mobile_number'});
			var count =  SelectedHeaders.find({});
			if(!def)
				$('.upload-msg').html('Field "Mobile No." is required!').removeClass('hidden').hide().fadeIn(1000);
			else if(count.count() < 2)
				$('.upload-msg').html('Two or more fields are required!').removeClass('hidden').hide().fadeIn(1000);
			else{
				var user = Session.get('currentUser');
				if(user){
					Session.set('ImportStatus', {flag: 3, data: ' - Importing'});
					Meteor.call('startImport', user.bid, user.aid);
					Session.set('totalImport', UploadedCSV.findOne({bid: user.bid, aid: user.aid}).entries.length);
				}
			}
		}
	}
);
/********************************************************/
Template.result.helpers(
	{
		'progress': function(){
			var user = Session.get('currentUser');
			var total = Session.get('totalImport');
			if(user && total){
				var count = 0;
				var c = UploadedCSV.findOne({bid: user.bid, aid: user.aid}).entries;
				c.forEach(function(data){
					if(data)
						count++;
				});
				var current = total - (total - (total-count));
				return current / total * 100;
			}else
				return 0;
		},
		'logs': function(){
			return ImportLogs.find();
		}
	}
);
Template.result.events({
		'click input.next-step': function() {
			Meteor.call('clearTempDB');
			Session.set('ImportStatus', {flag: 0, data:' - Upload File'});
		}
});

/********************************************************/
