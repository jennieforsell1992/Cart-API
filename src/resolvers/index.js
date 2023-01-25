const path = require("path");
const fsPromises = require("fs/promises");
const {
  fileExists,
  readJsonFile,
  deleteFile,
  getDirectoryFileNames,
} = require("../utils/fileHandling");
const { GraphQLError, printType } = require("graphql");
const crypto = require("crypto");

const cartDirectory = path.join(__dirname, "..", "data", "carts");
const cartProductDirectory = path.join(__dirname, "..", "data", "carts");

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

      if (!cartExists) return new GraphQLError("That project does not exist");

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
        totalamount: args.totalamount,
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
      const newProduct = {
        productId: crypto.randomUUID(),
        productName: args.productName,
        price: args.price,
      };

      let filePath = path.join(
        cartProductDirectory,
        readJsonFile(id.json),
        `${newProduct.id}.json`
      );

      let idExists = true;
      while (idExists) {
        const exists = await fileExists(filePath);
        console.log(exists, newProduct.id);

        if (exists) {
          newCart.id = crypto.randomUUID();
          filePath = path.join(cartProductDirectory, `${newProduct.id}.json`);
        }

        idExists = exists;
      }

      await fsPromises.writeFile(filePath, JSON.stringify(newProduct));

      return newProduct;
    },

    updateCartTotalamount: async (_, args) => {
      const { id, totalamount } = args;

      const filePath = path.join(cartDirectory, `${totalamount}.json`);

      const cartExists = await fileExists(filePath);
      if (!cartExists) return new GraphQLError("That Cart does not exist");

      const updatedCart = {
        id,
        totalamount,
      };

      await fsPromises.writeFile(filePath, JSON.stringify(updatedCart));

      return updatedCart;
    },

    deleteCart: async (_, args) => {
      // get project id
      const cartId = args.cartId;

      const filePath = path.join(cartDirectory, `${cartId}.json`);
      // does this project exist?
      // If no (return error)
      const cartExists = await fileExists(filePath);
      if (!cartExists) return new GraphQLError("That project does not exist");

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

    deleteProduct: async (_, args) => {},
  },
};
