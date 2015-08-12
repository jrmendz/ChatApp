Template.tasks.created = function() {
    Session.set('task_id', '55958d46efeaf3f04989d487');
};

Template.tasks.rendered = function() {
    $('.recorder-div').hide();
    timer();
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    var recorder;
    
    $('#due-date').datetimepicker({ format: 'MMMM D, YYYY' });
    $('#remind-date').datetimepicker({ format: 'MMMM D, YYYY h:mm a' });
    $('input[type=file]').on('change', uploadFile);
    $('.screenshot').on('click', screenshot);
    $('#record').on('click', startRecord);
    $('#stop').on('click', stopRecord);
    $('.record-audio').on('click', function() {
        if($('.recorder-div').is(':visible')) $('.recorder-div').hide();
        else $('.recorder-div').show();
    });
    
    $('#due-date').on('dp.change', function(e) {
        var newDate = moment(e.date).format('MMMM D, YYYY');
        Meteor.call('updateDueDate', Session.get('task_id'), newDate);
    });
    
    $('#remind-date').on('dp.change', function(e) {
        var newDate = moment(e.date).format('MMMM D, YYYY h:mm a');
        Meteor.call('updateRemindDate', Session.get('task_id'), newDate);
    });
    
    $(document).on('click', '.preview-img', function(e) {
        $('#preview img').hide();
        $('#preview video').hide();
        
        var url = '/files/';
        var preview = $(this).data('preview');
        
        $('#preview #title').text(preview);
        $('#preview img').attr('src', url + preview);
        $('#preview img').show();
        $('#preview').modal('show');
    });
    
    $(document).on('click', '.preview-video', function(e) {
        $('#preview img').hide();
        $('#preview video').hide();
        
        var url = '/files/';
        var preview = $(this).data('preview');
        var type = $(this).data('type');
        
        $('#preview #title').text(preview);
        $('#preview video').attr('src', url + preview);
        $('#preview video').attr('type', type);
        $('#preview video').show();
        $('#preview').modal('show');
    });
    
    this.autorun(function() {
        var dueDate = Session.get('due_date');
        var remindDate = Session.get('remind_date');
        if(dueDate) $('#due-date').data('DateTimePicker').date(dueDate);
        if(remindDate) $('#remind-date').data('DateTimePicker').date(remindDate);
    });
};

Template.tasks.helpers({
    task: function () {
        var task = Tasks.findOne(Session.get('task_id'));
        if(task !== undefined) {
                Session.set('due_date', task.due_date);
                Session.set('remind_date', task.remind_date);
        }
        return Tasks.findOne(Session.get('task_id'));
    },
    isDone: function(value) {
        if(value == '1') return 'checked';
    },
    lineThrough: function(value) {
        if(value == '1') return 'input-line-through';
    },
    isImage: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        var imageExtensions = ['jpg', 'gif', 'png', 'jpeg'];
        if($.inArray(extension, imageExtensions) > -1) return true;
        else return false;
    },
    isVideo: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        var videoExtensions = ['mp4', 'ogg', 'webm'];
        if($.inArray(extension, videoExtensions) > -1) return true;
        else return false;
    },
    videoType: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if(extension == 'mp4') return 'video/mp4';
        else if(extension == 'ogg') return 'video/ogg';
        else if(extension == 'webm') return 'video/webm';
    },
    isAudio: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        var audioExtensions = ['mp3', 'wav'];
        if($.inArray(extension, audioExtensions) > -1) return true;
        else return false;
    },
    audioType: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if(extension == 'mp3') return 'audio/mpeg';
        else if(extension == 'wav') return 'audio/wav';
    },
    isMp3: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if(extension == 'mp3') return true;
        else return false;
    },
    isWav: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        if(extension == 'wav') return true;
        else return false;
    },
    files: function () {
      return TaskFiles.find({task_id: Session.get('task_id')});
    },
    comments: function () {
      return TaskComments.find({task_id: Session.get('task_id')});
    },
    getUsername: function(userId) {
        return Meteor.users.findOne(userId).username;
    },
});

