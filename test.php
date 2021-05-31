<?php

$dateLastMonth = date_create('-30 Days')->format("Y-m-d");

var_dump($dateLastMonth);