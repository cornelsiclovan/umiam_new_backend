const express = require("express");
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");


const router = express.Router();

router.get("/places", shopController.getPlaces);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.delete("/cart", isAuth, shopController.deleteCartProduct);

router.get("/orders", isAuth, shopController.getOrders);

router.post("/orders", isAuth, shopController.postOrder);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);

module.exports = router;