document.addEventListener("DOMContentLoaded", function () {
  const passwordInput = document.querySelector(".member_password");
  const passwordToggle = document.querySelector(".password_toggle");

  if (!passwordInput || !passwordToggle) return;

  passwordToggle.addEventListener("click", function () {
    const shouldShowPassword = passwordInput.type === "password";

    passwordInput.type = shouldShowPassword ? "text" : "password";
    passwordToggle.setAttribute(
      "aria-label",
      shouldShowPassword ? "Hide password" : "Show password",
    );
    passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
  });
});
