// TODO: make this a proper addon

extend = (term) => {
  term.currentLine = "";
  term.user = "guest";
  term.host = "embedding-node";
  term.cwd = "~";
  term.sep = ":";
  term._promptChar = "$";
  term.history = [];
  term.historyCursor = -1;
  term.pos = () => term._core.buffer.x - term._promptRawText().length - 1;
  term._promptRawText = () => {
    // Use shorter prompt on small screens
    if (term.cols < 55) {
      return `$ `;
    }
    return `${term.user}${term.sep}${term.host} ${term.cwd} $`;
  };
  term.deepLink = window.location.hash.replace("#", "").split("-").join(" ");

  term.promptText = () => {
    var text = term._promptRawText();
    
    // Only apply colors if we're using the full prompt
    if (term.cols >= 55) {
      text = text
        .replace(term.user, colorText(term.user, "user"))
        .replace(term.sep, colorText(term.sep, ""))
        .replace(term.host, colorText(term.host, ""))
        .replace(term.cwd, colorText(term.cwd, "hyperlink"))
        .replace(term._promptChar, colorText(term._promptChar, "prompt"));
    } else {
      // Just color the $ for small screens
      text = text.replace("$", colorText("$", "prompt"));
    }
    return text;
  };

  term.timer = (ms) => new Promise((res) => setTimeout(res, ms));

  term.dottedPrint = async (phrase, n, newline = true) => {
    term.write(phrase);

    for (let i = 0; i < n; i++) {
      await term.delayPrint(".", 1000);
    }
    if (newline) {
      term.write("\r\n");
    }
  };

  term.progressBar = async (t, msg) => {
    var r;

    if (msg) {
      term.write(msg);
    }
    term.write("\r\n[");

    for (let i = 0; i < term.cols / 2; i = i + 1) {
      r = Math.round((Math.random() * t) / 20);
      t = t - r;
      await term.delayPrint("█", r);
    }
    term.write("]\r\n");
  };

  term.delayPrint = async (str, t) => {
    await term.timer(t);
    term.write(str);
  };

  term.delayStylePrint = async (str, t, wrap) => {
    await term.timer(t);
    term.stylePrint(str, wrap);
  };

  term.prompt = (prefix = "\r\n", suffix = " ") => {
    term.write(`${prefix}${term.promptText()}${suffix}`);
  };

  term.clearCurrentLine = (goToEndofHistory = false) => {
    term.write("\x1b[2K\r");
    term.prompt("", " ");
    term.currentLine = "";
    if (goToEndofHistory) {
      term.historyCursor = -1;
      term.scrollToBottom();
    }
  };

  term.setCurrentLine = (newLine, preserveCursor = false) => {
    const length = term.currentLine.length;
    term.clearCurrentLine();
    term.currentLine = newLine;
    term.write(newLine);
    if (preserveCursor) {
      term.write("\x1b[D".repeat(length - term.pos()));
    }
  };

  term.stylePrint = (text, wrap = true) => {
    // Hyperlinks
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urlMatches = text.matchAll(urlRegex);
    let allowWrapping = true;
    for (match of urlMatches) {
      allowWrapping = match[0].length < 76;
      text = text.replace(match[0], colorText(match[0], "hyperlink"));
    }

    // Text Wrap
    if (allowWrapping && wrap) {
      text = _wordWrap(text, Math.min(term.cols, 76));
    }

    // Commands
    const cmds = Object.keys(commands);
    for (cmd of cmds) {
      const cmdMatches = text.matchAll(`%${cmd}%`);
      for (match of cmdMatches) {
        text = text.replace(match[0], colorText(cmd, "command"));
      }
    }

    term.writeln(text);
  };

  term.printArt = (id) => {
    if (term.cols >= 55) {
      term.writeln(`\r\n${getArt(id)}\r\n`);
    }
  };

  term.printLogoType = () => {
    if (term.cols >= 75) {
      term.writeln(LOGO_TYPE);
    } else if (term.cols >= 30) {
      term.writeln(NARROW_LOGO_TYPE);
    } else {
      term.writeln("[Embedding VC]\r\n");
    }
  };

  term.openURL = (url, newWindow = true) => {
    term.stylePrint(`Opening ${url}`);
    if (term._initialized) {
      console.log(newWindow);
      if (newWindow) {
        window.open(url, "_blank");
      } else {
        window.location.href = url;
      }
    }
  };

  term.displayURL = (url) => {
    term.stylePrint(colorText(url, "hyperlink"));
  };

  term.command = (line) => {
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1, parts.length);
    const fn = commands[cmd];
    if (typeof fn === "undefined") {
      term.stylePrint(`Command not found: ${cmd}. Try 'help' to get started.`);
    } else {
      return fn(args);
    }
  };

  term.resizeListener = () => {
    term._initialized = false;
    term.init(term.user, true);
    term.runDeepLink();
    for (c of term.history) {
      term.prompt("\r\n", ` ${c}\r\n`);
      term.command(c);
    }
    term.prompt();
    term.scrollToBottom();
    term._initialized = true;
  };

  term.init = (user = "guest", preserveHistory = false) => {
    fitAddon.fit();
    preloadASCIIArt();
    preloadFiles();
    term.reset();
    term.printLogoType();
    term.stylePrint(
      "Welcome to the Embedding VC terminal. Embedding is an early-stage VC (venture capital && vibe coding) firm backing the future of AI.",
    );
    term.stylePrint(
      `\r\nType ${colorText("help", "command")} to get started, or type ${colorText("exit", "command")} to switch to the web version.`,
      false,
    );

    // Add when have new job opening
    // term.stylePrint(
    //   `\r\nOpen jobs detected. Type ${colorText("jobs", "command")} for more info.`,
    //   false,
    // );

    term.user = user;
    if (!preserveHistory) {
      term.history = [];
    }
    term.focus();
  };

  term.runDeepLink = () => {
    if (term.deepLink != "") {
      term.command(term.deepLink);
    }
  };
};

// https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
// TODO: This doesn't work well at detecting newline
function _wordWrap(str, maxWidth) {
  var newLineStr = "\r\n";
  done = false;
  res = "";
  while (str.length > maxWidth) {
    found = false;
    // Inserts new line at first whitespace of the line
    for (i = maxWidth - 1; i >= 0; i--) {
      if (_testWhite(str.charAt(i))) {
        res = res + [str.slice(0, i), newLineStr].join("");
        str = str.slice(i + 1);
        found = true;
        break;
      }
    }
    // Inserts new line at maxWidth position, the word is too long to wrap
    if (!found) {
      res += [str.slice(0, maxWidth), newLineStr].join("");
      str = str.slice(maxWidth);
    }
  }
  return res + str;
}

function _testWhite(x) {
  var white = new RegExp(/^\s$/);
  return white.test(x.charAt(0));
}
