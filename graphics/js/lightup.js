const meters = nodecg.Replicant('x32-meters')
const mutes = nodecg.Replicant('x32-mutes')
setTimeout(() => {
  const metersCopy = JSON.parse(JSON.stringify(meters.value))
  const mutesCopy = JSON.parse(JSON.stringify(mutes.value))
  console.log({metersCopy, mutesCopy})
}, 2000)

class Lightup {
  constructor(plate) {
    this.canvas = plate.querySelector('.lightup')
    this.ctx = this.canvas.getContext("2d");
    this.alpha = 0
    this.meter = 0
  }
  
  tick() {
    if (this.targetChannel === undefined) return
    if (meters.value === undefined) return
    if (mutes.value === undefined) return
    let meter = meters.value[this.targetChannel]
    const muteString = `${this.targetChannel}`.padStart(2, '0')
    const mute = mutes.value[muteString]
    if (meter === undefined || mute === undefined) return
    if (mute) {
      meter = 0
    }
    meter *= 3
    if (meter > 1) {
      meter = 1
    }
    const delta = meter - this.meter
    this.meter += delta / 5
    
    const canvas = this.canvas
    const ctx = this.ctx
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = `rgba(0, 198, 99, ${0.5+meter*0.25})`;
    const half = canvas.width / 2
    const height = canvas.height / 8
    const top = canvas.height * 7 / 8
    const width = this.meter * canvas.width
    ctx.fillRect(half-width/2, 0, width, height)
    ctx.fillRect(half-width/2, top, width, height)
  }
}

const lightups = plates.map(p => new Lightup(p))

window.requestAnimationFrame(tickLightups)
function tickLightups() {
  window.requestAnimationFrame(tickLightups)
  lightups.forEach(l => l.tick())
}

commentary.on('change', (newVal) => {
  lightups.forEach(l => {
    l.targetChannel = undefined
  })
  const data = newVal.lightupData
  let [runnerChannels, commentaryChannels] = data.split('--')
  runnerChannels = runnerChannels.split(',').map(s => parseInt(s, 10))
  commentaryChannels = commentaryChannels.split(',').map(s => parseInt(s, 10))
  console.log({runnerChannels, commentaryChannels})
  let i = 0
  for (const runnerChannel of runnerChannels) {
    // 1-6 -> 9-14 = +8
    linkLightup(i, runnerChannel + 8)
    i++
  }
  i = 10
  for (const commentaryChannel of commentaryChannels) {
    // 1-8 -> 17-24 = +16
    linkLightup(i, commentaryChannel + 16)
    i++
  }
})

function linkLightup(i, channel) {
  console.log('linking', i, 'to', channel)
  lightups[i].targetChannel = channel
}