const { type, name } = $arguments

// fallback 兼容直连出口
const compatibleOutbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatibleUsed = false
let config = JSON.parse($files[0])

// 产出所有代理节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

console.log('=== 代理节点 tags ===', proxies.map(p => p.tag))

if (!Array.isArray(proxies) || proxies.length === 0) {
  console.warn('⚠️ 未获取到任何代理节点！')
}

// 先 push 全部节点到 outbounds 等待分类填充
config.outbounds.push(...proxies)

/**
 * 返回符合正则的节点 tag 列表
 * @param {RegExp} [regex]  可选，若不传则返回所有 proxies 的 tag
 */
function getTags(regex) {
  const matched = proxies.filter(p =>
    typeof p.tag === 'string' && (!regex || regex.test(p.tag))
  )
  const tags = matched.map(p => p.tag)
  if (regex && tags.length === 0) {
    console.warn(`【WARN】正则 ${regex} 未匹配到任何节点`)
  }
  return tags
}

// 按区域分组填充 outbounds
config.outbounds.forEach(group => {
  if (!group.tag || !Array.isArray(group.outbounds)) return
  const tag = group.tag.toLowerCase()
  switch (tag) {
    case 'all':
      group.outbounds.push(...getTags())
      break

    case 'hk':
    case 'hk-auto':
      group.outbounds.push(...getTags(/港|hk|hongkong|kong kong|🇭🇰/i))
      break

    case 'mo':
    case 'mo-auto':
      group.outbounds.push(...getTags(/澳门|mo|macao|🇲🇴/i))
      break

    case 'tw':
    case 'tw-auto':
      group.outbounds.push(...getTags(/台|tw|taiwan|🇹🇼/i))
      break

    case 'jp':
    case 'jp-auto':
      group.outbounds.push(...getTags(/日本|jp|japan|🇯🇵/i))
      break

    case 'sg':
    case 'sg-auto':
      // 新加坡：排除 US 与 NZ
      group.outbounds.push(...getTags(/^(?!.*(?:nz)).*(新|sg|singapore|🇸🇬)/i))
      break

    case 'us':
    case 'us-auto':
      // 美国：排除 AU 与 RU
      group.outbounds.push(...getTags(/^(?!.*(?:au|aus|ru|rus)).*(美|us|unitedstates|united states|🇺🇸)/i))
      break
  }
})

// 对于仍然没有任何出站节点的分组，统一加上 COMPATIBLE
config.outbounds.forEach(group => {
  if (!Array.isArray(group.outbounds)) return
  if (group.outbounds.length === 0) {
    if (!compatibleUsed) {
      config.outbounds.push(compatibleOutbound)
      compatibleUsed = true
    }
    group.outbounds.push(compatibleOutbound.tag)
  }
})

$content = JSON.stringify(config, null, 2)