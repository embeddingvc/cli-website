const whoisEmbedding = "Embedding VC is an early stage venture firm in Silicon Valley to back AI startups, particularly those focused on introducing AI-native applications, business models or organization made possible by AI, as well as DevTools & Infrastructure stacks that facilitate Generative AI development. All our investors are current and former builders and operators. We believe that we are at the onset of a new computing super cycle, fundamentally driven by AI innovations. Moreover, our passion lies in empowering founders to achieve success — it just feels good. Try %whois% and one of roger, tom, jianing, jerry, or nelson to learn more about our team.";
const timeUnit = 1000; // useful for development, set to 10 to run faster, set to 1000 for production
let killed = false;

const commands = {
  help: function() {
    const maxCmdLength = Math.max(...Object.keys(help).map(x => x.length));
    Object.entries(help).forEach(function(kv) {
      const cmd = kv[0];
      const desc = kv[1];
      if (term.cols >= 80) {
        const rightPad = maxCmdLength - cmd.length + 2;
        const sep = " ".repeat(rightPad);
        term.stylePrint(`${cmd}${sep}${desc}`);
      } else {
        if (cmd != 'help') { // skip second leading newline
          term.writeln("");
        }
        term.stylePrint(cmd);
        term.stylePrint(desc);
      }
    })
  },

  team: function() {
    const people = Object.keys(team);
    term.stylePrint("Learn more about a team member - usage: %whois% name\r\n");
    for (p of people) {
      const person = team[p];
      const tabs = p.length > 8 ? "\t" : "\t\t";
      const sep = term.cols >= 80 ? tabs : "\r\n";
      term.stylePrint(`${person["name"]} (${p})${sep}${person["title"]}`);
      if (term.cols < 80 && p != people[people.length - 1]) {
        term.writeln("");
      }
    }    
  },

  whois: function(args) {
    const name = args[0];
    const people = Object.keys(team);

    if (!name) {
      term.stylePrint("%whois%: Learn about the firm, or an investor - usage:\r\n");
      term.stylePrint("%whois% embedding");
      for (p of people) {
        term.stylePrint(`%whois% ${p}`);
      }
    } else if (name == "embedding") {
      const description = whoisEmbedding;
      term.printArt("embedding-square");
      term.stylePrint(description);
    } else if (Object.keys(team).includes(name)) {
      const person = team[name];
      term.printArt(name);
      term.stylePrint(`\r\n${person["name"]}, ${person["title"]}`);
      term.stylePrint(`${person["linkedin"]}\r\n`);
      term.stylePrint(person["description"]);
    } else {
      term.stylePrint(`User ${name || ''} not found. Try:\r\n`);
      term.stylePrint("%whois% embedding");
      for (p of people) {
        term.stylePrint(`%whois% ${p}`);
      }
    }
  },

  portfolio: function(args) {
    const filter = args[0] || "all";
    term.stylePrint("Learn more about a portfolio company - usage: %whatis% name\r\n");
    const companies = Object.keys(portfolio);

    let filteredCompanies = companies.sort();
  
    // Filter companies based on argument
    if (filter.toLowerCase() === "early") {
      filteredCompanies = companies.filter(c => 
        ["Pre-Seed", "Seed", "Angel"].includes(portfolio[c]["stage"])
      );
    } else if (filter.toLowerCase() === "late") {
      filteredCompanies = companies.filter(c => 
        !["Pre-Seed", "Seed", "Angel"].includes(portfolio[c]["stage"])
      );
    }

    for (c of filteredCompanies) {
      const data = portfolio[c];
      const tabs = c.length > 8 ? "\t" : "\t\t";
      const sep = term.cols >= 80 ? tabs : "\r\n";
      term.stylePrint(`%whatis% ${c}${sep}${data["url"]}`);
      if (term.cols < 80 && c != filteredCompanies[filteredCompanies.length - 1]) {
        term.writeln("");
      }
    }
  },

  whatis: function(args) {
    const name = (args[0] || "");
    if (!name) {
      const companies = Object.keys(portfolio);
      term.stylePrint("%whatis%: Learn about a portfolio company - usage:\r\n");
      for (c of companies.sort()) {
        const data = portfolio[c];
        const tabs = c.length > 8 ? "\t" : "\t\t";
        const sep = term.cols >= 80 ? tabs : "\r\n";
        term.stylePrint(`%whatis% ${c}${sep}${data["url"]}`);
        if (term.cols < 80 && c != companies[companies.length - 1]) {
          term.writeln("");
        }
      }
    } else if (!portfolio[name]) {
      term.stylePrint(`Portfolio company ${name} not found. Should we talk to them? Email us: investors@embedding.vc`);
    } else {
      const company = portfolio[name];
      term.cols >= 60 ? term.printArt(name) : term.writeln("");
      term.stylePrint(company["name"] + "\t" + company["url"]);
      term.stylePrint("");
      term.stylePrint(company["description"]);
      if (company["status"] && company["status"] != "Active") {
        term.stylePrint("");
        term.stylePrint(`Company Status: ${company["status"]}`);
      }
      if (company["news"]) {
        term.stylePrint("");
        term.stylePrint(`Latest News: ${company["news"]}`);
      }
      if (company["memo"]) {
        term.stylePrint("");
        term.stylePrint(`Investment Memo: ${company["memo"]}`);
      }
      if (company["demo"]) {
        term.stylePrint("");
        term.stylePrint(`Try it with command: %${name}%`);
      }
      if (company["git"]) {
        term.stylePrint("");
        term.stylePrint(`OSS Github: ${company["git"]}`);
      }
    }
  },

  // github: function() {
  //   term.displayURL("https://github.com/embeddingvc");
  // },

  // agm: function() {
  //   term.openURL("http://annualmeeting.root.vc");
  // },

  // test: function() {
  //   term.openURL("https://www.reddit.com/r/ChatGPT/comments/1i3qnuy/match_made_in_heaven/#lightbox");
  // },

  email: function() {
    term.command("pine");
  },

  linkedin: function() {
    term.openURL("https://www.linkedin.com/company/embeddingvc/", true); 
  },

  substack: function() {
    term.openURL("https://embeddingvc.substack.com/", true); 
  },

  newsletter: function() {
    term.openURL("https://embedding.beehiiv.com/", true); 
  },

  // twitter: function() {
  //   term.displayURL("https://twitter.com/rootvc");
  //   term.displayURL("https://twitter.com/machinepix");
  // },

  other: function() {
    term.stylePrint("Yeah, I didn't literally mean %other%. I mean try some Linux commands");
  },

  echo: function(args) {
    const message = args.join(" ");
    term.stylePrint(message);
  },

  say: function(args) {
    const message = args.join(" ");
    term.stylePrint(`(Robot voice): ${message}`);
  },

  pwd: function() {
    term.stylePrint("/" + term.cwd.replaceAll("~", `home/${term.user}`));
  },

  ls: function() {
    term.stylePrint(_filesHere().join("   "));
  },

  // I am so, so sorry for this code.
  cd: function(args) {
    let dir = args[0] || "~";
    if (dir != "/") {
      // strip trailing slash
      dir = dir.replace(/\/$/, "");
    }

    switch (dir) {
      case "~":
        term.cwd = "~";
        break;
      case "..":
        if (term.cwd == "~") {
          term.command("cd /home");
        } else if (["home", "bin"].includes(term.cwd)) {
          term.command("cd /");
        }
        break;
      case "../..":
      case "../../..":
      case "../../../..":
      case "/":
        term.cwd = "/";
        break;
      case "home":
        if (term.cwd == "/") {
          term.command("cd /home");
        } else {
          term.stylePrint(`You do not have permission to access this directory`);
        }
        break;
      case "/home":
        term.cwd = "home";
        break;
      case "guest":
      case "root":
        if (term.cwd == "home") {
          if (term.user == dir) {
            term.command("cd ~");
          } else {
            term.stylePrint(`You do not have permission to access this directory`);
          }
        } else {
          term.stylePrint(`No such directory: ${dir}`);
        }
        break;
      case "../home/avidan":
      case "../home/kane":
      case "../home/chrissy":
      case "../home/lee":
      case "../home/emily":
      case "../home/laelah":
        if (term.cwd == "~" || term.cwd == "bin") {
          term.command(`cd ${dir.split("/")[2]}`);
        } else {
          term.stylePrint(`No such directory: ${dir}`);
        }
        break;
      case "/home/avidan":
      case "/home/kane":
      case "/home/chrissy":
      case "/home/lee":
      case "/home/emily":
      case "/home/laelah":
      case "avidan":
      case "kane":
      case "chrissy":
      case "lee":
      case "emily":
      case "laelah":
        term.stylePrint(`You do not have permission to access this directory`);
        break;
      case "/bin":
        term.cwd = "bin";
        break;
      case "bin":
        if (term.cwd == "/") {
          term.cwd = "bin";
        } else {
          term.stylePrint(`No such directory: ${dir}`);
        }
        break;
      case ".":
        break;
      default:
        term.stylePrint(`No such directory: ${dir}`);
        break;
    }
  },

  zsh: function() {
    term.init(term.user);
  },

  cat: function(args) {
    const filename = args[0];

    if (_filesHere().includes(filename)) {
      term.writeln(getFileContents(filename));
    } else {
      term.stylePrint(`No such file: ${filename}`);
    }
    if (filename == "id_rsa") {
      term.openURL("https://www.reddit.com/r/ChatGPT/comments/1i3qnuy/match_made_in_heaven/#lightbox");
    }
  },

  grep: function(args) {
    const q = args[0];
    const filename = args[1];

    if (filename == "id_rsa") {
      term.openURL("https://www.reddit.com/r/ChatGPT/comments/1i3qnuy/match_made_in_heaven/#lightbox");
    }

    if (!q || !filename) {
      term.stylePrint("usage: %grep% [pattern] [filename]");
      return;
    }

    if (_filesHere().includes(filename)) {
      var file = getFileContents(filename);
      const matches = file.matchAll(q);
      for (match of matches) {
        file = file.replaceAll(match[0], colorText(match[0], "files"));
      }
      term.writeln(file);
    } else {
      term.stylePrint(`No such file or directory: ${filename}`);
    }
  },

  finger: function(args) {
    const user = args[0];

    switch (user) {
      case 'guest':
        term.stylePrint("Login: guest            Name: Guest");
        term.stylePrint("Directory: /home/guest  Shell: /bin/zsh");
        break;
      case 'root':
        term.stylePrint("Login: root             Name: That's Us!");
        term.stylePrint("Directory: /home/root   Shell: /bin/zsh");
        break;
      case 'avidan':
      case 'kane':
      case 'chrissy':
      case 'lee':
      case 'emily':
      case 'laelah':
        term.stylePrint(`Login: ${user}   Name: ${team[user]["name"]}`);
        term.stylePrint(`Directory: /home/${user}   Shell: /bin/zsh`);
        break;
      default:
        term.stylePrint(user ? `%finger%: ${user}: no such user` : "usage: %finger% [user]");
        break;
    }
  },

  groups: function(args) {
    const user = args[0];

    switch (user) {
      case 'guest':
        term.stylePrint("guest lps founders engineers investors");
        break;
      case 'root':
        term.stylePrint("wheel investors engineers deep tech firms");
        break;
      case 'avidan':
        term.stylePrint("wheel investors engineers managingpartner handypersons tinkers agtech foodtech foodies coffeesnobs");
        break;
      case 'kane':
        term.stylePrint("wheel investors engineers partners tinkerers cad motorcyclists gearheads machinepix sportshooters gamers");
        break;
      case 'chrissy':
        term.stylePrint("wheel investors engineers partners electrical manufacturing ecad wearables healthtech gearheads automotive sportshooters");
        break;
      case 'lee':
        term.stylePrint("wheel investors engineers partners software devtools data ai+ml gamers winesnobs");
        break;
      case 'emily':
        term.stylePrint("wheel investors engineers principals mechanical space automotive winesnobs");
        break;
      case 'laelah':
        term.stylePrint("wheel admin operations miracleworkers gamers");
        break;
      default:
        term.stylePrint(user ? `%groups%: ${user}: no such user` : "usage: %groups% [user]");
        break;
    }
  },

  gzip: function() {
    term.stylePrint("What are you going to do with a zip file on a fake terminal, seriously?");
  },

  free: function() {
    term.stylePrint("Honestly, our memory isn't what it used to be.");
  },

  tail: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  less: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  head: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  open: function(args) {
    if (!args.length) {
      term.stylePrint("%open%: open a file - usage:\r\n");
      term.stylePrint("%open% test.htm");
    } else if (args[0].split(".")[0] == "test" && args[0].split(".")[1] == "htm") {
      term.openURL("https://www.reddit.com/r/ChatGPT/comments/1i3qnuy/match_made_in_heaven/#lightbox");
    } else if (args[0].split(".")[1] == "htm") {
      term.openURL(`./${args[0]}`, false);
    } else if (args.join(" ") == "the pod bay doors") {
      term.stylePrint("I'm sorry Dave, I'm afraid I can't do that.");
    } else {
      term.command(`cat ${args.join(" ")}`);
    }
  },

  more: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  emacs: function() {
    term.stylePrint("%emacs% not installed. try: %vi%");
  },

  vim: function() {
    term.stylePrint("%vim% not installed. try: %emacs%");
  },

  vi: function() {
    term.stylePrint("%vi% not installed. try: %emacs%");
  },

  pico: function() {
    term.stylePrint("%pico% not installed. try: %vi% or %emacs%");
  },

  nano: function() {
    term.stylePrint("%nano% not installed. try: %vi% or %emacs%");
  },

  pine: function() {
    term.openURL("mailto:information@embedding.vc");
  },

  curl: function(args) {
    term.stylePrint(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource ${args[0]}. Use a real terminal.`);
  },

  ftp: function(args) {
    term.command(`curl ${args.join(" ")}`);
  },

  ssh: function(args) {
    term.command(`curl ${args.join(" ")}`);
  },

  sftp: function(args) {
    term.command(`curl ${args.join(" ")}`);
  },

  scp: function(args) {
    term.stylePrint(`████████████ Request Blocked: The ███████████ Policy disallows reading the ██████ resource ${args[0]}.`);
  },

  rm: function() {
    term.stylePrint("I'm sorry, I'm afraid I can't do that.");
  },

  mkdir: function() {
    term.stylePrint("Come on, don't mess with our immaculate file system.");
  },

  alias: function() {
    term.stylePrint("Just call me HAL.");
  },

  df: function() {
    term.stylePrint("Nice try. Just get a Dropbox.");
  },

  kill: function(args) {
    if (args && args.slice(-1) == 337) {
      killed = true;
      term.stylePrint("Embedding VC GPT-10 model training disabled.");
    } else {
      term.stylePrint("You can't kill me!");
    }
  },

  killall: function(args) {
    term.command(`kill ${args.join(" ")}`);
  },

  locate: function() {
    term.stylePrint("Embedding VC");
    term.stylePrint("1300 El Camino Real Suite 100");
    term.stylePrint("Menlo Park, CA 94025");
  },

  history: function() {
    term.history.forEach((element, index) => {
      term.stylePrint(`${1000 + index}  ${element}`);
    })
  },

  find: function(args) {
    const file = args[0];
    if (Object.keys(_FILES).includes(file)) {
      term.stylePrint(_FULL_PATHS[file]);
    } else {
      term.stylePrint(`%find%: ${file}: No such file or directory`);
    }
  },

  fdisk: function() {
    term.command("rm");
  },

  chown: function() {
    term.stylePrint("You do not have permission to %chown%");
  },

  mv: function(args) {
    const src = args[0];

    if (_filesHere().includes(src)) {
      term.stylePrint(`You do not have permission to move file ${src}`);
    } else {
      term.stylePrint(`%mv%: ${src}: No such file or directory`);
    }
  },

  cp: function(args) {
    const src = args[0];

    if (_filesHere().includes(src)) {
      term.stylePrint(`You do not have permission to copy file ${src}`);
    } else {
      term.stylePrint(`%cp%: ${src}: No such file or directory`);
    }
  },

  touch: function() {
    term.stylePrint("You can't %touch% this");
  },

  sudo: function(args) {
    if (term.user == "root") {
      term.command(args.join(" "));
    }
    else {
      term.stylePrint(`${colorText(term.user, "user")} is not in the sudoers file. This incident will be reported`);
    }
  },

  su: function(args) {
    user = args[0] || "root";

    if (user == "root" || user == "guest") {
      term.user = user;
      term.command("cd ~");
    } else {
      term.stylePrint("su: Sorry");
    }
  },

  quit: function() {
    term.command("exit");
  },

  stop: function() {
    term.command("exit");
  },

  whoami: function() {
    term.stylePrint(term.user);
  },

  passwd: function() {
    term.stylePrint("Wow. Maybe don't enter your password into a sketchy web-based term.command prompt?");
  },

  man: function(args) {
    term.command(`tldr ${args}`);
  },

  ping: function() {
    term.stylePrint("pong");
  },

  ps: function() {
    term.stylePrint("PID TTY       TIME CMD");
    term.stylePrint("424 ttys00 0:00.33 %-zsh%");
    term.stylePrint("158 ttys01 0:09.70 %/bin/npm start%");
    term.stylePrint("767 ttys02 0:00.02 %/bin/sh%");
    if (!killed) {
      term.stylePrint("337 ttys03 0:13.37 %/bin/cgminer -o pwn.d%");
    }
  },

  uname: function(args) {
    switch (args[0]) {
      case "-a":
        term.stylePrint("EmbeddingNode embedding-node 0.0.1 EmbeddingNode Kernel Version 0.0.1 embed:xnu-31415.926.5~3/RELEASE_X86_64 x86_64");
        break;
      case "-mrs":
        term.stylePrint("EmbeddingNode 0.0.1 x86_64");
        break;
      default:
        term.stylePrint("EmbeddingNode");
    }
  },

  top: function() {
    term.command("ps");
  },

  exit: function() {
    // term.openURL("https://www.embedding.vc", false);  // false means it will replace the current page
    commands.supersite();
  },

  clear: function() {
    term.init();
  },

  zed: function() {
    term.stylePrint("Coming soon! ;)");
  },

  ge: function() {
    term.command("great_expectations");
  },

  great_expectations: function() {
    term.command("superconductive");
  },

  privacy: function() {
    term.command("privacy_dynamics");
  },

  eval: function(args) {
    term.stylePrint("please instead build a webstore with macros. in the meantime, the result is: " + eval(args.join(" ")));
  },

  // jobs: function() {
  //   term.stylePrint(`[1]   Running                 investor &`);
  //   term.stylePrint("\r\nUse %fg% [id] to see details of a job.")
  //   term.stylePrint("Yes, we know that's not exactly how %jobs% works in Unix, but close enough.");
  // },

  // bg: function(args) {
  //   term.stylePrint(`Sorry. If you want to background one of these jobs, you'll need to help us fill it. Try %fg% ${args} instead.`);
  // },

  // fg: function(args) {
  //   const job = jobs[args];

  //   if (job) {
  //     job.map(line => term.stylePrint(line));
  //     term.stylePrint(`\r\n%apply% ${args} to apply!`);
  //   } else {
  //     term.stylePrint(`job id ${args} not found.`);
  //   }
  // },

  // apply: function(args) {
  //   if (args == 1) {
  //     term.stylePrint("If you think you'd enjoy working here, apply by hitting the following endpoint:");
  //     term.stylePrint("\r\nhttps://hooks.attio.com/w/1d456d59-a7ac-4211-ac1d-fac612f7f491/5fc14931-0124-4121-b281-1dbfb64dceb2\r\n");
  //     term.stylePrint(`with a ${colorText("POST", "command")} request containing a json object with 4 keys (use a real terminal):`);
  //     term.stylePrint(`\r\n{`);
  //     term.stylePrint(`\t${colorText("name", "command")}: [your name]`);
  //     term.stylePrint(`\t${colorText("email", "command")}: [your email]`);
  //     term.stylePrint(`\t${colorText("linkedin", "command")}: [your linkedin profile url]`);
  //     term.stylePrint(`\t${colorText("notes", "command")}: [(optional) anything else you'd like to share?]`);
  //     term.stylePrint(`}`);
  //   } else if (!args || args == "") {
  //     term.stylePrint("Please provide a job id. Use %jobs% to list all current jobs.");
  //   } else {
  //     term.stylePrint(`Job id ${args[0]} not found. Use %jobs% to list all current jobs.`)
  //   }
  // }
}

// Add commands for company demos
for (kv of Object.entries(portfolio)) {
  const key = kv[0];
  const val = kv[1];

  if (val["demo"]) {
    commands[key] = () => term.displayURL(val["demo"]);
  }
}

function _filesHere() {
  return _DIRS[term.cwd].filter((e) => e != 'README.md' || term.user == "root");
}

// Add a new command to open the supersite
commands.supersite = function() {
  // First clear the current terminal display
  term.clear();
  
  // Create a full-page iframe to embed the external site
  const iframe = document.createElement('iframe');
  iframe.src = 'https://embedding.super.site/';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  
  // Add a way to return to the terminal (positioned at top center)
  const returnButton = document.createElement('button');
  returnButton.innerText = 'Return to Terminal';
  returnButton.style.position = 'fixed';
  returnButton.style.top = '10px';
  returnButton.style.left = '50%';
  returnButton.style.transform = 'translateX(-50%)'; // Center horizontally
  returnButton.style.zIndex = '10000';
  returnButton.style.padding = '8px 15px';
  returnButton.style.background = '#333';
  returnButton.style.color = '#fff';
  returnButton.style.border = 'none';
  returnButton.style.borderRadius = '3px';
  returnButton.style.cursor = 'pointer';
  returnButton.style.fontFamily = 'Arial, sans-serif';
  returnButton.style.fontSize = '14px';
  returnButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  
  returnButton.onclick = function() {
    document.body.removeChild(iframe);
    document.body.removeChild(returnButton);
    
    // Initialize the terminal
    term.init(term.user);
    
    // Explicitly show the prompt
    term.prompt();
    
    // Make sure the terminal has focus
    term.focus();
  };
  
  document.body.appendChild(iframe);
  document.body.appendChild(returnButton);
};
