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
                .addFields(
                    {name :"SoloQ", value: "MMR: "+response.data.ranked.avg+ ", Puntos de desviacion: "+response.data.ranked.err+ ", Rango al que pertenece:"+response.data.ranked.closestRank},
                    {name :"Normal", value: "MMR: "+response.data.normal.avg+ ", Puntos de desviacion: "+response.data.normal.err+ ", Rango al que pertenece:"+response.data.normal.closestRank}
                )
                msg.channel.send( { embed } );
            }
            
        })
    }
}



module.exports = {
    mmr
}