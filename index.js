const { Client, RichEmbed } = require('discord.js');
const axios = require('axios');
const tokens = require("./tokens.js")
import { token } from './config';
const tokenRiot = tokens.tokenRiot

const aws = require('aws-sdk');

let s3 = new aws.S3({
  accessKeyId: process.env.token
});
const generalLimit = 10;
const client = new Client();
var arrChamps = [];

client.on('ready', () => {
    console.log('Bot Now connected!');
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
    var contentSpl = content.split(" ")
    var command = content.substring(0, content.indexOf(" ")) == "" ? content : content.substring(0, content.indexOf(" "))
    var args = content.substring(content.indexOf(" ") + 1)
    //Genera las urls del usuario (Funciona)
    if (command === "!getAll") {        
        (async () => {
            let msgRet = await getAll(args);
            msg.channel.send(msgRet[0]);
            msg.channel.send(msgRet[1]);
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
                        let msgRet = spl[us] + "\n" + await masteryFunc(spl[us], generalLimit) + "\n\n"
                        if (msgRet !== null && msgRet !== undefined && msgRet !== "") {
                            msg.channel.send(spl[us] + ":\n" + await masteryFunc(spl[us], generalLimit) + "\n\n");
                        }
                    }                    
                }
            })()
        } else {         
            (async () => {
                var invocador = url.pathname.substring(url.pathname.indexOf("userName=") + "userName=".length).replace(/%20/g, " ")   
                let msgRet = await masteryFunc(invocador, generalLimit);
                msg.channel.send(msgRet);
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
                msg.channel.send(msgRet);
            })()            
        } else {
            msg.channel.send("This command must have at least an argument that can be a summonerName or a list of summonersName separate by ','\nAs a default value, it will return 15 result unless you add another argument added with a '-'. Example\n==>!mastery [summonerName/summonersName]-[limit]")
        }
    }
    //Help
    else if (command === "!help"){
        msg.channel.send("Here you will find the commands you can use:\n=>!getAll [summonerName]\n=>!getAll [server] [summonerName]\n=>!op [individual_OP.GG_URL]\n=>!op [multiquery_OP.GG_URL]\n=>!mastery [summonerName]")
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
                let strRet = ""
                for (let i = 0; i < data.length && i < limit ; i++) {
                    let c = data[i]
                    let lastPlayed = new Date(c.lastPlayTime)
                    lastPlayed = (lastPlayed.getDate() < 10 ? "0" + lastPlayed.getDate() : lastPlayed.getDate())
                        + "/" + ((lastPlayed.getMonth() + 1) < 10 ? "0" + (lastPlayed.getMonth() + 1) : (lastPlayed.getMonth() + 1))
                        + "/" + lastPlayed.getFullYear() 
                    let championInfo = (i + 1) + ". => " + arrChamps[c.championId] +  "(" + c.championLevel + "), last played : " + lastPlayed + "";
                    strRet = strRet + championInfo + (i < data.length -1 && i < limit -1 ? "\n" : "")
                    
                }
                return strRet;
        
            }).catch(error => {
                console.log(error);
            });
        }
    }).catch(error => {
        console.log(error);
    });
}

client.login(s3);