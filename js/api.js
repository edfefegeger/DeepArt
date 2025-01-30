document.getElementById("submitButton").addEventListener("click", async (event) => {
    event.preventDefault();

    const prompt = document.getElementById("prompt").value.trim();
    const videoUpload = document.getElementById("fileInput").files[0];
    const status = document.getElementById("status");
    const submitButton = document.getElementById("submitButton");
    const downloadSection = document.getElementById("downloadSection");

    if (!prompt || !videoUpload) {
        status.textContent = "Please enter a description and select a video.";
        return;
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("image", videoUpload); 

    console.log("Sending request with data:");
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }

    status.textContent = "Generating new video, please wait...";
    submitButton.disabled = true;

    try {
        const response = await fetch("http://62.72.20.247:8010/generate-video", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to start video generation: ${errorText}`);
        }

        const { task_id } = await response.json();
        localStorage.setItem("task_id", task_id);

        let taskStatus;
        do {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const statusResponse = await fetch(`http://62.72.20.247:8010/status/${task_id}`);
            const statusJson = await statusResponse.json();
            taskStatus = statusJson.status;

            status.textContent = `Task status: ${taskStatus}`;
        } while (taskStatus !== "completed");

        const videoResponse = await fetch(`http://62.72.20.247:8010/get-video/${task_id}`);
        if (!videoResponse.ok) {
            throw new Error("Failed to fetch video URL");
        }
        const { video_url } = await videoResponse.json();

        status.textContent = "Video successfully generated!";
        downloadSection.style.display = "block";

        const videoPlayer = document.getElementById("videoPlayer");
        videoPlayer.src = video_url;
        videoPlayer.style.display = "block";
        videoPlayer.controls = true;

    } catch (error) {
        console.error("Error during video generation:", error);
        status.textContent = "Error: " + error.message;
    } finally {
        submitButton.disabled = false;
    }
});
