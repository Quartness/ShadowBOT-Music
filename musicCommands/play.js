const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  voiceConnection,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
ytdl.YTDL_NO_UPDATE = true;
const YouTubeSearch = require('youtube-search');
const { EmbedBuilder } = require('discord.js');
const { updateHistory } = require('./historyUtils');
const config = require('../config.json');
const youtubeAPIKey = config.youtubeAPIKey;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { InteractionCollector } = require('discord.js');

let isPaused = false;
const youtubeSearchOptions = {
  maxResults: 1,
  key: youtubeAPIKey,
};

const queue = [];
let player;
let currentConnection; 
let currentMessage; 
function createPlayer() {
  if (!player) {
    player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, async () => {
      await playNextSong(currentConnection, currentMessage);
    });
  }
}


function enqueue(song) {
  queue.push(song);
}


function dequeue() {
  return queue.shift();
}
async function displayQueue(message) {
  if (queue.length === 0) {
     const embed = new EmbedBuilder()
      .setAuthor({
          name: 'Dikkat',
          url: 'https://discord.gg/cN7w93NzNK'
        })
      .setDescription('**Kuyruk şu anda boş, şarkı eklemeyi düşünün.**')
      .setColor('#ff0000');
    return message.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setColor('#2b71ec')
    .setAuthor({
      name: 'Kuyruk',
      iconURL: 'https://discord.gg/cN7w93NzNK',
      url: ''
    })
    .setDescription(queue.map((song, index) => `**${index + 1}.** ${song.searchQuery}`).join('\n'));

  message.reply({ embeds: [embed] });
}


async function playNextSong(connection, message) {
  if (queue.length > 0) {
    const nextSong = dequeue();
    await playSong(connection, nextSong.searchQuery, nextSong.message);
  } else {
    if (!connection.destroyed) {
      connection.destroy();
    }
   const embed = new EmbedBuilder()
 .setAuthor({
          name: 'Kuyruk Boş',
          url: 'https://discord.gg/cN7w93NzNK'
        })
     .setDescription('**Oops! Kuyruk boş. Botumuz mola alıyor. Görüşmek üzere!**')

      .setColor('#ffcc00');
    message.reply({ embeds: [embed] });
  }
}

async function playSong(connection, searchQuery, message) {
  createPlayer(); 

  player.pause();

  let searchResult;
  try {
    searchResult = await YouTubeSearch(searchQuery, youtubeSearchOptions);
  } catch (error) {
    console.error(error);
    return message.reply('❌ Şarkı aranırken bir hata oluştu.');
  }

  if (!searchResult || !searchResult.results.length) {
    return message.reply('❌ Sağlanan sorgu için arama sonuçları bulunamadı.');
  }

  const video = searchResult.results[0];
  const youtubeLink = `https://www.youtube.com/watch?v=${video.id}`;

  const stream = ytdl(youtubeLink, {filter: 'audioonly'});
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  });

  player.play(resource);
  connection.subscribe(player);

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    await entersState(player, AudioPlayerStatus.Playing, 20_000);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Şu Anda Bir Parça Çalınıyor', 
        url: 'https://discord.gg/cN7w93NzNK'
      })
      .setDescription(`\n ‎ \n▶️ **Detaylar :** [${video.title}](${youtubeLink})\n▶️ ** YouTube Müzik Deneyimini Yaşayın ** \n▶️ **Link çalınmazsa sorguyu deneyin**`)
      .setImage(video.thumbnails.high.url) 
      .setColor('#2b71ec')
      .setFooter({ text: 'Daha fazla bilgi - Varsayılan olarak Yardım komutunu kullanın: ?yardım' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('pause')
          .setLabel('Duraklat')
          .setEmoji('⏸️')
           .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('resume')
          .setLabel('Devam Et')
        .setEmoji('▶️')
           .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('skip')
          .setLabel('Atla')
         .setEmoji('⏭️')
           .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()  
        .setCustomId('display_queue')
        .setLabel('Kuyruk')
        .setEmoji('📄')
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()  
        .setLabel('Link')
