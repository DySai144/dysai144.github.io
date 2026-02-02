const checkButton = document.getElementById('btnCheckAnswer');
const nextButton = document.getElementById('btnNextQuestion');
const returnButton = document.getElementById('btnReturn');
const reviewMissedCardsButton = document.getElementById('btnMissedCards');
const firstPack = document.getElementById('btnFirstPack');
const secondPack = document.getElementById('btnSecondPack');
const thirdPack = document.getElementById('btnThirdPack');
const question = document.querySelector('.question');
const answer = document.querySelector('.answer');
const radio = document.querySelector('.radio-selection');
const gameContainer = document.querySelector('.game-container');
const packContainer = document.querySelector('.pack-selection-container');
const subtitle = document.querySelector('.subtitle');

let questionsArray = [];
let missedQuestionsArray = [];
let reviewMissedCards = false;

async function loadFlashcards(fileName) {
  const response = await fetch(fileName);
  const data = await response.json();
  questionsArray = Object.entries(data);

  // Ensure request succeeded
  if (!response.ok) throw new Error('Failed to load JSON file');

  getRandomQuestionAndAnswer();
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

firstPack.addEventListener('click', function() {
    loadFlashcards('/data/webDevFlashCards.json');
    toggleDisplayContainer("Web Development Fundamentals");
});

secondPack.addEventListener('click', function() {
    loadFlashcards('/data/NREMT.json');
    toggleDisplayContainer("NREMT Exam Prep");
});

thirdPack.addEventListener('click', function() {
    loadFlashcards('/data/htmlSemantics.json');
    toggleDisplayContainer("Html Semantics");
});

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