function submitData(){
    let name = document.getElementById("exampleInputName").value
    let email = document.getElementById("exampleInputEmail").value
    let phoneNumber = document.getElementById("exampleInputPhoneNumber").value
    let subject = document.getElementById("inputGroupSelect").value
    let message = document.getElementById("exampleFormControlTextarea1").value

    if(name == ""){
       return alert("Nama harus diisi")
    }else if(email == ""){
        return alert("Email harus diisi")
    }else if(phoneNumber == ""){
        return alert("Nomor Handphone harus diisi")
    }else if(subject == ""){
        return alert("Subject harus diisi")
    }else if(message == ""){
        return alert("Pesan Harus diisi")
    }
 
    let emailReciever = "khairulumam950@gmail.com"

    let a =document.createElement('a');
    a.href =`mailto:${emailReciever}?subject=${subject}&body=Hallo nama saya ${name}, ${message}, silahkan hubungi saya dengan email ${email} atau telepon di ${phoneNumber}`;
    a.click();

    let user ={
        name,
        email,
        phoneNumber,
        subject,
        message
    }

    // console.log(user);
}