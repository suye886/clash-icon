(function () {
  try {
    if (!$request || !$request.headers) {
      $done({});
      return;
    }

    let headers = $request.headers;

    // 要注入的值 —— 按需修改
    const X_T5_AUTH = "683556433";
    const FORCED_HOST = "153.3.236.22:443"; // 你指定的 Host:port
    const FORCED_UA = "okhttp/3.11.0 Dalvik/2.1.0 (Linux; U; Android 11; Redmi K30 5G Build/RKQ1.200826.002) baiduboxapp/11.0.5.12 (Baidu; P1 11)";

    // 可选：限定只在某些原始 Host 或 URL 下生效，避免全局注入
    // 例如：只在原始 Host 包含 "baidu" 时生效（按需开启）
    // const originalHost = (headers['Host'] || headers['host'] || '').toString();
    // if (!/baidu/i.test(originalHost)) {
    //   $done({});
    //   return;
    // }

    // 注入或覆盖 header
    headers['X-T5-Auth'] = X_T5_AUTH;
    headers['User-Agent'] = FORCED_UA;

    // 强制覆盖 Host（包含端口）
    headers['Host'] = FORCED_HOST;

    $done({ headers: headers });
  } catch (err) {
    // 出错则不阻断请求
    $done({});
  }
}
