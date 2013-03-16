<?php 
// Converts a unix timestamp to iCal format (UTC) - if no timezone is 
// specified then it presumes the uStamp is already in UTC format. 
// tzone must be in decimal such as 1hr 45mins would be 1.75, behind 
// times should be represented as negative decimals 10hours behind 
// would be -10 
	ini_set('display_errors','off');
    ini_set('date.timezone', 'America/Mexico_City');
    error_reporting(E_ALL ^ E_NOTICE);

	if (!function_exists('json_encode')) {
	    function json_encode($content) {
	        require_once '../JSON.php';
	        $json = new Services_JSON;
	        return $json->encode($content);
	    }
	}

	function unixToiCal($uStamp = 0, $tzone = 0.0) { 
	
		$uStampUTC = $uStamp + ($tzone * 3600);        
		$stamp  = date("Ymd\THis\Z", $uStampUTC); 
		
		return $stamp;        

	}
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

	function getData($stid){
		$table = array();
		oci_fetch_all($stid, $table,0,-1, OCI_FETCHSTATEMENT_BY_ROW);

		$seriesNames = array();
		$n = array();
		foreach ($table as $key => $value) {
			$step_name = $value['STEP_NAME'];
			$system_id = $value['SYSTEM_ID'];
			if ($step_name == 'LR4 OSA PLC ATTACH') {
				$step_name = 'SHIM';
			}
			if ($step_name == 'ROSA SUBASSEM2 (SUBASSEM1, PD ARRAY & HEADER)') {
				$step_name = 'SHIM';
			}
			if ($step_name == 'LR4 SILICON LENS REMEASURE') {
				$step_name = 'Remea';
			}
			if ($step_name == 'TOSA SUBASSEM1 (SHIM & PLC)') {
				$step_name = 'Manual';
			}
			if ($step_name == 'LR4 GLASS LENS ATTACH') {
				$step_name = 'ALPS';
			}
			if ($step_name == 'TOSA SUBASSEM3 (SUBASSEM2, SI LENS)') {
				$step_name = 'SiLens';
			}
			if ($step_name == 'TOSA SUBASSEM2 (SUBASSEM1, OSA, GLASS RAIL & ALPS LENS)') {
				$step_name = 'SHIM';
			}
			if ($step_name == 'LR4 SILICON LENS ATTACH') {
				$step_name = 'SiLens';
			}
			if ($step_name == 'ROSA SUBASSEM1 (SHIM & PLC)') {
				$step_name = 'Manual';
			}
			if ($step_name == 'ROSA SUBASSEM3 (SUBASSEM2 & ALPS LENS)') {
				$step_name = 'ALPS';
			}
			if ($step_name == 'LR4 SI LENS STANDARD CHECK') {
				$step_name = 'Standard';
			}
			if ($n[$step_name]==null) {
				//echo "-> Init seriesNames <br/>";
				$n[$step_name] = array();
				$seriesNames[$step_name] = array();
			}
			/*
				 {
					name: 'OSABW1',
					color: 'rgba(119, 152, 191, .5)',
					data: [fecha,tiempoCiclo]
				}
			*/
			//echo "-> " . $step_name . " " . $system_id . "<br/>";
            
            /* 
                SERIAL_NUM
                PASS_FAIL
                PROCESS_DATE
                SYSTEM_ID
                STEP_NAME
                CYCLE_TIME
            Esto lo utilizaba para el formato de las fechas pero ya no es necesario
            */
			if ($system_id!=null) {
				$is_in_array = in_array($system_id, $seriesNames[$step_name]);
				// echo "=-===" . !$is_in_array;
				if ( !$is_in_array ) {
					// echo "+> Llego a IF " . $step_name . " " . $system_id . "<br/>";
					array_push($seriesNames[$step_name], $system_id);
					array_push($n[$step_name], array('name' => $system_id, 'data' => array()));
					$bonderIndex = array_search($system_id, $seriesNames[$step_name]);
					array_push($n[$step_name][$bonderIndex]['data'], array((strtotime($value['PROCESS_DATE'])*1000)-21600000, round($value['CYCLE_TIME']/60,1),$value['PASS_FAIL']));
				} else {
					// echo "[]-> Llego a ELSE " . $step_name . " " . $system_id . "<br/>";
					$bonderIndex = array_search($system_id, $seriesNames[$step_name]);
					array_push($n[$step_name][$bonderIndex]['data'], array((strtotime($value['PROCESS_DATE'])*1000)-21600000, round($value['CYCLE_TIME']/60,1),$value['PASS_FAIL']));
				}		
			}
		}
		$na = json_encode($n);
		file_put_contents('n.json', $na);
		return $n;
	}



	if (false) {
		$query = file_get_contents("./cicle_time_query.sql");
		$conn = oci_connect('phase2', 'g4it2day', 'MXOPTIX');
		$stid = oci_parse($conn, $query);
		oci_execute($stid);
        $series = getData($stid);
	} else {
		$pack_id = false;
	}

	
	//Sets database conection to PROD_MX
	// $conn = oci_connect('query', 'query', 'rduxu');

	//Sets and execute the query

?><!DOCTYPE HTML>
<html>
	<head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Tiempos de ciclo LR4</title>
		<style type="text/css">
		body {
			padding-top: 60px;
		}
		</style>
		<link rel="stylesheet" media="screen" href="../bootstrap/css/bootstrap.css">
		<link rel="stylesheet" media="screen" href="../bootstrap/css/bootstrap-responsive.css">
		<script type="text/javascript">
        // Script goes here
		</script>
	</head>
	<body>
		
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container-fluid">
				<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</a>
				<a class="brand" href="#">CyOptics</a>
				<div class="nav-collapse collapse">
					<ul class="nav">
						<li class="active"><a href="../">Home</a></li>
						<li><a href="."><i class="icon-refresh icon-white"></i> Actualizar</a></li>
					</ul>
				</div><!--/.nav-collapse -->
			</div>
		</div>
	</div>
<div class="container-fluid">
	<div class="row-fluid">
		<div class="span2">
			<ul class="nav nav-list bs-docs-sidenav affix">
				<li></li>
			</ul>
		</div>
	</div>

    <div class="row-fluid">
        <div class="span10">
            <table>
                <thead>
                    <tr>
                        <th>Hora</th>
                        <th>Process</th>
                        <th>Pass</th>
                        <th>Fail</th>
                        <th>Meta</th>
                        <th>Tiempo de ciclo</th>
                        <th>Yield de produccion</th>
                        <th>Yield Proceso</th>
                        <th>Comentarios</th>
                    </tr>
                </thead>
                <tbody>
                    td
                </tbody>
            </table>
        </div>
    </div>
    
</div>
<script type="text/javascript" src="./jquery-1.8.1.min.js"></script>
<script type="text/javascript" src="./js/Sparky.js"></script>
</body>
</html>