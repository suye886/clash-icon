let groups = ["池鱼专属节点"];

async function testGroups() {
    for (let group of groups) {
        try {
            let response = await $httpClient.post({
                url: "http://127.0.0.1:6171/v1/policy_groups/test",
                headers: {
                    "X-Key": "chiyu886",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({group_name: group})
            });
            console.log(`✓ ${group} 测试完成`);
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.log(`✗ ${group} 测试失败`);
        }
    }
}

testGroups().then(() => $done());