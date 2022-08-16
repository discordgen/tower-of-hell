/* these things may change when they will find me (they don't know that I live in their walls) */
const appId = 'a0ca7921668f7d18c096ad85011589fd';
const globalSigKey = '0d88135dd851f81f9601e477b261a137';
const urlParams = '?' + Object.entries({
    'account_plat_type': 113,
    'app_id': appId,
    'lang_type': 'en',
    'os': 3,
    'source': 32,
    'channelid': 113,
    'conn': 0,
    'gameid': 29093,
    'sdk_version': '2.0'
}).sort().map(x => `${x[0]}=${x[1] || ""}`).join("&")


import got from "got";
import * as crypto from 'crypto';
import { workerData, parentPort } from 'worker_threads'
import http2 from "http2-wrapper";
import proxies from 'https-proxy-agent';

var proxy = !workerData.proxy ? undefined : new proxies.HttpsProxyAgent(workerData.proxy)
var client = got.extend({
    agent: {
        https: proxy
    },
    headers: {
        "content-type": "application/json",
        "Referer": "https://www.toweroffantasy-global.com/",
        "User-agent": Math.random().toString(36)
    },
    timeout: {
        request: 30000
    },
    retry: { limit: 0 }
});
/* mailbox things - feel free to change */
function randomMail() {
    return new Promise((resolve, reject) => {
        parentPort.once('message', (message) => {
            resolve(message)
        })
        parentPort.postMessage({ type: "mail" })
    })
}

function getProxy() {
    return new Promise((resolve, reject) => {
        parentPort.once('message', (message) => {
            resolve(message)
        })
        parentPort.postMessage({ type: "proxy" })
    })
}

function awaitMail(mailbox) {
    return new Promise((resolve, reject) => {
        parentPort.once('message', (message) => {
            resolve(message.match(/\d{5}/)[0])
        })
        parentPort.postMessage({ type: "mail-code", value: mailbox })
    })
}

/* request things */
async function jupiterRequest(cookie, endpoint) {
    return await client.post("https://www.jupiterlauncher.com/api/v1/fleet.platform.game.GameCommunity/" + endpoint, {
        json: {
            cookies: cookie
        },
    }).json()
}
async function getHash(endpoint, body) {
    return await got.post('https://grupahakerskapiotr.us/ilyhokuine.php', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'sus': endpoint,
            'amogus': body
        }
    }).text()
}
async function tecentIntl(endpoint, requestBody, canFail) {
    var json = await client.extend({agent: {
        https: new proxies.HttpsProxyAgent(await getProxy())
    }}).post(`https://aws-na.intlgame.com${endpoint}${urlParams}&sig=${await getHash(endpoint, requestBody)}`, {
        body: requestBody
    }).json()
    if (json.ret != 0 && !canFail)
        throw `[${endpoint}] err ${json.ret}: ${json.msg}`
    return json
}

var fakeRegister = await tecentIntl("/account/register", "{\"verify_code\":\"12345\",\"account\":\"" + Math.random() + "@gmail.com\",\"account_type\":1,\"password\":\"73b6be1ed6682a64b82b086aab3c9ff5\"}", true)
if(fakeRegister.ret != 2114)
    throw fakeRegister.msg

var email = await randomMail();
await tecentIntl("/account/sendcode", "{\"account\":\"" + email + "\",\"account_type\":1,\"code_type\":0}")

var code = await awaitMail(email)

var register = await tecentIntl("/account/register", "{\"verify_code\":\"" + code + "\",\"account\":\"" + email + "\",\"account_type\":1,\"password\":\"73b6be1ed6682a64b82b086aab3c9ff5\"}")
var tecentAuth = await tecentIntl("/v2/auth/login", `{"device_info":{"guest_id":null,"lang_type":"en","app_version":"0.1","screen_height":1080,"screen_width":1920,"device_brand":"Google Inc.","device_model":"${email}","network_type":"4g","ram_total":29,"rom_total":29,"cpu_name":"Win32","android_imei":"","ios_idfa":""},"channel_dis":"00000000","channel_info":{"token":"${register.token}","openid":"${register.uid}","account_plat_type":113}}`)
var netorareAuth = await client.post("https://na-community.playerinfinite.com/api/trpc/trpc.wegame_app_global.auth_svr.AuthSvr/LoginByINTL", {
    "body": '{"mappid":10109,"clienttype":903,"login_info":{"game_id":"29093","open_id":"' + tecentAuth.openid + '","token":"' + tecentAuth.token + '","channel_id":113,"channel_info":"{}"}}'
}).json();
var cookie = `uid=${netorareAuth.data.user_id};ticket=${netorareAuth.data.wt}`;
var dupa = (await jupiterRequest(cookie, "ObtainCdkey"));
parentPort.postMessage({ type: "finish", value: dupa.cdkey })