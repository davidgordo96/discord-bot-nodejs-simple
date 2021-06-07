const { Client, RichEmbed } = require('discord.js');

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
    }
});


const token = 'ODUxNDkzMDk5NTk4MzgxMDg3.YL5Evg.n-0XY6oljzq7hOH2hi6lFH24sK0';
client.login(token);