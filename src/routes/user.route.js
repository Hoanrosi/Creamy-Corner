import express from "express";
import {
  getAllUsers,
  getUser,
  deleteUser,
  createAddress,
  getAllAdresses,
  getAddress,
  updateAddress,
  deleteAdress,
} from "../controllers/user.controller";
import {
  signup,
  protect,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  refreshAccessToken,
  restrictTo,
  // signupRequest,
  // otpConfirm,
} from "../controllers/auth.controller";
import validate from "../middleware/validation.middleware";
import {
  loginValidate,
  refreshTokensValidate,
  forgotPasswordValidate,
  signUpValidate,
  resetPasswordValidate,
} from "../Schema/auth.validation";

const router = express.Router();

// guest

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Logs user into the system
 *     operationId: login
 *     requestBody:
 *       description: The user credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: login successful
 *       401:
 *         description: Invalid username/password supplied
 */
router.post("/login", validate(loginValidate), login);

/**
 * @swagger
 * /users/signup:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a new user
 *     operationId: signup
 *     requestBody:
 *       description: User's signup details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request, email might already exist
 */
router.post("/signup", validate(signUpValidate), signup);

/**
 * @swagger
 * /users/logout:
 *   get:
 *     tags:
 *       - auth
 *     summary: Log out the current user
 *     operationId: logout
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.get("/logout", logout);

/**
 * @swagger
 * /users/forgotPassword:
 *   post:
 *     tags:
 *       - auth
 *     summary: Request a password reset link
 *     operationId: forgotPassword
 *     requestBody:
 *       description: User's email to send password reset link
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset token sent to email
 *       404:
 *         description: Email not found
 */
router.post(
  "/forgotPassword",
  validate(forgotPasswordValidate),
  forgotPassword
);

/**
 * @swagger
 * /users/resetPassword/{token}:
 *   patch:
 *     tags:
 *       - auth
 *     summary: Reset the password using a reset token
 *     operationId: resetPassword
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *     requestBody:
 *       description: New password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid or expired token
 */
router.patch(
  "/resetPassword/:token",
  validate(resetPasswordValidate),
  resetPassword
);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     tags:
 *       - auth
 *     summary: Refresh the access token using a refresh token
 *     operationId: refreshAccessToken
 *     responses:
 *       200:
 *         description: Access token successfully refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh-token",
  validate(refreshTokensValidate),
  refreshAccessToken
);
// // user
router.use(protect);

router.get("/:id", getUser);

/**
 * @swagger
 * /users/updateMyPassword:
 *   patch:
 *     tags:
 *       - auth
 *     summary: Update the current user's password
 *     operationId: updatePassword
 *     requestBody:
 *       description: Current and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - passwordCurrent
 *               - password
 *     responses:
 *       200:
 *         description: Password successfully updated
 *       401:
 *         description: Incorrect current password
 */
router.patch("/updateMyPassword", updatePassword);

/**
 * @swagger
 * /users/{id}/addresses:
 *   get:
 *     tags:
 *       - addresses
 *     summary: Get all addresses for a specific user
 *     operationId: getAllAdresses
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to get addresses for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved all addresses for the user
 *       404:
 *         description: User not found
 *   post:
 *     tags:
 *       - addresses
 *     summary: Create a new address for a specific user
 *     operationId: createAddress
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to create an address for
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Address details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *             required:
 *               - userId
 *               - addressLine1
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *     responses:
 *       201:
 *         description: Address successfully created
 *       400:
 *         description: Bad request, invalid userId or address data
 */
router.route("/:id/addresses").get(getAllAdresses).post(createAddress);

router
  .route("/addresses/:id")
  .get(getAddress)
  .patch(updateAddress)
  .delete(deleteAdress);

// admin
router.use(restrictTo("admin"));

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - users
 *     summary: Get all users (admin only)
 *     operationId: getAllUsers
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *       401:
 *         description: Unauthorized, admin access required
 *       403:
 *         description: Forbidden, admin permissions required
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - users
 *     summary: Delete a specific user (admin only)
 *     operationId: deleteUser
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User successfully deleted
 *       401:
 *         description: Unauthorized, admin access required
 *       403:
 *         description: Forbidden, admin permissions required
 *       404:
 *         description: User not found
 */
router.route("/").get(getAllUsers);

router.route("/:id").delete(deleteUser);

export default router;
