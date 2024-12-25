// UI Elements
const elements = {
    methodForm: document.getElementById('method-form'),
    methodName: document.getElementById('method-name'),
    methodDescription: document.getElementById('method-description'),
    requiresKey: document.getElementById('requires-key'),
    keyType: document.getElementById('key-type'),
    encryptFunction: document.getElementById('encrypt-function'),
    decryptFunction: document.getElementById('decrypt-function'),
    testInput: document.getElementById('test-input'),
    testKey: document.getElementById('test-key'),
    testKeyGroup: document.getElementById('test-key-group'),
    testOutput: document.getElementById('test-output'),
    testEncrypt: document.getElementById('test-encrypt'),
    testDecrypt: document.getElementById('test-decrypt'),
    getCode: document.getElementById('get-code'),
    copyCode: document.getElementById('copy-code'),
    methodsList: document.getElementById('methods-list'),
    codeDisplay: document.getElementById('code-display'),
    implementationCode: document.getElementById('implementation-code'),
    notification: document.getElementById('notification'),
    userPrompt: document.getElementById('user-prompt'),
    findSimilar: document.getElementById('find-similar'),
    suggestions: document.getElementById('suggestions'),
    quickGuide: document.querySelector('.quick-guide')
};

// Event Listeners
elements.methodForm.addEventListener('submit', saveMethod);
elements.requiresKey.addEventListener('change', updateKeyTypeVisibility);
elements.testEncrypt.addEventListener('click', () => testMethod('encrypt'));
elements.testDecrypt.addEventListener('click', () => testMethod('decrypt'));
elements.getCode.addEventListener('click', generateImplementationCode);
elements.copyCode.addEventListener('click', copyImplementationCode);
elements.findSimilar.addEventListener('click', findSimilarEncryptions);
elements.userPrompt.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') findSimilarEncryptions();
});

// Load saved methods and show random suggestions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedMethods();
    findSimilarEncryptions(); // Show random suggestions initially
});

// Functions
function toggleGuide() {
    elements.quickGuide.classList.toggle('collapsed');
    const button = elements.quickGuide.querySelector('button');
    const icon = button.querySelector('i');
    const isCollapsed = elements.quickGuide.classList.contains('collapsed');
    
    button.innerHTML = `<i class="fas fa-chevron-${isCollapsed ? 'down' : 'up'}"></i> ${isCollapsed ? 'Show' : 'Hide'} Guide`;
}

function findSimilarEncryptions() {
    const prompt = elements.userPrompt.value.trim();
    let methodsToShow;
    let headerText;
    let isRandom = false;
    
    if (!prompt) {
        methodsToShow = getRandomExamples(customExamples, 3);
        headerText = '<i class="fas fa-random"></i> Random Suggestions';
        isRandom = true;
    } else {
        methodsToShow = findSimilarMethods(prompt);
        headerText = '<i class="fas fa-search"></i> Search Results';
    }
    
    if (methodsToShow.length === 0) {
        elements.suggestions.innerHTML = `
            <h3 class="suggestions-header">${headerText}</h3>
            <div class="no-results">
                <p>No similar methods found. Try a different description or create a new method.</p>
                <button class="btn-secondary" onclick="findSimilarEncryptions()">
                    <i class="fas fa-random"></i> Show Random Methods
                </button>
            </div>
        `;
    } else {
        elements.suggestions.innerHTML = `
            <h3 class="suggestions-header">${headerText}</h3>
            <div class="suggestions-grid ${isRandom ? 'random' : ''}">
                ${methodsToShow.map(method => `
                    <div class="suggestion-card" onclick="loadSuggestion(${JSON.stringify(method).replace(/"/g, '&quot;')})">
                        <h3>
                            ${method.name}
                            <span class="similarity">
                                ${prompt ? Math.round(method.similarity * 100) + '% match' : 'Random Pick'}
                            </span>
                        </h3>
                        <p>${method.description}</p>
                        <div class="method-details">
                            <span class="key-type">
                                <i class="fas fa-key"></i> 
                                ${method.requiresKey ? `Requires ${method.keyType} key` : 'No key required'}
                            </span>
                        </div>
                        <button class="btn-secondary">
                            <i class="fas fa-plus"></i> Use This Method
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    elements.suggestions.classList.remove('hidden');
}

function loadSuggestion(method) {
    // First, clear the form
    elements.methodForm.reset();
    
    // Then load the new method
    elements.methodName.value = method.name + ' (Custom)';
    elements.methodDescription.value = method.description;
    elements.requiresKey.value = method.requiresKey;
    elements.keyType.value = method.keyType;
    elements.encryptFunction.value = method.encryptFunction;
    elements.decryptFunction.value = method.decryptFunction;
    
    updateKeyTypeVisibility();
    showNotification('Method loaded! You can now test or modify it.');
    
    // Scroll to the method creator
    elements.methodForm.scrollIntoView({ behavior: 'smooth' });
    
    // Add example test text based on the method
    elements.testInput.value = "Hello, World!";
    if (method.requiresKey) {
        elements.testKey.value = method.keyType === 'number' ? '3' : 'test';
    }
}

