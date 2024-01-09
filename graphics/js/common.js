const params = new URLSearchParams(location.search)
function setRunDataDOM(num, run, isRun=true) {
  $('.game').eq(num).text(run.game.toUpperCase());
  const players = 'by ' + run.teams.flatMap(t => t.players).map(p => p.name).join(', ').toUpperCase()
  const category = (run.category ?? '').toUpperCase()
  const estimate = `EST ${run.estimate.substring(1)}`.toUpperCase()
  const releaseAndSystem = [run.release, run.system].flatMap(e => {
    return e !== undefined ? [e] : []
  }).join(', ').toUpperCase()
  $('.category').eq(num).text(isRun ? category : players);
  $('.estimate').eq(num).text(estimate);
  $('.releaseAndSystem').eq(num).text(isRun ? releaseAndSystem : category);
  textFitDelayed($('.game, .category'), {
    multiLine: true,
    alignHoriz: true,
    alignVert: true,
    maxFontSize: 200
  });
}
function textFitDelayed(element, options) {
  for (let i = 0; i <= 2000; i += 250) {
    setTimeout(() => {
      try {
        textFit(element, options);
      } catch (error) {
        console.log(error)
      }
    }, i);
  }
}
