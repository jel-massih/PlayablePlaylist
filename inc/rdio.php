<?php
require 'Rdio/rdio.php';
	ini_set("display_errors", "On");

$rdio = new Rdio(array("m3969ht3zzt5t5fsb4tavrvs", "aCjP2AUTQh"));
$params = array(
	'query'  => $_GET['q'],
	'types' => "Track"
);
$stuff = $rdio->call('search', $params);
echo(json_encode($stuff));
?>