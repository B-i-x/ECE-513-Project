const bcrypt = require('bcrypt');

const password = '1234';
const storedHash = '$2b$10$zbXsNGgGwxQY96mfoBfM.eoKGra2bIda0CipWY.Eo78zKayKtLNFG'; // Example from logs

bcrypt.hash(password, 10).then((newHash) => {
    console.log("Re-hashed password:", newHash);
    bcrypt.compare(password, storedHash).then((isMatch) => {
        console.log("Password match result:", isMatch); // Should be true if hashes match
    });
});