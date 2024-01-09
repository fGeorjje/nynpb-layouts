document.getElementById('changeover').onclick = () => {
  nodecg.sendMessage('changeover')
}

let commentaryReplicant = nodecg.Replicant('commentary');
let breakHostReplicant = nodecg.Replicant('breakScreenHost');

document.getElementById('update-host').onclick = () => {
  breakHostReplicant.value = commentaryReplicant.value.host
}

(async function setupCommentaryControl() {
  const replicant = commentaryReplicant
  await NodeCG.waitForReplicants(replicant);
  $('#submit-comms').click(sendUpdate);
  replicant.on('change', receiveUpdate);
  
  function getCommsObj(num) {
    let result = {};
    ['name', 'pronouns', 'twitch'].forEach(key => {
      const parse = `#${key}${num}`
      const val = $(parse).val()
      console.log(parse, val)
      result[key] = val
      if (!result[key]) result[key] = undefined
      console.log(result)
    })
    return result.name ? result : undefined
  }
  
  function sendUpdate() {
    let host = getCommsObj(0);
    let commentators = [];
    for (let i = 1; i < 4; i++) {
      const comm = getCommsObj(i)
      if (comm === undefined) continue
      commentators.push(comm);
      console.log(commentators)
    }
    
    const lightupData = $('#lightup-control').val()
    let value = { host, commentators, lightupData };
    console.log(value);
    replicant.value = value;
  }

  function receiveUpdate(value) {
    $('#textReplicantsContainer > input').val('a')
    $('#textReplicantsContainer > input').val('')
    receiveUpdateSingle(value.host, 0);
    
    for (let i = 0; i < value.commentators.length; i++) {
      receiveUpdateSingle(value.commentators[i], i+1);
    }
    $('#lightup-control').val(value.lightupData)
  }
  
  function receiveUpdateSingle(commsObj, num) {
    if (!commsObj) commsObj = {};
    let name = commsObj.name;
    let pronouns = commsObj.pronouns ?? '';
    let twitch = commsObj.twitch ?? '';
    $(`#name${num}`).val(name);
    $(`#pronouns${num}`).val(pronouns);
    $(`#twitch${num}`).val(twitch);
  }
})();

async function setupCheckbox(id) {
  let checkbox = document.getElementById(id);

  let replicant = nodecg.Replicant(id);
  await NodeCG.waitForReplicants(replicant)
  checkbox.addEventListener('change', sendUpdate);
  replicant.on('change', receiveUpdate);

  function sendUpdate() {
    replicant.value = checkbox.checked;
  }

  function receiveUpdate(value) {
    checkbox.checked = value
  }
}
setupCheckbox('flashinglightswarning')
setupCheckbox('violencewarning')
