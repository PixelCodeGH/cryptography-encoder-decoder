// Database of example custom encryption methods
const customExamples = [
    {
        name: "Skip Cipher",
        description: "Encrypts text by taking every Nth character and rearranging them in groups, where N is the key.",
        prompt: "I want to encrypt by skipping characters and rearranging them",
        requiresKey: true,
        keyType: "number",
        encryptFunction: `function encrypt(text, key) {
    const n = parseInt(key) || 2;
    const groups = Array(n).fill('').map(() => []);
    
    // Split text into n groups
    for (let i = 0; i < text.length; i++) {
        groups[i % n].push(text[i]);
    }
    
    // Join all groups
    return groups.flat().join('');
}`,
        decryptFunction: `function decrypt(text, key) {
    const n = parseInt(key) || 2;
    const length = text.length;
    const result = new Array(length);
    let index = 0;
    
    // Calculate group sizes
    const groupSize = Math.ceil(length / n);
    const groups = Array(n).fill(groupSize);
    const remainder = length % n;
    if (remainder) {
        for (let i = remainder; i < n; i++) {
            groups[i]--;
        }
    }
    
    // Reconstruct original text
    let pos = 0;
    for (let size of groups) {
        for (let i = 0; i < size; i++) {
            result[i * n + pos] = text[index++];
        }
        pos++;
    }
    
    return result.join('');
}`
    },
    {
        name: "Word Reverser",
        description: "Reverses each word in the text while maintaining word order and punctuation.",
        prompt: "I want to reverse words but keep their order",
        requiresKey: false,
        keyType: "none",
        encryptFunction: `function encrypt(text) {
    return text.split(/([\\s.,!?]+)/).map(word => {
        // If it's a separator (whitespace/punctuation), keep as is
        if (word.match(/[\\s.,!?]+/)) return word;
        // Otherwise reverse the word
        return word.split('').reverse().join('');
    }).join('');
}`,
        decryptFunction: `function decrypt(text) {
    // Same as encrypt since it's reversible
    return encrypt(text);
}`
    },
    {
        name: "Vowel Replacer",
        description: "Replaces vowels with numbers based on a pattern: a=1, e=2, i=3, o=4, u=5",
        prompt: "I want to replace vowels with numbers",
        requiresKey: false,
        keyType: "none",
        encryptFunction: `function encrypt(text) {
    const vowelMap = { 'a': '1', 'e': '2', 'i': '3', 'o': '4', 'u': '5',
                      'A': '1', 'E': '2', 'I': '3', 'O': '4', 'U': '5' };
    return text.split('').map(char => vowelMap[char] || char).join('');
}`,
        decryptFunction: `function decrypt(text) {
    const numberMap = { '1': 'a', '2': 'e', '3': 'i', '4': 'o', '5': 'u' };
    return text.split('').map(char => numberMap[char] || char).join('');
}`
    },
    {
        name: "Pattern Shifter",
        description: "Shifts characters based on a repeating pattern defined by the key.",
        prompt: "I want to shift letters based on a pattern or key sequence",
        requiresKey: true,
        keyType: "text",
        encryptFunction: `function encrypt(text, key) {
    if (!key) return text;
    const shifts = key.split('').map(k => k.charCodeAt(0) % 26);
    return text.split('').map((char, i) => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            const shift = shifts[i % shifts.length];
            return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
    }).join('');
}`,
        decryptFunction: `function decrypt(text, key) {
    if (!key) return text;
    const shifts = key.split('').map(k => k.charCodeAt(0) % 26);
    return text.split('').map((char, i) => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            const shift = shifts[i % shifts.length];
            return String.fromCharCode(((code - base - shift + 26) % 26) + base);
        }
        return char;
    }).join('');
}`
    },
    {
        name: "Symbol Encoder",
        description: "Encodes text using special symbols and emojis, making it look like a secret code.",
        prompt: "I want to encode text with symbols or emojis",
        requiresKey: false,
        keyType: "none",
        encryptFunction: `function encrypt(text) {
    const symbolMap = {
        'a': '★', 'b': '☆', 'c': '♥', 'd': '♦', 'e': '♣',
        'f': '♠', 'g': '⚡', 'h': '☀', 'i': '☁', 'j': '☂',
        'k': '☃', 'l': '☄', 'm': '☮', 'n': '☯', 'o': '☸',
        'p': '☹', 'q': '☺', 'r': '☻', 's': '☼', 't': '☾',
        'u': '☽', 'v': '♈', 'w': '♉', 'x': '♊', 'y': '♋',
        'z': '♌', ' ': '⭐'
    };
    return text.toLowerCase().split('').map(char => symbolMap[char] || char).join('');
}`,
        decryptFunction: `function decrypt(text) {
    const reverseSymbolMap = {
        '★': 'a', '☆': 'b', '♥': 'c', '♦': 'd', '♣': 'e',
        '♠': 'f', '⚡': 'g', '☀': 'h', '☁': 'i', '☂': 'j',
        '☃': 'k', '☄': 'l', '☮': 'm', '☯': 'n', '☸': 'o',
        '☹': 'p', '☺': 'q', '☻': 'r', '☼': 's', '☾': 't',
        '☽': 'u', '♈': 'v', '♉': 'w', '♊': 'x', '♋': 'y',
        '♌': 'z', '⭐': ' '
    };
    return text.split('').map(char => reverseSymbolMap[char] || char).join('');
}`
    }
];

// Function to find similar methods based on user prompt
function findSimilarMethods(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    return customExamples
        .map(example => ({
            ...example,
            similarity: calculateSimilarity(prompt, example.prompt.toLowerCase())
        }))
        .filter(example => example.similarity > 0.3) // Only return reasonably similar methods
        .sort((a, b) => b.similarity - a.similarity);
}

// Simple similarity calculation (you can make this more sophisticated)
function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    let matches = 0;
    
    for (const word1 of words1) {
        for (const word2 of words2) {
            if (word1.length > 3 && (word2.includes(word1) || word1.includes(word2))) {
                matches++;
            }
        }
    }
    
    return matches / Math.max(words1.length, words2.length);
}

// Export for use in custom.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { customExamples, findSimilarMethods };
} 