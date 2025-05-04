const { type, name } = $arguments

const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible = false
let config = JSON.parse($files[0])

// 产出节点
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

// 调试输出产出的节点 tag
console.log('生成的代理节点 tags:', proxies.map(p => p.tag))

if (!Array.isArray(proxies) || proxies.length === 0) {
  console.warn('⚠️ 未获取到任何代理节点，请检查订阅是否正确或网络是否正常。')
}

config.outbounds.push(...proxies)

// 匹配函数
function getTags(proxies, regex) {
  const result = (regex
    ? proxies.filter(p => typeof p.tag === 'string' && regex.test(p.tag))
    : proxies
  ).map(p => p.tag)

  if (regex && result.length === 0) {
    console.warn(`⚠️ 正则 ${regex} 未匹配到任何节点。`)
  }

  return result
}

// 分类填充策略组
config.outbounds.forEach(i => {
  if (!i.tag || !Array.isArray(i.outbounds)) return

  const tag = i.tag.toLowerCase()
  if (['all'].includes(tag)) {
    i.outbounds.push(...getTags(proxies))
  }
  if (['hk', 'hk-auto'].includes(tag)) {
    i.outbounds.push(...getTags(proxies, /港|hk|hongkong|kong kong|🇭🇰/i))
  }
  if (['mo', 'mo-auto'].includes(tag)) {
    i.outbounds.push(...getTags(proxies, /澳门|mo|macao|🇲🇴/i))
  }
  if (['tw', 'tw-auto'].includes(tag)) {
    i.outbounds.push(...getTags(proxies, /台|tw|taiwan|🇹🇼/i))
  }
  if (['jp', 'jp-auto'].includes(tag)) {
    i.outbounds.push(...getTags(proxies, /日本|jp|japan|🇯🇵/i))
  }
  if (['sg', 'sg-auto'].includes(tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)/i))
  }
  if (['us', 'us-auto'].includes(tag)) {
    i.outbounds.push(...getTags(proxies, /美|us|unitedstates|united states|🇺🇸/i))
  }
})

// 若策略组为空，填入兼容 DIRECT
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag)
  }
})

$content = JSON.stringify(config, null, 2)