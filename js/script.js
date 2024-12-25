// Add at the beginning of the script
const DEFAULT_METHOD = 'caesar';

// Define Morse code mapping once at the top level
const MORSE_CODE = {
    'A': '.-',     'B': '-...',   'C': '-.-.', 
    'D': '-..',    'E': '.',      'F': '..-.',
    'G': '--.',    'H': '....',   'I': '..',
    'J': '.---',   'K': '-.-',    'L': '.-..',
    'M': '--',     'N': '-.',     'O': '---',
    'P': '.--.',   'Q': '--.-',   'R': '.-.',
    'S': '...',    'T': '-',      'U': '..-',
    'V': '...-',   'W': '.--',    'X': '-..-',
    'Y': '-.--',   'Z': '--..',
    '0': '-----',  '1': '.----',  '2': '..---',
    '3': '...--',  '4': '....-',  '5': '.....',
    '6': '-....',  '7': '--...',  '8': '---..',
    '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', 
    '!': '-.-.--', ' ': '/',      "'": '.----.', 
    '"': '.-..-.', '(': '-.--.',  ')': '-.--.-',
    '&': '.-...',  ':': '---...', ';': '-.-.-.',
    '=': '-...-',  '+': '.-.-.',  '-': '-....-',
    '_': '..--.-', '$': '...-..-','@': '.--.-.',
    ' ': '/'
};

// Create reverse mapping for decoding
const REVERSE_MORSE_CODE = Object.fromEntries(
    Object.entries(MORSE_CODE).map(([key, value]) => [value, key])
);

