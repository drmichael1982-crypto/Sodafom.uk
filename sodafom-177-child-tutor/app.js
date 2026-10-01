const lessonOutput = document.querySelector("#lessonOutput");
const childInput = document.querySelector("#childInput");
const askForm = document.querySelector("#askForm");
const ageSelect = document.querySelector("#ageSelect");
const subjectSelect = document.querySelector("#subjectSelect");
const lengthSelect = document.querySelector("#lengthSelect");
const talkButton = document.querySelector("#talkButton");

const brainSettings = {
  enabled: true,
  endpoint: "http://localhost:7970/api/v1/chat",
  systemPrompt: "You are Ask Archie in Sodafom 177, a safe children's education tutor for ages 5 to 12. Teach using the UK National Curriculum style. Do not show programming, admin, model names, private 797 wording, worker controls or developer details. Give short friendly lessons, ask one question at a time, listen to the child's answer, then help step by step."
};

const lessons = {
  Reading: { intro: "Today we will read a short sentence, spot tricky words, and talk about what it means.", questions: ["Read this: The bright moon shone over the harbour. What did the moon shine over?", "Which word means light or shiny: bright, moon, or harbour?", "Can you tell me what might happen next in the story?"] },
  Maths: { intro: "Today we will practise number bonds, coins, shapes and simple problem solving.", questions: ["If Archie has 4 stickers and gets 6 more, how many stickers does he have altogether?", "A sweet costs 65p. Which coins could you use to make 65p?", "What is half of 8 pieces of chocolate?"] },
  Spelling: { intro: "Today we will sound out words, split them into syllables, and practise tricky spellings.", questions: ["Spell Wednesday by saying it slowly: Wed-nes-day. Now type the word.", "Which word is correct: becos, because, or becuase?", "Can you make a sentence using the word learning?"] },
  Science: { intro: "Today we will explore plants, animals, materials, space and forces.", questions: ["What do plants need to grow: light, water, air, or all three?", "Why does a ball slow down when it rolls across grass?", "Which planet do we live on?"] },
  History: { intro: "Today we will learn about people and places from the past, using clear child-friendly questions.", questions: ["Were the Ancient Egyptians before or after the Victorians?", "What were pyramids used for in Ancient Egypt?", "Can you name one thing people used in Victorian shops?"] },
  Geography: { intro: "Today we will look at maps, places, weather, rivers, coasts and countries.", questions: ["Is Felixstowe by the sea or in the mountains?", "What is a map used for?", "Name one type of weather you might see in the UK."] },
  "Knowledge Quiz": { intro: "Today we will play a quick quiz. Try your best and Archie will help after each answer.", questions: ["Which animal lived long ago: a dinosaur, a robot, or a laptop?", "How many days are in one week?", "Which subject helps us learn about numbers?"] }
};

let currentQuestion = 0;
let activeLesson = lessons[subjectSelect.value];

function addMessage(name, text) {
  const line = document.createElement("p");
  line.className = "message";
  line.innerHTML = `<strong>${name}:</strong> ${text}`;
  lessonOutput.appendChild(line);
  lessonOutput.scrollTop = lessonOutput.scrollHeight;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

async function askBrain(message) {
  if (!brainSettings.enabled) return null;
  try {
    const response = await fetch(brainSettings.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        system: brainSettings.systemPrompt,
        message,
        childMode: true,
        product: "Sodafom 177",
        subject: subjectSelect.value,
        age: ageSelect.value,
        mode: "chat",
        economy: true
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.reply || data.message || data.text || null;
  } catch {
    return null;
  }
}

function buildLesson() {
  const subject = subjectSelect.value;
  const age = ageSelect.value;
  const length = lengthSelect.value;
  activeLesson = lessons[subject];
  currentQuestion = 0;
  lessonOutput.innerHTML = "";
  const opening = `Hello, I am Archie. This is your ${subject} lesson for age ${age}. We will do ${length === "10" ? "10 questions" : `${length} minutes`} in a calm, friendly way. ${activeLesson.intro}`;
  addMessage("Archie", opening);
  askNextQuestion();
  speak(opening);
}

function askNextQuestion() {
  const question = activeLesson.questions[currentQuestion % activeLesson.questions.length];
  addMessage("Archie", question);
  speak(question);
}

async function replyToChild(answer) {
  addMessage("You", answer);
  const brainReply = await askBrain(answer);
  const reply = brainReply || "Good try. I will help you build the answer step by step. Now let us try the next one.";
  addMessage("Archie", reply);
  speak(reply);
  currentQuestion += 1;
  if (!brainReply) askNextQuestion();
}

document.querySelector("#startLesson").addEventListener("click", buildLesson);
document.querySelectorAll("[data-subject]").forEach((button) => {
  button.addEventListener("click", () => { subjectSelect.value = button.dataset.subject; buildLesson(); });
});
askForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = childInput.value.trim();
  if (!answer) return;
  childInput.value = "";
  replyToChild(answer);
});
talkButton.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addMessage("Archie", "Microphone speech recognition is not available in this browser. You can still type your answer.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-GB";
  recognition.onresult = (event) => { const text = event.results[0][0].transcript; childInput.value = ""; replyToChild(text); };
  recognition.start();
});

buildLesson();
