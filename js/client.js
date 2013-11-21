var timeoutReference;

var playlist = [];
var bPlaying = false;
var currentSongName = "";
var activeProvider ="";

$(function(){
	$('#loading').hide();
	$('#mainSearch').keypress(function() {
	        	var _this = $(this); // copy of this object for further usage
	        
	        	if (timeoutReference) clearTimeout(timeoutReference);
	        	timeoutReference = setTimeout(function() {
	        		var str = $('#mainSearch').val();
	        		if(str.length > 2) {
	        			if($('#providerSelect').val() == "1") {
	            			doSearch();
	            		} else if($('#providerSelect').val() == "2") {
	            			doRdioSearch();
	            		} else {
	            			doSoundcloudSearch();
	            		}
	            	} else if(str.length == 0) {
	            		showPlaylist();
	            	}
	        	}, 400);
	});

	$("#mainSearch").val("");

	$('body').on('click', '#addBtn',  function(evt) {
		var obj = JSON.parse($(this).siblings('.data').html());

		playlist.push(obj);
		showPlaylist();
	});

	$('body').on('click', '.icon-download',  function(evt) {
		var name = $(this).parent().siblings('.info').html();
		for(var i=0;i<playlist.length; i++) {
			if(playlist[i].track_title == name) {
				downloadURL(playlist[i].track_url);
			}
		}
	});

	$('body').on('click', '.icon-remove',  function(evt) {
		var name = $(this).parent().siblings('.info').html();
		for(var i=0;i<playlist.length; i++) {
			if(playlist[i].track_title == name) {
				playlist.splice(i, 1);
			}
		}
		showPlaylist();
	});

	$('body').on('click', '#exportBtn',  function(evt) {
		exportPlaylist();
	});

	$('body').on('click', '.playlistEntry .info', function(evt) {
		var name = $(this).html();
		for(var i=0;i<playlist.length; i++) {
			if(playlist[i].track_title == name) {
				playFile(playlist[i]);
			}
		}

	});

	$('#uploadBtn').click(function(evt) {
		$(':input[type="file"]').show().click().hide();
		
	});
	$(':input[type="file"]').change(function(evt) {
		 $.ajax({
		        url: 'http://192.241.169.33:8010/PlayablePlaylist/inc/upload.php',  //Server script to process data
		        type: 'POST',
		        success: function(data) {
		        	console.log(data);
		        	if(data == "") {return;} else {
				data = data.replace(/~/g, '"');
		        		playlist = JSON.parse(data);
		        		showPlaylist();
		        	}
		        },	
		        data: $("input[type=file]")[0].files[0],
		        cache: false,
		        contentType: false,
		        processData: false
		    });
	});

	$('#playBtn').click(function(evt) {
		if(bPlaying) {
			bPlaying = false;
			$('.icon-pause').attr('class', 'icon-play');
			if(activeProvider == "FMA") {
				document.getElementsByTagName('audio')[0].pause();
			} else if(activeProvider == "Rdio") {
				apiswf.rdio_pause();
			} else {
				SCSound.stop();
			}

		} else if(currentSongName != "") {
			bPlaying = true;
			$('.icon-play').attr('class', 'icon-pause');
			if(activeProvider == "FMA") {
				document.getElementsByTagName('audio')[0].play();
			} else if(activeProvider == "Rdio") {
				apiswf.rdio_play();
			} else {
				SCSound.play();
			}
		}
	});

	document.getElementsByTagName('audio')[0].addEventListener('ended', function(){
		trackEnded();
	}, false);
});

