const layout = params.get('layout')
document.getElementById('css').href = `css/${layout}.css`
document.getElementById('lines').src = `components/${layout}.png`

const plateTemplate = document.getElementById('plateTemplate')
const plates = []
const nameElements = []
const twitchPronounElements = []
const namePronounElements = []
const twitchElements = []
for (let i = 0; i < 14; i++) {
  const clone = plateTemplate.content.cloneNode(true)
  const plate = clone.querySelector('.plate')
  
  plates.push(plate)
  nameElements.push(plate.querySelector('.name'))
  twitchPronounElements.push(plate.querySelector('.twitchPronouns'))
  namePronounElements.push(plate.querySelector('.namePronouns'))
  twitchElements.push(plate.querySelector('.twitch'))
  
  plate.id = `plate${i}`
  plate.classList = 'plate ' + (i < 10 ? 'runnerPlate' : 'commentaryPlate')
  if (i < 10) {
    const lines = document.getElementById('lines')
    document.body.insertBefore(plate, lines)
  } else {
    document.getElementById('commentaryPlates').appendChild(plate)
  }
}
console.log({plates,twitchPronounElements,namePronounElements,twitchElements})

$('.twitchPlate').hide();
function cycleNameplates() {
  let nameplates = $('.plate').toArray();
  for (const nameplate of nameplates) {
    let twitchNameplate = $(nameplate).children('.twitchPlate').first();
    let runnerNameplate = $(nameplate).children('.namePlate').first();
    let runnerShown = runnerNameplate.is(":visible");
    if (runnerShown) {
      let runner = $(runnerNameplate).children('.name').first().text();
      let twitch = $(twitchNameplate).children('.twitch').first().text();
      if (!twitch) {
        continue;
      }
      if (twitch === runner) {
        continue;
      }
      twitchNameplate.fadeIn(1000);
      runnerNameplate.fadeOut(1000);
      continue;
    } else {
      twitchNameplate.fadeOut(1000);
      runnerNameplate.fadeIn(1000);
      continue;
    }
  }
}

setInterval(cycleNameplates, 15000);

const runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
const commentary = nodecg.Replicant('commentary');
NodeCG.waitForReplicants(runDataActiveRun, commentary).then(() => {
  runDataActiveRun.on('change', updatePlates)
  commentary.on('change', updatePlates)
  updatePlates()
})

function updatePlates() {
  const run = runDataActiveRun.value
  const players = run.teams.flatMap((t) => t.players).map(player => {
    return {
      name: player.name,
      pronouns: player.pronouns,
      twitch: player?.social?.twitch
    }
  })
  const { host, commentators } = commentary.value
  host.isHost = true
  let talent = []
  for (let i = 0; i < 14; i++) {
    talent[i] = undefined
  }
  
  players.forEach((p, i) => {
    talent[i] = p
  })
  talent[10] = host
  commentators.forEach((p, i) => {
    talent[i+11] = p
  })
  
  console.log(JSON.parse(JSON.stringify(talent)))
  $('.plate').hide()
  talent.forEach((t, i) => {
    if (t && t.name.trim() !== '') {
      $(plates[i]).show()
      $(nameElements[i]).text(t.name.toUpperCase())
      $(twitchElements[i]).text((t.twitch ?? '').toUpperCase())
      if (t.pronouns || t.isHost) {
        const pText = [t.pronouns ?? '', t.isHost ? '(Host)' : ''].join(' ').toUpperCase()
        $(twitchPronounElements[i]).html(pText)
        $(namePronounElements[i]).html(pText)
        $(twitchPronounElements[i]).show()
        $(namePronounElements[i]).show()
      } else {
        $(twitchPronounElements[i]).hide()
        $(namePronounElements[i]).hide()
      }
    }
  })
  
  const commentaryCount = commentators.length;
  function setPlateDimensions(num, x, y, w, h, fontSize) {
    const e = plates[num+9]
    e.style.left = x
    e.style.top = y
    e.style.width = w
    e.style.height = h
    e.style.fontSize = `${fontSize}px`
    $(nameElements[num+9])[0].style.marginTop = '2px'
    $(twitchPronounElements[num+9]).css('font-size', `${fontSize*3/4}px`)
    $(namePronounElements[num+9]).css('font-size', `${fontSize*3/4}px`)
  }
  if (commentaryCount === 0) {
    setPlateDimensions(1, 0, 0, '100%', '100%', 30)
  } else if (commentaryCount === 1) {
    setPlateDimensions(1, 0, 0, '100%', '50%', 25)
    setPlateDimensions(2, 0, '50%', '100%', '50%', 25)
  } else if (commentaryCount === 2) {
    setPlateDimensions(1, '0%', '5%', '100%', '45%', 20)
    setPlateDimensions(2, '0%', '50%', '50%', '45%', 20)
    setPlateDimensions(3, '50%', '50%', '50%', '45%', 20)
  } else if (commentaryCount === 3) {
    setPlateDimensions(1, '0%', '0%', '50%', '50%', 17)
    setPlateDimensions(2, '50%', '0%', '50%', '50%', 17)
    setPlateDimensions(3, '0%', '50%', '50%', '50%', 17)
    setPlateDimensions(4, '50%', '50%', '50%', '50%', 17)
  }
}

let currentLayout = undefined
runDataActiveRun.on('change', (run) => {
  setRunDataDOM(0, run)
});

