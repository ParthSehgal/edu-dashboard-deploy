const emailRegex = /^[a-zA-Z]+_[0-9]{4}[a-zA-Z]{2}[0-9]{2,3}@iitp\.ac\.in$/;
const email = "name_2401ai54@iitp.ac.in";
console.log("Regex:", emailRegex);
console.log("Email:", email);
console.log("Matches:", emailRegex.test(email));