Template.tasks.events({
    'click .update-task': function(event) {
        if($('.update-task').is(':checked')) var isDone = '1';
        else var isDone = '0';
        Meteor.call('updateTask', Session.get('task_id'), isDone);
    },
    'click .favorite': function() {
        Meteor.call('updateFavorite', Session.get('task_id'));
    },
    'click .clear-due-date': function() {
        $('#due-date').data('DateTimePicker').clear();
    },
    'click .clear-remind-date': function() {
        $('#remind-date').data('DateTimePicker').clear();
    },
    'click .update-subtask': function(event) {
        if($('.update-subtask').is(':checked')) var isDone = '1';
        else var isDone = '0';
        Meteor.call('updateSubtask', Session.get('task_id'), event.currentTarget.dataset.subtaskidx, isDone);
    },
    'click .remove-subtask': function(event) {
        if(confirm('Are you sure?')) Meteor.call('removeSubtask', Session.get('task_id'), event.currentTarget.dataset.subtaskidx);
    },
    'change .note': function() {
        Meteor.call('updateNote', Session.get('task_id'), $('.note').val());
    },
    'click .add-subtask': function() {
        Meteor.call('addSubtask', Session.get('task_id'), $('.subtask-input').val());
        $('.subtask-input').val('');
    },
    'click .add-comment': function() {
        Meteor.call('addComment', Session.get('task_id'), $('.comment-input').val(), Meteor.userId());
        $('.comment-input').val('');
    },
    'click .remove-comment': function(event) {
        if(confirm('Are you sure?')) Meteor.call('removeComment', event.currentTarget.dataset.commentid);
    },
    'click .remove-file': function(event) {
        if(confirm('Are you sure?')) Meteor.call('removeFile', event.currentTarget.dataset.fileid);
    }
});

function uploadFile(event) {
    var files;
    files = event.target.files;

    var data = new FormData();
    $.each(files, function(key, value)
    {
        data.append(key, value);
    });
    data.append('task_id', Session.get('task_id'));
    data.append('user_id', Meteor.userId());
    $.ajax({
        url: '/upload',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        complete: function(jqXHR, status) {
            $('#attachment').val('');
        },
    });
}

function screenshot() {
    html2canvas(document.body, {
      onrendered: function(canvas) {
          var myImage = canvas.toDataURL("image/png");
          var data = new FormData();
            data.append('screenshot', myImage);
            data.append('task_id', Session.get('task_id'));
            data.append('user_id', Meteor.userId());
            $.ajax({
              url: '/upload',
              type: 'POST',
              data: data,
              contentType: false,
              processData: false
            });
      }
    });
}

function uploadScreenshot() {
    var screenshot = document.documentElement.cloneNode(true);
    var b = document.createElement('base');
    b.href = document.location.protocol + '//' + location.host;
    var head = screenshot.querySelector('head');
    head.insertBefore(b, head.firstChild);
    screenshot.style.pointerEvents = 'none';
    screenshot.style.overflow = 'hidden';
    screenshot.style.webkitUserSelect = 'none';
    screenshot.style.mozUserSelect = 'none';
    screenshot.style.msUserSelect = 'none';
    screenshot.style.oUserSelect = 'none';
    screenshot.style.userSelect = 'none';
    screenshot.dataset.scrollX = window.scrollX;
    screenshot.dataset.scrollY = window.scrollY;
    var blob = new Blob([screenshot.outerHTML], {
        type: 'text/html'
    });
    var data = new FormData();
    data.append('screenshot', blob);
    data.append('task_id', Session.get('task_id'));
    data.append('user_id', Meteor.userId());
    $.ajax({
      url: '/upload',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false
    });
}

function startRecord() {
    $('#time').show();
    if (navigator.getUserMedia) {
        navigator.getUserMedia(
            {audio: true}, 
            function(s) {
                var context = new AudioContext();
                var mediaStreamSource = context.createMediaStreamSource(s);
                recorder = new Recorder(mediaStreamSource);
                recorder.record();

                // audio loopback
                // mediaStreamSource.connect(context.destination);
              }, 
              function(e) {
                console.log('Rejected!', e);
              }
        );
    } else {
        console.log('navigator.getUserMedia not present');
    }
}

function stopRecord() {
    recorder.stop();
    recorder.exportWAV(function(blob) {
        var url = URL.createObjectURL(blob);
        var data = new FormData();
        data.append('audio', blob);
        data.append('task_id', Session.get('task_id'));
        data.append('user_id', Meteor.userId());
        $.ajax({
          url: '/upload',
          type: 'POST',
          data: data,
          contentType: false,
          processData: false,

          complete: function(data) {
              $('.recorder-div').hide();
          }
        });
    });
  }

