const test = require("node:test");
const assert = require("node:assert/strict");

const { shapeIntoMongooseObjectId } = require("../dist/libs/config");
const Errors = require("../dist/libs/Error").default;
const ProductModel = require("../dist/controllers/schema/Product.model").default;
const OrderModel = require("../dist/controllers/schema/Order.model").default;
const OrderItemModel = require("../dist/controllers/schema/OrderItems.model").default;
const BlogPostModel = require("../dist/controllers/schema/BlogPost.model").default;

test("ObjectId helper accepts valid IDs and rejects malformed IDs", () => {
  const id = shapeIntoMongooseObjectId("507f1f77bcf86cd799439011");
  assert.equal(String(id), "507f1f77bcf86cd799439011");
  assert.throws(() => shapeIntoMongooseObjectId("not-an-id"), Errors);
});

test("application errors serialize with both code and message", () => {
  const error = new Errors(400, "Invalid request");
  assert.deepEqual(JSON.parse(JSON.stringify(error)), {
    code: 400,
    message: "Invalid request",
  });
});

test("product schema rejects negative price and fractional stock", () => {
  const product = new ProductModel({
    productName: "Validation product",
    productCategory: "LAPTOP",
    productCondition: "NEW",
    productPrice: -1,
    productLeftCount: 1.5,
  });
  const error = product.validateSync();
  assert.ok(error.errors.productPrice);
  assert.ok(error.errors.productLeftCount);
});

test("order schemas reject negative totals and invalid item quantities", () => {
  const order = new OrderModel({
    orderTotal: -1,
    orderDelivery: -1,
    memberId: "507f1f77bcf86cd799439011",
    deliveryAddress: {
      fullName: "Test User", phone: "+821012345678", country: "KR",
      city: "Seoul", address: "Test street", postalCode: "00000",
    },
    deliveryMethod: "STANDARD",
  });
  const orderError = order.validateSync();
  assert.ok(orderError.errors.orderTotal);
  assert.ok(orderError.errors.orderDelivery);

  const item = new OrderItemModel({
    itemQuantity: 0,
    itemPrice: -1,
    orderId: "507f1f77bcf86cd799439011",
    productId: "507f191e810c19729de860ea",
  });
  const itemError = item.validateSync();
  assert.ok(itemError.errors.itemQuantity);
  assert.ok(itemError.errors.itemPrice);
});

test("blog schema enforces meaningful title and content lengths", () => {
  const blog = new BlogPostModel({
    blogPostCategory: "NEWS",
    blogPostTitle: "x",
    blogPostContent: "too short",
  });
  const error = blog.validateSync();
  assert.ok(error.errors.blogPostTitle);
  assert.ok(error.errors.blogPostContent);
});
