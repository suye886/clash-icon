const { type, name } = $arguments

const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
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

console.log('=== 代理节点 tags ===', proxies.map(p => p.tag))

config.outbounds.push(...proxies)

function getTags(regex) {
  const matched = proxies.filter(p =>
    typeof p.tag === 'string' && (!regex || regex.test(p.tag))
  )
  const tags = matched.map(p => p.tag)
  if (regex && tags.length === 0) {
    console.warn(`【WARN】组 ${regex} 未匹配到任何节点`)
  }
  return tags
}

// 按组填充
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
      // ← 新增「門」、完整匹配「澳門」
      group.outbounds.push(...getTags(/澳(门)?|mo|macao|macau|🇲🇴/i))
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
      group.outbounds.push(...getTags(/^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)/i))
      break
    case 'us':
    case 'us-auto':
      group.outbounds.push(...getTags(/美|us|unitedstates|united states|🇺🇸/i))
      break
  }
})

// 最后把 fallback 加回：只加一次 COMPATIBLE
config.outbounds.forEach(group => {
  if (!Array.isArray(group.outbounds)) return
  if (group.outbounds.length === 0) {
    if (!compatibleUsed) {
      config.outbounds.push(compatible_outbound)
      compatibleUsed = true
    }
    group.outbounds.push(compatible_outbound.tag)
  }
})

$content = JSON.stringify(config, null, 2)