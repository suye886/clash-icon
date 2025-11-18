let groups = ["香港SMART", "日本SMART", "狮城SMART", "德国SMART", "台湾SMART", "美国SMART", "韩国SMART"];
let apiKey = "chiyu886";
let apiUrl = "http://127.0.0.1:6171/v1/policy_groups/test";

async function testGroup(group) {
    let startTime = Date.now();
    try {
        let response = await $httpClient.post({
            url: apiUrl,
            headers: {
                "X-Key": chiyu886,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({group_name: group})
        });
        
        let duration = Date.now() - startTime;
        console.log(`✓ ${group} 测试成功 (耗时${duration}ms)`);
        return {group, status: "success", duration};
        
    } catch (error) {
        let duration = Date.now() - startTime;
        console.log(`✗ ${group} 测试失败 (耗时${duration}ms): ${error}`);
        return {group, status: "failed", duration, error};
    }
}

async function testAllGroups() {
    console.log(`=== 开始测试 ${groups.length} 个策略组 ===`);
    let overallStart = Date.now();
    
    // 并行执行所有测试
    let tasks = groups.map(group => testGroup(group));
    let results = await Promise.all(tasks);
    
    // 统计结果
    let totalTime = Date.now() - overallStart;
    let success = results.filter(r => r.status === "success").length;
    let failed = results.filter(r => r.status === "failed").length;
    
    console.log(`=== 测试完成 ===`);
    console.log(`总耗时: ${totalTime}ms`);
    console.log(`成功: ${success} 个, 失败: ${failed} 个`);
}

testAllGroups().then(() => {
    $done();
});
