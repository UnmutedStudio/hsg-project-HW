/**
 * Register a new member account.
 *
 * @type {express.RequestHandler}
 * @openapi
 * /api/users:
 *   post:
 *     summary: "Register a new member account"
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserRegistration"
 *     responses:
 *       '200':
 *         $ref: "#/components/responses/Created"
 *       '400':
 *         $ref: "#/components/responses/Error"
 *       '500':
 *         $ref: "#/components/responses/Error"
 */
static async createUser(req, res) {
  const formData = req.body;

  if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.firstName)) {
    res.status(400).json({
      message:
        "Please enter a valid first name containing 2 to 50 letters, spaces, hyphens or apostrophes.",
    });
    return;
  }

  if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.lastName)) {
    res.status(400).json({
      message:
        "Please enter a valid last name containing 2 to 50 letters, spaces, hyphens or apostrophes.",
    });
    return;
  }

  if (
    !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      formData.email,
    )
  ) {
    res.status(400).json({
      message: "Please enter a valid email address.",
    });
    return;
  }

  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(
      formData.password,
    )
  ) {
    res.status(400).json({
      message:
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
    });
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    res.status(400).json({
      message: "Passwords do not match.",
    });
    return;
  }

  try {
    await UserModel.getByAllEmail(formData.email.trim());

    res.status(400).json({
      message: "An account already exists for this email address.",
    });
  } catch (error) {
    if (error !== "not found") {
      console.error(error);

      res.status(500).json({
        message: "The account could not be created.",
      });
      return;
    }

    try {
      const passwordHash = bcrypt.hashSync(formData.password);

      const user = new UserModel(
        null,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.email.trim(),
        passwordHash,
        "member",
        0,
        null,
      );

      const result = await UserModel.create(user);

      res.status(200).json({
        id: result.insertId,
        message: "Member account created",
      });
    } catch (createError) {
      console.error(createError);

      res.status(500).json({
        message: "The account could not be created.",
      });
    }
  }
}