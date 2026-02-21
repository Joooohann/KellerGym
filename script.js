
let currentStep = 1;
const totalSteps = 10;
let obData = {
    gender: null, weight: 75, height: 180, bodyfat: 15, activity: null,
    exp: null, location: null, split: null, freq: null, days: []
};
const stepMap = [
    { cat: 0, sub: 0 },
    { cat: 0, sub: 1 },
    { cat: 0, sub: 2 },
    { cat: 0, sub: 3 },
    { cat: 1, sub: 0 },
    { cat: 1, sub: 1 },
    { cat: 2, sub: 0 },
    { cat: 2, sub: 1 },
    { cat: 3, sub: 0 },
    { cat: 3, sub: 1 }
];
document.addEventListener('DOMContentLoaded', () => {
    console.log("App geladen.");
    const loginBtn = document.getElementById('btn-login-action');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    renderProgressBar();
});
function renderProgressBar() {
    const trackContainer = document.querySelector('.progress-tracks');
    if(!trackContainer) return;
    const structure = [
        { label: "Körper", steps: 4 },
        { label: "Level", steps: 2 },
        { label: "Training", steps: 2 },
        { label: "Planung", steps: 2 }
    ];

    trackContainer.innerHTML = '';

    structure.forEach((cat, catIndex) => {
        const segDiv = document.createElement('div');
        segDiv.className = 'progress-segment';
        segDiv.id = `cat-${catIndex}`;
        const labelSpan = document.createElement('span');
        labelSpan.className = 'progress-label';
        labelSpan.innerText = cat.label;
        segDiv.appendChild(labelSpan);
        for(let i=0; i < cat.steps; i++) {
            const subDiv = document.createElement('div');
            subDiv.className = 'sub-bar';
            subDiv.id = `sub-${catIndex}-${i}`;
            segDiv.appendChild(subDiv);
        }

        trackContainer.appendChild(segDiv);
    });
    
    updateProgressUI();
}

function updateProgressUI() {
    const numBox = document.getElementById('ob-step-num');
    if(numBox) numBox.innerText = currentStep < 10 ? `0${currentStep}` : currentStep;
    const map = stepMap[currentStep - 1]; 
    if(!map) return;
    const totalCats = 4;
    for(let c=0; c < totalCats; c++) {
        const catSeg = document.getElementById(`cat-${c}`);
        if(catSeg) {
            if(c === map.cat) catSeg.classList.add('active');
            else catSeg.classList.remove('active');
        }
        const subBars = catSeg.querySelectorAll('.sub-bar');
        subBars.forEach((bar, sIndex) => {
            bar.classList.remove('filled', 'active');
            
            if (c < map.cat) {
                bar.classList.add('filled');
            } else if (c === map.cat) {
                if (sIndex < map.sub) {
                    bar.classList.add('filled');
                } else if (sIndex === map.sub) {
                    bar.classList.add('active');
                }
            }
        });
    }
    if(currentStep === 10) { 
        const sub = document.getElementById('days-subtitle');
        if(sub && obData.freq) sub.innerText = `Wähle genau ${obData.freq} Tage aus.`;
    }
}
function handleLogin(e) {
    if(e) e.preventDefault();
    console.log("Login Klick - Umschalten startet");

    const loginScreen = document.getElementById('screen-login');
    const onboardingScreen = document.getElementById('screen-onboarding');
    loginScreen.classList.remove('active');
    onboardingScreen.classList.add('active');
    currentStep = 1;
    updateProgressUI();
    showStep(1);
}

