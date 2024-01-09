nodecg.Replicant('nowPlaying').on('change', (value) => {
  $('#nowPlaying').text('Now playing: ' + value);
  textFit($('#nowPlaying'), {
    multiLine: true,
    alignHoriz: false,
    alignVert: true,
    maxFontSize: 200
  });
});