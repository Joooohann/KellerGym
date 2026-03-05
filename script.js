// FIX RE: If I reload I want to come to index
// Check if page was reloaded
try {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
        // If we are NOT on index.html (or root), go there
        if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
             window.location.href = 'index.html';
        }
    }
} catch(e) { console.log(e); }

let currentStep = 1;
const totalSteps = 12;
let obData = {
    age: 25, gender: null, weight: 75, height: 180, bodyfat: 15, activity: null,
    exp: null, goal: null, location: null, split: null, freq: null, days: []
};
const stepMap = [
    { cat: 0, sub: 0 }, // 1. Age
    { cat: 0, sub: 1 }, // 2. Gender
    { cat: 0, sub: 2 }, // 3. Weight
    { cat: 0, sub: 3 }, // 4. Height
    { cat: 0, sub: 4 }, // 5. BodyFat
    { cat: 1, sub: 0 }, // 6. Activity
    { cat: 1, sub: 1 }, // 7. Exp
    { cat: 1, sub: 2 }, // 8. Goal
    { cat: 2, sub: 0 }, // 9. Location
    { cat: 2, sub: 1 }, // 10. Freq
    { cat: 3, sub: 0 }, // 11. Split
    { cat: 3, sub: 1 }  // 12. Days
];

// CLEAR STORAGE ON RELOAD if not on dashboard
// The user wants: "Wenn ich reloade möchte ich immer zu index kommen & dort starten"
// BUT: We need to check if they are ALREADY on dashboard, maybe keep session?
// The user said: "Wenn ich reloade möchte ich immer zu index kommen"
// This implies forcing index.html except maybe dashboard?
// Let's implement a check: If we are NOT on index.html, redirect to index.html?
// Wait, if they are on dashboard, they might want to stay presented.
// "Wenn ich reloade möchte ich immer zu index kommen & dort starten" -> Sounds like a hard reset.
// Let's force redirect to index.html if performance navigation type is reload?
// Or just check data?

if (window.performance) {
    if (performance.navigation.type == 1) {
        // Reload triggered
        // If we are NOT on index.html already
        if (!window.location.href.includes('index.html')) {
             window.location.href = 'index.html';
        }
    }
}
// Also newer API
if (window.performance && window.performance.getEntriesByType) {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
         if (!window.location.href.includes('index.html')) {
             window.location.href = 'index.html';
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("App geladen.");
    
    // LOGIN PAGE LOGIC
    const loginBtn = document.getElementById('btn-login-action');
    if (loginBtn) {
        // If we are on index/login page
        // Check if already logged in / onboarded? (Optional)
        /* 
        const params = new URLSearchParams(window.location.search);
        if(!params.has('reset') && localStorage.getItem('kellerGymData')) {
            window.location.href = 'dashboard.html';
        } 
        */

        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const userField = document.getElementById('login-user');
            const passField = document.getElementById('login-pass');
            
            if(userField && passField) {
                const u = userField.value;
                const p = passField.value;
                
                if((u === 'admin' && p === 'admin') || (u === 'a' && p === 'a')) {
                    // Admin Bypass: Go directly to dashboard with 0 calories
                    console.log("Admin Login Detected");
                    const adminData = {
                        calories: 0,
                        username: "Admin",
                        freq: 0,
                        split: "Test"
                    };
                    localStorage.setItem('kellerGymData', JSON.stringify(adminData));
                    window.location.href = 'dashboard.html';
                    return;
                }
            }
            
            // Default: Navigate to Onboarding
            window.location.href = 'onboarding.html';
        });
    }

    // TEST ANIMATION BUTTON (on login page)
    const testGenBtn = document.getElementById('btn-test-gen');
    if(testGenBtn) {
        testGenBtn.addEventListener('click', () => {
            // When user clicks "Test Animation" on Login page
            // Redirect to onboarding.html created specifically to SHOW ANIMATION then RETURN TO LOGIN
            window.location.href = 'onboarding.html?test=true';
        });
    }

    // ONBOARDING PAGE LOGIC
    // Check if we are on onboarding page
    if(document.getElementById('screen-onboarding')) {
        renderProgressBar();
        
        // Check for test mode
        const params = new URLSearchParams(window.location.search);
        if(params.get('test') === 'true') {
            // Hide the wizard immediately
            document.getElementById('screen-onboarding').classList.remove('active');
            
            // Mock minimal data to ensure no errors happen during "calculation" even if unused
            if(!obData.freq) obData.freq = 4;
            
            // Start the "Animation Only" flow
            // Passing 'true' to finishOnboarding signals it's a test run
            finishOnboarding(true); 
        }
    }
});

