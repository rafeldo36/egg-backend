const Customer = require("../models/customer.model");

exports.createCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.json(customer);
};

exports.getCustomers = async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
};
