const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AedNI1edFGH15QUaTcJpYt3RjQaCZpwd7M17a-KwX23Y-6fY0sl_GkjpIlKASYmh2kTAlh6Jawj1oUqv",
  client_secret: "EFQCqX1pIbuIR-2PiRPqzWKJodR5py6mbdJop3BktWHUyJsxhlEsyRdJ_LaGKkUZOVZ5YZ51mxOazEws",
});

module.exports = paypal;
