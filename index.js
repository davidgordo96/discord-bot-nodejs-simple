const Discord = require('discord.js');

const axios = require('axios');
const tokens = require("./tokens.js");
const funciones = require("./funciones.js");
const tokenRiot = process.env.tokenRiot || tokens.tokenRiot;

const token = process.env.token || tokens.token;

const generalLimit = 10;
const client = new Discord.Client();
const commands = ["!getAll", "!op", "!mastery", "!test", "!mmr", "!p", "!pausa", "!reanudar", "!terminar"]
var arrChamps = [];
var embed = null;

client.on('ready', () => {
    console.log('Bot Now connected!');
    const dispatcher = null ;
    const connection = null;
    //Recuperación de los campeones del LOL con sus IDs
    var version = "0"
    axios.get('https://ddragon.leagueoflegends.com/api/versions.json')
    .then(response => {
        version = response.data[0];
    }).then(function () {
        if (version !== "0" && version !== undefined && version !== null) {
            axios.get('http://ddragon.leagueoflegends.com/cdn/' + version + '/data/es_ES/champion.json')
            .then(resp => {
                var champions = resp.data.data
                for (champ in champions) {
                    if (champ !== null && champ !== undefined && champ !== "") {
                        var id = champions[champ].key
                        arrChamps[id] = champ
                    }
                }
                console.assert(arrChamps[72] == "Skarner", "Error loading")
            }).catch(error => {
                console.log(error);
            });
        }
    }).catch(error => {
        console.log(error);
    });
    setTimeout(() => {
        if (arrChamps[81] == "Ezreal") {
            console.log("arrChamps correctly loaded")
        } else {
            console.log("There was an error loading champ list")
        }
    }, 1000);
});

// Bot listenning messages
client.on('message', msg => {
    
    var content = msg.content
    var command = content.substring(0, content.indexOf(" ")) == "" ? content : content.substring(0, content.indexOf(" "))
    var args = content.substring(content.indexOf(" ") + 1)
    if (commands.includes(command)) {
        embed = new Discord.MessageEmbed()
        //Genera las urls del usuario (Funciona)
        if (command === "!getAll") {        
            (async () => {
                let msgRet = await getAll(args);
                embed.setTitle("Recuperación del OP GG y las maestrías de " + args)
                    .setColor(0x00AE86)
                    .addField("OP.GG:" , msgRet[0])
                arrDataToEmbed(msgRet[1])
                msg.channel.send( { embed } )
            })()
        } 
        //Recupera los datos de op gg (Funciona)
        else if (command === "!op") {
            var url = new URL(args);
            var server = url.host.split(".")[0]
            if (url.pathname.indexOf("multi_old") > -1) { 
                (async () => {
                    var spl = url.pathname.substring(url.pathname.indexOf("query=") + "query=".length).replace(/%20/g, " ").split("%2C")
                    for (us in spl) {
                        if (spl[us] !== null && spl[us] !== "") {
                            var invocador = spl[us].trim()
                            let msgRet = await getAll(invocador);
                            embed.setTitle("Recuperación del OP GG y las maestrías de " + invocador)
                                .setColor(0x00AE86)
                                .addField("OP.GG:" , msgRet[0])
                            arrDataToEmbed(msgRet[1])
                            msg.channel.send( { embed } )
                            embed = new Discord.MessageEmbed()
                        }                    
                    }
                })()
            } else {         
                (async () => {
                    var invocador = url.pathname.substring(url.pathname.indexOf("userName=") + "userName=".length).replace(/%20/g, " ").trim()
                    let msgRet = await getAll(invocador);
                    embed.setTitle("Recuperación del OP GG y las maestrías de " + invocador)
                        .setColor(0x00AE86)
                        .addField("OP.GG:" , msgRet[0])
                    arrDataToEmbed(msgRet[1])
                    msg.channel.send( { embed } )
                })()
            }
        } 
        //Recupera info de la maestría de la API de RIOT
        else if(command === "!mastery"){
            if (args !== null && args !== undefined && args !== "") {   
                (async () => {
                    var argsSpl = args.split(" ")
                    var invocador = argsSpl[0];
                    var limit = argsSpl >= 2 && isNaN(parseInt(argsSpl[1])) == false ? argsSpl[1] : generalLimit

                    let msgRet = await masteryFunc(invocador, limit);
                    embed.setTitle("Recuperación del OP GG y las maestrías de " + args)
                        .setColor(0x00AE86)
                    arrDataToEmbed(msgRet)
                    msg.channel.send( { embed } )
                })()            
            } else {
                msg.channel.send("Este comando debe tener al menos un argumento correspondiente al nombre de invoicador o a una lista de invocadores serparados con comas")
            }
        } else if (command === "!test") {
            msg.channel.send("!getAll Gordp")
            msg.channel.send("!op https://euw.op.gg/summoner/userName=Gordp")
            msg.channel.send("!op https://euw.op.gg/multi_old/query=Gordp%2Csergioycompany")
            msg.channel.send("!mastery Gordp")       
        }
        //Devuelve el mmr pasandole el nombre de invocador
        else if (command === "!mmr") {
            embed=funciones.mmr(args, msg);
        }
        //Arranca la musica
        else if(command ==="!p"){
            funciones.musica(args, msg);              
        }
        // TODO Problemas con versiones de librerias
        else if(command ==="!pausa"){
            dispatcher.pause(true);
            msg.channel.send(':pause_button: | Musica pausada.');
        }else if(command ==="!reanudar"){
            dispatcher.resume(true);
        }else if(command ==="!terminar"){
            dispatcher.end();
        }
    }
    //Help
    if (command === "!help" || (command.indexOf("!") === 0 && !commands.includes(command))) {
        
        embed = new Discord.MessageEmbed()
        embed.setTitle("A continuación se muestran los comandos admitidos por este bot: ")
        .setColor(0x00AE86)
        .addFields(
            {name :"!getAll [summonerName]", value: "Devuelve el OP GG de un jugador y sus 10 campeones con mayor maestría"},
            {name :"!op [individual_OP.GG_URL]", value: "Devuelve el OP GG de un jugador "},
            {name :"!op [multiquery_OP.GG_URL]", value: "Devuelve el OP GG de una lista de jugadores separados por comas."},
            {name :"!mastery [summonerName]", value: "Devuelve los " + generalLimit + " campeones con mayor maestría de un jugador"},
            {name :"!mastery [summonerName] [limit]", value: "Devuelve los [limit] campeones con mayor maestría de un jugador"},
            {name :"!mmr [summonerName]", value: "Devuelve los valores de MMR para las colas de SoloQ y Normal"},
            {name :"!p [url de youtube]", value: "Inicia la reproduccion de musica"}
        )        
        msg.channel.send( { embed } )       
    }
});

