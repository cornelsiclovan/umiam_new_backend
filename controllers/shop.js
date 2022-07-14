const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const e = require("express");
const  stripe = require("stripe")(process.env.STRIPE_KEY);
const PDFDocument = require("pdfkit");
const OrderItem = require("../models/order-item");

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;

  let products = [];
  let totalItems = 0;

  const ITEMS_PER_PAGE = 1;

  try {
    totalItems = await Product.count();
    products = await Product.findAll({offset: page - 1, limit: ITEMS_PER_PAGE});

    res.status(200).json({
      totalItems: totalItems,
      products: products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    const cart = await user.getCart();

    if(!cart) {
      const error = new Error('Cart is empty');
      error.statusCode = 401;
      throw error;
    }

    const products = await cart.getProducts();
    res.status(200).json({
      productsInCart: products,
    });
  } catch (error) {
    next(error);
  }
};

exports.postCart = async (req, res, next) => {
  const productId = req.body.productId;

  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      const error = new Error("User doesn't exist!");
      error.statusCode = 404;
      throw error;
    }

    let cart = await user.getCart();
    if (!cart) cart = await user.createCart();

    const products = await cart.getProducts({ where: { id: productId } });

    let product;
    if (products.length > 0) {
      product = products[0];
    }

    let newQuantity = 1;
    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      console.log(newQuantity);
    }

    product = await Product.findByPk(productId);

    await cart.addProduct(product, { through: { quantity: newQuantity } });

    res.status(200).json({
      message: "Product added to cart.",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deleteCartProduct = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const user = await User.findByPk(req.userId);
    const cart = await user.getCart();
    const products = await cart.getProducts({ where: { id: productId } });

    console.log(products[0]);
    products[0].cartItem.destroy();

    res.status(200).json({
      message: "Product delete.",
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  const user =  await User.findByPk(req.userId);
  try {
    const orders = await user.getOrders({include: ['products']});

    if(!orders || orders.length === 0) {
      const error = new Error("No orders yet");
      error.statusCode = 400;
      throw(error);
    }

    res.status(200).json({
      orders: orders
    });
  } catch(error) {
    next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  let fetchedCart;

  try {
    const user = await User.findByPk(req.userId);
    const cart = await user.getCart();
    if(!cart) {
      const error = new Error("Cart is empty");
      error.statusCode = 404;
      throw error;
    }

    fetchedCart = cart;


    const products = await cart.getProducts();

    if(products.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 404;
      throw error;
    }

    const order = await user.createOrder();
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );

    await fetchedCart.setProducts(null);


    res.status(200).json({
        message: "Order created."
    });
  } catch (error) {
    next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  let total = 0;

  try {
    const user = await User.findByPk(req.userId);

    if(!user) {
      const error = new Error('User does not exist!');
      error.statusCode = 404;
      throw error;
    }

    const cart = await user.getCart({include: ['products']});

    if(!cart || cart.products.length === 0) {
      const error = new Error('Cart is empty');
      error.statusCode = 404;
      throw error;
    }

    const products = cart["products"];

    products.forEach(element => {
      total += element.cartItem.quantity * element.price;
      console.log(element.quantity);
    });

    
    //// payment code //////
    //// STRYPE EXAMPLE ////

    // await stripe.checkout.sessions.create({
    //   payment_methods_type: ['cart'],
    //   line_items: products.map(element => {
    //     return {
    //       name: element.title,
    //       description: element.description,
    //       amount: element.price * 100,
    //       currency: 'usd',
    //       quantity: element.cartItem.quantity
    //     }
    //   }),
    //   success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:8080/checkout/success
    //   cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
    // })

    //// END PAYMENT ///////

    res.status(200).json({
      message: "payment process started"
    });

  } catch(error) {
    next(error);
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const cart = await user.getCart();
    if(!cart) {
      const error = new Error("Cart is empty");
      error.statusCode = 404;
      throw error;
    }

    fetchedCart = cart;


    const products = await cart.getProducts();

    if(products.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 404;
      throw error;
    }

    const order = await user.createOrder();
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );

    await fetchedCart.setProducts(null);


    res.status(200).json({
        message: "Order created."
    });
   
  } catch(error) {
    next(error);
  }
};


exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByPk(orderId, {include: ["products"]});
   
    if(!order) {
      const error = new Error("Order does not exist");
      error.statusCode = 400;
      throw error;
    }

    if(order.userId.toString() !== req.userId.toString()) {
      const error = new Error("Unauthorized!");
      error.statusCode = 403;
      throw error;
    }

    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfdoc = new PDFDocument();
   
    pdfdoc.pipe(fs.createWriteStream(invoicePath));
    pdfdoc.pipe(res);
    pdfdoc.fontSize(26).text("invoice", { underline: true });
    pdfdoc.text("--------------------------------------");

    let totalPrice = 0;

    order.products.forEach(product => {
      totalPrice = totalPrice + product.orderItem.quantity * product.price;
    
      pdfdoc.fontSize(14).text(
        product.title +
        " - " +
        product.orderItem.quantity +
        " x " +
        product.orderItem.price
      );
    })

    pdfdoc.text("-------");
    pdfdoc.fontSize(20).text("Total Price: $" + totalPrice);
    pdfdoc.end();
    
    fs.readFile(invoicePath, (err, data) => {
      if(err) {
        throw err;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );

      res.status(200).send(data);

    });

    // res.status(200).json({
    //   order: order
    // });
  } catch(error) {
    next(error);
  }
  

};
