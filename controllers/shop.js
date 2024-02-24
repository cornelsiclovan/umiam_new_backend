const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const e = require("express");
const  stripe = require("stripe")(process.env.STRIPE_KEY);
const PDFDocument = require("pdfkit");
const OrderItem = require("../models/order-item");
const Place = require("../models/place");
const Type = require("../models/type");
const Category = require("../models/category");
const CartItem = require("../models/cart-item");

exports.getPlaces = async (req, res, next) => {
  let places = [];
  let totalItems = 0;

  try {
    places = await Place.findAll();

    totalItems = places.length;

    if(!places || places.length === 0) {
      const error = new Error("No places are available for your request");
      throw error;
    } 

    res.status(200).json({
      places: places,
      totalItems: totalItems
    });
  } catch (error) {
    next(error);
  }
}

exports.getProducts = async (req, res, next) => {
  const typeId = req.query.typeId;
  const categoryId = req.query.categoryId;
  const placeId = req.query.placeId;

  const page = +req.query.page || 1;
  const items_per_page = +req.query.items_per_page || 250;

  let queryObject = {};

  if(placeId) {
    queryObject.placeId = placeId;
  }

  if(typeId) {
    queryObject.typeId = typeId;
  }

  if(categoryId) {
    queryObject.categoryId = categoryId;
  }


  let products = [];
  let totalItems = 0;

  try {
    products = await Product.findAll({where: queryObject, offset: page - 1, limit: items_per_page});
    totalItems = products.length;

    let productsToSend = await Promise.all(
      products.map(async (product) => {
        let type = await Type.findByPk(product.typeId);
        let category = await Category.findByPk(product.categoryId);

        return {
          id: product.id,
          title: product.title,
          typeId: product.typeId,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          categoryId: product.categoryId,
          type: type.title,
          category : category.title,
          imageUrl: product.imageUrl,
          price: product.price,
          place: product.placeId
        }
      })
    )

    res.status(200).json({
      queryObject: queryObject,
      totalItems: totalItems,
      products: productsToSend,
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

    let user = await User.findOne({where: {tableId: req.query.tableId}});
    
    if(!user) {
      user = await User.create({
        name: req.query.tableId,
        email: req.query.tableId,
        password: req.query.tableId,
        registryToken: req.query.tableId,
        registryTokenExpiration: req.query.tableId,
        tableId: req.query.tableId
      });
    }

    if(!user) {
      const error = new Error('Cart is empty');
      error.statusCode = 401;
      throw error;
    }

    const cart = await user.getCart();

    if(!cart) {
      res.status(200).json({
        productsInCart: [],
      });
    }

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
  const fishWeight = req.body.fishWeight;

  try {
    let user = await User.findOne({where: {tableId: req.body.tableId}});

    if(!user) {
      user = await User.create({
        name: req.body.tableId,
        email: req.body.tableId,
        password: req.body.tableId,
        registryToken: req.body.tableId,
        registryTokenExpiration: req.body.tableId,
        tableId: req.body.tableId
      });

    }

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
     
    }

   

    product = await Product.findByPk(productId);


    if(!product) {
      const error = new Error("Product does not exist");
      error.statusCode = 404;
      throw error;
    }

    if(productId !== 111 && productId !==112) {
      await cart.addProduct(product, { through: { quantity: newQuantity } });
    } else {
      await CartItem.create({
        productId: productId,
        quantity: fishWeight || 1,
        cartId: cart.id
      })
    }




    const productsInCart = await cart.getProducts();

    res.status(200).json({
      message: "Product added to cart.",
      productsInCart: productsInCart
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
   // let user = await User.findOne({where: {tableId: req.query.tableId}});
    // cart = await user.getCart();
     await CartItem.destroy({ where: { id: productId } });



   // console.log(products[0]);
    //products[0].cartItem.destroy();

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
  // for different place add place id at the request

  let fetchedCart;
  const total = req.body.total;
  console.log(req.body);
  const tableNumber = req.body.tableNumber;

  try {
    let user = await User.findOne({where: {tableId: req.query.tableId}});
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


    const order = await user.createOrder({
      total: total,
      table_id: tableNumber
    });
   
    
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );

    await fetchedCart.setProducts(null);

    const userDetails = {
      name: user.name,
      email: user.email
    }


    res.status(200).json({
        order: order,
        user: userDetails,
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

    console.log("checkout");

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
