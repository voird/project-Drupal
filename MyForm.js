function saveLocalStorage() {
    localStorage.setItem("fname", $("#fname").val());
    localStorage.setItem("fnumber", $("#fnumber").val());
    localStorage.setItem("femail", $("#femail").val());
    localStorage.setItem("fmessage", $("#fmessage").val());
    localStorage.setItem("fpolicy", $("#fpolicy").prop("checked"));
}

function loadLocalStorage() {
    if (localStorage.getItem("fname") !== null)
        $("#fname").val(localStorage.getItem("fname"));
    if (localStorage.getItem("fnumber") !== null)
        $("#fnumber").val(localStorage.getItem("fnumber"));
    if (localStorage.getItem("femail") !== null)
        $("#femail").val(localStorage.getItem("femail"));
    if (localStorage.getItem("fmessage") !== null)
        $("#fmessage").val(localStorage.getItem("fmessage"));
    if (localStorage.getItem("fpolicy") !== null) {
        $("#fpolicy").prop("checked", localStorage.getItem("fpolicy") === "true");
        if ($("#fpolicy").prop("checked"))
            $("#sendButton").removeAttr("disabled");
    }
}
function clear() {
    localStorage.clear()
    $("#fname").val("");
    $("#fnumber").val("");
    $("#femail").val("");
    $("#fmessage").val("");
    $("#fpolicy").val(false);
}

$(document).ready(function () {
    loadLocalStorage();
    $("#form").submit(function (e) {
        e.preventDefault();
        let data = $(this).serialize();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://formcarry.com/s/Vf5gz_Dw-z",
            data: data,
            success: function (response) {
                if ((response.status == "success") && (!grecaptcha.getResponse())) {
                    alert("Форма отправлена!");
                    clear();
                } else {
                    alert("Произошла ошибка: " + response.message);
                }
            }
        });
    });
    $("#fpolicy").change(function () {
        if ((!this.checked))
            $("#sendButton").attr("disabled", "");
        else
            $("#sendButton").removeAttr("disabled");
    })


    $("#form").change(saveLocalStorage);
})