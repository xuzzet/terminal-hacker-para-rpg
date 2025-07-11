// Terminal - Ordo Realitas 
// ================================================

const output = document.getElementById('output');
const input = document.getElementById('command');

// Comandos disponíveis
const comandos = {
  ajuda: `Comandos Disponíveis:\n  ajuda               - Mostra esta mensagem\n  limpar              - Limpa o terminal\n  decodificar <tipo> <msg> - Decodifica uma mensagem cifrada\n    Tipos: morse, bin, base64, hex, rot13, atbash, cesar\n  sobre               - Informações do sistema\n  escanear            - Escaneia hosts\n  conectar <ip>       - Conecta a um host\n  logs                - Mostra logs\n  descriptografar <msg> - Descriptografa mensagem\n  invadir             - Invade host conectado\n  tema <nome>         - Troca o tema\n  desligar            - Desliga o terminal\n  quem                - Mostra perfil do agente\n  dica                - Dica contextual\n  codinome <nome>     - Altera codinome\n  conversa            - Log de conversa dos agentes\n  ls                  - Lista arquivos\n  cat <arquivo>       - Mostra conteúdo de arquivo\n  criar <arq> <txt>   - Cria arquivo\n  rm <arquivo>        - Remove arquivo\n  editar <arq> <txt>  - Edita arquivo\n  mv <arq> <novo>     - Renomeia arquivo\n  grep <txt>          - Busca texto em arquivos`,
  sobre: `Terminal de Decodificação da Ordo Realitas\nUtilizado por agentes para interceptar comunicações cifradas.\nVersão 1.3.0 - Protocolo Reconhecimento/Infiltraçao`
};

// Elementos principais
const bootScreen = document.getElementById('boot-screen');
const terminal = document.getElementById('terminal');
const bootSound = document.getElementById('boot-sound');
const ambientMusic = document.getElementById('ambient-music');

// Estado do agente
let userAgent = null;
let failCount = 0;
let blocked = false;
let blockTimeout = null;
let lastScanHosts = [];
let lastCommand = null;
let agentProfile = { codename: null, connections: 0, hacks: 0, lastHost: null };

// Solicita codinome do agente
function askCodename() {
  terminal.style.display = 'none';
  bootScreen.style.display = '';
  bootScreen.style.opacity = 1;
  document.querySelector('.boot-text').innerHTML =
    'Escolha seu codinome de agente:<br>' +
    '<input id="codename-input" maxlength="16" style="background:#000;color:#33ff33;border:1px solid #33ff33;font-family:monospace;font-size:1.2em;padding:4px;" autofocus><br>' +
    '<button id="codename-btn" style="margin-top:10px;background:#222;color:#33ff33;border:1px solid #33ff33;font-family:monospace;cursor:pointer;">Entrar</button>';
  setTimeout(() => {
    const inputCodename = document.getElementById('codename-input');
    const btn = document.getElementById('codename-btn');
    btn.onclick = () => {
      if (inputCodename.value.trim().length > 1) {
        userAgent = inputCodename.value.trim();
        bootScreen.style.opacity = 0;
        setTimeout(() => {
          bootScreen.style.display = 'none';
          terminal.style.display = '';
          input.disabled = false;
          input.value = '';
          input.focus();
          print(`Bem-vindo, agente ${userAgent}.`, { typewriter: true });
          setTimeout(() => {
            print('Terminal - Ordo Realitas Iniciado. Digite "ajuda" para comandos.', {typewriter: true});
          }, 900);
        }, 1000);
      }
    };
    inputCodename.addEventListener('keydown', e => {
      if (e.key === 'Enter') btn.click();
    });
    inputCodename.focus();
  }, 200);
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  bootSound.volume = 0.5;
  bootSound.play();

  // Boot animado
  const bootLines = [
    'Iniciando sistema Ordo Realitas...',
    'Verificando protocolos de segurança...',
    'Carregando módulos principais...',
    'Sincronizando banco de dados oculto...',
    '[OK] Rede segura estabelecida.',
    '[OK] Criptografia de canal ativada.',
    '[ALERTA] Sinais residuais detectados. Análise em andamento...',
    'Inicializando interface neural...',
    'Aguardando autenticação do agente...'
  ];
  const bootLog = document.getElementById('boot-log');
  if (bootLog) {
    bootLog.innerHTML = '';
    let idx = 0;
    function showNextBootLine() {
      if (idx < bootLines.length) {
        const line = document.createElement('span');
        line.className = 'boot-line';
        bootLog.appendChild(line);
        let i = 0;
        function typeChar() {
          if (i < bootLines[idx].length) {
            line.textContent += bootLines[idx][i];
            if (bootLines[idx][i].trim() !== '') {
              bootSound.currentTime = 0.01;
              bootSound.play();
            }
            i++;
            setTimeout(typeChar, 12 + Math.random() * 30);
          } else {
            bootLog.appendChild(document.createElement('br'));
            idx++;
            setTimeout(showNextBootLine, 320 + Math.random() * 200);
          }
        }
        typeChar();
      } else {
        // Mostra o cursor ao final
        const blink = document.createElement('span');
        blink.className = 'boot-blink';
        blink.textContent = '█';
        bootLog.appendChild(blink);
        setTimeout(askCodename, 900);
      }
    }
    showNextBootLine();
  } else {
    setTimeout(askCodename, 2000);
  }

  input.focus();

  // Overlays visuais
  if (!document.getElementById('visual-noise')) {
    const noise = document.createElement('div');
    noise.id = 'visual-noise';
    document.body.appendChild(noise);
  }
  if (!document.getElementById('scanlines')) {
    const scan = document.createElement('div');
    scan.id = 'scanlines';
    document.body.appendChild(scan);
  }
});

