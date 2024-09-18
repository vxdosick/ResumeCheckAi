function updateFileName() {
    const scanFileinput = document.querySelector(".scan__fileinput")
    const scanFilename = document.querySelector(".scan__filename")
    const scanType = document.querySelector(".scan__type")
    if (scanFileinput.files.length > 0) {
        scanFilename.textContent = scanFileinput.files[0].name
        scanType.classList.add("display--flex")
        scanType.classList.remove("display--none")
    } else if (scanFileinput.files.length < 0) {
        scanFilename.textContent = "No file selected"
    }
}