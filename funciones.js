const Discord = require('discord.js');
const axios = require('axios');

let mmr= function (args,msg) {
    if (args !== null && args !== undefined && args !== "") {
        axios.get('https://euw.whatismymmr.com/api/v1/summoner?name=' + args)
        .then(response => {
            if(response.status ===200){

                embed = new Discord.MessageEmbed()
                embed.setTitle("MMR de: "+args)
                .setColor(0x00AE86)
                if(response.data.ranked.avg !== null){
                    embed.addField(
                        "SoloQ", "MMR: "+response.data.ranked.avg+ ", Puntos de desviacion: "+response.data.ranked.err+ ", Rango al que pertenece:"+response.data.ranked.closestRank
                    )
                }else{
                    embed.addField(
                        "SoloQ", "El invocador no ha jugado suficientes partidas recientemente"
                    ) 
                }
                if(response.data.normal.avg !== null){
                    embed.addField(
                        "Normal",  "MMR: "+response.data.normal.avg+ ", Puntos de desviacion: "+response.data.normal.err+ ", Rango al que pertenece:"+response.data.normal.closestRank
                    )
                }else{
                    embed.addField(
                        "Normal",  "El invocador no ha jugado suficientes partidas recientemente"
                    )
                }
                msg.channel.send( { embed } );
            }
            
        })
    }
}

let musica = function(args,msg){
    let voiceChannel = msg.member.voice.channel;
    if (!voiceChannel || voiceChannel.type !== 'voice') {
    msg.channel.send('¡Necesitas unirte a un canal de voz primero!.').catch(error => msg.channel.send(error));
    } else if (msg.guild.voiceConnection) {
    msg.channel.send('Ya estoy conectado en un canal de voz.');
    } else {
     msg.channel.send('Conectando...').then(m => {
        voiceChannel.join().then(() => {
               m.edit(':white_check_mark: | Conectado exitosamente.').catch(error => msg.channel.send(error));
         }).catch(error => msg.channel.send(error));
     }).catch(error => msg.channel.send(error));
    }
        // args[1] es la url de reproduccion 
        const ytdl = require('ytdl-core');
        if(!voiceChannel) return msg.channel.send('¡Necesitas unirte a un canal de voz primero!.');
        if(args[1] == null || args[1] == undefined) return msg.channel.send('Ingrese un enlace de youtube para poder reproducirlo.');
        voiceChannel.join()
          .then(connection => {
            const url = ytdl(args, { filter : 'audioonly' });
            dispatcher = connection.play(url);
            msg.channel.send('Reproduciendo ahora: '+ args);
            msg.delete();
          })
          .catch(console.error);
}



module.exports = {
    mmr,
    musica
}