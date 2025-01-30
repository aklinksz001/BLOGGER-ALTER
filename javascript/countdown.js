let timeLeft = parseInt(document.getElementById('timer').innerText);
const progressCircle = document.getElementById('progress');

function updateTimer() {
    document.getElementById("timer").innerText = timeLeft + "s";
    
    let percent = (timeLeft / 1800) * 113.097;  // 1800s = 30 min
    progressCircle.style.strokeDashoffset = 113.097 - percent;

    timeLeft--;

    if (timeLeft <= 0) {
        window.location.href = "/others/Expired.html";
    } else {
        setTimeout(updateTimer, 1000);
    }
}

updateTimer();