// Encryption method implementations
const encryptionMethods = {
    caesar: {
        encrypt: (text, key) => {
            const shift = parseInt(key) % 26;
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = code >= 65 && code <= 90;
                    const base = isUpperCase ? 65 : 97;
                    return String.fromCharCode(((code - base + shift) % 26) + base);
                }
                return char;
            }).join('');
        },
        decrypt: (text, key) => {
            const shift = (26 - (parseInt(key) % 26)) % 26;
            return encryptionMethods.caesar.encrypt(text, shift);
        },
        generateKey: () => Math.floor(Math.random() * 25) + 1,
        info: {
            name: "Caesar Cipher",
            description: "A simple substitution cipher that shifts each letter in the plaintext by a fixed number of positions in the alphabet.",
            security: "low",
            keyType: "Numeric (1-25)"
        }
    },
    vigenere: {
        encrypt: (text, key) => {
            key = key.toLowerCase().replace(/[^a-z]/g, '');
            if (!key) return text;
            return text.split('').map((char, i) => {
                if (char.match(/[a-z]/i)) {
                    const isUpperCase = char === char.toUpperCase();
                    char = char.toLowerCase();
                    const shift = key[i % key.length].charCodeAt(0) - 97;
                    const newChar = String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
                    return isUpperCase ? newChar.toUpperCase() : newChar;
                }
                return char;
            }).join('');
        },
        decrypt: (text, key) => {
            key = key.toLowerCase().replace(/[^a-z]/g, '');
            if (!key) return text;
            return text.split('').map((char, i) => {
                if (char.match(/[a-z]/i)) {
                    const isUpperCase = char === char.toUpperCase();
                    char = char.toLowerCase();
                    const shift = key[i % key.length].charCodeAt(0) - 97;
                    const newChar = String.fromCharCode(((char.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
                    return isUpperCase ? newChar.toUpperCase() : newChar;
                }
                return char;
            }).join('');
        },
        generateKey: () => {
            const length = Math.floor(Math.random() * 8) + 4;
            return Array.from({ length }, () => 
                String.fromCharCode(Math.floor(Math.random() * 26) + 97)
            ).join('');
        },
        info: {
            name: "Vigenère Cipher",
            description: "A polyalphabetic substitution cipher using a keyword to determine the shift pattern.",
            security: "medium",
            keyType: "Text (letters only)"
        }
    },
    aes: {
        encrypt: (text, key) => {
            try {
                return CryptoJS.AES.encrypt(text, key).toString();
            } catch (e) {
                console.error('AES Encryption Error:', e);
                return 'Encryption Error';
            }
        },
        decrypt: (text, key) => {
            try {
                const bytes = CryptoJS.AES.decrypt(text, key);
                return bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                console.error('AES Decryption Error:', e);
                return 'Decryption Error';
            }
        },
        generateKey: () => CryptoJS.lib.WordArray.random(16).toString(),
        info: {
            name: "AES (Advanced Encryption Standard)",
            description: "A symmetric encryption standard used worldwide for secure data encryption.",
            security: "high",
            keyType: "Any text (recommended: 16+ characters)"
        }
    },
    base64: {
        encrypt: (text) => btoa(text),
        decrypt: (text) => atob(text),
        generateKey: () => null,
        info: {
            name: "Base64",
            description: "A binary-to-text encoding scheme used to represent binary data in ASCII string format.",
            security: "low",
            keyType: "No key required"
        }
    },
    morse: {
        encrypt: (text) => {
            return text
                .toUpperCase()
                .split('')
                .map(char => MORSE_CODE[char] || char)
                .filter(code => code !== undefined)
                .join(' ');
        },
        decrypt: (text) => {
            return text
                .split(' ')
                .map(code => REVERSE_MORSE_CODE[code] || code)
                .join('')
                .trim();
        },
        generateKey: () => null,
        info: {
            name: "Morse Code",
            description: "A method of encoding text characters using dots and dashes. Supports letters, numbers, and common punctuation.",
            security: "low",
            keyType: "No key required"
        }
    },
    binary: {
        encrypt: (text) => {
            return Array.from(new TextEncoder().encode(text))
                .map(byte => byte.toString(2).padStart(8, '0'))
                .join(' ');
        },
        decrypt: (text) => {
            try {
                const bytes = text.split(' ')
                    .map(bin => parseInt(bin, 2))
                    .filter(num => !isNaN(num));
                return new TextDecoder().decode(new Uint8Array(bytes));
            } catch (e) {
                return 'Invalid binary data';
            }
        },
        generateKey: () => null,
        info: {
            name: "Binary",
            description: "Converts text to binary representation using UTF-8 encoding.",
            security: "low",
            keyType: "No key required"
        }
    },
    hex: {
        encrypt: (text) => {
            return Array.from(new TextEncoder().encode(text))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        },
        decrypt: (text) => {
            try {
                const bytes = text.match(/.{1,2}/g)
                    .map(hex => parseInt(hex, 16))
                    .filter(num => !isNaN(num));
                return new TextDecoder().decode(new Uint8Array(bytes));
            } catch (e) {
                return 'Invalid hexadecimal data';
            }
        },
        generateKey: () => null,
        info: {
            name: "Hexadecimal",
            description: "Converts text to hexadecimal representation using UTF-8 encoding.",
            security: "low",
            keyType: "No key required"
        }
    },
    rot13: {
        encrypt: (text) => {
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = code >= 65 && code <= 90;
                    const base = isUpperCase ? 65 : 97;
                    return String.fromCharCode(((code - base + 13) % 26) + base);
                }
                return char;
            }).join('');
        },
        decrypt: (text) => encryptionMethods.rot13.encrypt(text), // ROT13 is its own inverse
        generateKey: () => null,
        info: {
            name: "ROT13",
            description: "A simple letter substitution cipher that replaces each letter with the 13th letter after it.",
            security: "low",
            keyType: "No key required"
        }
    },
    atbash: {
        encrypt: (text) => {
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = code >= 65 && code <= 90;
                    const base = isUpperCase ? 65 : 97;
                    return String.fromCharCode(base + (25 - (code - base)));
                }
                return char;
            }).join('');
        },
        decrypt: (text) => encryptionMethods.atbash.encrypt(text), // Atbash is its own inverse
        generateKey: () => null,
        info: {
            name: "Atbash Cipher",
            description: "A substitution cipher where each letter is replaced with its opposite (A→Z, B→Y, etc).",
            security: "low",
            keyType: "No key required"
        }
    },
    railfence: {
        encrypt: (text, key) => {
            const rails = parseInt(key) || 3;
            if (rails < 2) return text;
            
            const fence = Array(rails).fill('').map(() => []);
            let rail = 0;
            let direction = 1;

            for (let char of text) {
                fence[rail].push(char);
                rail += direction;
                
                if (rail === 0 || rail === rails - 1) {
                    direction = -direction;
                }
            }
            
            return fence.flat().join('');
        },
        decrypt: (text, key) => {
            const rails = parseInt(key) || 3;
            if (rails < 2) return text;
            
            const fence = Array(rails).fill('').map(() => Array(text.length).fill(''));
            let rail = 0;
            let direction = 1;
            
            // Mark positions
            for (let i = 0; i < text.length; i++) {
                fence[rail][i] = '*';
                rail += direction;
                
                if (rail === 0 || rail === rails - 1) {
                    direction = -direction;
                }
            }
            
            // Fill marked positions
            let index = 0;
            for (let i = 0; i < rails; i++) {
                for (let j = 0; j < text.length; j++) {
                    if (fence[i][j] === '*') {
                        fence[i][j] = text[index++];
                    }
                }
            }
            
            // Read off
            let result = '';
            rail = 0;
            direction = 1;
            
            for (let i = 0; i < text.length; i++) {
                result += fence[rail][i];
                rail += direction;
                
                if (rail === 0 || rail === rails - 1) {
                    direction = -direction;
                }
            }
            
            return result;
        },
        generateKey: () => Math.floor(Math.random() * 4) + 2, // 2-5 rails
        info: {
            name: "Rail Fence Cipher",
            description: "A transposition cipher that arranges text in a zigzag pattern on a number of rails.",
            security: "low",
            keyType: "Number (2 or more)"
        }
    },
    reverse: {
        encrypt: (text) => text.split('').reverse().join(''),
        decrypt: (text) => text.split('').reverse().join(''),
        generateKey: () => null,
        info: {
            name: "Reverse Cipher",
            description: "A simple cipher that reverses the input text.",
            security: "low",
            keyType: "No key required"
        }
    }
};

