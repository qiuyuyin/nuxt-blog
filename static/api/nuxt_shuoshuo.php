<?php

header('Content-Type:application/json; charset=utf-8');
header("Access-Control-Allow-Origin:*");


$servername = "localhost";
$username = "nuxt_shuoshuo";
$password = "nuxt_shuoshuo";
$dbname = "nuxt_shuoshuo";

// 创建连接
$conn = new mysqli($servername, $username, $password, $dbname);
 
// 检测连接
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

// $tdate = FROM_UNIXTIME(created);
// $sql = "select FROM_UNIXTIME(created),text from nuxt_shuoshuo_comments order by created desc";
$sql = "select authorId,author,text,FROM_UNIXTIME(created) as created from nuxt_shuoshuo_comments order by created desc";
$result = $conn->query($sql);


if ($result->num_rows > 0) {
    // 输出数据
    while($row = $result->fetch_assoc()) {
        
    $data[]=$row;
    
    }
    
    $json = json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);//把数据转换为JSON数据.
    
    exit($json) ;

} else {
    echo "未查询到结果！";
}

$conn->close();
?>