<?php 
ini_set('display_errors','off');
ini_set('date.timezone', 'America/Mexico_City');
error_reporting(E_ALL ^ E_NOTICE);

function db_conect($db){
	global $conn;
	// echo "vamos bien conect";
	if ($db = "prod") {
		$conn = oci_connect('wp_db', 'wp1', 'PROD_MX');
	} elseif($db = "mxoptix") {
		$conn = oci_connect('phase2', 'g4it2day', 'MXOPTIX');
	}
	return $conn;	
} 

function table($stid){
	// Prints the table
	$tabla ="";
	$Fields = oci_num_fields($stid);
	$tabla .= "<table class='table table-bordered table-condensed table-hover'><thead><tr>\n";
	for ($i=1; $i <= $Fields; $i++){ 
    	$tabla .= "<th>".oci_field_name( $stid,$i)."</th>"; 
    }
    $tabla .= "</tr></thead><tbody>";
	while ($row = oci_fetch_array($stid, OCI_ASSOC+OCI_RETURN_NULLS)) {
		$tabla .= "<tr>\n";
		foreach ($row as $item) {
			$tabla .= " <td>" . ($item !== null ? htmlentities($item, ENT_QUOTES) : "&nbsp;") . "</td>\n";
		}
		$tabla .= "</tr>\n";
	}
	$tabla .= "</tbody></table>\n";

	echo $tabla;
}

function json($stid){
	oci_fetch_all($stid, $table,0,-1, OCI_FETCHSTATEMENT_BY_ROW);
	$encoded = json_encode($table);
	file_put_contents('data.json', $encoded);
	return $encoded;
}

$alert = false;
if (isset($_GET["dev"])) {
	$dev = true;
} else {
	$dev = false;
}

if (true) {
	// $pack_id = ucfirst($_GET["pack_id"]);
	$pack_id = "some";
	$query = file_get_contents("./cicle_time_query.sql");
	$conn = oci_connect('phase2', 'g4it2day', 'MXOPTIX');
	$stid = oci_parse($conn, $query);
	// oci_bind_by_name($stid, ':pack_id', $pack_id, -1); 
	oci_execute($stid);
} else {
	$pack_id = false;
}

//Sets database conection to PROD_MX
// $conn = oci_connect('query', 'query', 'rduxu');

//Sets and execute the query

?><!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Utilizacion OSABW1</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="Proporciona un metodo para cambiar los tipos de laser de un PackID">
	<meta name="author" content="Aldo Mendez Reyes">

</head>
<style type="text/css">
body {
	padding-top: 60px;
}
</style>
<link rel="stylesheet" href="./bootstrap/css/bootstrap.css">
<link rel="stylesheet" href="./bootstrap/css/bootstrap-responsive.css">
<body>
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container-fluid">
				<a class="brand" href="../" >CyOptics</a>
				<ul class="nav">
					<li class="active"><a href="./">Utilizaci&oacute;n OSABW1</a></li>
					<li><a href="./graph.php">Grafica</a></li>
					<?php if (false) {
						echo '<li><a href="../twitter-bootstrap-source/docs/index.html">Ejemplos</a></li>';
					} ?>
					<?php if (false) {
						echo '<li class="active"><a href="?pack_id='.$pack_id.'">'.$pack_id.'</a></li>';
					} ?>
				</ul>
			</div>
		</div>
	</div>

<div class="container">
	<?php if ($alert) { ?>
		<div class="alert">
			<button type='button' class='close' data-dismiss='alert'>x</button>
			<strong><?php echo "{$errorclass}"; ?>: </strong><?php echo "{$errortext}"; ?>
		</div>
	<?php } ?>

	<?php if($dev){ ?>
	<div>
		<form method="post" action="save_query.php?pack_id=<?php echo $pack_id; ?>">
			<textarea class="input-block-level" rows = "10" name = "query"><?php echo $query; ?></textarea>
			<button type="submit" class="btn">Update Query</button>
		</form>
	</div>
	<?php } ?>

	<div>
		<h2>Resultado para: <span class="muted"><?php echo "{$pack_id}"; ?></span></h2>
		<!-- <p></p> -->
		<pre><?php echo(json($stid)); ?></pre>
	</div>
</div>

	<script type="../jquery/jquery.js"></script>
</body>
</html>
<?php 

if($pack_id){
	oci_close($conn);
} 

?>