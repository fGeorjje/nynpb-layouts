const sharp = require('sharp')
const VLCRemote = require('vlc-remote');
const hammingcode = require('hamming-code')
const { obs, OBSWebSocket } = require('./obs')
const { nodecg } = require('./nodecg')()

const settings = nodecg.Replicant('streamSyncSettings')
settings.value = {}
settings.value.enabled = true

let currentDelay = 100
mainInterval()
async function mainInterval() {
  try {
    await mainInterval0().catch(error => nodecg.log.error(error))
  } finally {
    setTimeout(mainInterval, currentDelay)
  }
}
async function mainInterval0() {
  if (!obs.identified || !settings.value.enabled) {
    currentDelay = 100
    return
  }
  currentDelay = 1000
  
  const requests = []
  requests.push({ requestType: 'GetStats'})
  for (let i = 0; i < 61; i++) {
    requests.push({
      requestType: 'GetSourceScreenshot',
      requestData: {
        sourceName: 'Timers Capture',
        imageFormat: 'tiff'
      }
    }, {
      requestType: 'Sleep',
      requestData: {
        sleepFrames: 1
      }
    })
  }
  requests.push({ requestType: 'GetStats'})
  
  const obsResponses = await obs.callBatch(requests, {
    executionType: OBSWebSocket.RequestBatchExecutionType.SerialFrame
  })
  
  const stats = obsResponses
    .filter(r => r.requestType === 'GetStats')
    .map(r => r.responseData)
  const droppedFrames = stats[1].renderSkippedFrames - stats[0].renderSkippedFrames
  if (droppedFrames !== 0) {
    nodecg.log.info(`OBS has dropped ${droppedFrames} frames, skipping timer sync`)
    return
  }

  const pngPromises = obsResponses
    .filter(r => r.requestType === 'GetSourceScreenshot')
    .map(r => r.responseData.imageData)
    .map(imageData => Buffer.from(imageData.slice(23), 'base64'))
    .map(buffer => sharp(buffer).raw().toBuffer())
  const imageDatas = await Promise.all(pngPromises)
  const timers = [...Array(18).keys()].map(timerId => parseEdgeTime(imageDatas, timerId))
  if (timers[0] === undefined) {
    return nodecg.log.info('Could not read Stream PC timer (top row), cannot perform sync')
  }
    
  const syncs = timers.map(synchronize)
  await Promise.all(syncs)
}

const hammingCodeCache = []
for (let output = 0; output < 32768; output++) {
  const binary = output.toString(2).padStart(15, '0')
  const decoded = hammingcode.decode(binary)
  const input = parseInt(decoded, 2)
  hammingCodeCache.push(input)
}

function parseTime(imageDatas, frame, timerId) {
  let value = 0
  const colors = [[1,1,1], [0,0,0], [0,0,1]]
  for (let column = 0; column < 15; column++) {
    let red=0,green=0,blue=0
    for (let deltaX = 0; deltaX < 2; deltaX++) {
      for (let deltaY = 0; deltaY < 2; deltaY++) {
        const x = (column*4)+deltaX+1
        const y = (timerId*4)+deltaY+1
        const offset = (y*128+x)*4
        const data = imageDatas[frame]
        red += data[offset]
        green += data[offset+1]
        blue += data[offset+2]
      }
    }

    const [r,g,b] = [red, green, blue].map(s => s > 255)
    const offColor = colors[column % 3]
    const onColor = colors[(column+1) % 3]
    
    let setBit = false
    if (column % 3 === 0) {
      // white on, black off
      if (r && g && b) {
        value = value | (1 << (14-column))
      } else if (r || g || b) {
        return undefined
      }
    } else if (column % 3 === 1) {
      // black on, blue off
      if (!r && !g && !b) {
        value = value | (1 << (14-column))
      } else if (r || g || !b) {
        return undefined
      }
    } else if (column % 3 === 2) {
      // blue on, white off
      if (!r && !g && b) {
        value = value | (1 << (14-column))
      } else if (!r || !g || !b) {
        return undefined
      }
    }
  }
  return hammingCodeCache[value]
}

function parseEdgeTime(imageDatas, timerId) {
  let last;
  for (let frame = 0; frame < 61; frame++) {
    const time = parseTime(imageDatas, frame, timerId)
    if (time === undefined) continue
    if (last !== undefined && last === time-1) {
      return (time - frame / 60) * 1000
    }
    last = time
  }
}

let lastReadSuccessful = {}
async function synchronize(timer, n, timers) {
  if (n === 0) return
  if (timer === undefined) {
    if (lastReadSuccessful[n]) {
      delete lastReadSuccessful[n]
      nodecg.log.info(`Could not read time for stream #${n}, skipping sync`)
    }
    return 
  }
  
  lastReadSuccessful[n] = true
  let delta = Math.floor(timers[0] - timer)
  let absDelta = Math.abs(delta)
  if (absDelta > 2000000) {
    delta = -Math.sign(delta) * (2048000 - absDelta)
    absDelta = Math.abs(delta)
  }
  
  const vlcAction = (action) => {
    const remote = new VLCRemote()
    const port = 7001 + n
    remote._port = port
    remote._send(action).catch(error => {
      nodecg.log.info(`Error performing VLC action ${action} on stream #${n}`, error)
    })
  }
  const pause = async () => await new Promise(r => setTimeout(r, absDelta))
  
  if (absDelta > 30000) {
    nodecg.log.info(`Stream #${n} has errored out (30s+ delay), refreshing`)
    await vlcAction('quit')
  } else if (delta > 200) {
    nodecg.log.info(`Speeding up stream #${n} for ${absDelta}ms`)
    vlcAction('faster')
    vlcAction('faster')
    await pause()
    nodecg.log.info(`Resuming normal speed for stream #${n}`)
    await Promise.all([
      vlcAction('slower'),
      vlcAction('slower')
    ])
  } else if (delta < -100) {
    nodecg.log.info(`Pausing stream #${n} for ${absDelta}ms`)
    vlcAction('pause')
    await pause()
    nodecg.log.info(`Resuming stream #${n}`)
    await vlcAction('pause')
  }
}