const { nodecg } = require('./nodecg')()
const currentCommentaryData = nodecg.Replicant('commentary');
const allCommentaryData = nodecg.Replicant('commentary-alldata');
const runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol');
if (allCommentaryData.value === undefined) allCommentaryData.value = {}
runDataActiveRun.on('change', onActiveRunChange);
currentCommentaryData.on('change', onCommentaryDataChange);

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function onActiveRunChange(run) {
  let data;
  if (run !== undefined) data = allCommentaryData.value[run.id];
  if (data === undefined) data = {
    host: { name: '' },
    commentators: []
  }
  currentCommentaryData.value = clone(data);
}

function onCommentaryDataChange(data) {
  const run = runDataActiveRun.value;
  if (run === undefined) return;
  allCommentaryData.value[run.id] = clone(data);
}