// Garante que o event listener do input só é adicionado uma vez
if (!window.__terminalInputListenerAdded) {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !input.disabled) {
      handleCommand(input.value);
      input.value = '';
    }
  });
  window.__terminalInputListenerAdded = true;
}

// Garante foco no input ao clicar em qualquer área do terminal
terminal.addEventListener('mousedown', e => {
  if (e.target === terminal || e.target === output) {
    input.focus();
  }
});

// Efeito typewriter
const typewriterPrint = (text, callback, sound = true) => {
  // Usa graphemes para suportar acentos, emojis, etc.
  const chars = Array.from(text);
  let i = 0;
  const typingSound = document.getElementById('typing-sound');
  function type() {
    if (i < chars.length) {
      if (chars[i] === '\n') {
        output.innerHTML += '<br>';
      } else {
        output.innerHTML += chars[i];
        if (sound && chars[i] !== '\n' && chars[i].trim() !== '') {
          typingSound.currentTime = 0;
          typingSound.play();
        }
      }
      i++;
      setTimeout(type, 18 + Math.random() * 30);
    } else {
      output.innerHTML += '<br>';
      output.scrollTop = output.scrollHeight;
      if (callback) callback();
    }
  }
  type();
};

// Função auxiliar para imprimir uma linha com efeito typewriter, respeitando acentos e quebras de linha
function printLineTypewriter(text, cb) {
  const lineDiv = document.createElement('div');
  output.appendChild(lineDiv);
  const chars = Array.from(text);
  let i = 0;
  const typingSound = document.getElementById('typing-sound');
  function type() {
    if (i < chars.length) {
      if (chars[i] === '\n') {
        lineDiv.innerHTML += '<br>';
      } else {
        lineDiv.innerHTML += chars[i];
        if (chars[i] !== '\n' && chars[i].trim() !== '') {
          typingSound.currentTime = 0;
          typingSound.play();
        }
      }
      i++;
      output.scrollTop = output.scrollHeight; // Scroll automático
      setTimeout(type, 18 + Math.random() * 30);
    } else {
      output.scrollTop = output.scrollHeight; // Garante scroll ao final
      if (cb) cb();
    }
  }
  type();
}

// Cursor piscante
const blinkingCursor = document.getElementById('blinking-cursor');
setInterval(() => {
  blinkingCursor.style.visibility = (document.activeElement === input) ? 'visible' : 'hidden';
}, 400);

// Efeito glitch
const glitchEffect = () => {
  output.classList.add('glitch');
  setTimeout(() => output.classList.remove('glitch'), 300);
};
setInterval(() => { if (Math.random() < 0.04) glitchEffect(); }, 2000);

// Troca de tema
const themeButtons = document.querySelectorAll('#theme-switcher button');
themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.className = 'theme-' + btn.dataset.theme;
    themeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
// Garante apenas um botão ativo
function setActiveThemeButton(theme) {
  themeButtons.forEach(b => b.classList.remove('active'));
  const btn = Array.from(themeButtons).find(b => b.dataset.theme === theme);
  if (btn) btn.classList.add('active');
}
if (themeButtons[0]) themeButtons[0].classList.add('active');

// Sons
const errorSound = document.getElementById('error-sound');
const successSound = document.getElementById('success-sound');
const alertSound = new Audio('sounds/alert.mp3');

// ===== SISTEMA DE IMPRESSÃO TYPEWRITER EM FILA =====
let typewriterQueue = [];
let typewriterActive = false;

function processTypewriterQueue() {
  if (typewriterActive || typewriterQueue.length === 0) return;
  typewriterActive = true;
  const { text, callback, sound } = typewriterQueue.shift();
  typewriterPrint(text, () => {
    typewriterActive = false;
    if (callback) callback();
    processTypewriterQueue();
  }, sound);
}

// Substitui print para usar fila se typewriter
const print = (text, options = {}) => {
  if (options.typewriter) {
    typewriterQueue.push({ text, callback: options.callback, sound: options.sound !== false });
    processTypewriterQueue();
  } else {
    // Usa innerHTML para preservar quebras de linha e acentos
    output.innerHTML += text.replace(/\n/g, '<br>') + '<br>';
    output.scrollTop = output.scrollHeight;
  }
  limitOutputLines();
};

const clearTerminal = () => { output.innerText = ''; };

