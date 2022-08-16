import { readFileSync, appendFile } from 'fs';
import { Worker } from 'worker_threads'
import { FoldetEmailingClient } from './foldet-client.js';
import { AsariEmailingClient } from './asari-client.js'
import chalk from 'chalk';
import got from "got";

//var client = new FoldetEmailingClient("ws://backend.foldet.pl:587", "sssssssss")
//await client.awaitConnection()
var client = new AsariEmailingClient()

var proxies;
loadProxies(readFileSync('proxies.txt').toString())

function loadProxies(body) {
    proxies = body.replace(/\r\n/g, '\n').split("\n").filter(x => x).map(x => {
        if (x && !x.startsWith("http://"))
            return "http://" + x
        return x
    })
}

await downloadProxies()

async function downloadProxies() {
    if (proxies.length == 0) {
        console.log(`${chalk.yellow("warrning")}: dont have any proxies, downloading new ones...`)
        //loadProxies((await got.get('https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=1000&country=all&ssl=all&anonymity=all&simplified=true')).body)
        var json = await got.get("https://proxylist.geonode.com/api/proxy-list?limit=50&sort_by=lastChecked&sort_type=desc&protocols=http").json()
        for (var entry of json.data) {
            proxies.push("http://" + entry.ip + ":" + entry.port)
        }
    }
}

var proxyIndex = 0;

function getProxy() {
    return proxies[proxyIndex++ % proxies.length];
}

async function createWorkir() {
    await downloadProxies()

    console.log(`${chalk.cyanBright("info")}: creating new task`)
    createWorker(getProxy(), createWorkir)
}

function createWorker(proxy, exit) {
    var worker = new Worker('./promo-worker.js', {
        workerData: {
            proxy: proxy
        }
    }).on('error', (err) => {
        console.log(`${chalk.red("failed")}: ${err}`)
       // proxies.pop(proxy)
    }).on('message', (message) => {
        if (message.type == "finish") {
            var code = message.value;
            console.log(`${chalk.green("success")}: ${code}`)
            appendFile('gifts.txt', code + '\n', err => {
                if (err)
                    console.log(chalk.red(`file append err: ${err}`))
            });
        } else if (message.type == "mail") {
            client.requestMail().then(mail => {
                worker.postMessage(mail.getMail())
            })
        } else if (message.type == "mail-code") {
            client.subscribeMail(message.value).then(content => {
                worker.postMessage(content)
            })
        } else if(message.type == "proxy") {
            worker.postMessage(getProxy())
        }
    }).on('exit', exit)
}

for(var i = 0; i < 50; i++)
    createWorkir()