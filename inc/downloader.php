<?php
	$file = $_GET['file'];
	$name = $_GET['name'];
	$name = urlencode($name);
	header('Content-disposition: attachment; filename='.$name.".mp3");
	header('Content-type: audio/mpeg3');
	readfile($file);
?>