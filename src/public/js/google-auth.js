/* Google Identity Services for the admin authentication pages. */

(function () {
  function showGoogleError(message) {
    document.querySelectorAll(".google_auth_error").forEach(function (element) {
      element.textContent = message;
      element.classList.add("is_visible");
    });
  }

  async function handleGoogleCredential(response) {
    try {
      const request = await fetch("/admin/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const result = await request.json();

      if (!request.ok) {
        throw new Error(result.message || "Google authentication failed.");
      }

      window.location.assign(result.redirectUrl || "/admin/product/all");
    } catch (error) {
      showGoogleError(error.message || "Google authentication failed.");
    }
  }

  window.initializeGoogleAuth = function () {
    const authContainer = document.querySelector(".google_auth");
    const buttonContainer = document.querySelector(".google_auth_button");
    const googleTrigger = document.querySelector(".google_auth_trigger");
    const clientId = authContainer?.dataset.clientId;

    if (!authContainer || !buttonContainer || !googleTrigger) return;
    if (!clientId || !window.google?.accounts?.id) {
      showGoogleError("Google authentication is not configured.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleTrigger, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: Math.min(buttonContainer.clientWidth || 500, 500),
    });
  };
})();
