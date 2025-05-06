const { type, name } = $arguments;

const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
};

let compatible = false;
let config = JSON.parse($files[0]);

// 产出节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// 调试输出产出的节点 tag
console.log('生成的代理节点 tags:', proxies.map(p => p.tag));

if (!Array.isArray(proxies) || proxies.length === 0) {
  console.warn('⚠️ 未获取到任何代理节点，请检查订阅是否正确或网络是否正常。');
}

config.outbounds.push(...proxies);

// 获取匹配到的 tag 列表
function getTags(regex) {
  const result = (regex
    ? proxies.filter(p => typeof p.tag === 'string' && regex.test(p.tag))
    : proxies
  ).map(p => p.tag);

  if (regex && result.length === 0) {
    console.warn(`⚠️ 正则 ${regex} 未匹配到任何节点。`);
  }

  return result;
}

// 策略组填充逻辑
config.outbounds.forEach(group => {
  if (!group.tag || !Array.isArray(group.outbounds)) return;

  const tag = group.tag.toLowerCase();

  switch (tag) {
    case 'all':
      group.outbounds.push(...getTags());
      break;

    case 'hk':
    case 'hk-auto':
      group.outbounds.push(...getTags(/港|hk|hongkong|kong kong|🇭🇰/i));
      break;

    case 'mo':
    case 'mo-auto':
      group.outbounds.push(...getTags(/^(?=.*(🇲🇴|^澳门$|\bMO\b|\bMacao\b|\bMacau\b)).*$/i));
      break;

    case 'tw':
    case 'tw-auto':
      group.outbounds.push(...getTags(/台|TW|TW1|TW2|TW3|TW4|TW5|TW6|TW7|TW8|TW9|TW10|TW11|TWN|taiwan|🇹🇼/i));
      break;

    case 'jp':
    case 'jp-auto':
      group.outbounds.push(...getTags(/日本|jp|japan|🇯🇵/i)); 
      break;

    case 'sg':
    case 'sg-auto':
      group.outbounds.push(...getTags(/^(?=.*(🇸🇬|新加坡|\b(SG|Singapore)\b)).*$/i));
      break;

    case 'us':
    case 'us-auto':
      group.outbounds.push(...getTags(/^(?=.*(🇺🇸|美国|\b(US|United States|UnitedStates)\b)).*$/i));
      break;
  }
});

// 若策略组为空，填入兼容 DIRECT
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound);
      compatible = true;
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2);