// Decodificadores
const decodeMorse = text => {
  const morseMap = {
    '.-': 'A','-...': 'B','-.-.': 'C','-..': 'D','.': 'E','..-.': 'F',
    '--.': 'G','....': 'H','..': 'I','.---': 'J','-.-': 'K','.-..': 'L',
    '--': 'M','-.': 'N','---': 'O','.--.': 'P','--.-': 'Q','.-.': 'R',
    '...': 'S','-': 'T','..-': 'U','...-': 'V','.--': 'W','-..-': 'X',
    '-.--': 'Y','--..': 'Z','-----': '0','.----': '1','..---': '2',
    '...--': '3','....-': '4','.....': '5','-....': '6','--...': '7',
    '---..': '8','----.': '9'
  };
  return text.trim().split('   ').map(word =>
    word.split(' ').map(char => morseMap[char] || '?').join('')
  ).join(' ');
};
const decodeBinary = text => text.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
const decodeHex = text => {
  return text.replace(/\b([0-9a-fA-F]{2})\b/g, (m) => String.fromCharCode(parseInt(m, 16)));
};
const decodeRot13 = text => {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
};
const decodeAtbash = text => {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
  });
};
const decodeCesar = (text, shift = 3) => {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
};

// Nomes de agentes fictícios
const agentNames = [
  'Marcos Torres', 'Mabel Oliveira', 'Rodrigo Miranda', 'Zoe Romano', 'Victor Santos'
];
const randomAgent = () => agentNames[Math.floor(Math.random() * agentNames.length)];

// Barra de progresso animada
const animatedProgress = (text, duration, callback) => {
  let progress = 0;
  const steps = 12;
  (function step() {
    let bar = '[' + '='.repeat(progress) + ' '.repeat(steps - progress) + ']';
    output.innerText += '\r' + text + ' ' + bar;
    output.scrollTop = output.scrollHeight;
    progress++;
    if (progress <= steps) {
      setTimeout(step, duration / steps);
    } else if (callback) {
      output.innerText += '\n';
      callback();
    }
  })();
};

// Simulação de escaneamento de hosts
const fakeScan = () => {
  const allHosts = [
    {ip: '192.168.0.2', ports: [22, 80, 443]},
    {ip: '10.0.0.5', ports: [21, 8080]},
    {ip: '172.16.1.10', ports: [3306]},
    {ip: '192.168.1.13', ports: [22, 666, 31337]},
    {ip: '10.10.10.10', ports: [23, 2323]},
    {ip: '172.20.0.7', ports: [8081]},
    {ip: '192.168.100.100', ports: [443, 8443]},
  ];
  lastScanHosts = allHosts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random()*3)+3);
  animatedProgress('Escaneando rede...', 1200, () => {
    let result = '';
    lastScanHosts.forEach(h => {
      result += `Host encontrado: ${h.ip} | Portas abertas: ${h.ports.join(', ')}\n`;
    });
    result += 'Scan finalizado.';
    print(result, {typewriter: true});
    successSound.currentTime = 0;
    successSound.play();
    lastCommand = 'escanear';
  });
};

