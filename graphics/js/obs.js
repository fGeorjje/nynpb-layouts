const obs = new OBSWebSocket();
let ip = 'localhost'
let obsReady;
const obsLogger = {};
(() => {
  let obsReadyResolve;
  obsReady = new Promise((resolve) => {
    obsReadyResolve = resolve;
  })
  const logger = obsLogger
  const validSources = {}
  for (const func in console) {
    obsLogger[func] = (...args) => console[func]('OBS', ...args)
  }

  obs.on('ConnectionClosed', async (error) => {
    logger.log('connection closed', error.code, error.message)
    setTimeout(connectOBS, 10000)
  })
  obs.on('Hello', () => logger.log('Hello'))
  obs.on('Identified', () => {
    logger.log('Identified')
    obsReadyResolve()
  })
  connectOBS().catch(error => {
    console.log('this should not happen 2', error.message)
  })
  async function connectOBS() {
    logger.log('connecting')
    const connect = obs.connect(`ws://${ip}:4455`, 'aw9fu9aeg7nuaeg8aegua3', {
      eventSubscriptions: OBSWebSocket.EventSubscription.All | OBSWebSocket.EventSubscription.InputVolumeMeters
    }).catch(error => {
      return { error }
    })
    const timeout = new Promise((resolve, reject) => {
      setTimeout(resolve, 2000, { error: 'Connection timeout' });
    });
    
    let result
    try {
      result = await Promise.race([connect, timeout])
    } catch (error) {
      logger.error('this should not happen', error.message)
      return
    }
    
    if (result.error !== undefined) {
      console.error(result.error.message)
      return
    }
  }
})()