const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getCoworkingSpaces,
  getCoworkingSpace,
  createCoworkingSpace,
  updateCoworkingSpace,
  deleteCoworkingSpace,
} = require("../controllers/coworkingSpaces");

/**
 * @swagger
 * tags:
 *   name: CoworkingSpaces
 *   description: Manage co-working space directory
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CoworkingSpace:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - tel
 *         - openTime
 *         - closeTime
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the co-working space
 *         name:
 *           type: string
 *           description: Co-working space name
 *         address:
 *           type: string
 *           description: Address details
 *         tel:
 *           type: string
 *           description: Telephone number (up to 10 digits)
 *         openTime:
 *           type: string
 *           description: Opening time (e.g. 08:00)
 *         closeTime:
 *           type: string
 *           description: Closing time (e.g. 18:00)
 *       example:
 *         id: 609bda561452242d88d36e37
 *         name: Downtown Co-work
 *         address: "123 Main Road, Bangkok"
 *         tel: "0812345678"
 *         openTime: "08:00"
 *         closeTime: "20:00"
 */
/**
 * @swagger
 * /coworking-spaces:
 *   get:
 *     summary: Returns the list of all co-working spaces
 *     tags: [CoworkingSpaces]
 *     responses:
 *       200:
 *         description: The list of co-working spaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CoworkingSpace'
 */
/**
 * @swagger
 * /coworking-spaces:
 *   post:
 *     summary: Create a new co-working space
 *     tags: [CoworkingSpaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoworkingSpace'
 *     responses:
 *       201:
 *         description: The co-working space was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoworkingSpace'
 *       500:
 *         description: Some server error
 */
/**
 * @swagger
 * /coworking-spaces/{id}:
 *   get:
 *     summary: Get the co-working space by id
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The co-working space id
 *     responses:
 *       200:
 *         description: Co-working space detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoworkingSpace'
 *       404:
 *         description: The co-working space was not found
 */
/**
 * @swagger
 * /coworking-spaces/{id}:
 *   put:
 *     summary: Update the co-working space by the id
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The co-working space id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoworkingSpace'
 *     responses:
 *       200:
 *         description: The co-working space was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoworkingSpace'
 *       404:
 *         description: The co-working space was not found
 *       500:
 *         description: Some error happened
 */
/**
 * @swagger
 * /coworking-spaces/{id}:
 *   delete:
 *     summary: Remove the co-working space by id
 *     tags: [CoworkingSpaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The co-working space id
 *
 *     responses:
 *       200:
 *         description: The co-working space was deleted
 *       404:
 *         description: The co-working space was not found
 */
//Include other resource routers
const reservationRouter = require("./reservations");

const router = express.Router();

//Re-route into other resource routers
router.use("/:coworkingSpaceId/reservations/", reservationRouter);

router
  .route("/")
  .get(getCoworkingSpaces)
  .post(protect, authorize("admin"), createCoworkingSpace);
router
  .route("/:id")
  .get(getCoworkingSpace)
  .put(protect, authorize("admin"), updateCoworkingSpace)
  .delete(protect, authorize("admin"), deleteCoworkingSpace);

module.exports = router;