async function getAll (args) {
    var spl = args.split(" ");
    var server = spl.length > 1 ? spl[0] : "euw";
    var user = spl.length > 1 ? spl[1] : spl[0];
    let retArgs = []
    if (user !== "" && user !== undefined && user !== null) {
        retArgs[0] = "https://" + server + ".op.gg/summoner/userName=" + user;   
        retArgs[1] = await masteryFunc (user, generalLimit)
        return retArgs;
    }
}

async function masteryFunc (invocador, limit) {        
    var idInvocador = "";
    return await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + invocador + '?api_key=' + tokenRiot)
    .then(response => {
        idInvocador = response.data.id
    }).then (await function () {
        if (idInvocador !== null && idInvocador !== undefined && idInvocador !== "") {
            return axios.get('https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + idInvocador + '?api_key=' + tokenRiot)
            .then(resp => {
                let data = resp.data
                let arrRet = []
                for (let i = 0; i < data.length && i < limit ; i++) {
                    let c = data[i]
                    let lastPlayed = new Date(c.lastPlayTime)
                    lastPlayed = (lastPlayed.getDate() < 10 ? "0" + lastPlayed.getDate() : lastPlayed.getDate())
                        + "/" + ((lastPlayed.getMonth() + 1) < 10 ? "0" + (lastPlayed.getMonth() + 1) : (lastPlayed.getMonth() + 1))
                        + "/" + lastPlayed.getFullYear() 
                    arrRet[arrRet.length] = {
                        champName : arrChamps[c.championId],
                        champLv : c.championLevel,
                        lastPlayed : lastPlayed
                    }
                    
                }
                return arrRet;
        
            }).catch(error => {
                console.log(error);
            });
        }
    }).catch(error => {
        console.log(error);
    });
}

function arrDataToEmbed (arr) {
    for (var i = 0; (i*2) < arr.length; i++) {
        console.log(i)
        embed.addFields(
            {name :arr[(i*2)].champName, value: arr[(i*2)+1].champName, inline : true},
            {name :arr[(i*2)].champLv, value: arr[(i*2)+1].champLv, inline : true},
            {name :arr[(i*2)].lastPlayed, value: arr[(i*2)+1].lastPlayed, inline : true})
    }
}
client.login(token);