function timer() {
    $.extend({
        APP : {   
            formatTimer : function(a) {
                if (a < 10) {
                    a = '0' + a;
                }                              
                return a;
            },    

            startTimer : function(dir) {
                var a;
                // save type
                $.APP.dir = dir;
                // get current date
                $.APP.d1 = new Date();

                switch($.APP.state) {
                    case 'pause' :
                        // resume timer
                        // get current timestamp (for calculations) and
                        // substract time difference between pause and now
                        $.APP.t1 = $.APP.d1.getTime() - $.APP.td;  
                    break;

                    default :
                        // get current timestamp (for calculations)
                        $.APP.t1 = $.APP.d1.getTime(); 

                        // if countdown add ms based on seconds in textfield
                        if ($.APP.dir === 'cd') {
                            $.APP.t1 += parseInt($('#cd_seconds').val())*1000;
                        }    
                    break;
                }                                   

                // reset state
                $.APP.state = 'alive';   
                $('#' + $.APP.dir + '_status').html('Running');
                // start loop
                $.APP.loopTimer();
            },

            pauseTimer : function() {
                // save timestamp of pause
                $.APP.dp = new Date();
                $.APP.tp = $.APP.dp.getTime();

                // save elapsed time (until pause)
                $.APP.td = $.APP.tp - $.APP.t1;

                // change button value
                $('#' + $.APP.dir + '_start').val('Resume');
                // set state
                $.APP.state = 'pause';
                $('#' + $.APP.dir + '_status').html('Paused');
            },

            stopTimer : function() {
                // change button value
                $('#' + $.APP.dir + '_start').val('Restart');                    

                // set state
                $.APP.state = 'stop';
                $('#' + $.APP.dir + '_status').html('Stopped');
            },

            resetTimer : function() {
                // reset display
                $('#' + $.APP.dir + '_ms,#' + $.APP.dir + '_s,#' + $.APP.dir + '_m,#' + $.APP.dir + '_h').html('00');                 

                // change button value
                $('#' + $.APP.dir + '_start').val('Start');                    

                // set state
                $.APP.state = 'reset';  
                $('#' + $.APP.dir + '_status').html('Reset & Idle again');
            },

            endTimer : function(callback) {
                // change button value
                $('#' + $.APP.dir + '_start').val('Restart');

                // set state
                $.APP.state = 'end';

                // invoke callback
                if (typeof callback === 'function') {
                    callback();
                }   
            },    

            loopTimer : function() {
                var td;
                var d2,t2;
                var ms = 0;
                var s  = 0;
                var m  = 0;
                var h  = 0;

                if ($.APP.state === 'alive') {
                    // get current date and convert it into 
                    // timestamp for calculations
                    d2 = new Date();
                    t2 = d2.getTime();   

                    // calculate time difference between
                    // initial and current timestamp
                    if ($.APP.dir === 'sw') {
                        td = t2 - $.APP.t1;
                    // reversed if countdown
                    } else {
                        td = $.APP.t1 - t2;
                        if (td <= 0) {
                            // if time difference is 0 end countdown
                            $.APP.endTimer(function(){
                                $.APP.resetTimer();
                                $('#' + $.APP.dir + '_status').html('Ended & Reset');
                            });
                        }    
                    }    

                    // calculate milliseconds
                    ms = td%1000;
                    if (ms < 1) {
                        ms = 0;
                    } else {    
                        // calculate seconds
                        s = (td-ms)/1000;
                        if (s < 1) {
                            s = 0;
                        } else {
                            // calculate minutes   
                            var m = (s-(s%60))/60;
                            if (m < 1) {
                                m = 0;
                            } else {
                                // calculate hours
                                var h = (m-(m%60))/60;
                                if (h < 1) {
                                    h = 0;
                                }                             
                            }    
                        }
                    }

                    // substract elapsed minutes & hours
                    ms = Math.round(ms/100);
                    s  = s-(m*60);
                    m  = m-(h*60);                                

                    // update display
                    $('#' + $.APP.dir + '_ms').html($.APP.formatTimer(ms));
                    $('#' + $.APP.dir + '_s').html($.APP.formatTimer(s));
                    $('#' + $.APP.dir + '_m').html($.APP.formatTimer(m));
                    $('#' + $.APP.dir + '_h').html($.APP.formatTimer(h));
                    // loop
                    $.APP.t = setTimeout($.APP.loopTimer,1);
                } else {
                    // kill loop
                    clearTimeout($.APP.t);
                    return true;
                }  
            }
        }    
    });

    $('#record').on('click', function() {
        document.getElementById('status').innerHTML = "";
        $.APP.startTimer('sw');
    });    

    $('#start').on('click', function() {
        $.APP.startTimer('cd');
    });           

    $('#stop,#cd_stop').on('click', function() {
        document.getElementById('status').innerHTML = "";
        $.APP.stopTimer();
    });

    $('#reset,#cd_reset').on('click', function() {
        $('#time').show();
        document.getElementById('status').innerHTML = "";
        $.APP.resetTimer();
    });  

    $('#sw_pause,#cd_pause').on('click', function() {
        $.APP.pauseTimer();
    });
}