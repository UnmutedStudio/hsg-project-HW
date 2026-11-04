
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

      // Check whether the user entered a new password
      const passwordWasEntered =
        typeof formData.password === "string" &&
        formData.password.length > 0;

      // Validate the new password only when one was entered
      if (
        passwordWasEntered &&
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

      // Confirm both new password fields match
      if (
        passwordWasEntered &&
        formData.password !== formData.confirmPassword
      ) {
        res.status(400).json({
          message: "Passwords do not match.",
        });
        return;
      }

      const user = await UserModel.getById(
        req.authenticatedUser.id,
      );

      user.firstName = formData.firstName.trim();
      user.lastName = formData.lastName.trim();
      user.email = formData.email.trim();

      // Replace the existing password hash only when a new password was entered
      if (passwordWasEntered) {
        user.passwordHash = bcrypt.hashSync(formData.password);
      }

      const result = await UserModel.update(user);