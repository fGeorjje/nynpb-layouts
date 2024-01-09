const elements = {}

let id = -1
async function insertElement(html) {
  const left = 1652
  html.style.left = '1652px'
  document.getElementById('texts').appendChild(html)
  while (true) {
    await new Promise(r => setTimeout(r, 10))
    const width = html.offsetWidth
    if (width === 0) continue
    id++
    const element = { id, html, left, width}
    console.log(width)
    elements[id] = element
    break
  }
}

async function createText(text, color) {
  const html = document.createElement('span')
  if (color) {
    html.style.color = color
  }
  html.classList = 'text'
  html.innerHTML = text.toUpperCase()
  insertElement(html)
}

const allhandlers = [intro, discord, schedule, youtube, twitter, charity, nextrun]
let lefthandlers = [intro]
const currentScene = nodecg.Replicant('currentScene')
const flashinglightswarning = nodecg.Replicant('flashinglightswarning')
const violencewarning = nodecg.Replicant('violencewarning')
let lastWasWarning = false
createNextElement()
function createNextElement() {
  if (checkWarning()) return
  const index = Math.floor(Math.random()*lefthandlers.length)
  const handler = lefthandlers[index];
  lefthandlers.splice(index, 1);
  if (lefthandlers.length === 0) {
    lefthandlers = [...allhandlers]
    const originalIndex = lefthandlers.indexOf(handler)
    lefthandlers.splice(originalIndex, 1);
  }
  const text = handler()
  if (text === undefined) {
    setTimeout(createNextElement, 1000)
    return
  }
  lastWasWarning = false
  createText(text)
}

setInterval(() => {
  const date = new Date(Date.now() + 2000).toString().toUpperCase()
  const day = date.substring(4, 10)
  const time = date.substring(15, 24)
  document.getElementById('rta').innerHTML = day + time + ' ET'
})

function checkWarning() {
  console.log(currentScene.value)
  if (currentScene.value === undefined) return false
  if (currentScene.value.includes('Break')) return false
  const flashingLights = flashinglightswarning.value
  const violence = violencewarning.value
  console.log({flashingLights, violence})
  if (!flashingLights && !violence) return false
  if (lastWasWarning) {
    return false
  }
  
  lastWasWarning = true
  let text = 'WARNING: This game contains '
  if (flashingLights && !violence) {
    text += 'FLASHING LIGHTS'
  } else if (!flashingLights && violence) {
    text += 'VIOLENT DEPICTIONS'
  } else if (violence && flashingLights) {
    text += 'FLASHING LIGHTS AND VIOLENT DEPICTIONS'
  }
  createText(text, 'rgb(255,64,64)')
  return true
}

function intro() {
  return 'You are watching New Year, New PB on No Glitches Allowed'
}
function discord() {
  return 'Join the No Glitches Allowed Discord at noglitchesallowed.org/discord and stay tuned for NoGA11 news!'
}
function schedule() {
  return 'Check out the event schedule at noglitchesallowed.org/schedule'
}
function youtube() {
  return 'No Glitches Allowed is now uploading event VODs to YouTube too! youtube.com/@noglitchesallowed'
}
function twitter() {
  return 'Follow us on Twitter (No, we\'re still not calling it X) at @NoGlitches'
}
function charity() {
  return 'Got money to spare? This isn\'t a charity event, but if you want to help an awesome charity regardless, visit gorescuedogs.com'
}
const runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol')
const runDataArray = nodecg.Replicant('runDataArray', 'nodecg-speedcontrol')
function nextrun() {
  if (currentScene.value.includes('Break')) return
  let i
  for (i = 0; i < runDataArray.value.length; i++) {
    if (runDataArray.value[i].id === runDataActiveRun.value.id) break
  }
  const run = runDataArray.value[i+1]
  if (run === undefined) return
  const players = run.teams.flatMap(t => t.players).map(p => p.name).join(', ')
  return `Coming up after this run is ${run.game} - ${run.category} by ${players}!`
}

let lastTimestamp = undefined
window.requestAnimationFrame(render)
function render(timestamp) {
  window.requestAnimationFrame(render)
  Object.values(elements).forEach(renderElement)
}

function renderElement(element, delta) {
  if ((1442 - element.width) > element.left && !element.thresholdCrossed) {
    element.thresholdCrossed = true
    createNextElement()
  }
  
  element.left = element.left - 2
  
  if (-element.width > element.left) {
    element.html.remove()
    delete elements[element.id]
    return
  }
  element.html.style.left = `${Math.floor(element.left)}px`
}