// Decodificação animada
const animatedDecode = (type, content, decodeFn) => {
  if (!content.trim()) {
    print('Exemplo de uso: decodificar ' + type + ' <mensagem>', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    print('Dica: Tente "decodificar morse ...", "decodificar bin ..." ou "decodificar base64 ..."', {typewriter: true});
    return;
  }
  animatedProgress('Decodificando ' + type + '...', 900, () => {
    let result;
    try {
      result = decodeFn(content);
      if (!result || /[?]/.test(result)) throw new Error('Decodificação incompleta');
      print('Resultado: ' + result, {typewriter: true});
      output.classList.add('glitch');
      setTimeout(() => output.classList.remove('glitch'), 900);
      output.classList.add('flash-success');
      setTimeout(() => output.classList.remove('flash-success'), 900);
    } catch (e) {
      print('Erro: Mensagem inválida ou formato incorreto.', {typewriter: true});
      output.classList.add('flash-error');
      setTimeout(() => output.classList.remove('flash-error'), 900);
      print('Dica: Confira se a mensagem está correta e tente novamente.', {typewriter: true});
    }
  });
};

// Áudio de estática e alerta de intrusão
const staticSound = document.getElementById('static-sound');
const intrusionAlert = document.getElementById('intrusion-alert');

// Função para mostrar alerta de intrusão
function showIntrusionAlert() {
  if (intrusionAlert.style.display === 'block') {
    intrusionAlert.style.display = 'none';
    staticSound.pause();
  }
  intrusionAlert.style.display = 'block';
  staticSound.currentTime = 0;
  staticSound.play();
  setTimeout(() => {
    intrusionAlert.style.display = 'none';
    staticSound.pause();
  }, 1800);
}

// Função para simular entrada de dados secretos (corrigida para remover container)
function showDataStream(lines = 8) {
  let container = document.getElementById('data-stream');
  if (container) container.remove();
  container = document.createElement('div');
  container.id = 'data-stream';
  container.className = 'data-stream';
  document.body.appendChild(container);
  for (let i = 0; i < lines; i++) {
    const line = document.createElement('div');
    line.className = 'data-stream-line';
    line.textContent =
      Math.random().toString(36).substring(2, 18) +
      '  ' + Math.random().toString(36).substring(2, 10);
    container.appendChild(line);
    setTimeout(() => line.remove(), 1200);
  }
  setTimeout(() => container.remove(), 1400);
}

// LEDs piscando conforme eventos
function blinkLed(color) {
  const led = document.querySelector('.led-' + color);
  if (!led) return;
  led.style.filter = 'brightness(3)';
  setTimeout(() => { led.style.filter = ''; }, 400);
}

// Bloqueio com contagem regressiva
function blockCommands() {
  blocked = true;
  let seconds = 6;
  showIntrusionAlert();
  print('Sistema bloqueado por tentativas inválidas. Aguarde...');
  const interval = setInterval(() => {
    print(`Desbloqueando em ${seconds} segundos...`);
    seconds--;
    if (seconds < 0) {
      clearInterval(interval);
      blocked = false;
      failCount = 0;
      print('Sistema desbloqueado. Continue sua missão.');
    }
  }, 1000);
}

// Easter egg: comando oculto "ordo"
function handleCommand(cmd) {
  if (blocked) {
    print('Aguarde o desbloqueio do sistema...', {typewriter: true});
    errorSound.currentTime = 0;
    errorSound.play();
    return;
  }
  const args = cmd.trim().split(' ');
  const base = args[0].toLowerCase();

  if (base === 'ordo') {
    if (window.ordoRunning) return; // Evita múltiplas execuções simultâneas
    window.ordoRunning = true;
    showDataStream(16);
    // Narrativa de investigação do Marcos Torres
    const narrativa = [
      '[LOG DE INVESTIGAÇÃO - AGENTE MARCOS TORRES]',
      '21:41 - Cheguei ao local do ritual. Sinais de atividade recente. O chão está coberto de símbolos estranhos. (16/04)',
      '21:43 - Encontrei vestígios de cera e um círculo desenhado em sangue. O ar está pesado, sensação de ser observado. (16/04)',
      '21:45 - Ouvi sussurros vindos do corredor. Gravei o áudio para análise posterior. Nenhum sinal de Mabel até agora. (16/04)',
      '21:47 - Mensagem cifrada encontrada: "A Fé é a chave. Eles observam." (16/04)',
      '21:49 - Preciso sair. Algo está errado. Encerrando log. (16/04)',
      '...'
    ];
    let idx = 0;
    function nextMsg() {
      if (idx < narrativa.length) {
        printLineTypewriter(narrativa[idx], () => {
          idx++;
          setTimeout(nextMsg, 1200);
        });
      } else {
        blinkLed('yellow');
        setTimeout(() => {
          printLineTypewriter('...', () => {
            blinkLed('green');
            setTimeout(() => {
              printLineTypewriter('...', () => {
                window.ordoRunning = false;
              });
            }, 1200);
          });
        }, 1200);
      }
    }
    nextMsg();
    return;
  }

  switch (base) {
    case 'limpar':
      clearTerminal();
      lastCommand = 'limpar';
      break;
    case 'ajuda':
      print(comandos.ajuda, {typewriter: true});
      successSound.currentTime = 0;
      successSound.play();
      lastCommand = 'ajuda';
      break;
    case 'sobre':
      print(comandos.sobre + (userAgent ? `\nAgente: ${userAgent}\nConexões: ${agentProfile.connections}\nInvasões: ${agentProfile.hacks}\nÚltimo host: ${agentProfile.lastHost || '-'}` : ''), {typewriter: true});
      successSound.currentTime = 0;
      successSound.play();
      lastCommand = 'sobre';
      break;
    case 'decodificar': {
      const type = args[1];
      const content = args.slice(2).join(' ');
      if (!type) {
        print('Exemplo de uso: decodificar morse <mensagem>', {typewriter: true});
        print('Tipos disponíveis: morse, bin, base64, hex, rot13, atbash, cesar', {typewriter: true});
        break;
      }
      if (type === 'morse') {
        animatedDecode('morse', content, decodeMorse);
      } else if (type === 'bin') {
        animatedDecode('binário', content, decodeBinary);
      } else if (type === 'base64') {
        animatedDecode('base64', content, safeAtob);
      } else if (type === 'hex') {
        animatedDecode('hexadecimal', content, decodeHex);
      } else if (type === 'rot13') {
        animatedDecode('rot13', content, decodeRot13);
      } else if (type === 'atbash') {
        animatedDecode('atbash', content, decodeAtbash);
      } else if (type === 'cesar' || type === 'césar') {
        animatedDecode('césar', content, decodeCesar);
      } else {
        print('Erro: Tipo de decodificação desconhecido.', {typewriter: true});
        output.classList.add('flash-error');
        setTimeout(() => output.classList.remove('flash-error'), 900);
        print('Tipos disponíveis: morse, bin, base64, hex, rot13, atbash, cesar', {typewriter: true});
      }
      lastCommand = 'decodificar';
      break;
    }
    case 'escanear':
      fakeScan();
      showDataStream(6);
      blinkLed('yellow');
      break;
    case 'conectar':
      fakeConnect(args[1]);
      blinkLed('green');
      break;
    case 'logs':
      showLogs();
      showDataStream(4);
      break;
    case 'descriptografar':
      fakeDecrypt(args.slice(1).join(' '));
      blinkLed('yellow');
      break;
    case 'invadir':
      fakeHack();
      showDataStream(10);
      blinkLed('red');
      break;
    case 'tema':
      themeByCommand(args[1]);
      break;
    case 'desligar':
      shutdownTerminal();
      break;
    case 'quem':
      print('Agente: ' + (userAgent || randomAgent()) + (userAgent ? `\nConexões: ${agentProfile.connections}\nInvasões: ${agentProfile.hacks}` : ''), {typewriter: true});
      successSound.currentTime = 0;
      successSound.play();
      lastCommand = 'quem';
      break;
    case 'dica': {
      let hint = 'Use ajuda para ver os comandos.';
      if (lastCommand === 'escanear') hint = 'Tente conectar <ip> em um host encontrado.';
      else if (lastCommand === 'conectar') hint = 'Você pode tentar invadir após conectar.';
      else if (lastCommand === 'invadir') hint = 'Verifique os logs para pistas.';
      else if (lastCommand === 'decodificar') hint = 'Experimente decodificar diferentes formatos.';
      else if (lastCommand === 'logs') hint = 'Alguns logs podem conter segredos raros.';
      else if (lastCommand === 'descriptografar') hint = 'Nem toda mensagem é o que parece.';
      else if (lastCommand === 'sobre') hint = 'Personalize seu codinome com codinome <nome>.';
      print('Dica: ' + hint, {typewriter: true});
      successSound.currentTime = 0;
      successSound.play();
      lastCommand = 'dica';
      break;
    }
    case 'codinome':
      setCodename(args.slice(1).join(' '));
      agentProfile.codename = userAgent;
      print('Perfil atualizado.', {typewriter: true});
      lastCommand = 'codinome';
      break;
    case 'conversa':
      showAgentChat();
      lastCommand = 'conversa';
      break;
    case 'ls':
      cmd_ls(args[1]);
      lastCommand = 'ls';
      break;
    case 'cat':
      cmd_cat(args[1]);
      lastCommand = 'cat';
      break;
    case 'rm':
      cmd_rm(args[1], args[2]);
      lastCommand = 'rm';
      break;
    case 'criar':
      cmd_criar(args[1], ...args.slice(2));
      lastCommand = 'criar';
      break;
    case 'editar':
      cmd_editar(args[1], ...args.slice(2));
      lastCommand = 'editar';
      break;
    case 'mv':
      cmd_mv(args[1], args[2]);
      lastCommand = 'mv';
      break;
    case 'grep':
      cmd_grep(args[1]);
      lastCommand = 'grep';
      break;
    default:
      failCount++;
      showIntrusionAlert();
      blinkLed('red');
      showDataStream(5);
      if (failCount >= 3) {
        blockCommands();
        return;
      }
      // Feedback visual animado para erro e pistas falsas
      const fakeHints = [
        'Sinal estranho detectado. Verifique os logs.',
        'Acesso negado. Tente novamente mais tarde.',
        'Mensagem corrompida recebida.',
        'Protocolo desconhecido ativado.'
      ];
      print(fakeHints[Math.floor(Math.random() * fakeHints.length)], {typewriter: true});
      errorSound.currentTime = 0;
      errorSound.play();
      output.classList.add('flash-error');
      setTimeout(() => output.classList.remove('flash-error'), 900);
      lastCommand = 'falha';
  }
}

// Comando de conversa dos agentes
function showAgentChat() {
  const chat = [
    '[LOG INTERNO - ORDO REALITAS - EQUIPE DE SUPORTE ALFA-OURO]',
    '[Canal Privado | Transmissão Segura | 17:42 - Dia 16/04]',
    '',
    '> user_marcos_torres [Líder | Ocultista]',
    'Os novatos chegaram. Sejam gentis. Ou pelo menos... tentem parecer.',
    'Eles vão precisar de rostos amigáveis quando as coisas começarem a ficar estranhas.',
    '',
    '> user.mabel_oliveira [Especialista | Hacker]',
    'Gentil? Sempre. 👼',
    'Exceto quando tentam usar “senha123” no terminal da Ordem.',
    '(Novatos, não façam isso. Sério.)',
    '',
    '> user.victor_santos [Combatente | Brigão]',
    'Se tiver alguma porta trancada, é só me chamar.',
    'Ah, e se alguém tiver uma barra de cereal extra... eu aceito.',
    '',
    '> user.zoe_romano [Especialista | Arte & Negociação]',
    'Bem-vindos.',
    'Se precisarem de ajuda pra lidar com gente difícil — ou arte amaldiçoada — podem me chamar.',
    '(Aparentemente, isso acontece mais do que deveria.)',
    '',
    '> user.rodrigo_miranda [Combatente | Armamentos]',
    'Mantenham a cabeça baixa, os olhos abertos e a calma sempre por último.',
    'Ah... e não apontem nada que não pretendem destruir.',
    '',
    '> user.mabel_oliveira',
    '⚠ Curiosidades que ninguém pediu:',
    '– Marcos anota os sonhos dele em latim.',
    '– Zoe fala seis línguas, mas prefere silêncio.',
    '– Victor uma vez deu um soco num espelho achando que era um portal.',
    '– Rodrigo dorme com um canivete debaixo do travesseiro.',
    '– Eu sou a Mabel. Eu tenho backups de todo mundo. Até de vocês. 😌',
    '',
    '> user.marcos_torres',
    'Esse é o time que vai apoiar vocês nos bastidores.',
    'Nós erramos. Nós aprendemos.',
    'E se vocês caírem… nós vamos estar lá pra levantar vocês.',
    'Às vezes, só ouvir outra voz do outro lado da linha já ajuda.',
    'Boa sorte em Ouro Virgem. A cidade parece pequena, mas os segredos dela são grandes demais.',
    '',
    '[FIM DO LOG]'
  ];
  let idx = 0;
  function nextLine() {
    if (idx < chat.length) {
      printLineTypewriter(chat[idx], () => {
        idx++;
        setTimeout(nextLine, 900);
      });
    }
  }
  nextLine();
}

// Efeito shake
const shakeTerminal = () => {
  const container = document.getElementById('terminal-container');
  container.classList.add('shake');
  setTimeout(() => container.classList.remove('shake'), 300);
};

// Mensagem de acesso
const showAccessMsg = (msg, deny = false) => {
  let el = document.getElementById('access-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'access-msg';
    el.className = 'access-msg';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'access-msg' + (deny ? ' deny' : '');
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 1200);
};

// Atualiza prompt visual do input-line para refletir codinome/host
function updatePromptVisual() {
  const promptEl = document.querySelector('.prompt');
  let promptStr = '$';
  if (userAgent) promptStr = `[${userAgent}`;
  if (agentProfile.lastHost) promptStr += `@${agentProfile.lastHost}`;
  if (userAgent) promptStr += ']$';
  promptEl.textContent = promptStr;
}
input.addEventListener('focus', updatePromptVisual);
input.addEventListener('blur', updatePromptVisual);
setInterval(updatePromptVisual, 2000); // Atualiza periodicamente

// Limita o número de linhas do output para evitar lentidão visual
function limitOutputLines(max = 200) {
  const lines = output.innerText.split('\n');
  if (lines.length > max) {
    output.innerText = lines.slice(lines.length - max).join('\n');
  }
}

// ===== SISTEMA DE ARQUIVOS VIRTUAL =====
const fs = {
  files: {
    'leia-me.txt': 'Bem-vindo ao terminal Ordo Realitas! Use ls para listar arquivos.',
    '.segredo': 'Arquivo oculto. Você não deveria ter encontrado isso tão fácil...'
  },
  exists(name) { return Object.prototype.hasOwnProperty.call(this.files, name); },
  read(name) { return this.exists(name) ? this.files[name] : null; },
  write(name, content) { this.files[name] = content; },
  remove(name) { if (this.exists(name)) delete this.files[name]; },
  list(all = false) {
    return Object.keys(this.files).filter(f => all || !f.startsWith('.'));
  }
};

// ===== COMANDOS DE ARQUIVO =====
function cmd_ls(flag) {
  let all = flag === '-a';
  if (flag && flag !== '-a') {
    print('Flag desconhecida. Use apenas ls ou ls -a para arquivos ocultos.');
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  const files = fs.list(all);
  if (files.length === 0) {
    print('Nenhum arquivo encontrado.');
    if (!all && fs.list(true).length > 0) print('Dica: use ls -a para ver arquivos ocultos.');
  } else print(files.join('\n'));
  if (Math.random() < 0.18) print('[ALERTA] Atividade suspeita detectada em logs recentes.');
}
function cmd_cat(name) {
  if (!name) { print('Uso: cat <arquivo>'); output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900); return; }
  if (!fs.exists(name)) { print('Arquivo não encontrado.'); output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900); return; }
  let conteudo = fs.read(name);
  print(conteudo === undefined ? '' : conteudo);
  if (name.startsWith('secreto_') || name.startsWith('.')) {
    print('Você sente um calafrio ao ler este arquivo. Algo não está certo...');
    if (Math.random() < 0.3) print('Uma interferência estranha ecoa no rádio...');
  }
}
function cmd_rm(name, flag) {
  if (!name) { print('Uso: rm <arquivo>'); output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900); return; }
  if (!fs.exists(name)) { print('Arquivo não encontrado.'); output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900); return; }
  if (name === 'leia-me.txt' && flag !== '-f') {
    print('O sistema hesita. Tem certeza que deseja remover este arquivo? (rm -f leia-me.txt para forçar)');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  fs.remove(name);
  const msgs = [
    'Arquivo removido: ' + name,
    'Remoção concluída.',
    'Arquivo deletado com sucesso.',
    'O arquivo foi apagado dos registros.'
  ];
  print(msgs[Math.floor(Math.random()*msgs.length)]);
  if (Math.random() < 0.15) print('[SISTEMA] Log de remoção registrado.');
}
function cmd_criar(name, ...conteudo) {
  if (!name || !conteudo.length) { print('Uso: criar <arquivo> <conteúdo>'); output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900); return; }
  fs.write(name, conteudo.join(' '));
  const msgs = [
    'Arquivo criado: ' + name,
    'Novo arquivo registrado.',
    'Criação concluída.',
    'Arquivo salvo com sucesso.'
  ];
  print(msgs[Math.floor(Math.random()*msgs.length)]);
  if (name.startsWith('.')) print('Você criou um arquivo oculto. Poucos saberão encontrá-lo.');
}
function cmd_editar(name, ...conteudo) {
  if (!name || !fs.exists(name)) {
    print('Uso: editar <arquivo> <novo_conteúdo>');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  if (!conteudo.length) {
    print('Nada para editar.');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  fs.write(name, conteudo.join(' '));
  const msgs = [
    'Arquivo editado: ' + name,
    'Alteração registrada.',
    'Conteúdo atualizado.',
    'Edição concluída.'
  ];
  print(msgs[Math.floor(Math.random()*msgs.length)]);
  if (Math.random() < 0.12) print('[SISTEMA] Log de edição registrado.');
}
function cmd_mv(oldName, newName) {
  if (!oldName || !newName) {
    print('Uso: mv <arquivo_antigo> <arquivo_novo>');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  if (!fs.exists(oldName)) {
    print('Arquivo não encontrado.');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  if (fs.exists(newName)) {
    print('Já existe um arquivo com esse nome.');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  fs.write(newName, fs.read(oldName));
  fs.remove(oldName);
  print(`Arquivo renomeado para: ${newName}`);
}
function cmd_grep(padrao) {
  if (!padrao) {
    print('Uso: grep <texto>');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  let achou = false;
  fs.list().forEach(name => {
    const conteudo = fs.read(name);
    if (conteudo && conteudo.includes(padrao)) {
      print(`(${name}): ${conteudo}`);
      achou = true;
    }
  });
  if (!achou) {
    print('Nenhum resultado encontrado. Tente outros termos ou investigue arquivos secretos.');
    output.classList.add('flash-error'); setTimeout(() => output.classList.remove('flash-error'), 900);
  }
  else print('DICA: Se encontrar códigos ou mensagens cifradas, use decodificar ou descriptografar.');
}

// ===== INTEGRAÇÃO DOS COMANDOS COM ARQUIVOS =====
// Modifica fakeScan para criar arquivos de hosts
const originalFakeScan = fakeScan;
fakeScan = function() {
  originalFakeScan();
  // Cria arquivos de hosts
  lastScanHosts.forEach(h => {
    fs.write(`host_${h.ip.replace(/\./g,'_')}.txt`, `Host: ${h.ip}\nPortas: ${h.ports.join(', ')}`);
  });
  print('Arquivos de hosts criados com pistas. Use ls/cat para investigar.');
};
// Modifica fakeConnect para criar arquivo de log
const originalFakeConnect = fakeConnect;
fakeConnect = function(ip) {
  originalFakeConnect(ip);
  if (ip && lastScanHosts.some(h => h.ip === ip)) {
    let contexto = 'Conexão estabelecida com ' + ip + ' em 16/04/2025.';
    if (pistasPorHost[ip]) contexto += '\n' + pistasPorHost[ip];
    fs.write(`log_conexao_${ip.replace(/\./g,'_')}.txt`, contexto);
  }
};
// Modifica fakeHack para criar arquivo secreto
const originalFakeHack = fakeHack;
fakeHack = function() {
  if (!agentProfile.lastHost) { originalFakeHack(); return; }
  originalFakeHack();
  let pista = 'Nada encontrado.';
  if (pistasPorHost[agentProfile.lastHost]) pista = 'PISTA: ' + pistasPorHost[agentProfile.lastHost];
  fs.write(`secreto_${agentProfile.lastHost.replace(/\./g,'_')}.txt`, `Dado secreto extraído do host.\n${pista}`);
};
// Modifica showLogs para ler arquivos de log
const originalShowLogs = showLogs;
showLogs = function() {
  const logs = fs.list().filter(f => f.startsWith('log_conexao_'));
  if (logs.length === 0) originalShowLogs();
  else logs.forEach(f => print(`${f}:\n${fs.read(f)}`));
  // Dica extra
  if (logs.length > 0) print('DICA: Use cat, grep ou decodificar para investigar arquivos gerados.');
};

// Função para conectar a um host
function fakeConnect(ip) {
  if (!ip) {
    print('Exemplo de uso: conectar <ip>', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  if (!lastScanHosts.some(h => h.ip === ip)) {
    print('Host não encontrado. Faça um escaneamento primeiro.', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  animatedProgress('Conectando ao host ' + ip + '...', 1000, () => {
    print('Conexão estabelecida com ' + ip, {typewriter: true});
    agentProfile.connections++;
    agentProfile.lastHost = ip;
    showAccessMsg('Acesso concedido!');
    successSound.currentTime = 0;
    successSound.play();
    updatePromptVisual(); // Atualiza prompt imediatamente
  });
}

// Função para descriptografar mensagem (fake)
function fakeDecrypt(msg) {
  if (!msg.trim()) {
    print('Exemplo de uso: descriptografar <mensagem>', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  animatedProgress('Descriptografando...', 900, () => {
    print('Mensagem descriptografada: "A fé é a chave"', {typewriter: true});
    showAccessMsg('Descriptografado!');
    successSound.currentTime = 0;
    successSound.play();
  });
}

// Função para simular invasão
function fakeHack() {
  if (!agentProfile.lastHost) {
    print('Conecte-se a um host antes de invadir.', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  animatedProgress('Invadindo host ' + agentProfile.lastHost + '...', 1200, () => {
    print('Invasão bem-sucedida em ' + agentProfile.lastHost + '!', {typewriter: true});
    agentProfile.hacks++;
    showAccessMsg('Invasão bem-sucedida!');
    successSound.currentTime = 0;
    successSound.play();
    updatePromptVisual(); // Atualiza prompt imediatamente
  });
}

// Função para mostrar logs fictícios
function showLogs() {
  print('[LOGS DO SISTEMA]\n- 21:41: Host 192.168.0.2 acessado em 16/04\n- 21:43: Mensagem cifrada interceptada em 16/04\n- 21:45: Tentativa de invasão detectada em 16/04\n- 21:47: Mensagem descriptografada com sucesso em 16/04', {typewriter: true});
}

// Função para trocar tema via comando
function themeByCommand(theme) {
  if (!theme) {
    print('Temas disponíveis: classico, futurista, retro', {typewriter: true});
    return;
  }
  const t = theme.toLowerCase();
  let found = false;
  if (t === 'classico' || t === 'classic') {
    document.body.className = 'theme-classic';
    setActiveThemeButton('classic');
    found = true;
  } else if (t === 'futurista' || t === 'futuristic') {
    document.body.className = 'theme-futuristic';
    setActiveThemeButton('futuristic');
    found = true;
  } else if (t === 'retro' || t === 'retrô') {
    document.body.className = 'theme-retro';
    setActiveThemeButton('retro');
    found = true;
  }
  if (found) {
    print('Tema alterado para ' + theme, {typewriter: true});
    successSound.currentTime = 0;
    successSound.play();
  } else {
    print('Tema não reconhecido. Temas: classico, futurista, retro', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
  }
}

// Função para desligar o terminal
function shutdownTerminal() {
  print('Desligando terminal...', {typewriter: true});
  setTimeout(() => {
    document.body.innerHTML = `
      <div class="shutdown-screen">
        Terminal desligado.<br>Pressione <span style="color:#fff">F5</span> para reiniciar.<span class="shutdown-blink">█</span>
      </div>
      <div id="visual-noise" aria-hidden="true"></div>
      <div id="scanlines" aria-hidden="true"></div>
    `;
  }, 1200);
}

// Função para definir codinome
function setCodename(nome) {
  if (!nome || nome.trim().length < 2) {
    print('Codinome inválido. Use: codinome <nome>', {typewriter: true});
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
    return;
  }
  userAgent = nome.trim();
  agentProfile.codename = userAgent;
  print('Codinome alterado para ' + userAgent, {typewriter: true});
}

// Corrige decodificação base64 para tratar erros
function safeAtob(str) {
  try {
    return atob(str);
  } catch (e) {
    return '[base64 inválido]';
  }
}

// ================= TESTES DE PADRÃO DE IMPRESSÃO =================
// Comando especial: testar-comandos
function testarComandos() {
  const comandosTest = [
    'ajuda', 'sobre', 'ls', 'ls -a', 'cat leia-me.txt', 'criar teste.txt teste',
    'editar teste.txt novo', 'rm teste.txt', 'mv leia-me.txt novo.txt', 'grep Bem-vindo',
    'escanear', 'conectar 192.168.0.2', 'invadir', 'logs', 'descriptografar mensagem',
    'decodificar morse ...', 'tema classico', 'quem', 'dica', 'codinome Teste', 'conversa'
  ];
  let passed = 0, failed = 0;
  const originalPrint = window.print;
  const originalPrintLineTypewriter = window.printLineTypewriter;
  let printUsed = false, typewriterUsed = false;
  window.print = function(text, options) {
    printUsed = true;
    if (options && options.typewriter) typewriterUsed = true;
    return originalPrint.apply(this, arguments);
  };
  window.printLineTypewriter = function(text, cb) {
    typewriterUsed = true;
    return originalPrintLineTypewriter.apply(this, arguments);
  };
  comandosTest.forEach(cmd => {
    printUsed = false; typewriterUsed = false;
    try {
      handleCommand(cmd);
      if (printUsed || typewriterUsed) {
        passed++;
      } else {
        failed++;
        originalPrint('ERRO: Comando não usou função de impressão padrão: ' + cmd);
      }
    } catch (e) {
      failed++;
      originalPrint('ERRO ao testar comando: ' + cmd + ' -> ' + e.message);
    }
  });
  window.print = originalPrint;
  window.printLineTypewriter = originalPrintLineTypewriter;
  originalPrint(`Testes de comandos finalizados. Passaram: ${passed}, Falharam: ${failed}`);
}
// Permite rodar pelo terminal: "testar-comandos"
const originalHandleCommand = handleCommand;
handleCommand = function(cmd) {
  if (cmd.trim() === 'testar-comandos') {
    testarComandos();
    return;
  }
  originalHandleCommand.apply(this, arguments);
};
// ================= FIM DOS TESTES =================

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !input.disabled) {
    handleCommand(input.value);
    input.value = '';
  }
});

