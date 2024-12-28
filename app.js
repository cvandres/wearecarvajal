const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const crypto = require("crypto");

const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html"); // Adjust the path to your index.html if necessary
});

// Serve the HTML form
app.get("/contact", (req, res) => {
    res.sendFile(__dirname + "/contact.html");
});

// Handle form submission and update Mailchimp subscriber
app.post("/", (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    // Mailchimp API setup
    const data = {
        members: [
            {
                email_address: email,
                customer_message: message,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const url = "https://us10.api.mailchimp.com/3.0/lists/447fa1636f"; // Replace with your Mailchimp List ID
    const options = {
        method: "POST",
        headers: {
            Authorization: 'auth e4c840f7055f3af6a00ee19a889054f5-us10'
          },
    };

    // Send the request to Mailchimp
    const request = https.request(url, options, (response) => {
        console.log(response.statusCode);
        console.log(url)
        const status = response.statusCode;
        if (status === 200) {
            res.sendFile(__dirname + "/sent.html");
        } else {
            res.send("There was an error with your submission. Please try again.");
        }

        response.on("data", (data) => {
            console.log(JSON.parse(data));
        });
    });

    request.write(jsonData);
    request.end();
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
