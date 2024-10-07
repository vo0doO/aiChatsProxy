var proxy = "";

var urls = [
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
  "https://rutracker.org"
];

var tasks = urls.map((url) => {
  return { url: url, proxy: proxy };
});

function changeProxy(tasks) {
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

  setOnAuthListener(tasks[0].proxy);
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

setOnAuthListener();
changeProxy(tasks);
