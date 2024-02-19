// get the elements

document.getElementById("loginButton").addEventListener(onclick(), formvalid)
function formvalid(){
    const validPass = document.getElementById("inputPassword4").value;

    if (validPass.length <= 8 || validPass.length >= 20) {
        document.getElementById("passwordLabel").innerHTML = "Password must be at least 8 Characters and not more than 20"
    }
}