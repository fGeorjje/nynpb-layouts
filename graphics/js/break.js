const urlParams = new URLSearchParams(window.location.search);

nodecg.Replicant('breakScreenHost').on('change', (value) => {
  if (value === undefined) return
  $('.name').text('HOST: ' + value.name.toUpperCase());
  let pronounElement = $('.pronouns');
  if (value.pronouns) {
    pronounElement.text(value.pronouns.toUpperCase());
    pronounElement.show();
  } else {
    pronounElement.hide();
  }
});

nodecg.Replicant('nowPlaying').on('change', (value) => {
  $('#nowPlaying').text('NOW PLAYING: ' + value.toUpperCase());
  textFit($('#nowPlaying'), {
    multiLine: true,
    alignHoriz: false,
    alignVert: false,
    maxFontSize: 30
  });
});

const runDataArray = nodecg.Replicant('runDataArray', 'nodecg-speedcontrol');
const runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
const commentaryData = nodecg.Replicant('commentary-alldata');

async function initSchedule() {
  await NodeCG.waitForReplicants(runDataArray, runDataActiveRun);
  runDataActiveRun.on('change', updateSchedule)
  runDataArray.on('change', updateSchedule)
  commentaryData.on('change', updateSchedule)
}
initSchedule();

let entryindex
function updateSchedule() {
  let runs = runDataArray.value;
  const currentRun = runDataActiveRun.value;
  let index = findIndexOfRun(currentRun, runs);
  console.log(index);
  
  [
    '.game', '.releaseAndSystem', '.estimate', '.category', '.until'
  ].forEach(e => $(e).text(''))
  entryindex = 0
  //$('.scheduleentry').hide()
  runs.slice(index, index+4).forEach(updateRunDOM)
}

let totalTime;
function updateRunDOM(run, i) {
  if (run === undefined) {
    return
  }
  
  setRunDataDOM(entryindex, run, false)
  let untilText;
  if (i === 0) {
    totalTime = 0;
    untilText = 'Up next'
  } else {
    const hours = Math.floor(totalTime / 3600)
    let minutes = (totalTime - hours * 3600) / 60 / 5
    minutes = Math.ceil(minutes) * 5
    
    if (hours > 0 && minutes > 0) {
      untilText = `In ${hours} hours, ${minutes} minutes`;
    } else if (hours > 0) {
      untilText = `In ${hours} hours`;
    } else {
      untilText = `in ${minutes} minutes`;
    }
  }
  totalTime = totalTime + run.estimateS + run.setupTimeS;
  $(`.until`)[entryindex].innerText = untilText.toUpperCase()
  entryindex++
}

function findIndexOfRun(run, runs) {
  for (let i = 0; i < runs.length; i++) {
    if (run.id === runs[i].id) return i;
  }
}

