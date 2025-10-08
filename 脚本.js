// baidu_ua.js - Surge http-request 脚本
let headers = $request.headers || {};
headers['User-Agent'] = 'okhttp/3.11.0 Dalvik/2.1.0 (Linux; U; Android 11; Redmi K30 5G Build/RKQ1.200826.002) baiduboxapp/11.0.5.12 (Baidu; P1 11)';
headers['X-T5-Auth'] = '683556433';
$done({headers});