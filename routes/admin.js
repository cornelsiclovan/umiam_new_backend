const express = require("express");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator/check");

const router = express.Router();

// PRODUCT ROUTES

router.get(
        "/products", 
        isAuth, 
        adminController.getProducts
    );

router.get(
        "/products/:productId", 
        isAuth, 
        adminController.getProduct
    );

router.post(
        "/products", 
        isAuth,
        [
            body("title").trim().isLength({min: 5}),
            body("price").trim().isNumeric(),
            body("description").trim().isLength()
        ],   
        adminController.createProduct
    );

router.put(
        "/products/:productId", 
        isAuth,
        [
            isAuth,
            [
                body("title").trim().isLength({min: 5}),
                body("price").trim().isNumeric(),
                body("description").trim().isLength()
            ], 
        ], 
        adminController.editProduct
    );

router.delete(
        "/products/:productId", 
        isAuth, 
        adminController.deleteProduct
    );

// END PRODUCT ROUTES


// PLACES ROUTES

router.get(
    "/places",
    isAuth, 
        adminController.getPlaces
);

router.get(
    "/places/:placeId",
    isAuth,
    adminController.getPlace
);

router.post(
    "/places",
    isAuth,
    [
        body("title").trim().isLength({min: 5}),
        body("location").trim().isLength({min: 5}),
        body("description").trim().isLength({min: 5}),
        body("tableNumber").trim().isNumeric()
    ],   
    adminController.addPlace
);

router.put(
    "/places/:placeId",
    isAuth,
    [
        body("title").trim().isLength({min: 5}),
        body("location").trim().isLength({min: 5}),
        body("description").trim().isLength({min: 5}),
        body("tableNumber").trim().isNumeric()
    ],
    adminController.editPlace
);

router.delete(
    "/places/:placeId",
    isAuth,
    adminController.deletePlace
)

// END PLACES ROUTES



// CATEGORY ROUTES



// END CATEGORY ROUTES


// TYPE ROUTES



// END TYPE ROUTES

module.exports = router;