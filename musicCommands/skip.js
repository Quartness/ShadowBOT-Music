const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { dequeue, playNextSong, playSong } = require('./play');
const { queue } = require('./play');

module.exports = {
  name: 'geç',
  description: 'Mevcut şarkıyı atla',
  async execute(mesaj, argümanlar) {
    const sesKanalı = mesaj.member.voice.channel;
    if (!sesKanalı) {
      const gömülü = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('🐼 Bu komutu kullanmak için bir ses kanalında olmanız gerekiyor!');
      return mesaj.reply({ embeds: [gömülü] });
    }

    const bağlantı = joinVoiceChannel({
      channelId: sesKanalı.id,
      guildId: mesaj.guild.id,
      adapterCreator: mesaj.guild.voiceAdapterCreator,
    });

    if (bağlantı.state.status === VoiceConnectionStatus.Ready) {
      if (queue.length > 0) {
        const sonrakiŞarkı = dequeue();
        await playSong(bağlantı, sonrakiŞarkı.searchQuery, sonrakiŞarkı.message);

        const gömülü = new EmbedBuilder()
           .setColor('#2b71ec')
     .setAuthor({
          name: 'Şarkı Atlandı!',
          iconURL: 'https://cdn.discordapp.com/attachments/1175488636033175602/1175488721253052426/right-chevron-.png?ex=656b6a2e&is=6558f52e&hm=7a73aa51cb35f25eba52055c7b4a1b56bbf3a6d150643adc15b52dc533236956&',
          url: 'https://discord.gg/FUEHs7RCqz'
        })
          .setDescription('**Gelecek melodilere geçiliyor...**');
        return mesaj.reply({ embeds: [gömülü] });
      } else {
        const gömülü = new EmbedBuilder()
          .setColor('#FFFF00')
          .setDescription('**❌ Atlamak için sıraya eklenmiş şarkı yok.**');
        return mesaj.reply({ embeds: [gömülü] });
      }
    } else {
      const gömülü = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription('**❌ Atlamak için şarkı bulunmamaktadır. Kuyruk boş.**');
      return mesaj.reply({ embeds: [gömülü] });
    }
  },
};
