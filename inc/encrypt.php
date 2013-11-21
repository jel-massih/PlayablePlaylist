<?php
	header("Access-Control-Allow-Origin: *");
	ini_set("display_errors", "On");

	$comment = $_GET['comment'];
	$type = $_GET['type'];
	$comment = "'".$_GET['comment']."'";

	$tracks = json_decode(str_replace("~", '"', $_GET['comment']));
	$count = 0;
	$filesStr = "";

	if($type == "add") {
		foreach($tracks as $track) {
			if($track->provider == "FMA") {
				file_put_contents("../uploads/tmp/".$count.".mp3", file_get_contents($track->track_url));
				shell_exec('cutmp3 -i ../uploads/tmp/'.$count.".mp3 -o ../uploads/tmp/".$count."_cropped.mp3 -a 0:30.0 -b 0:40.0");
				$filesStr.= '../uploads/tmp/'.$count.'_cropped.mp30001.mp3 ';
				$count += 1;
			}
		}
		$UID = uniqid();
		if($filesStr == "") {
			echo(exec("cp ../uploads/dummy.mp3 ../uploads/".$UID.".mp3"));
		} else {
			shell_exec('mp3wrap -v ../uploads/final.mp3 '.$filesStr);
			exec("mv ../uploads/final_MP3WRAP.mp3 ../uploads/".$UID.".mp3");
		}
		$file = "../uploads/".$UID.".mp3";
		exec('rm ../uploads/tmp/*');
		exec('eyeD3 --remove-all '.$file);
		exec('eyeD3 -c English:Test:'.$comment.' '.$file);
		exec('cp '.$file.' ../uploads/lastPlaylist.mp3');
		echo($file);
	} else {
		
	}

?>