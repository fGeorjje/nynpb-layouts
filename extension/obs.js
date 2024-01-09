const { nodecg } = require('./nodecg')()
const OBSWebSocket = require('obs-websocket-js')
const obs = new OBSWebSocket.default()
const currentScene = nodecg.Replicant('currentScene')

module.exports = { OBSWebSocket, obs }

obs.on('Identified', () => {
  nodecg.log.info('Connected to OBS Websocket')
})

obs.on('SceneTransitionStarted', updateScene)
async function updateScene() {
  const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene')
  currentScene.value = currentProgramSceneName
  nodecg.log.info('currentScene', currentProgramSceneName)
}

obs.on('ConnectionClosed', async (error) => {
  if (obs.identified) {
    nodecg.log.info('Disconnected from OBS Websocket', error.code, error.message)
  }
  
  setTimeout(connectOBS, 100)
})

setTimeout(connectOBS, 1000)
async function connectOBS() {
  const connect = obs.connect('ws://localhost:4455', 'aw9fu9aeg7nuaeg8aegua3')
    .catch(error => {
      return { error }
    })
  const timeout = new Promise((resolve, reject) => {
    setTimeout(resolve, 2000, { error: 'Connection timeout' })
  })
  
  let result = await Promise.race([connect, timeout])
  
  if (result.error !== undefined) {
    if (obs.identified) {
      nodecg.log.info('OBS Websocket Error', result.error.message)
    }
    obs.disconnect()
    return
  }
}