function selectOption(key, value, element) {
    if (key === 'split') {
        let enabled = true;
        let reason = "";

        if (value === 'ppl') {
            if (obData.freq < 3) {
                enabled = false;
                reason = "Push/Pull/Legs benötigt mindestens 3 Trainingstage pro Woche.";
            }
        } else if (value === 'ul') {
            if (obData.freq !== 2 && obData.freq !== 4) {
                enabled = false;
                reason = "Upper/Lower Splits sind ideal für 2 oder 4 Trainingstage.";
            }
        } else if (value === 'bro') {
             if (obData.freq < 4) {
                enabled = false;
                reason = "Ein Bro-Split macht erst ab 4 Trainingstagen Sinn.";
            }
        }

        if (!enabled) {
            const box = document.getElementById('split-info-box');
            if(box) {
                box.classList.add('active');
                const t = document.getElementById('info-box-title');
                const d = document.getElementById('info-box-desc');
                if(t) { t.innerText = "Nicht verfügbar"; t.style.color = '#ff4444'; }
                if(d) { d.innerText = reason; }
            }
            return;
        } else {
            const box = document.getElementById('split-info-box');
            const t = document.getElementById('info-box-title');
            if(box && t && t.innerText === "Nicht verfügbar") {
                box.classList.remove('active');
                t.style.color = 'var(--primary)';
            }
        }
    }

    obData[key] = (key === 'freq') ? parseInt(value) : value;
    if (element && element.parentElement) {
        const siblings = element.parentElement.querySelectorAll('.select-card');
        siblings.forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
    const btnId = `btn-next-${currentStep}`;
    const nextBtn = document.getElementById(btnId);
    if(nextBtn) {
        nextBtn.disabled = false;
    }
}
document.addEventListener('DOMContentLoaded', () => {
});

function checkSplitAvailability() {
    const freq = obData.freq;
    if(!freq) return;
    const cards = document.querySelectorAll('#ob-step-9 .select-card');
    
    cards.forEach(card => {
        const onclick = card.getAttribute('onclick');
        if(!onclick) return;
        
        let type = '';
        if(onclick.includes("'ppl'")) type = 'ppl';
        else if(onclick.includes("'pp'")) type = 'pp';
        else if(onclick.includes("'full'")) type = 'full';
        else if(onclick.includes("'ul'")) type = 'ul';
        else if(onclick.includes("'bro'")) type = 'bro';

        let enabled = true;
        if (type === 'ppl') {
            if (freq < 3) enabled = false;
        } else if (type === 'ul') {
            const valid = [2, 4, 6]; 
            if (!valid.includes(freq)) enabled = false;
        } else if (type === 'bro') {
            if (freq < 4) enabled = false;
        }

        if(enabled) {
            card.classList.remove('disabled');
        } else {
            card.classList.add('disabled');
            card.classList.remove('active');
        }
    });
}

function showRejectionInfo(type) {
    const box = document.getElementById('split-info-box');
    const titleEl = document.getElementById('info-box-title');
    const descEl = document.getElementById('info-box-desc');
    
    if(!box || !titleEl || !descEl) return;

    let reason = "Diese Option ist mit deiner gewählten Trainingshäufigkeit nicht optimal.";
    
    if(type === 'ppl') {
        reason = "Push/Pull/Legs benötigt mindestens 3 Trainingstage pro Woche (besser 6), um effektiv zu sein.";
    } else if (type === 'ul') {
        reason = "Upper/Lower Splits sind ideal für 2 oder 4 Tage (Oberkörper/Unterkörper).";
    } else if (type === 'bro') {
        reason = "Ein Bro-Split (1 Muskelgruppe pro Tag) macht erst ab 4 Trainingstagen Sinn, um alle Muskeln abzudecken.";
    }

    titleEl.innerText = "Nicht verfügbar";
    titleEl.style.color = '#ff4444';
    descEl.innerText = reason;
    box.classList.add('active');
}

function syncInputs(key, val) {
    obData[key] = val;
    const disp = document.getElementById(`val-${key}`);
    if(disp) disp.innerText = val;
}

function toggleDay(element, dayId) {
    if (!obData.freq) {
        alert("Bitte wähle zuerst eine Frequenz.");
        return;
    }

    const index = obData.days.indexOf(dayId);
    if (index > -1) {
        obData.days.splice(index, 1);
        element.classList.remove('active');
    } else {
        if (obData.days.length < obData.freq) {
            obData.days.push(dayId);
            element.classList.add('active');
        }
    }
    const finishBtn = document.getElementById('btn-finish-ob');
    if(finishBtn) {
        if (obData.days.length === obData.freq) {
            finishBtn.disabled = false;
        } else {
            finishBtn.disabled = true;
        }
    }
}
function showStep(step) {
    document.querySelectorAll('.ob-content').forEach(el => el.classList.remove('active-step'));
    const nextStepEl = document.getElementById(`ob-step-${step}`);
    if(nextStepEl) {
        nextStepEl.classList.add('active-step');
    }
    updateProgressUI();
    if(step === 9) {
        checkSplitAvailability();
    }
}

function nextOnboarding() {
    if(!validateStep(currentStep)) return;

    if(currentStep >= totalSteps) {
        console.log("Onboarding Fertig!", obData);
        finishOnboarding();
        return;
    }

    currentStep++;
    showStep(currentStep);
}

function prevOnboarding() {
    if(currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function validateStep(step) {
    if(step === 1 && !obData.gender) return false;
    if(step === 2 && !obData.weight) return false;
    if(step === 3 && !obData.height) return false;
    if(step === 4 && !obData.bodyfat) return false;
    
    if(step === 5 && !obData.activity) return false;
    if(step === 6 && !obData.exp) return false;
    if(step === 7 && !obData.location) return false;
    if(step === 8 && !obData.freq) return false;
    if(step === 9 && !obData.split) return false;
    if(step === 10 && obData.days.length !== obData.freq) return false;

    return true;
}


function finishOnboarding() {
    console.log("Onboarding fertig!");
    document.getElementById('screen-onboarding').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    document.body.classList.remove('no-nav');
    const planText = document.getElementById('dash-plan');
    if(planText) {
        planText.innerText = `${obData.freq}x Training (${obData.split ? obData.split.toUpperCase() : 'Custom'})`;
    }
}

const splitInfos = {
    'ppl': {
        title: 'Push / Pull / Legs',
        desc: 'Ein Klassiker für Fortgeschrittene. Du trainierst Druckübungen (Brust/Schulter/Trizeps), Zugübungen (Rücken/Bizeps) und Beine an separaten Tagen. Ideal bei 3x oder 6x Training pro Woche.'
    },
    'pp': {
        title: 'Push / Pull',
        desc: 'Unterteilt das Training in Druck- (Push) und Zugbewegungen (Pull). Beine werden oft integriert. Sehr flexibel und gut geeignet für 2, 4 oder 6 Trainingstage.'
    },
    'ul': {
        title: 'Upper / Lower',
        desc: 'Teilt den Körper in Oberkörper und Unterkörper auf. Sehr effizient, um jede Muskelgruppe 2x pro Woche zu trainieren (bei 4 Trainingstagen).'
    },
    'full': {
        title: 'Ganzkörper',
        desc: 'Du trainierst in jeder Einheit den kompletten Körper. Perfekt für Einsteiger oder wenn du 2-3x pro Woche trainierst, um maximale Frequenz zu haben.'
    },
    'bro': {
        title: 'Bro Split',
        desc: 'Jeden Tag eine andere Muskelgruppe (z.B. Brust-Tag, Rücken-Tag). Hohes Volumen pro Muskel, aber geringere Frequenz. Beliebt im Oldschool-Bodybuilding.'
    }
};

function showSplitInfo(event, type) {
    if(event) event.stopPropagation();
    
    const info = splitInfos[type];
    if(!info) return;
    const box = document.getElementById('split-info-box');
    const title = document.getElementById('info-box-title');
    const desc = document.getElementById('info-box-desc');
    if(title) title.innerText = info.title;
    if(desc) desc.innerText = info.desc;
    if(box) box.classList.add('active');
}

function closeInfoBox() {
    const box = document.getElementById('split-info-box');
    if(box) box.classList.remove('active');
}




