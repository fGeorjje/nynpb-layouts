const { nodecg } = require('./nodecg')();
const { exec } = require('child_process');
const fs = require('fs');
const replicant = nodecg.Replicant('nowPlaying')
replicant.value = undefined
const command = '@chcp 65001 >nul & cmd /d/s/c powershell.exe -command "Get-Process | Where-Object {$_.Name -eq \'foobar2000\'} | Select-Object MainWindowTitle | ConvertTo-Json"'
let lastWrite
setInterval(getFoobarWindowTitle, 500)

function getFoobarWindowTitle() {
	exec(command, { shell : 'cmd.exe' }, receiveFoobarWindowTitle)
}

let noSongFoundCounter = 0
function receiveFoobarWindowTitle(error, stdout, stderr) {
  const args = parseFoobarWindowTitle(error, stdout, stderr)
  if (args === undefined) {
    noSongFoundCounter++
    if (replicant.value !== undefined && noSongFoundCounter > 3) {
      replicant.value = undefined
    }
    return
  }
  
  noSongFoundCounter = 0
  let [title, albumArtist, artist] = args
  function isAlbumArtist(...checks) {
    return checks.some(check => albumArtist === check)
  }
  
  if (isAlbumArtist('OverClocked ReMix')) {
    title = /[^"]+"(.*)"/g.exec(title)[1]
    setNowPlaying(`${artist} - ${title} - OverClocked ReMix (https://ocremix.org)`)
  } else if (isAlbumArtist('COOL&CREATE', 'COOL＆CREATE', 'COOL&CREATE')) {
    setNowPlaying(`${artist} - ${title} (http://cool‑create.cc)`)
  } else if (isAlbumArtist('NCS')) {
    setNowPlaying(`${title}`)
  } else if (isAlbumArtist('Demetori')) {
    setNowPlaying(`Demetori - ${title}`)
  } else if (artist === albumArtist) {
    setNowPlaying(`${artist} - ${title}`)
  } else {
    setNowPlaying(`${artist} (${albumArtist}) - ${title}`)
  }
  
  
}

let lastNowPlaying
function setNowPlaying(value) {
  if (replicant.value === value || lastNowPlaying === value) return
  nodecg.log.info('Now playing: ', value)
  replicant.value = lastNowPlaying = value
}

function parseFoobarWindowTitle(error, stdout, stderr) {
	if (error) {
    nodecg.log.error(`exec error getting foobar title: ${error}`)
    return undefined
  }
  
  if (!stdout) return undefined
  
  let rawJson
  try {
    rawJson = JSON.parse(stdout)
  } catch (error) {
    nodecg.log.error('Error parsing JSON from foobar title get', error, rawJson)
    return undefined
  }
  
  const rawTitle = rawJson.MainWindowTitle
  if (rawTitle === undefined) return undefined
  
  const args = rawTitle.split('|||')
  return args.length === 4 ? args : undefined
}