function renderProgressBar() {
    const trackContainer = document.querySelector('.progress-tracks');
    if(!trackContainer) return;

    const structure = [
        { label: "Körper", steps: 5 },
        { label: "Level", steps: 3 },
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
    
    if(currentStep === 11) {
        checkSplitAvailability();
    }
    
    if(currentStep === 12) { 
        const sub = document.getElementById('days-subtitle');
        if(sub && obData.freq) sub.innerText = `Wähle genau ${obData.freq} Tage aus.`;
    }
}

function handleLogin(e) {
    if(e) e.preventDefault();
    // Redirect is handled in event listener now
}

// FIX: When finishing Onboarding (regular), user says animation does NOT show,
// instead it goes to dashboard after a few seconds.
// This means the 'screen-generating' is not becoming visible OR overlay is wrong.
// In onboarding.html, #screen-generating is a sibling to #screen-onboarding.
// When finishOnboarding() runs:
// 1. We remove 'active' from onboarding (it hides).
// 2. We add 'active' to generating (it shows).
// 3. Wait duration.
// 4. Redirect.

function finishOnboarding(isTest = false) {
    console.log("Onboarding fertig! isTest:", isTest);
    const obScreen = document.getElementById('screen-onboarding');
    
    // Hide the wizard screen if it's visible
    if(obScreen) obScreen.classList.remove('active');
    
    // Show generating screen
    const genScreen = document.getElementById('screen-generating');
    
    // Force display block via style if class isn't enough (css issue?)
    if(genScreen) {
        genScreen.classList.add('active'); 
        genScreen.style.display = 'block'; // Force visibility
        genScreen.style.opacity = '1';
        
        const genText = document.getElementById('gen-text');
        
        // Duration logic
        // If Test Mode: Use a standard duration or the randomized one
        // If Real Mode: Use randomized duration
        const duration = Math.floor(Math.random() * 4000) + 14000; 
        
        // Text updates
        if(genText) {
            genText.innerText = "Analysiere Daten...";
            setTimeout(() => { genText.innerText = "Thinking..."; }, duration * 0.2);
            setTimeout(() => { genText.innerText = "Berechne Kalorienbedarf..."; }, duration * 0.5);
            setTimeout(() => { genText.innerText = "Erstelle Trainingsplan..."; }, duration * 0.75);
            setTimeout(() => { genText.innerText = "Finalisiere Setup..."; }, duration * 0.9);
        }
        
        // Finish after duration
        setTimeout(() => {
            genScreen.classList.remove('active');

            if(isTest) {
                // TEST MODE: Return to Login (index.html)
                console.log("Animation Test Complete -> Back to Login");
                window.location.href = 'index.html';
            } else {
                // REAL MODE: Calculate -> Save -> Dashboard
                calculateCalories(); 
                // Save to Storage
                localStorage.setItem('kellerGymData', JSON.stringify(obData));
                console.log("Onboarding Complete -> To Dashboard");
                window.location.href = 'dashboard.html';
            }
        }, duration);
    } else {
        // Fallback if no specific animation screen found 
        console.error("Generating screen not found!");
        if(isTest) {
             window.location.href = 'index.html';
        } else {
            calculateCalories();
            localStorage.setItem('kellerGymData', JSON.stringify(obData));
            window.location.href = 'dashboard.html';
        }
    }
}


function selectOption(key, value, element) {
    console.log(`Select: ${key} = ${value}`);
    
    // Split validation handled in handleSplitClick now, 
    // but if called directly we might want to keep it safe or just allow.
    // For now, allow selectOption to just set data.

    // Update Data
    obData[key] = (key === 'freq') ? parseInt(value) : value;

    // UI Feedback
    if (element && element.parentElement) {
        // Remove active from siblings
        const siblings = element.parentElement.querySelectorAll('.select-card');
        siblings.forEach(el => el.classList.remove('active'));
        // Add active to clicked
        element.classList.add('active');
    }

    // Enable Next Button
    // Step 11 is distinct
    let step = currentStep;
    // Attempt to deduce step if possible, but currentStep var is reliable enough
    
    // Special check for freq to clear days and invalidate incompatible split
    if(key === 'freq') {
        obData.days = [];
        const days = document.querySelectorAll('.day-card');
        days.forEach(d => d.classList.remove('active'));
        
        // Disable "Next" button on Step 11 (Split) if previously selected split is now invalid
        // We do this by checking if the CURRENT split fits the NEW freq
        if(obData.split) {
            const info = splitInfoData[obData.split];
            const newFreq = parseInt(value);
            if(info && info.validFreq && !info.validFreq.includes(newFreq)) {
                // Invalid! Clear header, disable button step 11 logic
                obData.split = null; // Clear selection
                
                // Visually deselect in Step 11 (will happen when we navigate there via checkSplitAvailability but we should ensure state is clean)
                // We can preemptively clear UI classes for step 11
                const splitCards = document.querySelectorAll('#split-grid .select-card');
                splitCards.forEach(c => c.classList.remove('active'));

                // Also disable the Next button for Step 11
                const btn11 = document.getElementById('btn-next-11');
                if(btn11) btn11.disabled = true;
            }
        }
    }

    const btnId = `btn-next-${currentStep}`;
    const nextBtn = document.getElementById(btnId);
    if(nextBtn) {
        nextBtn.disabled = false;
        // Optionally auto-advance?
        // if(key !== 'split') nextOnboarding(); 
    }
}

// ---------------------------------------------------------
// NEW SPLIT LOGIC
// ---------------------------------------------------------

const splitInfoData = {
    'ppl': {
        title: "Push / Pull / Legs",
        desc: "Unterteilt das Training in Druck- (Push), Zugbewegungen (Pull) und Beine (Legs). Sehr effektiv für Muskelaufbau, benötigt aber eine höhere Frequenz (3 oder 6 Tage).",
        validFreq: [3, 6]
    },
    'pp': {
        title: "Push / Pull",
        desc: "Unterteilt das Training in Druck- (Push) und Zugbewegungen (Pull). Beine werden oft integriert. Sehr flexibel und gut geeignet für 2, 4 oder 6 Trainingstage.",
        validFreq: [2, 4, 6]
    },
    'ul': {
        title: "Upper / Lower",
        desc: "Trennt Oberkörper- und Unterkörper-Training. Klassischer Split für Fortgeschrittene bei 4 Tagen (z.B. Mo/Di, Do/Fr) oder 2/6 Tagen.",
        validFreq: [2, 4, 6]
    },
    'full': {
        title: "Ganzkörper",
        desc: "Trainiert den gesamten Körper in jeder Einheit. Ideal für Einsteiger oder bei 2-3 Trainingstagen pro Woche, um die Frequenz pro Muskel hoch zu halten.",
        validFreq: [2, 3] // Only valid for 2 or 3 days
    },
    'bro': {
        title: "Bro Split",
        desc: "Jeder Trainingstag widmet sich einer oder zwei spezifischen Muskelgruppen (z.B. Brust-Tag, Rücken-Tag). Erfordert hohe Frequenz (min. 4 Tage), damit Muskeln nicht zu lange pausieren.",
        validFreq: [4, 5, 6] // Min 4
    }
};

function handleSplitClick(e, key, element) {
    if(e && (e.target.classList.contains('info-icon') || e.target.closest('.info-icon'))) {
        return; // Ignore clicking on info icon
    }

    // Adapt to old calls where e might be missing (just in case)
    // If called with (key, element) only
    if(typeof e === 'string') {
        // e is key, key is element, element is undefined
        element = key;
        key = e;
    }
    
    // Safety check
    if(!element) return;
    
    const freq = obData.freq || 3; // Default to 3 if missing for safety
    const info = splitInfoData[key];
    
    // Validate
    let isValid = true;
    if(info.validFreq && !info.validFreq.includes(freq)) {
        isValid = false;
    }

    if(isValid) {
        // Select it
        selectOption('split', key, element);
        // Also close info box if open?
        // closeInfoBox(); 
    } else {
        // Show Error Info
        showSplitError(key, freq);
    }
}

function showSplitInfo(e, key) {
    if(e) {
        e.preventDefault();
        e.stopPropagation(); // Don't trigger card click
    }
    console.log("Showing info for:", key);
    
    const info = splitInfoData[key];
    if(!info) {
        console.error("No info found for key:", key);
        return;
    }

    const box = document.getElementById('split-info-box');
    const t = document.getElementById('info-box-title');
    const d = document.getElementById('info-box-desc');
    
    if(box && t && d) {
        t.innerText = info.title;
        t.style.color = 'var(--primary)'; // Turquoise
        d.innerText = info.desc;
        
        box.style.display = 'block';
        
        // Reset styles (in case error state persisted)
        box.style.background = 'rgba(0, 128, 128, 0.1)';
        box.style.borderColor = 'var(--primary)';
    } else {
        console.error("Info box elements not found!");
    }
}

function showSplitError(key, currentFreq) {
    const info = splitInfoData[key];
    const box = document.getElementById('split-info-box');
    const t = document.getElementById('info-box-title');
    const d = document.getElementById('info-box-desc');

    if(box && t && d) {
        t.innerText = info.title; 
        t.style.color = '#ff4444'; 
        
        // Generate reason based on rule
        let reason = "Diese Aufteilung passt nicht zu deinen gewählten Tagen (" + currentFreq + "). ";
        if(key === 'ppl') reason += "Push/Pull/Legs benötigt 3 oder 6 Tage.";
        if(key === 'pp') reason += "Push/Pull ist für 2, 4 oder 6 Tage ausgelegt.";
        if(key === 'ul') reason += "Upper/Lower ist für 2, 4 oder 6 Tage ausgelegt.";
        if(key === 'full') reason += "Ganzkörper ist nur für 2 oder 3 Tage geeignet.";
        if(key === 'bro') reason += "Bro Split benötigt mindestens 4 Tage.";
        
        d.innerText = reason;
        
        box.style.display = 'block';
        
        // Error style? Maybe reddish tint?
        // Or keep same style but red title?
        // User didn't specify distinct BG for error, just red title.
        // Let's stick to the subtle active BG or maybe slightly reddish?
        // "wenn man eins auswählt was ausgegraut ist... ist die Überschrift rot" -> Implies same box style.
        
        box.style.background = 'rgba(0, 128, 128, 0.1)'; // Keep consistent
        box.style.borderColor = 'var(--primary)';
    }
}

function closeInfoBox() {
    const box = document.getElementById('split-info-box');
    if(box) {
        box.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
});

function checkSplitAvailability() {
    const freq = obData.freq;
    if(!freq) return;

    // Use split-grid selector specifically
    const cards = document.querySelectorAll('#split-grid .select-card');
    
    cards.forEach(card => {
        // New HTML uses data-val
        const key = card.getAttribute('data-val');
        if(!key || !splitInfoData[key]) return;
        
        const info = splitInfoData[key];
        let enabled = true;
        if(info.validFreq && !info.validFreq.includes(freq)) {
            enabled = false;
        }

        if(enabled) {
            card.classList.remove('disabled');
        } else {
            card.classList.add('disabled');
            card.classList.remove('active');
        }
    });
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
    // Reset Scroll & Zoom attempt
    const viewport = document.getElementById('app-viewport');
    if(viewport) viewport.scrollTop = 0;
    window.scrollTo(0, 0);

    document.querySelectorAll('.ob-content').forEach(el => el.classList.remove('active-step'));
    const nextStepEl = document.getElementById(`ob-step-${step}`);
    if(nextStepEl) {
        nextStepEl.classList.add('active-step');
    }
    updateProgressUI();
    if(step === 11) {
        checkSplitAvailability(); // Ensure availability is checked when showing step 11
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
    if(step === 1 && !obData.age) return false;
    if(step === 2 && !obData.gender) return false;
    if(step === 3 && !obData.weight) return false;
    if(step === 4 && !obData.height) return false;
    if(step === 5 && !obData.bodyfat) return false;
    
    if(step === 6 && !obData.activity) return false;
    if(step === 7 && !obData.exp) return false;
    if(step === 8 && !obData.goal) return false;

    if(step === 9 && !obData.location) return false;
    if(step === 10 && !obData.freq) return false;
    if(step === 11 && !obData.split) return false;
    if(step === 12 && obData.days.length !== obData.freq) return false;

    return true;
}



/* 
 Older functions removed for cleanup (finishOnboarding duplicate, completeSetup) 
*/


function calculateCalories() {
    console.log("Starte Kalorienberechnung...");

    // Determine Source of Truth
    const data = (typeof window.obData !== 'undefined' && Object.keys(window.obData).length > 0) 
               ? window.obData 
               : obData;

    // -----------------------------
    // INPUTS (mit Fallbacks)
    // -----------------------------
    const gender = data.gender || 'male';
    const weight = parseFloat(data.weight) || 75;
    const age = parseInt(data.age) || 25;
    const height = parseFloat(data.height) || 175;
    const bodyfatPercent = parseFloat(data.bodyfat) || 15;
    const activityKey = data.activity || 'low';
    const goalKey = data.goal || 'maintain_build';

    // -----------------------------
    // 1. Bodyfat Decimal
    // -----------------------------
    const bodyfat = bodyfatPercent / 100;

    // -----------------------------
    // 2. Lean Body Mass
    // -----------------------------
    const LBM = weight * (1 - bodyfat);

    // -----------------------------
    // 3. BMR Raw (Katch-McArdle)
    // -----------------------------
    let BMR_raw = 370 + (21.6 * LBM);

    // -----------------------------
    // 4. Gender Adjustment
    // -----------------------------
    if (gender === 'female') {
        BMR_raw = BMR_raw * 0.97;
    }

    // -----------------------------
    // 5. Age Adjustment
    // 1.2% Reduktion pro Dekade nach 20
    // -----------------------------
    let ageFactor = 1;
    if (age > 20) {
        ageFactor = 1 - (0.012 * ((age - 20) / 10));
    }

    const BMR = BMR_raw * ageFactor;

    // -----------------------------
    // 6. Activity Factor (optimiert)
    // -----------------------------
    let activityFactor = 1.2;

    if (activityKey === 'low') activityFactor = 1.4;
    if (activityKey === 'somewhat') activityFactor = 1.55;
    if (activityKey === 'med') activityFactor = 1.7;
    if (activityKey === 'high') activityFactor = 1.85;

    const TDEE = BMR * activityFactor;

    // -----------------------------
    // 7. BMI Check (für adaptive Ziele)
    // -----------------------------
    const heightMeters = height / 100;
    const BMI = weight / (heightMeters * heightMeters);

    // -----------------------------
    // 8. Goal Factor (adaptiv)
    // -----------------------------
    let goalFactor = 1.0;

    if (goalKey === 'lose_build') {
        goalFactor = 0.85; // -15%
    }

    if (goalKey === 'maintain_build') {
        goalFactor = 1.0;
    }

    if (goalKey === 'gain_build') {

        // Untergewicht → höherer Überschuss
        if (BMI < 18.5) {
            goalFactor = 1.25;
        }
        // Schlank
        else if (BMI < 21) {
            goalFactor = 1.18;
        }
        // Normalgewicht
        else {
            goalFactor = 1.12;
        }
    }

    // -----------------------------
    // 9. Training Bonus
    // -----------------------------
    let trainingBonus = 1.0;

    if (goalKey === 'gain_build') {
        trainingBonus = 1.08;
    }

    // -----------------------------
    // 10. Endberechnung
    // -----------------------------
    let calories = TDEE * goalFactor * trainingBonus;

    // -----------------------------
    // 11. Sicherheits-Minimum
    // -----------------------------
    let minCal = (gender === 'female') ? 1300 : 1600;
    if (calories < minCal) calories = minCal;

    const finalCal = Math.round(calories);

    console.log("BMR:", Math.round(BMR));
    console.log("TDEE:", Math.round(TDEE));
    console.log("BMI:", BMI.toFixed(1));
    console.log("Berechnet:", finalCal);

    // -----------------------------
    // 12. UI Update
    // -----------------------------
    const card = document.getElementById('calorie-card');
    const valSpan = document.getElementById('cal-val');

    // Save final calories to data object so it persists
    data.calories = finalCal;
    
    // Ensure we update global window object if suitable
    if(typeof window.obData !== 'undefined') {
        window.obData.calories = finalCal;
    }

    // Save entire data object to localStorage (preserving inputs)
    // Only save if we actually have data loaded (don't overwrite with meaningful defaults if empty)
    if(Object.keys(data).length > 2) { 
        localStorage.setItem('kellerGymData', JSON.stringify(data));
    }

    if (card) {
        card.style.display = 'block';
        if (valSpan) valSpan.innerText = finalCal.toLocaleString('de-DE');
    }
    

}


/* 
  completeSetup removed 
*/




