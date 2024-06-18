document.addEventListener("DOMContentLoaded", () => {
  const locationInput = document.getElementById("location");
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  const eventTypeInput = document.getElementById("eventType");
  const imagensInput = document.getElementById("imagens");
  const addPostButton = document.getElementById("add-post");
  const postList = document.getElementById("posts");

  addPostButton.addEventListener("click", async () => {
    const location = locationInput.value.trim();
    const latitude = parseFloat(latitudeInput.value.trim());
    const longitude = parseFloat(longitudeInput.value.trim());
    const eventType = eventTypeInput.value.trim();
    const imagens = imagensInput.value.trim().split(",");

    if (
      !location ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      !eventType ||
      !imagens.length
    )
      return;

    const response = await fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location,
        latitude,
        longitude,
        eventType,
        imagens,
        Datatime: new Date().toISOString(),
        likes: 0,
      }),
    });
    const newPost = await response.json();
    addPostToDOM(newPost);
    locationInput.value = "";
    latitudeInput.value = "";
    longitudeInput.value = "";
    eventTypeInput.value = "";
    imagensInput.value = "";
  });

  async function loadPosts() {
    const response = await fetch("/api/posts");
    const posts = await response.json();
    posts.forEach(addPostToDOM);
  }

  function addPostToDOM(post) {
    const li = document.createElement("li");
    li.textContent = `${post.eventType} at ${post.location} (${post.likes} likes)`;

    const likeButton = document.createElement("button");
    likeButton.textContent = "Like";
    likeButton.addEventListener("click", async () => {
      const response = await fetch(`/api/post/${post.id}/like`, {
        method: "POST",
      });
      const updatedPost = await response.json();
      li.textContent = `${updatedPost.eventType} at ${updatedPost.location} (${updatedPost.likes} likes)`;
    });

    li.appendChild(likeButton);
    postList.appendChild(li);
  }

  loadPosts();
});
