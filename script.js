const display = document.getElementById("display");

let lastResult = null;
let isError = false;
let lastOperation = "";

// Input validation and sanitization
function isValidInput(input) {
    const validChars = /^[0-9+\-*/().= ]$/;
    return validChars.test(input);
}

function sanitizeExpression(expression) {
    // Remove any potentially dangerous characters
    return expression.replace(/[^0-9+\-*/.() ]/g, '');
}

function appendToDisplay(input) {
    try {
        // Clear error state
        if (isError) {
            clearDisplay();
            isError = false;
        }
        
        // Validate input
        if (!isValidInput(input)) {
            throw new Error("Invalid character");
        }
        
        const currentValue = display.value;
        const lastChar = currentValue.slice(-1);
        
        // Handle operator logic
        if (['+', '-', '*', '/'].includes(input)) {
            // Prevent multiple consecutive operators
            if (['+', '-', '*', '/'].includes(lastChar)) {
                display.value = currentValue.slice(0, -1) + input;
                return;
            }
            // Prevent operators at the beginning (except minus for negative numbers)
            if (currentValue === "" && input !== '-') {
                return;
            }
        }
        
        // Handle decimal point logic
        if (input === '.') {
            // Get the current number being typed
            const numbers = currentValue.split(/[+\-*/]/);
            const currentNumber = numbers[numbers.length - 1];
            
            // Prevent multiple decimal points in the same number
            if (currentNumber.includes('.')) {
                return;
            }
            
            // Add 0 before decimal if needed
            if (currentValue === "" || ['+', '-', '*', '/'].includes(lastChar)) {
                display.value += "0.";
                return;
            }
        }
        
        // Limit display length
        if (currentValue.length >= 15) {
            throw new Error("Maximum input length reached");
        }
        
        display.value += input;
        
    } catch (error) {
        handleError(error.message);
    }
}

function clearDisplay() {
    try {
        display.value = "";
        display.classList.remove('error');
        isError = false;
        lastResult = null;
    } catch (error) {
        handleError("Clear operation failed");
    }
}

function clearEntry() {
    try {
        display.value = "";
        display.classList.remove('error');
        isError = false;
    } catch (error) {
        handleError("Clear entry failed");
    }
}

function backspace() {
    try {
        if (isError) {
            clearDisplay();
            return;
        }
        
        display.value = display.value.slice(0, -1);
    } catch (error) {
        handleError("Backspace failed");
    }
}

function toggleSign() {
    try {
        if (isError) {
            clearDisplay();
            return;
        }
        
        const currentValue = display.value;
        if (currentValue === "" || currentValue === "0") {
            return;
        }
        
        // Toggle sign of the current number
        if (currentValue.startsWith('-')) {
            display.value = currentValue.substring(1);
        } else {
            display.value = '-' + currentValue;
        }
    } catch (error) {
        handleError("Sign toggle failed");
    }
}

function calculate() {
    try {
        const expression = display.value;
        
        // Check for empty expression
        if (!expression || expression.trim() === "") {
            throw new Error("No expression to calculate");
        }
        
        // Sanitize the expression
        const sanitizedExpression = sanitizeExpression(expression);
        
        // Check for division by zero before evaluation
        if (sanitizedExpression.includes('/0') && !sanitizedExpression.includes('/0.')) {
            throw new Error("Division by zero");
        }
        
        // Validate expression format
        if (!/^[0-9+\-*/.() ]+$/.test(sanitizedExpression)) {
            throw new Error("Invalid expression format");
        }
        
        // Check for incomplete expression
        const lastChar = sanitizedExpression.slice(-1);
        if (['+', '-', '*', '/', '.'].includes(lastChar)) {
            throw new Error("Incomplete expression");
        }
        
        
        // Evaluate the expression
        const result = Function('"use strict"; return (' + sanitizedExpression + ')')();
        
        // Check if result is valid
        if (!isFinite(result)) {
            if (isNaN(result)) {
                throw new Error("Invalid calculation");
            } else {
                throw new Error("Result is infinite");
            }
        }
        
        // Format the result
        let formattedResult;
        if (Number.isInteger(result)) {
            formattedResult = result.toString();
        } else {
            // Limit decimal places and remove trailing zeros
            formattedResult = parseFloat(result.toFixed(10)).toString();
        }
        
        // Check if result is too large to display
        if (formattedResult.length > 15) {
            formattedResult = result.toExponential(6);
        }
        
        display.value = formattedResult;
        lastResult = result;
        
    } catch (error) {
        if (error.name === 'SyntaxError') {
            handleError("Invalid expression");
        } else {
            handleError(error.message);
        }
    }
}

function handleError(message) {
    display.value = `Error: ${message}`;
    display.classList.add('error');
    isError = true;
    
    // Clear error after 3 seconds
    setTimeout(() => {
        if (isError) {
            clearDisplay();
        }
    }, 3000);
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    try {
        const key = event.key;
        
        // Prevent default browser shortcuts
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        
        event.preventDefault();
        
        // Handle number keys
        if (key >= '0' && key <= '9') {
            appendToDisplay(key);
        }
        // Handle operators
        else if (key === '+') {
            appendToDisplay('+');
        }
        else if (key === '-') {
            appendToDisplay('-');
        }
        else if (key === '*') {
            appendToDisplay('*');
        }
        else if (key === '/') {
            appendToDisplay('/');
        }
        else if (key === '.') {
            appendToDisplay('.');
        }
        // Handle special keys
        else if (key === 'Enter' || key === '=') {
            calculate();
        }
        else if (key === 'Escape' || key === 'c' || key === 'C') {
            clearDisplay();
        }
        else if (key === 'Backspace') {
            backspace();
        }
        
    } catch (error) {
        handleError("Keyboard input error");
    }
});

// Prevent context menu on calculator
document.getElementById('calculator').addEventListener('contextmenu', function(e) {
    e.preventDefault();
});