let rates = new Map();
let allCurrencies = [];

// DOM Elements
const input1 = document.getElementById('Input1');
const list1 = document.getElementById('List1');
const input2 = document.getElementById('Input2');
const list2 = document.getElementById('List2');
const amountInput = document.getElementById('amount');
const coin1Ticker = document.getElementById('coin1_ticker');
const resultDisplay = document.getElementById('result');
const rateDisplay = document.getElementById('rate');

// Initial setup
window.addEventListener('load', async () => {
    await fetchData();
    setupDropdown(input1, list1, true); // true for updating ticker
    setupDropdown(input2, list2, false);
    
    // Initial conversion
    convert();
});

amountInput.addEventListener('input', convert);

async function fetchData() {
    try {
        const response = await fetch('https://itog.by/bootcamp/converter/api.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        rates = new Map(data);
        // Ensure USDT is present
        rates.set('USDT', '1');
        
        // Extract currencies from the map keys
        allCurrencies = Array.from(rates.keys());
        
        // Sort initially alphabetically
        allCurrencies.sort();
        
    } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback or alert if needed
        resultDisplay.textContent = 'Error loading data';
    }
}

function setupDropdown(input, list, updateTicker) {
    // Input event: Filter and show list
    input.addEventListener('input', () => {
        const value = input.value.toUpperCase();
        renderList(list, value, input);
        list.style.display = 'block';
    });

    // Focus event: Show full list or filtered list
    input.addEventListener('focus', () => {
        const value = input.value.toUpperCase();
        renderList(list, value, input);
        list.style.display = 'block';
    });

    // Blur event: Hide list with delay to allow clicking
    input.addEventListener('blur', () => {
        setTimeout(() => {
            list.style.display = 'none';
        }, 200);
    });
    
    // Change event: Trigger convert when user manually changes input and leaves
    input.addEventListener('change', () => {
         if (updateTicker) {
            coin1Ticker.textContent = input.value.toUpperCase();
        }
        convert();
    });
}

function renderList(listElement, filterText, inputElement) {
    listElement.innerHTML = '';
    
    let filtered = allCurrencies;
    
    if (filterText) {
        filtered = allCurrencies.filter(c => c.toUpperCase().includes(filterText));
        
        // Sort by relevance: Exact match > Starts with > Alphabetical
        filtered.sort((a, b) => {
            const aUpper = a.toUpperCase();
            const bUpper = b.toUpperCase();
            
            // 1. Exact match
            if (aUpper === filterText) return -1;
            if (bUpper === filterText) return 1;
            
            // 2. Starts with
            const aStarts = aUpper.startsWith(filterText);
            const bStarts = bUpper.startsWith(filterText);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // 3. Alphabetical (default for remaining)
            return aUpper.localeCompare(bUpper);
        });
    }

    if (filtered.length === 0) {
         const li = document.createElement('li');
         li.className = 'dropdown-item text-muted';
         li.textContent = 'No results found';
         listElement.appendChild(li);
         return;
    }

    filtered.forEach(currency => {
        const li = document.createElement('li');
        li.className = 'dropdown-item';
        li.textContent = currency;
        
        li.addEventListener('click', () => {
            inputElement.value = currency;
            
            if (inputElement.id === 'Input1') {
                coin1Ticker.textContent = currency;
            }
            
            convert();
        });
        
        listElement.appendChild(li);
    });
}

function convert() {
    if (rates.size === 0) return;

    const coin1 = input1.value.toUpperCase();
    const coin2 = input2.value.toUpperCase();
    
    // Handle comma in amount
    let amountStr = amountInput.value.replace(',', '.');
    let amount = parseFloat(amountStr);
    
    if (isNaN(amount)) {
         if (amountInput.value === '') {
             amount = 0;
         } else {
             // If it's really invalid, just stop or show error
             resultDisplay.textContent = 'Invalid Amount';
             return;
         }
    }

    if (!rates.has(coin1) || !rates.has(coin2)) {
        resultDisplay.textContent = 'Invalid currency';
        rateDisplay.textContent = '';
        return;
    }

    let rate = 0;
    const rate1 = parseFloat(rates.get(coin1));
    const rate2 = parseFloat(rates.get(coin2));

    if (coin2 === 'USDT') {
        rate = rate1;
    } else if (coin1 === 'USDT') {
        rate = 1 / rate2;
    } else {
        rate = (1 / rate2) * rate1;
    }

    const amount2 = amount * rate;

    // Formatting output
    // Simple logic: if amount is integer, show as is? 
    // The previous code used String(amount) + ' ' + coin1 + ' ≈ ' + String(amount2) + ' ' + coin2;
    // I'll stick to a slightly cleaner format but keep the essence
    
    resultDisplay.textContent = `${amount} ${coin1} ≈ ${amount2} ${coin2}`;
    rateDisplay.textContent = `Rate: ${rate} / 1`;
}