// UI Elements
const elements = {
    methodSelect: document.getElementById('encryption-method'),
    keyInput: document.getElementById('encryption-key'),
    inputText: document.getElementById('input-text'),
    outputText: document.getElementById('output-text'),
    encryptBtn: document.getElementById('encrypt'),
    decryptBtn: document.getElementById('decrypt'),
    generateKeyBtn: document.getElementById('generate-key'),
    copyBtn: document.getElementById('copy'),
    swapBtn: document.getElementById('swap'),
    methodInfo: document.getElementById('method-info'),
    notification: document.getElementById('notification'),
    keyStrength: document.getElementById('key-strength')
};

// Event Listeners
elements.methodSelect.addEventListener('change', updateMethodInfo);
elements.generateKeyBtn.addEventListener('click', generateKey);
elements.encryptBtn.addEventListener('click', () => processText('encrypt'));
elements.decryptBtn.addEventListener('click', () => processText('decrypt'));
elements.copyBtn.addEventListener('click', copyOutput);
elements.swapBtn.addEventListener('click', swapTexts);
elements.keyInput.addEventListener('input', updateKeyStrength);

// Initialize function
function initializeApp() {
    // Set default encryption method if none selected
    if (!elements.methodSelect.value) {
        elements.methodSelect.value = DEFAULT_METHOD;
    }
    
    // Update method info
    updateMethodInfo();
    
    // Show/hide key input based on selected method
    updateKeyInputVisibility();
    
    // Add welcome notification
    showNotification('Welcome to CryptoTools! Select a method to begin.', 'success');
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Add these functions after the event listeners

function updateMethodInfo() {
    const method = encryptionMethods[elements.methodSelect.value];
    if (!method) return;

    const info = method.info;
    elements.methodInfo.innerHTML = `
        <h3>${info.name}</h3>
        <p>${info.description}</p>
        <div class="security-info">
            <div class="security-level">
                <span>Security Level:</span>
                <div class="level-indicator ${info.security}">
                    <span>${info.security.charAt(0).toUpperCase() + info.security.slice(1)}</span>
                </div>
            </div>
            <div class="key-info">
                <span>Key Type:</span>
                <span>${info.keyType}</span>
            </div>
        </div>
    `;
    
    updateKeyInputVisibility();
}

function generateKey() {
    const methodName = elements.methodSelect.value;
    const method = encryptionMethods[methodName];
    
    if (!method) {
        showNotification('Please select an encryption method first!', 'error');
        return;
    }

    const key = method.generateKey();
    if (key !== null) {
        elements.keyInput.value = key;
        updateKeyStrength();
        showNotification(`Key generated: ${key}`, 'success');
    }
}

function processText(action) {
    const methodName = elements.methodSelect.value;
    const method = encryptionMethods[methodName];
    
    if (!method) {
        showNotification('Please select an encryption method!', 'error');
        return;
    }

    const text = elements.inputText.value.trim();
    if (!text) {
        showNotification('Please enter text to process!', 'error');
        return;
    }

    // Check if method requires a key
    const noKeyMethods = ['base64', 'morse', 'binary', 'hex', 'rot13', 'atbash', 'reverse'];
    const key = elements.keyInput.value;

    if (!noKeyMethods.includes(methodName) && !key) {
        showNotification('Please enter an encryption key!', 'error');
        return;
    }

    try {
        const result = method[action](text, key);
        if (result === 'Encryption Error' || result === 'Decryption Error') {
            showNotification(`${action} failed! Please check your input and key.`, 'error');
            return;
        }

        elements.outputText.value = result;
        showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)}ion successful!`, 'success');
    } catch (error) {
        console.error(error);
        showNotification(`${action} failed! ${error.message}`, 'error');
    }
}

function copyOutput() {
    const output = elements.outputText.value;
    if (!output) {
        showNotification('No text to copy!', 'error');
        return;
    }

    navigator.clipboard.writeText(output)
        .then(() => showNotification('Copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy text!', 'error'));
}

function swapTexts() {
    [elements.inputText.value, elements.outputText.value] = 
    [elements.outputText.value, elements.inputText.value];
}

function showNotification(message, type = 'success') {
    const notification = elements.notification;
    notification.querySelector('span').textContent = message;
    notification.style.background = type === 'success' ? 'var(--success-color)' : 'var(--error-color)';
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function updateKeyStrength() {
    const key = elements.keyInput.value;
    const strengthMeter = elements.keyStrength;
    
    if (!key) {
        strengthMeter.classList.add('hidden');
        return;
    }

    let strength = 0;
    if (key.length >= 8) strength += 25;
    if (key.match(/[A-Z]/)) strength += 25;
    if (key.match(/[0-9]/)) strength += 25;
    if (key.match(/[^A-Za-z0-9]/)) strength += 25;

    const meterFill = strengthMeter.querySelector('.meter-fill');
    const strengthText = strengthMeter.querySelector('.strength-text');
    
    meterFill.style.width = `${strength}%`;
    if (strength <= 25) {
        meterFill.style.background = 'var(--error-color)';
        strengthText.textContent = 'Weak';
    } else if (strength <= 50) {
        meterFill.style.background = 'var(--warning-color)';
        strengthText.textContent = 'Fair';
    } else if (strength <= 75) {
        meterFill.style.background = '#60a5fa';
        strengthText.textContent = 'Good';
    } else {
        meterFill.style.background = 'var(--success-color)';
        strengthText.textContent = 'Strong';
    }

    strengthMeter.classList.remove('hidden');
}

function updateKeyInputVisibility() {
    const methodName = elements.methodSelect.value;
    const noKeyMethods = ['base64', 'morse', 'binary', 'hex', 'rot13', 'atbash', 'reverse'];
    
    const keyInput = elements.keyInput.parentElement.parentElement;
    keyInput.style.display = noKeyMethods.includes(methodName) ? 'none' : 'block';
} 