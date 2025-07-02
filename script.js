// Terminal Hacker Ordo Realitas - Profissionalizado
// ================================================

const output = document.getElementById('output');
const input = document.getElementById('command');

// Comandos disponíveis
const comandos = {
  ajuda: `Comandos Disponíveis:\n  ajuda               - Mostra esta mensagem\n  limpar              - Limpa o terminal\n  decodificar morse <msg> - Decodifica código Morse\n  decodificar bin <msg>   - Decodifica Binário\n  decodificar base64 <msg>- Decodifica Base64\n  sobre               - Informações do sistema`,
  sobre: `Terminal de Decodificação da Ordo Realitas\nUtilizado por agentes para interceptar comunicações cifradas.\nVersão 1.3.0 - Protocolo Sangue/Conhecimento`
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
          print(`Bem-vindo, agente ${userAgent}.`, { typewriter: true });
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
  setTimeout(askCodename, 2000);

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

// Efeito typewriter
const typewriterPrint = (text, callback, sound = true) => {
  let i = 0;
  const typingSound = document.getElementById('typing-sound');
  (function type() {
    if (i < text.length) {
      output.innerText += text[i];
      if (sound && text[i] !== '\n') {
        typingSound.currentTime = 0;
        typingSound.play();
      }
      i++;
      setTimeout(type, 18 + Math.random() * 30);
    } else {
      output.innerText += '\n';
      output.scrollTop = output.scrollHeight;
      if (callback) callback();
    }
  })();
};

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
if (themeButtons[0]) themeButtons[0].classList.add('active');

// Sons
const errorSound = document.getElementById('error-sound');
const successSound = document.getElementById('success-sound');
const alertSound = new Audio('sounds/alert.mp3');

// Impressão no terminal
const print = (text, options = {}) => {
  if (options.typewriter) {
    typewriterPrint(text, options.callback, options.sound !== false);
  } else {
    output.innerText += text + '\n';
    output.scrollTop = output.scrollHeight;
  }
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

// Nomes de agentes fictícios
const agentNames = [
  'Specter', 'Ghost', 'Cipher', 'Oráculo', 'Vigil', 'Echo', 'Shade', 'Zero', 'Nômade', 'Sentinela'
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

// Simulação de conexão
const fakeConnect = ip => {
  if (!lastScanHosts.length) {
    print('Nenhum host encontrado. Use escanear antes de conectar.', {typewriter: true});
    errorSound.currentTime = 0;
    errorSound.play();
    return;
  }
  const found = lastScanHosts.find(h => h.ip === ip);
  if (found) {
    print(`Conectando ao host ${ip}...`, {typewriter: true});
    animatedProgress('Estabelecendo conexão', 900, () => {
      print('Acesso concedido.', {typewriter: true});
      showAccessMsg('ACESSO CONCEDIDO');
      successSound.currentTime = 0;
      successSound.play();
      shakeTerminal();
      agentProfile.connections++;
      agentProfile.lastHost = ip;
      lastCommand = 'conectar';
    });
  } else {
    print(`Host ${ip} não encontrado no último escaneamento.`, {typewriter: true});
    showAccessMsg('ACESSO NEGADO', true);
    errorSound.currentTime = 0;
    errorSound.play();
    shakeTerminal();
    output.classList.add('flash-error');
    setTimeout(() => output.classList.remove('flash-error'), 900);
  }
};

// Exibe logs fictícios
const showLogs = () => {
  const logsCommon = [
    '[2025-07-02 22:13] ALERTA: Atividade incomum detectada no host 192.168.1.13',
    '[2025-07-02 22:15] Mensagem interceptada: "O ritual começa à meia-noite"',
    '[2025-07-02 22:17] Sinal desconhecido decodificado: "Σκοτεινή Πύλη"',
    '[2025-07-02 22:20] Acesso root concedido ao agente Specter',
    '[2025-07-02 22:22] LOG: Protocolo Sangue/Conhecimento ativado.'
  ];
  const logsRare = [
    '[2025-07-02 22:23] ALERTA: Anomalia detectada no host 10.10.10.10',
    '[2025-07-02 22:24] Mensagem oculta: "A chave está no símbolo do infinito"',
    '[2025-07-02 22:25] LOG: Acesso não autorizado detectado.'
  ];
  let logs = logsCommon.slice();
  if (Math.random() < 0.25) logs.push(logsRare[Math.floor(Math.random()*logsRare.length)]);
  print('Exibindo logs recentes...\n' + logs.join('\n'), {typewriter: true});
  successSound.currentTime = 0;
  successSound.play();
  lastCommand = 'logs';
};

// Simulação de descriptografia
const fakeDecrypt = msg => {
  animatedProgress('Descriptografando', 900, () => {
    print('Mensagem decifrada: "' + (msg || 'A verdade está nos símbolos.') + '"', {typewriter: true});
    successSound.currentTime = 0;
    successSound.play();
    lastCommand = 'descriptografar';
  });
};

// Simulação de invasão
const fakeHack = () => {
  print('Iniciando ataque...', {typewriter: true});
  glitchEffect();
  setTimeout(() => {
    const fail = Math.random() < 0.18;
    if (fail) {
      print('Ataque detectado! Firewall bloqueou a ação.', {typewriter: true});
      showAccessMsg('FIREWALL BLOQUEOU', true);
      errorSound.currentTime = 0;
      errorSound.play();
      shakeTerminal();
      lastCommand = 'invadir-falha';
    } else {
      print('Bypass de firewall... OK\nInjetando payload... OK\nAcesso root obtido!', {typewriter: true});
      successSound.currentTime = 0;
      successSound.play();
      glitchEffect();
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100vw';
      flash.style.height = '100vh';
      flash.style.background = 'radial-gradient(circle, #33ff33cc 0%, #000 80%)';
      flash.style.opacity = '0.18';
      flash.style.zIndex = '1001';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 350);
      shakeTerminal();
      agentProfile.hacks++;
      lastCommand = 'invadir';
    }
  }, 1500);
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
  intrusionAlert.style.display = 'block';
  staticSound.currentTime = 0;
  staticSound.play();
  setTimeout(() => {
    intrusionAlert.style.display = 'none';
    staticSound.pause();
  }, 1800);
}

// Função para simular entrada de dados secretos
function showDataStream(lines = 8) {
  let container = document.getElementById('data-stream');
  if (!container) {
    container = document.createElement('div');
    container.id = 'data-stream';
    container.className = 'data-stream';
    document.body.appendChild(container);
  }
  for (let i = 0; i < lines; i++) {
    const line = document.createElement('div');
    line.className = 'data-stream-line';
    line.textContent =
      Math.random().toString(36).substring(2, 18) +
      '  ' + Math.random().toString(36).substring(2, 10);
    container.appendChild(line);
    setTimeout(() => line.remove(), 1200);
  }
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
    showDataStream(16);
    print('VOCÊ DESCOBRIU O SEGREDO DA ORDO REALITAS!');
    blinkLed('yellow');
    setTimeout(() => {
      print('A verdade está além do véu...');
      blinkLed('green');
    }, 1200);
    return;
  }

  switch (base) {
    case 'limpar':
      clearTerminal();
      lastCommand = 'limpar';
      break;
    case 'ajuda':
      print(comandos.ajuda + `\nComandos extras:\nescanear, conectar <ip>, logs, descriptografar <msg>, invadir, tema <nome>, desligar, quem, dica, codinome <nome>`, {typewriter: true});
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
        print('Tipos disponíveis: morse, bin, base64', {typewriter: true});
        break;
      }
      if (type === 'morse') {
        animatedDecode('morse', content, decodeMorse);
      } else if (type === 'bin') {
        animatedDecode('binário', content, decodeBinary);
      } else if (type === 'base64') {
        animatedDecode('base64', content, atob);
      } else {
        print('Erro: Tipo de decodificação desconhecido.', {typewriter: true});
        output.classList.add('flash-error');
        setTimeout(() => output.classList.remove('flash-error'), 900);
        print('Tipos disponíveis: morse, bin, base64', {typewriter: true});
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

// Destaque do prompt
input.addEventListener('focus', () => {
  document.querySelector('.prompt').classList.add('active');
});
input.addEventListener('blur', () => {
  document.querySelector('.prompt').classList.remove('active');
});

// Entrada de comandos
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    print(`$ ${input.value}`);
    handleCommand(input.value);
    input.value = '';
  }
});

// Mensagem inicial
setTimeout(() => {
  print('Terminal Hacker da Ordo Realitas Iniciado. Digite "ajuda" para comandos.', {typewriter: true});
}, 300);