function saveMethod(event) {
    event.preventDefault();

    // Validate functions
    try {
        validateCustomFunction(elements.encryptFunction.value, 'encrypt');
        validateCustomFunction(elements.decryptFunction.value, 'decrypt');
    } catch (error) {
        showNotification(error.message, 'error');
        return;
    }

    const method = {
        name: elements.methodName.value,
        description: elements.methodDescription.value,
        requiresKey: elements.requiresKey.value === 'true',
        keyType: elements.keyType.value,
        encryptFunction: elements.encryptFunction.value,
        decryptFunction: elements.decryptFunction.value
    };

    // Save to localStorage
    const savedMethods = getSavedMethods();
    savedMethods.push(method);
    localStorage.setItem('customMethods', JSON.stringify(savedMethods));

    // Update UI
    addMethodToList(method);
    showNotification('Method saved successfully!');
    elements.methodForm.reset();
}

function validateCustomFunction(code, type) {
    // Basic security checks
    if (code.includes('eval') || code.includes('Function') || 
        code.includes('import') || code.includes('require')) {
        throw new Error('Unsafe code detected! Please avoid using eval, Function, import, or require.');
    }

    try {
        // Test compilation
        new Function('text', 'key', code);
    } catch (error) {
        throw new Error(`Invalid ${type} function: ${error.message}`);
    }
}

function testMethod(action) {
    const text = elements.testInput.value;
    const key = elements.testKey.value;

    if (!text) {
        showNotification('Please enter test input!', 'error');
        return;
    }

    try {
        const functionCode = action === 'encrypt' ? 
            elements.encryptFunction.value : 
            elements.decryptFunction.value;

        const testFunction = new Function('text', 'key', functionCode);
        const result = testFunction(text, key);
        
        elements.testOutput.value = result;
        showNotification('Test successful!');
    } catch (error) {
        showNotification(`Test failed: ${error.message}`, 'error');
    }
}

function generateImplementationCode() {
    const method = {
        name: elements.methodName.value,
        description: elements.methodDescription.value,
        requiresKey: elements.requiresKey.value === 'true',
        keyType: elements.keyType.value,
        encryptFunction: elements.encryptFunction.value,
        decryptFunction: elements.decryptFunction.value
    };

    const code = `
// ${method.name}
const customMethod = {
    encrypt: ${method.encryptFunction},
    decrypt: ${method.decryptFunction},
    info: {
        name: "${method.name}",
        description: "${method.description}",
        security: "custom",
        keyType: "${method.requiresKey ? method.keyType : 'No key required'}"
    }
};

// Usage example:
const text = "Your text here";
${method.requiresKey ? 'const key = "your-key-here";' : ''}
const encrypted = customMethod.encrypt(text${method.requiresKey ? ', key' : ''});
const decrypted = customMethod.decrypt(encrypted${method.requiresKey ? ', key' : ''});
`;

    elements.implementationCode.textContent = code;
    elements.codeDisplay.classList.remove('hidden');
}

function copyImplementationCode() {
    const code = elements.implementationCode.textContent;
    navigator.clipboard.writeText(code)
        .then(() => showNotification('Code copied to clipboard!'))
        .catch(() => showNotification('Failed to copy code!', 'error'));
}

function getSavedMethods() {
    const saved = localStorage.getItem('customMethods');
    return saved ? JSON.parse(saved) : [];
}

function loadSavedMethods() {
    const methods = getSavedMethods();
    methods.forEach(method => addMethodToList(method));
}

function addMethodToList(method) {
    const methodElement = document.createElement('div');
    methodElement.className = 'method-card';
    methodElement.innerHTML = `
        <h3>${method.name}</h3>
        <p>${method.description}</p>
        <div class="method-actions">
            <button class="btn-secondary" onclick="loadMethod(${getSavedMethods().length - 1})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-secondary" onclick="deleteMethod(${getSavedMethods().length - 1})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    elements.methodsList.appendChild(methodElement);
}

function loadMethod(index) {
    const methods = getSavedMethods();
    const method = methods[index];
    
    elements.methodName.value = method.name;
    elements.methodDescription.value = method.description;
    elements.requiresKey.value = method.requiresKey;
    elements.keyType.value = method.keyType;
    elements.encryptFunction.value = method.encryptFunction;
    elements.decryptFunction.value = method.decryptFunction;
    
    updateKeyTypeVisibility();
}

function deleteMethod(index) {
    const methods = getSavedMethods();
    methods.splice(index, 1);
    localStorage.setItem('customMethods', JSON.stringify(methods));
    
    // Refresh the list
    elements.methodsList.innerHTML = '';
    loadSavedMethods();
    
    showNotification('Method deleted successfully!');
}

function updateKeyTypeVisibility() {
    const requiresKey = elements.requiresKey.value === 'true';
    elements.keyType.parentElement.style.display = requiresKey ? 'block' : 'none';
    elements.testKeyGroup.style.display = requiresKey ? 'block' : 'none';
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

// Helper function to get random examples
function getRandomExamples(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Initialize
updateKeyTypeVisibility(); 