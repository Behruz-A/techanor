$(function () {
  const fileTarget = $(".file_box .upload_hidden");
  let filename;

  $(".password_toggle").on("click", function () {
    const targetId = $(this).data("password-target"),
      passwordInput = document.getElementById(targetId),
      shouldShowPassword = passwordInput?.type === "password";

    if (!passwordInput) return;

    passwordInput.type = shouldShowPassword ? "text" : "password";
    $(this).attr(
      "aria-label",
      shouldShowPassword ? "Hide password" : "Show password",
    );
  });

  fileTarget.on("change", function () {
    if (window.FileReader) {
      const uploadFile = $(this)[0].files[0],
        fileType = uploadFile["type"],
        validImageType = ["image/jpg", "image/jpeg", "image/png"];
      if (!validImageType.includes(fileType)) {
        alert("Please only jpeg, jpg and png!");
        $(this).val("");
        $(this).siblings(".upload_name").val("No image selected");
        return;
      } else {
        if (uploadFile) {
          $(".upload_img_frame")
            .attr("src", URL.createObjectURL(uploadFile))
            .prop("hidden", false)
            .addClass("success");
          $(".upload_placeholder").hide();
        }
        filename = $(this)[0].files[0].name;
      }
      $(this).siblings(".upload_name").val(filename);
    }
  });
});

function validateSignupForm() {
  const memberNick = String($(".member_nick").val() || "").trim(),
    memberPhone = String($(".member_phone").val() || "").trim(),
    memberPassword = $(".member_password").val(),
    confirmPassword = $(".confirm_password").val();

  if (
    memberNick === "" ||
    memberPhone === "" ||
    memberPassword === "" ||
    confirmPassword === ""
  ) {
    alert("Please insert all required inputs");
    return false;
  }

  if (memberPassword !== confirmPassword) {
    alert("Password differs, please check!");
    return false;
  }
  const memberImage = $(".member_image").get(0)?.files[0]?.name
    ? $(".member_image").get(0)?.files[0]?.name
    : null;
  if (!memberImage) {
    alert("Please select a store profile image!");
    return false;
  }

  return true;
}
