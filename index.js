const { Client, RichEmbed } = require('discord.js');
const axios = require('axios');


const client = new Client();

client.on('ready', () => {
    console.log('Bot Now connected!');
});

// Bot listenning messages
client.on('message', msg => {
    
    //Genera las urls del usuario
    if (msg.content.indexOf("!getAll") > -1) {
        var spl = msg.content.split("!getAll ")[1].split(" ");
        var server = spl.length > 1 ? spl[0] : "euw";
        var user = spl[1].split(",");
        if (user !== "" && user !== undefined && user !== null) {
            msg.channel.send("https://" + server + ".op.gg/summoner/userName=" + user);
            msg.channel.send("!b mastery " + server + " " + user);
        }
    } 
    //Recupera los datos de los multiquery de op gg
    else if (msg.content.indexOf("op.gg") > -1 && msg.author.username !== "Scouting Bot") {
        var url = new URL(msg.content);
        console.log(msg)
        var server = url.host.split(".")[0]
        if (url.pathname.indexOf("multi_old") > -1) {
            var spl = msg.content.split("query=")[1].replace(/%20/g, " ").split("%2C")
            for (us in spl) {
                if (spl[us] !== null && spl[us] !== "") {
                    msg.channel.send("!b mastery " + server + " " + spl[us])
                }                    
            }
        } else {
            var spl = msg.content.split("userName=")[1].replace(/%20/g, " ")
                msg.channel.send("!b mastery " + server + " " + spl[1])
            
            
        }
    }else if(msg.content.indexOf("!info") > -1){
        console.log(msg.content);
        var invocador = msg.content.split(" ")[1]

        axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+invocador+'?api_key=RGAPI-1738dee4-bf09-4aee-b0df-2f2c2e99ee26')
        .then(response => {
            var idInvocador=response.data.id
            axios.get('https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/'+idInvocador+'?api_key=RGAPI-1738dee4-bf09-4aee-b0df-2f2c2e99ee26')
            .then(resp => {

                msg.channel.send(resp.data.toString())

            }).catch(error => {
                console.log(error);
            });
        })
        .catch(error => {
            console.log(error);
        });


    }
});





client.login(token);