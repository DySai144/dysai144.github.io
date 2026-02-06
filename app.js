const checkButton = document.getElementById('btnCheckAnswer');
const nextButton = document.getElementById('btnNextQuestion');
const returnButton = document.getElementById('btnReturn');
const reviewMissedCardsButton = document.getElementById('btnMissedCards');
const question = document.querySelector('.question');
const answer = document.querySelector('.answer');
const radio = document.querySelector('.radio-selection');
const gameContainer = document.querySelector('.game-container');
const packContainer = document.querySelector('.pack-selection-container');
const subtitle = document.querySelector('.subtitle');
const createContainer = document.querySelector('.create-container');
const btnCreateMode = document.getElementById('btnCreateMode');
const btnSaveCard = document.getElementById('btnSaveCard');
const btnCancelCreate = document.getElementById('btnCancelCreate');
const packFolderSelect = document.getElementById('pack-folder-select');
const newPackInput = document.getElementById('new-pack-name');
const btnImport = document.getElementById('btnImport');
const fileInput = document.getElementById('import-file');

// Trigger the hidden file input when "Import" is clicked
btnImport.addEventListener('click', () => fileInput.click());

// Handle the file when it is selected
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            const packName = file.name.replace('.json', '').replace(/_/g, ' ');

            // Save to localStorage
            let customData = JSON.parse(localStorage.getItem('myCustomPacks')) || {};
            customData[packName] = importedData;
            localStorage.setItem('myCustomPacks', JSON.stringify(customData));

            // Refresh the UI
            renderPackButtons();
            alert(`Successfully imported "${packName}"!`);
        } catch (err) {
            alert("Error: Invalid JSON file format.");
        }
    };
    reader.readAsText(file);
});

let questionsArray = [];
let missedQuestionsArray = [];
let reviewMissedCards = false;

async function loadFlashcards(fileName, packName) {
    let data = {};
    
    // Only fetch if a filename is provided
    if (fileName) {
        try {
            const response = await fetch(fileName);
            data = await response.json();
        } catch (err) {
            console.error("Could not load JSON file", err);
        }
    }
  
    let customData = JSON.parse(localStorage.getItem('myCustomPacks')) || {};
    let extraCards = customData[packName] || {};

    const combinedData = { ...data, ...extraCards };
    
    questionsArray = Object.entries(combinedData);
    
    if (questionsArray.length > 0) {
        getRandomQuestionAndAnswer();
    } else {
        alert("This pack is empty!");
    }
}

function getRandomQuestionAndAnswer() {
    let random = questionsArray[Math.floor(Math.random() * questionsArray.length)];
    question.innerHTML = `<h3>${random[0]}</h3>`;
    answer.innerHTML = `<h3>${random[1]}</h3>`;
}

function toggleDisplayContainer(name) {
    if (packContainer.style.display == 'block'){
        packContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        subtitle.innerHTML = `<h2>${name}</h2>`;
    } else {
        packContainer.style.display = 'block';
        gameContainer.style.display = 'none';
        subtitle.innerHTML = `<h2>${name}</h2>`;
    }    
}

function toggleReviewMissedCardsDisplay() {
    if (questionsArray.length === 0) {
        subtitle.innerHTML = `<h2>No more cards to review! Would you like to review your missed cards?</h2>`;
        question.style.display = 'none';
        answer.style.display = 'none';
        radio.style.display = 'none';
        checkButton.style.display = 'none';
        nextButton.style.display = 'none';
        returnButton.style.display = 'block';
        reviewMissedCardsButton.style.display = 'block';
    } else {
        reviewMissedCards = false;
        subtitle.innerHTML = `<h2>Select a flash card pack to use.</h2>`;
    }
}   

function clearRadioSelection() {
    const radios = document.getElementsByName('answer');
    radios.forEach(radio => radio.checked = false);
}

function updateCardsList() {
    const radios = document.getElementsByName('answer');
    let selectedValue;

    radios.forEach(radio => {
        if (radio.checked) {
            selectedValue = radio.value;
        }
    });

    let currentQuestion = question.innerText;
    let currentAnswer = answer.innerText;

    // remove the matching question from questionsArray
    const index = questionsArray.findIndex(q =>
        q[0] === currentQuestion && q[1] === currentAnswer
    );

    if (index !== -1) {
        questionsArray.splice(index, 1);
    }

    // add to missedQuestionsArray if incorrect
    if (selectedValue === 'incorrect') {
        missedQuestionsArray.push([currentQuestion, currentAnswer]);
    }
}

checkButton.addEventListener('click', function() {
    answer.style.display = 'block';
    radio.style.display = 'block';
});

nextButton.addEventListener('click', function() {
    answer.style.display = 'none';
    if(radio.checked == false) {
        alert("Please select if you got the question right or wrong.");
        return;
    }
    else {
        updateCardsList();
        radio.style.display = 'none';
        clearRadioSelection();
        getRandomQuestionAndAnswer();
    }
});

