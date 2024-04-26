const playModule = require('./play.js');
const { VoiceConnectionStatus } = require('@discordjs/voice');
module.exports = {
  name: 'resume',
  description: 'Paused müzik çalmayı devam ettirir',
  execute: (message, args) => {
    const currentConnection = playModule.getCurrentConnection();
    if (currentConnection && currentConnection.state.status === VoiceConnectionStatus.Ready) {
      playModule.resume();
    } else {
      message.reply('❌ Bot şu anda müzik çalmıyor.');
    }
  },
};
