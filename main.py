import requests, os, httpx, json, random, string, time, datetime, urllib3
from keyauth import *
import hashlib

appId = 'a0ca7921668f7d18c096ad85011589fd'
globalSigKey = '0d88135dd851f81f9601e477b261a137'

urlParams = f"""?account_plat_type=113&app_id={appId}&lang_type=en&os=3&source=32&channelid=113&conn=0&gameid=29093&sdk_version=2.0"""
headers: {
        "content-type": "application/json",
        "Referer": "https://www.toweroffantasy-global.com/",
        "User-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
        }

def getchecksum():
    path = os.path.basename(__file__)
    if not os.path.exists(path):
        path = path[:-2] + "exe"
    md5_hash = hashlib.md5()
    a_file = open(path, "rb")
    content = a_file.read()
    md5_hash.update(content)
    digest = md5_hash.hexdigest()
    return digest

KeyAuth = api(
    "nitrogen",
    "4ZybA005nM",
    "2f6c2959285b8da2eb3745a1a92dc913ad237499aab840c45cc0ae8530fbc570", 
    "1.0",
    getchecksum()
)

def getProxy():
    proxieslist = open('proxies.txt').read().splitlines()
    proxies = {"http" : "http://" + random.choice(proxieslist)}

    return proxies

def randomMail():
    return f"""{random.choices((string.ascii_lowercase + string.digits), k=10)}@guilded.lol"""

def awaitMail(mailbox):
    response = requests.get("https://asari.gay/api/v1/emails/" + mail, proxies=getProxy())
    return response.text

def jupiterRequest(cookie, endpoint):
    return requests.get("https://www.jupiterlauncher.com/api/v1/fleet.platform.game.GameCommunity/" + endpoint, {
        json: {
            cookies: cookie
        },
    }).json()

def getHash(endpoint, body):
    site = "https://grupahakerskapiotr.us/cock.php" 
    return requests.post(site, headers={'Content-Type': 'application/x-www-form-urlencoded'}, data={'sus': endpoint,'amogus': body,'morbius': KeyAuth.nigga()}).text

def tecentIntl(endpoint, requestBody):
    json = requests.get(f"https://aws-na.intlgame.com{endpoint}{urlParams}&sig={getHash(endpoint, requestBody)}", proxies=getProxy())
    if json.text != 0:
        return f"[{endpoint}] err {json}: {json.text}"
    return json.text

def faketecentIntl(endpoint):
    requestBody = {"verify_code":"12345","account": randomMail() ,"account_type":1,"password":"73b6be1ed6682a64b82b086aab3c9ff5"}
    json = requests.post(f"https://aws-na.intlgame.com{endpoint}{urlParams}&sig={getHash(endpoint, requestBody)}", proxies=getProxy())
    if json.text != 0:
        return f"[{endpoint}] err {json}: {json.text}"
    return json.text

def fakeRegisterz():
    fakeRegister = faketecentIntl("/account/register")
    if fakeRegister != 2114:
        print(fakeRegister)

fakeRegisterz()

# def registerfr():
#    email = randomMail()
#    tecentIntl("/account/sendcode", f"""{"account":"" + email + "","account_type":1,"code_type":0}""")
#
#    code = awaitMail(email)
#
#    register = tecentIntl("/account/register", f"""{"verify_code":"" + code + "","account":"" + email + "","account_type":1,"password":"73b6be1ed6682a64b82b086aab3c9ff5"}""")
