<?php
$directory = 'posts/';
$files = glob($directory . '*.html');

$posts = array();
foreach ($files as $file) {
    $posts[] = array(
        'title' => basename($file),
        'content' => ''
    );
}

header('Content-Type: application/json');
echo json_encode($posts);
?>
