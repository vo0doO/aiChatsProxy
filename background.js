var tasks = [
    // gemini
    {
        url: "https://gemini.google.com/",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    // chathpt
    {
        url: "https://chatgpt.com/",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    {
        url: "https://chat.openai.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    {
        url: "https://labs.openai.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    {
        url: "https://platform.openai.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    {
        url: "https://auth0.openai.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    {
        url: "https://auth.openai.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    },
    {
        url: "https://api.openai.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    }, {
        url: "https://myip.ru",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    }, {
        url: "https://cdn.oaistatic.com",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    }, {
        url: "https://openaiapi-site.azureedge.net/public-assets/d/aed59725be/manifest.json",
        proxy: "http://tcnajmrr:kks63f4wl1oy@102.212.88.162:6159",
    }
]

function changeProxy(tasks) {
    script = "function FindProxyForURL(url, host) {\n"

    for (var task of tasks) {
        proxy = new URL(task.proxy)
        url = new URL(task.url)
        var part =
            `  if (host == '${url.hostname}')\n` +
            `    return 'PROXY ${proxy.hostname}:${proxy.port}';\n`
        script += part
    }

    proxy = new URL(proxy)

    script +=
        "  return 'DIRECT';\n" +
        "}"

    var config = {
        mode: "pac_script",
        pacScript: {
            data: script,
        }
    };

    chrome.proxy.settings.set({
        value: config,
        scope: "regular"
    }, function () { });

    chrome.proxy.settings.get({
        incognito: false
    }, function (config) {
        console.log(config)
    })

    setOnAuthListener(tasks[0].proxy)
}

function setOnAuthListener() {
    chrome.webRequest.onAuthRequired.addListener(
        function callbackFn(details, cb) {
            console.log(details.challenger.host)
            var task = tasks.filter(task => new URL(task.proxy).hostname == details.challenger.host)[0]
            var proxy = new URL(task.proxy)
            cb({
                authCredentials: {
                    username: proxy.username,
                    password: proxy.password
                }
            })
        }, {
        urls: ["<all_urls>"]
    }, ['asyncBlocking']
    );
}

setOnAuthListener()
changeProxy(tasks)