returnButton.addEventListener('click', function() {
    toggleDisplayContainer("Select a flash card pack to use.");
})

reviewMissedCardsButton.addEventListener('click', function() {
    if (missedQuestionsArray.length === 0) {
        alert("Well done! You have no missed cards to review!");
        return;
    } else {
        questionsArray = missedQuestionsArray;
        missedQuestionsArray = [];
        reviewMissedCards = true;
        radio.style.display = 'none';
        getRandomQuestionAndAnswer();
    }
    toggleReviewMissedCardsDisplay();
});

btnCreateMode.addEventListener('click', () => {
    packContainer.style.display = 'none';
    createContainer.style.display = 'block';
});

btnCancelCreate.addEventListener('click', () => {
    createContainer.style.display = 'none';
    packContainer.style.display = 'block';
});

packFolderSelect.addEventListener('change', () => {
    newPackInput.style.display = (packFolderSelect.value === 'new') ? 'block' : 'none';
});

btnSaveCard.addEventListener('click', () => {
    const isNew = packFolderSelect.value === 'new';
    const packName = isNew ? newPackInput.value : packFolderSelect.value;
    const q = document.getElementById('custom-front').value;
    const a = document.getElementById('custom-back').value;

    if (!packName || !q || !a) {
        alert("Please fill in all fields!");
        return;
    }

        // Retrieve existing custom data from localStorage or create empty object
    let customData = JSON.parse(localStorage.getItem('myCustomPacks')) || {};

    // If the pack doesn't exist in local storage yet, create it
    if (!customData[packName]) {
        customData[packName] = {};
    }

    // Add the card
    customData[packName][q] = a;

    // Save back to localStorage
    localStorage.setItem('myCustomPacks', JSON.stringify(customData));

    alert(`Card added to ${packName}!`);
    
    renderPackButtons();
    
    // Clear inputs
    document.getElementById('custom-front').value = "";
    document.getElementById('custom-back').value = "";
});

function createPackButton(name, fileName, isCustom = false) {
    const container = document.getElementById('pack-button-list');
    
    const wrapper = document.createElement('div');
    wrapper.className = 'pack-item-wrapper';

    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => {
        loadFlashcards(fileName, name);
        toggleDisplayContainer(name);
    };
    wrapper.appendChild(btn);

    if (isCustom) {
        // --- ADDED DOWNLOAD BUTTON ---
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '↓'; // Download symbol
        downloadBtn.className = 'download-btn';
        downloadBtn.title = 'Download pack as JSON';
        downloadBtn.onclick = (e) => {
            e.stopPropagation(); 
            downloadPack(name);
        };
        wrapper.appendChild(downloadBtn);

        // --- EXISTING DELETE BUTTON ---
        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        delBtn.className = 'delete-btn';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${name}"?`)) {
                deletePack(name);
            }
        };
        wrapper.appendChild(delBtn);
    }

    container.appendChild(wrapper);
}

// 2. New function to remove the pack from storage
function deletePack(name) {
    let customData = JSON.parse(localStorage.getItem('myCustomPacks')) || {};
    
    // Remove the specific pack key
    delete customData[name];
    
    // Save the updated list back to localStorage
    localStorage.setItem('myCustomPacks', JSON.stringify(customData));
    
    // Refresh the list on screen
    renderPackButtons();
}

function downloadPack(name) {
    const customData = JSON.parse(localStorage.getItem('myCustomPacks')) || {};
    const packData = customData[name];

    if (!packData) {
        alert("Pack data not found!");
        return;
    }

    // Convert data to a JSON string with nice formatting
    const dataStr = JSON.stringify(packData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a temporary hidden link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}.json`; // Replaces spaces with underscores
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 3. Update renderPackButtons to pass 'true' for custom packs
function renderPackButtons() {
    const container = document.getElementById('pack-button-list');
    container.innerHTML = ''; 

    const defaultPacks = [
        { name: "Web Dev Fundamentals", file: "/data/webDevFlashCards.json" },
        { name: "NREMT Exam Prep", file: "/data/NREMT.json" },
        { name: "Html Semantics", file: "/data/htmlSemantics.json" }
    ];

    const customData = JSON.parse(localStorage.getItem('myCustomPacks')) || {};
    const customPackNames = Object.keys(customData);

    // Default packs (isCustom = false)
    defaultPacks.forEach(pack => {
        createPackButton(pack.name, pack.file, false);
    });

    // Custom packs (isCustom = true)
    customPackNames.forEach(name => {
        if (!defaultPacks.find(p => p.name === name)) {
            createPackButton(name, null, true);
        }
    });
}

onload = function() {
    renderPackButtons();
}