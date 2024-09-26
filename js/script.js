function updateFileName() {
    const scanFileinput = document.querySelector(".scan__fileinput")
    const scanFilename = document.querySelector(".scan__filename")
    const scanAccept = document.querySelector(".scan__accept button")
    if (scanFileinput.files.length > 0) {
        scanFilename.textContent = scanFileinput.files[0].name
        scanAccept.classList.add("button--general")
        scanAccept.classList.remove("button--disabled")
        scanAccept.removeAttribute("disabled")
    } else if (scanFileinput.files.length < 0) {
        scanFilename.textContent = "No file selected"
        scanAccept.setAttribute("disabled", true )
    }
}
function startLoading() {
    const scanLoading = document.querySelector(".scan__loading")
    const scanAccept = document.querySelector(".scan__accept button")
    scanLoading.classList.add("display--flex")
    scanLoading.classList.remove("display--none")
    scanAccept.classList.add("button--disabled")
}

const analyzeResume = async (file, companyType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_type", companyType);
    try {
        const response = await fetch("http://resume-scan-ai.digital/api/analyze-resume", {
            method: "POST",
            body: formData
        })
        if(!response.ok) {
            window.location.href = "/error.html";
            throw new Error("Error analyzing resume")
        } else if (response.ok) {
            const result = await response.json();
            console.log(result);
            localStorage.setItem('resumeFeedback', JSON.stringify(result));
            window.location.href = "/feedback.html";
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

const loadFeedback = () => {
    const feedbackData = JSON.parse(localStorage.getItem('resumeFeedback'));

    if (feedbackData) {
        const feedbackTitle = document.querySelector(".feedback__title");
        const feedbackPlus = document.querySelector(".feedback__plus nav ul");
        const feedbackMinus = document.querySelector(".feedback__minus ul");
        const feedbackFooter = document.querySelector(".feedback__footer h3");

        feedbackTitle.textContent = `${feedbackData.rating}/10`;

        feedbackPlus.innerHTML = '';
        feedbackMinus.innerHTML = '';

        const pluses = feedbackData.strengths;
        pluses.forEach(plus => {
            const li = document.createElement('li');
            li.classList.add('feedback__step');
            const p = document.createElement('p');
            const img = document.createElement('img');

            p.textContent = plus;
            img.src = '/img/feedback/plus.svg';

            li.appendChild(img);
            li.appendChild(p);
            feedbackPlus.appendChild(li);
        });

        const minuses = feedbackData.weaknesses;
        minuses.forEach(minus => {
            const li = document.createElement('li');
            li.classList.add('feedback__step');
            const p = document.createElement('p');
            const img = document.createElement('img');

            p.textContent = minus;
            img.src = '/img/feedback/minus.svg';

            li.appendChild(img);
            li.appendChild(p);
            feedbackMinus.appendChild(li);
        });

        feedbackFooter.textContent = feedbackData.summary;
    } else {
        console.error("No feedback data found");
    }
};

if (window.location.pathname === "/feedback.html") {
    loadFeedback();
} else {
    const scanSubmit = document.querySelector(".scan__submit")
    scanSubmit.addEventListener("click", (e) => {
    console.log("okay");
    e.preventDefault();
    startLoading()
    
    const scanFileinput = document.querySelector(".scan__fileinput")
    const companyType = document.querySelector('input[name="company_type"]:checked')?.value;

    const file = scanFileinput.files[0];
    if (file && companyType) {
        analyzeResume(file, companyType)
    } else {
        alert("Please select a file.pdf and select company type")
    }
})
}