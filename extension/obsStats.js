const { nodecg } = require('./nodecg')()
const { obs } = require('./obs')
const replicant = nodecg.Replicant('obsStats')

mainInterval()
async function mainInterval() {
  try {
    await mainInterval0().catch(error => nodecg.log.error(error))
  } finally {
    setTimeout(mainInterval, 1000)
  }
}
async function mainInterval0() {
  if (!obs.identified) {
    return
  }
  
  const [stats, streamStatus] = await Promise.allSettled([
    obs.call('GetStats'),
    obs.call('GetOutputStatus', { outputName: 'adv_stream' })
  ])
  replicant.value = {
    stats: stats.value,
    stream: streamStatus.value
  }
}