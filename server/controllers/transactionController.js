const Transaction = require("../models/Transaction");

// Create transaction
const createTransaction = async (req, res) => {
   
  try {
    const {
      type,
      amount,
      category,
      description,
      paymentMethod,
      date,
    } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        message:
          "Type, amount and category are required.",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type.",
      });
    }

    const transaction = await Transaction.create({
      user: req.user.userId,
      type,
      amount,
      category,
      description,
      paymentMethod,
      date: date || new Date(),
    });

    res.status(201).json({
      message: "Transaction created successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      message: "Failed to create transaction.",
    });
  }
};

// Get user's transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: "Failed to fetch transactions.",
    });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user: req.user.userId,
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);

    res.status(500).json({
      message: "Failed to fetch transaction.",
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction =
      await Transaction.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      message: "Transaction updated successfully.",
      transaction,
    });
  } catch (error) {
    console.error(
      "Update transaction error:",
      error
    );

    res.status(500).json({
      message: "Failed to update transaction.",
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction =
      await Transaction.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId,
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete transaction error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete transaction.",
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};