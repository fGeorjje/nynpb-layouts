const { X32 } = require('x32-osc')
const { nodecg } = require('./nodecg')()
let x32, lastReceived
const meters = nodecg.Replicant('x32-meters')
const mutes = nodecg.Replicant('x32-mutes')
const faders = nodecg.Replicant('x32-faders')
for (const repl of [meters, mutes, faders]) repl.value = {}

function log(...args) {
  nodecg.log.info('X32', ...args)
}

connectX32()
function connectX32() {
  lastReceived = undefined
  x32 = new X32('192.168.2.14', 50)
  x32.meterSubscriptions = [1]
  x32.on('error', (err) => log('ERR', err))
  x32.on('info', (info) => log('INFO', info))
  x32.on('meter', onMeter)
  x32.on('closed', () => {
    log('CLOSED')
    lastReceived = undefined
    setTimeout(connectX32, 500)
  });
}

function onMeter(data) {
  if (lastReceived === undefined) {
    log('Receiving meter data')
  }
  lastReceived = Date.now()
  const newMeters = {}
  for (let chan = 0; chan < 32; chan++) {
    newMeters[chan+1] = data.meters[chan] * data.meters[chan+32]
  }
  meters.value = newMeters
  updateOSCData()
}

function updateOSCData() {
  let channelData = x32?.OSC?.ch
  if (!channelData) return
  channelData = JSON.parse(JSON.stringify(channelData))
  for (const channelNum in channelData) {
    const mixData = channelData[channelNum]?.mix
    if (mixData === undefined) continue
    
    const fader = mixData.fader
    if (fader !== undefined && faders.value[channelNum] !== fader) {
      faders.value[channelNum] = fader
    }
    
    let mute = mixData.on
    if (mute !== undefined) mute = mute === 'OFF'
    if (mute !== undefined && mutes.value[channelNum] !== mute) {
      mutes.value[channelNum] = mute
    }
  }
}

setTimeout(() => {
  if (lastReceived === undefined) return
  if (Date.now() - lastReceived > 1000) {
    console.log('METERS DISCONNECTED')
    x32.close()
  }
}, 100)