const timerReplicant = nodecg.Replicant('timer', 'nodecg-speedcontrol');
let storedTimer, storedTimerUpdatedAt
timerReplicant.on('change', (timer) => {
  storedTimer = timer
  storedTimerUpdatedAt = Date.now()
  updateTimerDOM(timer)
});
setInterval(updateTimerDOM, 10)
function updateTimerDOM(timer) {
  let offset = 0
  if (timer === undefined) {
    if (storedTimer === undefined) return
    timer = storedTimer
    if (storedTimer.state === 'running') {
      offset = Date.now() - storedTimerUpdatedAt
    }
  }
  
  let time = timer.milliseconds + offset
  const millisInHour = 1000 * 60 * 60
  let hours = Math.floor(time / millisInHour)
  time -= hours * millisInHour
  
  const millisInMinute = 1000 * 60
  let minutes = Math.floor(time / millisInMinute)
  time -= minutes * millisInMinute
  minutes = `${minutes}`.padStart(2, '0')
  
  const millisInSecond = 1000
  let seconds = Math.floor(time / millisInSecond)
  time -= seconds * millisInSecond
  seconds = `${seconds}`.padStart(2, '0')
  
  let decis = Math.floor(time / 100)
  $('#timerMain').text(`${hours}:${minutes}:${seconds}`)
  $('#timerDecis').text(`.${decis}`)
}

const timerCanvas = document.getElementById('timerCanvas')
const timerCanvasCtx = timerCanvas.getContext('2d')
let timerAlternations = 0
let timerAlternationFrames = 0
window.requestAnimationFrame(updateTimerCanvas)
function updateTimerCanvas() {
  window.requestAnimationFrame(updateTimerCanvas)
  if (storedTimer === undefined) return
  timerCanvasCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height)
  const finishTime = Object.values(storedTimer.teamFinishTimes)[0]
  if (finishTime !== undefined && finishTime.state === 'forfeit') {
    timerCanvasCtx.fillStyle = 'rgba(255,127,127,0.8)'
    timerCanvasCtx.fillRect(0, 0, timerCanvas.width, timerCanvas.height)
    return
  }
  if (storedTimer.state === 'finished') {
    timerCanvasCtx.fillStyle = 'rgba(127,255,127,0.8)'
    timerCanvasCtx.fillRect(0, 0, timerCanvas.width, timerCanvas.height)
    return
  }
  if (storedTimer.state === 'paused' || storedTimer.state === 'stopped') {
    timerCanvasCtx.fillStyle = 'rgba(127,127,127,0.8)'
    timerCanvasCtx.fillRect(0, 0, timerCanvas.width, timerCanvas.height)
    return
  }
  
  const milliseconds = storedTimer.milliseconds + Date.now() - storedTimerUpdatedAt
  const binary = Math.floor(milliseconds / 1000 * 3).toString(2)
  const columns = binary.length
  
  let onesFound = false
  for (let i = 0; i < columns; i++) {
    if (binary[i] === '0') {
      onesFound = true
      break
    }
  }
  if (!onesFound && milliseconds > 10000) {
    timerAlternations = 4
    timerAlternationFrames = 15
  }
  
  for (let i = 0; i < columns; i++) {
    const from = Math.floor(i*timerCanvas.width/columns)
    const to = Math.floor((i+1)*timerCanvas.width/columns)
    const width = to - from
    if (timerAlternations > 0) {
      if (timerAlternations % 2 === 0) {
        timerCanvasCtx.fillStyle = 'rgba(255,205,58,0.84)'
      } else {
        timerCanvasCtx.fillStyle = 'rgba(255,232,216,0.88)'
      }
    } else if (binary[i] === '1') {
      timerCanvasCtx.fillStyle = 'rgba(255,205,58,0.84)'
    } else {
      timerCanvasCtx.fillStyle = 'rgba(255,232,216,0.88)'
    }
    timerCanvasCtx.fillRect(from, 0, width, timerCanvas.height)
    if (i !== columns - 1) {
      timerCanvasCtx.fillStyle = 'black'
      timerCanvasCtx.fillRect(to-5, 0, 6, timerCanvas.height)
    }
  }
  if (timerAlternationFrames > 0) {
    timerAlternationFrames--
    if (timerAlternationFrames <= 0) {
      timerAlternationFrames = 15
      if (timerAlternations > 0) {
        timerAlternations--
      }
    }
  }
}

const flashinglightswarning = nodecg.Replicant('flashinglightswarning')
const violencewarning = nodecg.Replicant('violencewarning')
NodeCG.waitForReplicants(flashinglightswarning, violencewarning).then(() => {
  flashinglightswarning.on('change', updateWarnings)
  violencewarning.on('change', updateWarnings)
  updateWarnings()
})
function updateWarnings() {
  const flashingLights = flashinglightswarning.value
  const violence = violencewarning.value
  console.log('warnings', flashingLights, violence)
  const elem = $('#warning')
  if (!flashingLights && !violence) {
    elem.hide();
    return
  }
  elem.show();
  if (flashingLights && !violence) {
    elem.text('CW: FLASHING LIGHTS')
  } else if (!flashingLights && violence) {
    elem.text('CW: VIOLENT DEPICTIONS')
  } else if (violence && flashingLights) {
    elem.text('CW: FLASHING LIGHTS/VIOLENCE')
  }
}