function doSearch() {
	$('#loading').show();
	$.ajax({
		type: "GET",
		url: "inc/relay.php?url=" + "http://freemusicarchive.org/api/get/tracks.json?api_key=M9UPND46P44349CW"+encodeURIComponent("&")+"genre_handle=" + $('#mainSearch').val(),
		success: function(data){
			$('#loading').hide();
			$('#playlistPanel').empty();
			var object = JSON.parse(data);
			var arr = object.dataset;
			$('#playlistPanel').append('<div style="margin-left:20px; margin-bottom:20px; color:rgb(150,150,150); font-size:12px">Search Results:</div>')
			for(var i=0; i<arr.length; i++) {
				$('#playlistPanel').append('<div class="playlistEntry">' + 
					'<div class="index"><img style="width:48px; height:48px" src="' + arr[i].track_image_file + '"  ></img></div>' +
                      			'<div id="addBtn" class="ActionMenu pill"><i class="icon-plus track_icon"></i></div>' + 
                      			'<div class="duration">' + arr[i].track_duration + '</div>' + 
                      			'<div class="providerIcon"><img style="width:24px; height:24px" src="imgs/FMA.png"></img></div>' + 
                      			'<div class="info">'+arr[i].track_title+'</div>' + 
                      			'<div class="data" style="display:none">{"provider":"FMA", "track_title":"' + arr[i].track_title + '","track_duration":"' + arr[i].track_duration + '","track_url":"' + arr[i].track_url + '/download", "track_image_file":"' + arr[i].track_image_file + '"}</div>' +
                    				'</div>');
			}
		}
	});
}

function doRdioSearch() {
	$('#loading').show();
	$.ajax({
		type: "GET",
		url: "inc/rdio.php?q=" + $('#mainSearch').val(),
		success: function(data){
			$('#loading').hide();
			$('#playlistPanel').empty();
			var object = JSON.parse(data);
			var arr = object.result.results;
			$('#playlistPanel').append('<div style="margin-left:20px; margin-bottom:20px; color:rgb(150,150,150); font-size:12px">Search Results:</div>')
			for(var i=0; i<arr.length; i++) {
				arr[i].duration = (Math.round(arr[i].duration/60)) + ':' + ((arr[i].duration%60 < 10) ? ('0' + (arr[i].duration%60)) : (arr[i].duration%60));
				$('#playlistPanel').append('<div class="playlistEntry">' + 
					'<div class="index"><img style="width:48px; height:48px" src="' + arr[i].icon + '"  ></img></div>' +
                      			'<div id="addBtn" class="ActionMenu pill"><i class="icon-plus track_icon"></i></div>' + 
                      			'<div class="duration">' + arr[i].duration  + '</div>' + 
                      			'<div class="providerIcon"><img style="width:24px; height:24px" src="imgs/Rdio.png"></img></div>' + 
                      			'<div class="info">'+arr[i].name+'</div>' + 
                      			'<div class="data" style="display:none">{"provider":"Rdio", "track_title":"' + arr[i].name + '","track_duration":"'+arr[i].duration+'","track_url":"' + arr[i].key+ '", "track_image_file":"' + arr[i].icon + '"}</div>' +
                    				'</div>');
			}
		},
		error: function(data) {
			console.log(data);
		} 
	});
}

function doSoundcloudSearch() {
	$('#loading').show();
	$.ajax({
		type: "GET",
		url: "http://api.soundcloud.com/tracks/?client_id=c3f1ba162d5e4efcc5307cabd1b2d8a6&format=json&q=" + $('#mainSearch').val(),
		success: function(data){
			$('#loading').hide();
			$('#playlistPanel').empty();
			var arr = data;
			$('#playlistPanel').append('<div style="margin-left:20px; margin-bottom:20px; color:rgb(150,150,150); font-size:12px">Search Results:</div>')
			for(var i=0; i<arr.length; i++) {
				$('#playlistPanel').append('<div class="playlistEntry">' + 
					'<div class="index"><img style="width:48px; height:48px" src="' + arr[i].artwork_url + '"  ></img></div>' +
                      			'<div id="addBtn" class="ActionMenu pill"><i class="icon-plus track_icon"></i></div>' + 
                      			'<div class="providerIcon"><img style="width:24px; height:24px" src="imgs/SoundCloud.png"></img></div>' + 
                      			'<div class="info">'+arr[i].title+'</div>' + 
                      			'<div class="data" style="display:none">{"provider":"SoundCloud", "track_title":"' + arr[i].title + '","track_duration":" ","track_url":"' + arr[i].id+ '", "track_image_file":"' + arr[i].artwork_url + '"}</div>' +
                    				'</div>');
			}
		},
		error: function(data) {
			console.log(data);
		} 
	});
}

