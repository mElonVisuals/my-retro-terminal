import { useState, useEffect, useRef } from 'react';

const commands = {
  help: {
    output: [
      'MLVS-OS COMMAND REFERENCE',
      '-----------------------',
      'help     - Show this help menu',
      'about    - System information',
      'clear    - Clear terminal',
      'contact  - Contact administrator',
      'theme    - Change terminal color',
      'banner   - Display system banner',
      'sudo     - Administrator access',
      '',
      'Press ↑/↓ for command history',
      ''
    ]
  },
  about: {
    output: [
      'RETROSH TERMINAL v1.0',
      '-------------------',
      'Retro-styled terminal interface',
      'Built with React.js',
      'Simulated CRT display effects',
      '',
      '© 2025 RETROSH',
      'ALL RIGHTS RESERVED',
      ''
    ]
  },
  contact: {
    output: [
      'SYSTEM ADMINISTRATOR',
      '-------------------',
      'Email: #',
      'BBS: #',
      'FTP: #',
      '',
      'For emergency access:',
      'Dial: #',
      ''
    ]
  },
  sudo: {
    output: [
      '┌─[ACCESS DENIED]─┐',
      '│                 │',
      '│ INSUFFICIENT    │',
      '│ PRIVILEGES      │',
      '│                 │',
      '└─────────────────┘',
      ''
    ]
  },
banner: {
  output: [
    '╔════════════════════════════════════════════╗',
    '║ ██████╗ ███████╗████████╗██████╗  ██████╗ ║',
    '║ ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗║',
    '║ ██████╔╝█████╗     ██║   ██████╔╝██║   ██║║',
    '║ ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║║',
    '║ ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝║',
    '║ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ║',
    '╠════════════════════════════════════════════╣',
    '║         RETROSH TERMINAL EMULATOR          ║',
    '║               v2.1 (2025)                 ║',
    '╚════════════════════════════════════════════╝',
    ''
  ],
  effect: 'typewriter'
}};

const themes = {
  green: { text: 'text-green-400', border: 'border-green-400', glow: 'glow-green' },
  amber: { text: 'text-amber-400', border: 'border-amber-400', glow: 'glow-amber' },
  blue: { text: 'text-blue-400', border: 'border-blue-400', glow: 'glow-blue' },
  red: { text: 'text-red-400', border: 'border-red-400', glow: 'glow-red' }
};

const Terminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('green');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll and focus
  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    inputRef.current?.focus();
  }, [history]);

  // Initial messages
  useEffect(() => {
    executeCommand('banner', false);
    executeCommand('help', false);
  }, []);

  // Command execution
  const executeCommand = (cmd, addToHistory = true) => {
    if (cmd.startsWith('theme ')) {
      const newTheme = cmd.split(' ')[1];
      if (themes[newTheme]) {
        setTheme(newTheme);
        addOutput(`Terminal theme changed to ${newTheme}`);
      } else {
        addOutput(`Invalid theme. Available: ${Object.keys(themes).join(', ')}`);
      }
      return;
    }

    if (commands[cmd]) {
      addOutput(commands[cmd].output, addToHistory);
    } else if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd) {
      addOutput(`Command not found: ${cmd}`);
    }
  };

  // Add output with typing effect
  const addOutput = (lines, addToHistory = true) => {
    if (Array.isArray(lines)) {
      if (addToHistory) {
        setHistory(prev => [...prev, { type: 'input', content: `> ${input}` }]);
      }
      
      setIsTyping(true);
      let currentLine = 0;
      let currentChar = 0;
      const output = [];

      const typeLine = () => {
        if (currentLine < lines.length) {
          if (currentChar < lines[currentLine].length) {
            output[currentLine] = (output[currentLine] || '') + lines[currentLine].charAt(currentChar);
            currentChar++;
            setHistory(prev => [...prev.slice(0, -1), { type: 'output', content: output.join('\n') }]);
            setTimeout(typeLine, 10);
          } else {
            output[currentLine] = lines[currentLine];
            currentLine++;
            currentChar = 0;
            if (currentLine < lines.length) {
              output.push('');
            }
            setTimeout(typeLine, 50);
          }
        } else {
          setIsTyping(false);
        }
      };

      typeLine();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    const cmd = input.toLowerCase().trim();
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    executeCommand(cmd);
    setInput('');
  };

  // Command history navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && cmdHistory.length > 0) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(cmdHistory[cmdHistory.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : cmdHistory[cmdHistory.length - 1 - newIndex]);
    }
  };

  return (
    <div 
      ref={terminalRef}
      className={`terminal-container ${themes[theme].border} ${themes[theme].glow} w-full max-w-3xl h-96 bg-black bg-opacity-90 rounded p-4 overflow-y-auto relative crt-effect`}
    >
      {/* Terminal noise overlay */}
      <div className="noise-overlay"></div>
      
      {/* Command history */}
      <div className={`terminal-content ${themes[theme].text} font-mono text-sm leading-tight space-y-1`}>
        {history.map((item, i) => (
          <div 
            key={i} 
            className={item.type === 'input' ? 'font-bold' : ''}
          >
            {item.content}
          </div>
        ))}
      </div>
      
      {/* Input line */}
      <form onSubmit={handleSubmit} className="flex items-center mt-2">
        <span className={`prompt ${themes[theme].text} font-bold mr-2`}>⇢</span>
        <input
          ref={inputRef}
          type="text"
          className={`terminal-input ${themes[theme].text} bg-transparent outline-none flex-1 caret-transparent`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          spellCheck="false"
          autoComplete="off"
        />
        <span className={`cursor ${themes[theme].text} ${isTyping ? 'opacity-50' : 'animate-pulse'} ml-1`}>█</span>
      </form>
    </div>
  );
};

export default Terminal;