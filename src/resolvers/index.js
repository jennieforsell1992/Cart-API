const path = require("path");
const fsPromises = require("fs/promises");
const {
  fileExists,
  deleteFile,
  getDirectoryFileNames,
} = require("../utils/fileHandling");
const { GraphQLError, printType } = require("graphql");
const crypto = require("crypto");

const cartDirectory = path.join(__dirname, "..", "data", "carts");
const productDirectory = path.join(__dirname, "..", "data", "products");

exports.resolvers = {
  Query: {
    getAllCarts: async (_, args) => {
      const carts = await getDirectoryFileNames(cartDirectory);

      const cartData = [];

      for (const file of carts) {
        const filePath = path.join(cartDirectory, file);

        const fileContents = await fsPromises.readFile(filePath, {
          encoding: "utf-8",
        });

        const data = JSON.parse(fileContents);

        cartData.push(data);
      }
      return cartData;
    },
    getCartById: async (_, args) => {
      const cartId = args.cartId;

      const cartFilePath = path.join(cartDirectory, `${cartId}.json`);

      const cartExists = await fileExists(cartFilePath);

      if (!cartExists) return new GraphQLError("That cart does not exist");

      const cartData = await fsPromises.readFile(cartFilePath, {
        encoding: "utf-8",
      });

      const data = JSON.parse(cartData);

      return data;
    },
  },

  Mutation: {
    createCart: async (_, args) => {
      const newCart = {
        id: crypto.randomUUID(),
        totalamount: 0,
        products: [],
      };

      let filePath = path.join(cartDirectory, `${newCart.id}.json`);

      let idExists = true;
      while (idExists) {
        const exists = await fileExists(filePath);
        console.log(exists, newCart.id);

        if (exists) {
          newCart.id = crypto.randomUUID();
          filePath = path.join(cartDirectory, `${newCart.id}.json`);
        }

        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newCart));

      return newCart;
    },

    createProduct: async (_, args) => {
      const { productName, price } = args.input;
      const id = crypto.randomUUID();

      const newProduct = {
        productId: id,
        productName: productName,
        price: price,
      };

      let filePath = path.join(productDirectory, `${newProduct.id}.json`);

      let idExists = true;
      while (idExists) {
        const exists = await fileExists(filePath);

        if (exists) {
          newProduct.productId = crypto.randomUUID();
          filePath = path.join(
            productDirectory,
            `${newProduct.productId}.json`
          );
        }

        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newProduct));

      return newProduct;
    },

    addProductToCart: async (_, args) => {
      const { cartId, productId } = args;

      const filePath = path.join(cartDirectory, `${cartId}.json`);
      const shoppingcartExists = await fileExists(filePath);

      if (!shoppingcartExists) {
        return new GraphQLError("This cart doesn't exist!");
      }

      const productFilepath = path.join(productDirectory, `${productId}.json`);
      const productExists = await fileExists(productFilepath);

      if (!productExists) {
        return new GraphQLError("This product doesn't exist!");
      }

      const cartContents = await fsPromises.readFile(filePath, {
        encoding: "utf-8",
      });

      let shoppingcart = JSON.parse(cartContents);

      const fileContents = await fsPromises.readFile(productFilepath, {
        encoding: "utf-8",
      });

      const productToCart = JSON.parse(fileContents);

      const products = shoppingcart.products;
      shoppingcart.products.push(productToCart);

      let totalamount = 0;
      for (let i = 0; i < shoppingcart.products.length; i++) {
        totalamount += shoppingcart.products[i].price;
      }

      const updatedCart = { cartId, products, totalamount };

      await fsPromises.writeFile(filePath, JSON.stringify(updatedCart));

      // console.log(shoppingcart.products);

      return updatedCart;
    },

    deleteCart: async (_, args) => {
      // get project id
      const cartId = args.cartId;

      const filePath = path.join(cartDirectory, `${cartId}.json`);
      // does this project exist?
      // If no (return error)
      const cartExists = await fileExists(filePath);
      if (!cartExists) return new GraphQLError("That caart does not exist");

      // delete file
      try {
        await deleteFile(filePath);
      } catch (error) {
        return {
          deletedId: cartId,
          success: false,
        };
      }

      return {
        deletedId: cartId,
        success: true,
      };
    },

    deleteProduct: async (_, args) => {
      // get project id
      const productId = args.productId;

      const filePath = path.join(productDirectory, `${productId}.json`);
      // does this project exist?
      // If no (return error)
      const productExists = await fileExists(filePath);
      if (!productExists)
        return new GraphQLError("That product does not exist");

      // delete file
      try {
        await deleteFile(filePath);
      } catch (error) {
        return {
          deletedId: productId,
          success: false,
        };
      }

      return {
        deletedId: productId,
        success: true,
      };
    },
  },
};
