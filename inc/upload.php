<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	ini_set("display_errors", "On");

	$input = fopen("php://input", "r");
	file_put_contents('../uploads/playlist.mp3', $input);
	echo(exec('eyeD3 ../uploads/playlist.mp3'));
	exit();
?>