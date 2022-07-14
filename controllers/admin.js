const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../models/product");
const Place = require("../models/place");

// get products per place 
exports.getProducts = async (req, res, next) => {
  const placeId = req.body.placeId;
  const categoryId = req.body.categoryId;


  let products = [];
  let totalItems = 0;


  try {
    products = await Product.findAll({'where': {'userid': req.userId }});

    if(categoryId) {
      products = products.filter((product) => {
        return product.categoryId !== categoryId
      })
    }


    res.status(200).json({
      products: products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error("This product does not exist!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.status = 422;
      error.data = errors.array();
      throw error;
    }

    // if(!req.file) {
    //     const error = new Error("No image provided!");
    //     error.statusCode = 422;
    //     throw error;
    // }
  } catch (error) {
    next(error);
    return;
  }

  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  try {
    const product = await Product.create({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      userId: req.userId,
    });

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.editProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      const error = new Error("Product does not exist!");
      error.statusCode = 403;
      throw error;
    }

    if (product.userId !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDescription;

    await product.save();

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      const error = new Error("Could not find product.");
      error.statusCode = 404;
      throw error;
    }

    if (product.userId !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    fileHelper.deleteFile(product.imageUrl);

    await product.destroy();

    res.status(200).json({ message: "Deleted post!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

//// PLACE

exports.getPlaces = async (req, res, next) => {
  let places = [];
  let totalItems = 0;


  try {
    places = await Place.findAll({'where': {'userid': req.userId }});

    totalItems = places.length;

    if(!places || places.length === 0) {
      const error = new Error("No places are found for this user!");
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

exports.getPlace = async (req, res, next) => {
  const placeId = req.params.placeId;
  
  console.log(req.userId);
  
  try {
    const place = await Place.findByPk(placeId);
    
    if (!place) {
      const error = new Error("This place does not exist!");
      error.statusCode = 404;
      throw error;
    }
    
    if(place.userId !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      place: place,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

exports.addPlace = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.status = 422;
      error.data = errors.array();
      throw error;
    }

  } catch (error) {
    next(error);
    return;
  }

  const title = req.body.title;
  const description = req.body.description;
  const location = req.body.location;
  const tableNumber = req.body.tableNumber;

  try {
    const place = await Place.create({
      title: title,
      description: description,
      location: location,
      tableNumber: tableNumber,
      userId: req.userId,
    });

    res.status(200).json({
      place: place,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
}

exports.editPlace = async (req, res, next) => {
  const placeId = req.params.placeId;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const place = await Place.findByPk(placeId);

    if (!place) {
      const error = new Error("Place does not exist!");
      error.statusCode = 403;
      throw error;
    }

    if (place.userId !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    const updatedTitle = req.body.title;
    const updatedLocation = req.body.location;
    const updatedTableNumber = req.body.tableNumber;
    const updatedDescription = req.body.description;

    place.title = updatedTitle;
    place.location = updatedLocation;
    place.tableNumber = updatedTableNumber;
    place.description = updatedDescription;

    await place.save();

    res.status(200).json({
      place: place,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 404;
    }
    next(error);
  }
}

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.placeId;
  try {
    const place = await Place.findByPk(placeId);

    if (!place) {
      const error = new Error("Could not find place.");
      error.statusCode = 404;
      throw error;
    }

    if (place.userId !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    await place.destroy();

    res.status(200).json({ message: "Deleted place!" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

//// END PLACE


//// CATEGORY

exports.getCategories = async (req, res, next) => {

}

exports.getCategory = async (req, res, next) => {

}

exports.addCategory = async (req, res, next) => {

}

exports.editCategory = async (req, res, next) => {

}

exports.deleteCategory = async (req, res, next) => {

}

//// END CATEGORY

//// TYPE

exports.getTypes = async (req, res, next) => {

}

exports.getType = async (req, res, next) => {

}

exports.addType = async (req, res, next) => {

}

exports.editType = async (req, res, next) => {

}

exports.deleteType = async (req, res, next) => {

}

//// END TYPE
