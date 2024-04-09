// script.js
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const LoginPageContainer = document.querySelector(".LoginPageContainer");
  const emailForm = document.getElementById("emailForm");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const recipientListDiv = document.getElementById("recipientList");
  const sendButton = document.getElementById("sendButton");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send username and password to the server for authentication
    authenticate(username, password);
  });

  sendButton.addEventListener("click", function () {
    const content = document.getElementById("emailContent").value;
    const recipients = Array.from(
      document.querySelectorAll('input[name="recipient"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!content) {
      alert("Email content is required.");
      return;
    }

    if (recipients.length === 0) {
      alert("At least one recipient is required.");
      return;
    }

    // Show loading spinner
    loadingSpinner.style.display = "block";

    // Send email content and recipients to the server
    sendEmail(content, recipients);
  });

  function authenticate(username, password) {
    fetch("/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          getReceiepentsList();
          // Hide login form and show email form
          LoginPageContainer.style.display = "none";
          emailForm.style.display = "block";
        } else {
          alert("Invalid username or password");
        }
      })
      .catch((error) => {
        console.error("Error occurred:", error);
        alert("An error occurred. Please try again later.");
      });
  }

  function sendEmail(content, recipients) {
    fetch("/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, recipients }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Email sent successfully!");
        } else {
          alert("Error occurred, email not sent.");
        }
      })
      .catch((error) => {
        console.error("Error occurred:", error);
        alert("An error occurred. Please try again later.");
      })
      .finally(() => {
        // Hide loading spinner
        loadingSpinner.style.display = "none";
      });
  }

  // Fetch recipients from the server
  function getReceiepentsList() {
    fetch("/recipient-list")
      .then((response) => response.json())
      .then((data) => {
        // Handle response
        const recipients = data.recipients;
        // Display recipients in the UI
        recipients.forEach((recipient, index) => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "recipient";
          checkbox.value = recipient;
          checkbox.id = "recipient" + index;

          const label = document.createElement("label");
          label.htmlFor = "recipient" + index;
          label.appendChild(document.createTextNode(recipient));

          recipientListDiv.appendChild(checkbox);
          recipientListDiv.appendChild(label);
          recipientListDiv.appendChild(document.createElement("br"));
        });
      })
      .catch((error) => {
        console.error("Error fetching recipients:", error);
        alert("An error occurred while fetching recipients.");
      });
  }
});