function showPlaylist() {
	$('#loading').hide();
	$("#mainSearch").val("");
	$('#playlistPanel').empty();
	$('#playlistPanel').append('<div style="margin-left:20px; margin-bottom:5px; color:rgb(150,150,150); font-size:12px">Current Playlist:</div>')
	for(var i=0; i<playlist.length; i++) {
		$('#playlistPanel').append('<li class="playlistEntry ' + ((i == playlist.length-1) ? "last" : "") +'">' + 
                      	'<div class="index"><img style="width:48px; height:48px" src="' + playlist[i].track_image_file + '"  ></img></div>' +
      			'<div id="removeBtn" class="ActionMenu pill"><i class="icon-remove track_icon"></i>' + 
      			((playlist[i].provider == "FMA") ? '<i class="icon-download track_icon"></i>' : '') +
      			'</div>' +  
      			'<div class="duration">' + playlist[i].track_duration + '</div>' + 
                      	'<div class="providerIcon"><img style="width:24px; height:24px" src="imgs/' + ((playlist[i].provider == "FMA") ? "FMA" : ((playlist[i].provider == "Rdio") ? "Rdio" : "SoundCloud")) + '.png"></img></div>' + 
      			'<div class="info">'+playlist[i].track_title+'</li>' + 
    			'</div>');
	}

	if(playlist.length > 0) {
		$('#playlistPanel').append(' <div style="width:200; display:block;margin-left:auto; margin-right:auto;"><input type="text" style="width:300px;  display:inline-block; margin-bottom:40px" id="playName" class="form-control" placeholder="Playlist Name..."><a id="exportBtn" style=" display:inline-block" class="btn btn-large btn-success" href="#">Export Playlist</a></div>');
	}
}

function exportPlaylist() {
	var out = JSON.stringify(playlist);
	out = out.replace(/"/g, "~");
	console.log(out);
	$.ajax({
		datatype: 'jsonp',
		url: "http://192.241.169.33:8010/PlayablePlaylist/inc/encrypt.php?type=add&comment=" + out,
		success: function(data){
			console.log(data);
			var str = $('#playName').val();
			if(str == "") {
				str = "playlist";
			}
			downloadURL("http://192.241.169.33:8010/PlayablePlaylist/inc/downloader.php?name=" + str + "&file=" + data);
		},
			error: function (xhr, ajaxOptions, thrownError) {
	        alert(xhr.status);
	        alert(thrownError);
	    }
	});
}

var $idown; 

downloadURL : function downloadURL(url) {
  if ($idown) {
    $idown.attr('src',url);
  } else {
    $idown = $('<iframe>', { id:'idown', src:url }).hide().appendTo('body');
  }
};
var SCSound;
function playFile(file) {
	currentSongName = file.track_title;
	bPlaying = true;
	$('.icon-play').attr('class', 'icon-pause');
	$('#currentPlaying').html(currentSongName);
	activeProvider = file.provider;
	if(file.provider == "FMA") {
		$('audio').attr("src", file.track_url );
		apiswf.rdio_pause();
		SCSound.pause();
	} else if(file.provider == "Rdio") {
		document.getElementsByTagName('audio')[0].pause();
		playTrack(file.track_url);
		SCSound.pause();
	} else {
		SC.stream("/tracks/" + file.track_url, function(sound){
  			SCSound = sound;
  			sound.play();
			document.getElementsByTagName('audio')[0].pause();
			apiswf.rdio_pause();
		});
	}
}

function trackEnded() {
	for(var i=0; i<playlist.length; i++) {
		if(playlist[i].track_title == currentSongName) {
			i++;
			if(i >= playlist.length) {
				i=0;
			}
			playFile(playlist[i]);
			return;
		}
	}
}