var proxy = "";

var urls = [
  // copilot
  "https://copilot.microsoft.com/",
  // gemini
  "https://gemini.google.com/",
  // chathpt
  "https://chatgpt.com/",
  "https://ab.chatgpt.com/",
  "https://chat.openai.com",
  "https://labs.openai.com",
  "https://platform.openai.com",
  "https://auth0.openai.com",
  "https://auth.openai.com",
  "https://api.openai.com",
  "https://myip.ru",
  "https://cdn.oaistatic.com",
  "https://openaiapi-site.azureedge.net/public-assets/d/aed59725be/manifest.json",
  "https://files.oaiusercontent.com/",
  // swagger
  "https://swagger.io/",
  // medium
  "https://alex-ber.medium.com/",
  // ebay
  "https://www.ebay.com/",
  // rutracker
  "https://rutracker.org",
  // 2ip.ru
  "https://2ip.ru"
];

var tasks = urls.map((url) => {
  return { url: url, proxy: proxy };
});

function enableProxy(tasks) {
  script = "function FindProxyForURL(url, host) {\n";

  for (var task of tasks) {
    proxy = new URL(task.proxy);
    url = new URL(task.url);
    var part =
      `  if (host == '${url.hostname}')\n` +
      `    return 'PROXY ${proxy.hostname}:${proxy.port}';\n`;
    script += part;
  }

  proxy = new URL(proxy);

  script += "  return 'DIRECT';\n" + "}";

  var config = {
    mode: "pac_script",
    pacScript: {
      data: script,
    },
  };

  chrome.proxy.settings.set(
    {
      value: config,
      scope: "regular",
    },
    function () { }
  );

  chrome.proxy.settings.get(
    {
      incognito: false,
    },
    function (config) {
      console.log(config);
    }
  );
}

function setOnAuthListener() {
  chrome.webRequest.onAuthRequired.addListener(
    function callbackFn(details, cb) {
      console.log(details.challenger.host);
      var task = tasks.filter(
        (task) => new URL(task.proxy).hostname == details.challenger.host
      )[0];
      var proxy = new URL(task.proxy);
      cb({
        authCredentials: {
          username: proxy.username,
          password: proxy.password,
        },
      });
    },
    {
      urls: ["<all_urls>"],
    },
    ["asyncBlocking"]
  );
}

function disableProxy() {
  try {
    let config = {
      mode: "direct",
    };
    setProxySettings(config);
    return;
  } catch (error) {
    throw error;
  }
}

function getProxySettings() {
  return chrome.proxy.settings.get(
    {
      incognito: false,
    },
    (config) => {
      console.log(`Получен конфиг ${JSON.stringify(config)}`)
      return config;
    }
  );
}

function setProxySettings(config) {
  return chrome.proxy.settings.set({
    value: config,
    scope: "regular"
  }, () => {
    console.log(`Настройки прокси успешно установлены на ${JSON.stringify(config)}`)
  }
  )
}

function redirectToProxyman() {
  const proxymanHost = "192.168.0.164";
  const proxymanPort = "9090";
  try {
    const script = `
    function FindProxyForURL(url, host) {
      return 'PROXY ${proxymanHost}:${proxymanPort}; DIRECT';
    }
  `;

    const config = {
      mode: "pac_script",
      pacScript: {
        data: script,
      },
    };

    setProxySettings(config);
    console.log(`Трафик принудительно перенаправлен на Proxyman (${proxymanHost}:${proxymanPort}).`);
  }
  catch (e) {
    console.error(`ОШИБКА перенаправления на Proxyman ${e}.`)
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "enable":
      setOnAuthListener();
      enableProxy(tasks);
      break;
    case "disable":
      chrome.webRequest.onAuthRequired.removeListener();
      disableProxy();
      break;
    case "redirectToProxyman":
      chrome.webRequest.onAuthRequired.removeListener();
      redirectToProxyman();
      break;
    default:
      console.warn("Unknown message action:", message.action);
  }
});

setOnAuthListener()