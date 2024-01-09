const { nodecg } = require('./nodecg')();
const { obs } = require('./obs');
const fetch = require('node-fetch');

nodecg.listenFor('changeover', async () => {
  nodecg.log.info('Changeover message received')
  const startTime = Date.now()
  const { currentProgramSceneName: prev } = await obs.call('GetCurrentProgramScene')
  const { currentPreviewSceneName: next } = await obs.call('GetCurrentPreviewScene')
  nodecg.log.info({next, prev})
  handleFoobar(startTime, prev, next)
  await preview('Changeover')
  await setTransition('IN')
  await sleepUntil(250, startTime)
  await transition()
  await sleep(1500)
  await preview(next)
  await setTransition('OUT')
  await sleepUntil(2250, startTime)
  await transition()
  await sleep(1500)
  await preview(prev)
  nodecg.log.info('Changeover finished')
})

async function setTransition(transitionName) {
  await obs.call('SetCurrentSceneTransition', { transitionName })
}
async function sleep(ms) {
  await new Promise(r => setTimeout(r, ms))
}

async function sleepUntil(target, startTime) {
  const elapsed = Date.now() - startTime
  const duration = target - elapsed
  nodecg.log.info({target, elapsed, duration})
  await sleep(duration)
}

async function preview(sceneName) {
  await obs.call('SetCurrentPreviewScene', { sceneName })
}

async function transition() {
  await obs.call('TriggerStudioModeTransition')
}

async function handleFoobar(startTime, prev, next) {
  const wasBreak = prev.includes('Break')
  const nowBreak = next.includes('Break')
  if (wasBreak === nowBreak) return //??
  await sleepUntil(wasBreak ? 2000 : 2250, startTime)
  const method = wasBreak ? 'stop' : 'play'
  fetch(`http://localhost:8880/api/player/${method}`, {
    "body": null,
    "method": "POST"
  })
}