const Customer = require("../models/customer.model");

exports.createCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.json(customer);
};

exports.getCustomers = async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Customer.findByIdAndUpdate(id, req.body, {
      new: true
    });
    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Customer.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
