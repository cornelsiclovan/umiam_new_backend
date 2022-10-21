const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../models/product");
const Place = require("../models/place");
const Category = require("../models/category");
const Type = require("../models/type");

// get products per place 
exports.getProducts = async (req, res, next) => {
  const placeId = req.query.placeId;
  const categoryId = req.query.categoryId;
  const typeId = req.query.typeId;

  let queryObject = {userId: req.userId};

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
    products = await Product.findAll({'where': queryObject});

    totalItems = products.length;

    res.status(200).json({
      products: products,
      totalItems: totalItems
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

    const place = await Place.findByPk(req.body.placeId);

    if(place.userId !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 400;
      throw error;
    }

    const type = await Type.findByPk(req.body.typeId);

    if(!type) {
      const error = new Error("Invalid type");
      error.statusCode = 400;
      throw error;
    }


    if(type.placeId !== place.id) {
      const error = new Error("The type is not from the selected place");
      error.statusCode = 400;
      throw error;
    } 

    const category = await Category.findByPk(req.body.categoryId);

    
    if(!category) {
      const error = new Error("Invalid category");
      error.statusCode = 400;
      throw error;
    }


    if(type.categoryId !== category.id) {
      const error = new Error("The type is not from the selected category");
      error.statusCode = 400;
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
  const placeId = req.body.placeId;
  const categoryId = req.body.categoryId;
  const typeId = req.body.typeId;

  try {
    const product = await Product.create({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      userId: req.userId,
      placeId: placeId,
      categoryId: categoryId,
      typeId: typeId
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


    const type = await Type.findByPk(req.body.typeId);

    if(!type) {
      const error = new Error("Invalid type");
      error.statusCode = 400;
      throw error;
    }


    if(type.placeId !== place.id) {
      const error = new Error("The type is not from the selected place");
      error.statusCode = 400;
      throw error;
    } 

    const category = await Category.findByPk(req.body.categoryId);

    
    if(!category) {
      const error = new Error("Invalid category");
      error.statusCode = 400;
      throw error;
    }


    if(type.categoryId !== category.id) {
      const error = new Error("The type is not from the selected category");
      error.statusCode = 400;
      throw error;
    }

    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedTypeId = req.body.typeId;
    const updatedCategoryId = req.body.categoryId;
    const updatedPlaceId = req.body.placeId;

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDescription;
    product.typeId = updatedTypeId;
    product.categoryId = updatedCategoryId;
    product.placeId = updatedPlaceId;

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

  console.log(req.body);

  if(!req.isOwner) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }

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
  
  console.log(req.isOwner);

  if(!req.isOwner) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }
  
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
  
  if(!req.isOwner) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }
  
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
  let categories = [];
  let totalItems = 0;


  try {

    categories = await Category.findAll();

    if(!categories || categories.length === 0) {
      const error = new Error("There is no category available");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      categories: categories,
      totalItems: totalItems
    });

  } catch (error) {
    next(error);
  }

}

exports.getCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;

  try {
    
    const category = Category.findByPk(categoryId);

    if(!category) {
      const error = new Error("Category is not availble!");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      category: category
    })

  } catch(error) {
    next(error);
  }
}

exports.addCategory = async (req, res, next) => {
  const errors = validationResult(req);

  if(!req.isAdmin) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }

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
  
  try {

    const category = await Category.create({
      title: title,
      description: description
    });

    res.status(200).json({
      category: category
    });

  } catch(error) {
    next(error);
  }
}

exports.editCategory = async (req, res, next) => {
  const errors = validationResult(req);

  const categoryId = req.params.categoryId;

  if(!req.isAdmin) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }

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

  try {

    const category = await Category.findByPk(categoryId);



    if(!category) {
      const error = new Error("Category does not exist!");
      error.statusCode = 400;
      throw error;
    }


    category.title = title;
    category.description = description;
    
    await category.save();

    res.status(200).json({
      category: category
    })

  } catch(error) {
    next(error);
  }
}

exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;

  if(!req.isAdmin) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }


  try{
    const category = await Category.findByPk(categoryId);
    
    if(!category) {
      const error = new Error("This category does not exist!");
      error.statusCode = 400;
      throw error;
    }

    await category.destroy();

    res.status(200).json({
      message: "Category deleted!"
    });

  } catch(error) {
    next(error);
  }
}

//// END CATEGORY

//// TYPE

exports.getTypes = async (req, res, next) => {
  let types = [];
  let totalItems = 0;
  const placeId = req.params.placeId;
  const categoryId = req.body.categoryId;

  

  let queryObject = {placeId: placeId};

  if(categoryId) {
    queryObject.categoryId = categoryId;
  }

  if(!placeId) {
    const error = new Error("please provide place id");
    error.statusCode = 403;
    next(error);
  }

  try {
    types = await Type.findAll({'where': queryObject});

    if(!types || types.length === 0) {
      const error = new Error("No types are available");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      types: types,
      totalItems: types.length
    })

  } catch(error) {
    next(error);
  }
}

exports.getType = async (req, res, next) => {
  let  typeId = req.params.typeId;

  try {
    const type = Type.findByPk(typeId);

    if(!type) {
      const error = "This type does not exist";
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      type: type
    });
  } catch (error) {
    next(error);
  }
}

exports.addType = async (req, res, next) => {
  const errors = validationResult(req);

  if(!req.isOwner) {
    const error = new Error("Not authorized!");
    error.statusCode = 403;
    next(error);
  }

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
  const placeId = req.body.placeId;
  const categoryId = req.body.categoryId;
  



  try {

    const category = await Category.findByPk(categoryId);

    if(!category) {
      const error = new Error("Category does not exist");
      error.statusCode = 400;
      throw error;
    }

    const place = await Place.findByPk(placeId);

    if(!place) {
      const error = new Error("Place does not exist!");
      error.statusCode = 400;
      throw error;
    }

    if(place.userId !== req.userId) {
  
      const error = new Error("Not owner authorized!");
      error.statusCode = 400;
      throw error;
    }

    const type = await Type.create({
      title: title,
      description: description,
      userId: req.userId,
      placeId: placeId,
      categoryId: categoryId
    });

    res.status(200).json({
      type: type
    });

  } catch(error) {
    next(error);
  }
}

exports.editType = async (req, res, next) => {
  const errors = validationResult(req);
 
  try {

    if(!req.isOwner) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
  
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
  const placeId = req.body.placeId;
  const categoryId = req.body.categoryId;
  const typeId = req.params.typeId;



  try {

    const type = await Type.findByPk(typeId);

    if(!type) {
      const error = new Error("Type is not available");
      error.statusCode = 400;
      throw error;
    }

    const category = await Category.findByPk(categoryId);

    if(!category) {
      const error = new Error("Category does not exist");
      error.statusCode = 400;
      throw error;
    }

    const place = await Place.findByPk(placeId);

    if(!place) {
      const error = new Error("Place does not exist!");
      error.statusCode = 400;
      throw error;
    }

    if(place.userId !== req.userId) {
  
      const error = new Error("Not authorized!");
      error.statusCode = 400;
      throw error;
    }

    type.title = title;
    type.description = description;  
    type.categoryId = categoryId;
    type.placeId = placeId;

    await type.save();
    


    // const type = await Type.create({
    //   title: title,
    //   description: description,
    //   userId: req.userId,
    //   placeId: placeId,
    //   categoryId: categoryId
    // });

    res.status(200).json({
      type: type
    });

  } catch(error) {
    next(error);
  }
}

exports.deleteType = async (req, res, next) => {
  const typeId = req.params.typeId;

  try {

    const type = await Type.findByPk(typeId);

    if(!type) {
      const error = new Error("This type is not available");
      error.statusCode = 400;
      throw error;
    }

    if(type.userId !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 400;
      throw error;
    }

    await type.destroy();

    res.status(200).json({
      message: "Type deleted"
    })

  } catch(error) {  

  }
}

//// END TYPE
