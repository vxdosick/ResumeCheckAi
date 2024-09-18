function updateFileName() {
    const scanFileinput = document.querySelector(".scan__fileinput")
    const scanFilename = document.querySelector(".scan__filename")
    const scanType = document.querySelector(".scan__type")
    const scanAccept = document.querySelector(".scan__accept button")
    if (scanFileinput.files.length > 0) {
        scanFilename.textContent = scanFileinput.files[0].name
        scanType.classList.add("display--flex")
        scanType.classList.remove("display--none")
        scanAccept.classList.add("button--general")
        scanAccept.classList.remove("button--disabled")
    } else if (scanFileinput.files.length < 0) {
        scanFilename.textContent = "No file selected"
    }
}
function startLoading() {
    const scanLoading = document.querySelector(".scan__loading")
    const scanAccept = document.querySelector(".scan__accept button")
    scanLoading.classList.add("display--flex")
    scanLoading.classList.remove("display--none")
    scanAccept.classList.add("button--disabled")
}

const scanForm = document.querySelector(".scan__form")
scanForm.addEventListener("submit", (e) => {
    e.preventDefault()
    startLoading()

    setTimeout(() => {
        scanForm.submit();
        console.log("okay");
        
    }, 5000)
})