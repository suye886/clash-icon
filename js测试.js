const { type, name } = $arguments

// 可兼容直连的备选出口（只有 fallback 时才会加）
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

// 可选的兜底分组：把所有未命中逻辑的节点都加到这里
const fallback_proxy_group = {
  tag: 'PROXY',
  type: 'select',
  outbounds: []
}

let compatibleUsed = false
let config = JSON.parse($files[0])

// 产出节点列表
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

// Debug 输出
console.log('=== 生成的代理节点 tags ===')
console.log(proxies.map(p => p.tag))

if (!Array.isArray(proxies) || proxies.length === 0) {
  console.warn('⚠️ 未获取到任何代理节点！请检查订阅或网络。')
}

// 先把所有节点当作 outbound push 进去，等待后续分类填充
config.outbounds.push(...proxies)

/**
 * 返回符合正则的所有节点 tag 列表
 */
function getTags(proxies, regex) {
  const matched = regex
    ? proxies.filter(p => typeof p.tag === 'string' && regex.test(p.tag))
    : proxies.slice()

  const tags = matched.map(p => p.tag)
  if (regex && tags.length === 0) {
    console.warn(`⚠️ 正则 ${regex} 未匹配到任何节点。`)
  }
  return tags
}

// 先给每个策略组尝试填充
config.outbounds.forEach(group => {
  if (!group.tag || !Array.isArray(group.outbounds)) return

  const tag = group.tag.toLowerCase()
  switch (tag) {
    case 'all':
      group.outbounds.push(...getTags(proxies))
      break
    case 'hk':
    case 'hk-auto':
      group.outbounds.push(...getTags(proxies, /港|hk|hongkong|kong kong|🇭🇰/i))
      break
    case 'mo':
    case 'mo-auto':
      group.outbounds.push(...getTags(proxies, /澳|mo|macao|macau|🇲🇴/i))
      break
    case 'tw':
    case 'tw-auto':
      group.outbounds.push(...getTags(proxies, /台|tw|taiwan|🇹🇼/i))
      break
    case 'jp':
    case 'jp-auto':
      group.outbounds.push(...getTags(proxies, /日本|jp|japan|🇯🇵/i))
      break
    case 'sg':
    case 'sg-auto':
      group.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)/i))
      break
    case 'us':
    case 'us-auto':
      group.outbounds.push(...getTags(proxies, /美|us|unitedstates|united states|🇺🇸/i))
      break
  }
})

// 处理空组：fallback 到 PROXY 或 COMPATIBLE
config.outbounds.forEach(group => {
  if (!Array.isArray(group.outbounds)) return

  if (group.outbounds.length === 0) {
    // 首先记录所有未命中的节点到 fallback_proxy_group
    if (group.tag.toLowerCase() !== 'compatible') {
      fallback_proxy_group.outbounds.push(...getTags(proxies))
    }
    // 然后再给这个组加 COMPATIBLE
    if (!compatibleUsed) {
      config.outbounds.push(compatible_outbound)
      compatibleUsed = true
    }
    group.outbounds.push(compatible_outbound.tag)
  }
})

// 如果你想要一个 PROXY 兜底组，就把它 push 进去
if (fallback_proxy_group.outbounds.length > 0) {
  // 去重
  fallback_proxy_group.outbounds = [...new Set(fallback_proxy_group.outbounds)]
  config.outbounds.push(fallback_proxy_group)
}

$content = JSON.stringify(config, null, 2)