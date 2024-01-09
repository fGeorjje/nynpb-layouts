module.exports = (nodecg) => {
  require('./nodecg')(nodecg);
  require('./save_commentary_by_run');
  require('./obs');
  require('./obsStats');
  require('./streamSync');
  require('./foobar_parse_title');
  require('./changeover_transition');
  require('./mixer');
};