const express = require("express");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator/check");
const isAdmin = require("../middleware/is-admin");
const isOwner = require("../middleware/is-owner");
const isEmployee = require("../middleware/is-employee");


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
        isOwner,
        [
            body("title").trim().isLength({min: 5}),
            body("price").trim().isNumeric(),
            body("description").trim().isLength(),
            body("categoryId").isNumeric(),
            body("placeId").isNumeric(),
            body("typeId").isNumeric()
        ],   
        adminController.createProduct
    );

router.put(
        "/products/:productId", 
        isAuth,
        isOwner,
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
    isOwner,
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
    isOwner,
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
    isOwner,
    adminController.deletePlace
)

// END PLACES ROUTES



// CATEGORY ROUTES

router.get(
    "/categories",
    isAuth, 
    adminController.getCategories
);

router.get(
    "/categories/:categoryId",
    isAuth,
    adminController.getCategory
);

router.post(
    "/categories",
    isAuth,
    isAdmin,
    [
        body("title").trim().isLength({min: 3}),
        body("description").trim().isLength({min: 5}),
    ],   
    adminController.addCategory
);

router.put(
    "/categories/:categoryId",
    isAuth,
    isAdmin,
    [
        body("title").trim().isLength({min: 5}),
        body("description").trim().isLength({min: 5}),
    ],
    adminController.editCategory
);

router.delete(
    "/categories/:categoryId",
    isAuth,
    isAdmin,
    adminController.deleteCategory
)


// END CATEGORY ROUTES


// TYPE ROUTES

router.get(
    "/places/:placeId/types",
    isAuth, 
    adminController.getTypes
);

router.get(
    "/types/:typeId",
    isAuth,
    adminController.getType
);

router.post(
    "/types",
    isAuth,
    isOwner,
    [
        body("title").trim().isLength({min: 3}),
        body("description").trim().isLength({min: 5}),
        body("placeId").isNumeric(),
        body("categoryId").isNumeric()
    ],   
    adminController.addType
);

router.put(
    "/types/:typeId",
    isAuth,
    isOwner,
    [
        body("title").trim().isLength({min: 5}),
        body("description").trim().isLength({min: 5}),
        body("placeId").isNumeric(),
        body("categoryId").isNumeric()
    ],
    adminController.editType
);

router.delete(
    "/types/:typeId",
    isAuth,
    isOwner,
    adminController.deleteType
)

// END TYPE ROUTES

module.exports = router;