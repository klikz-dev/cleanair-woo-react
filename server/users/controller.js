const activity = require("../activity/controller");
const Model = require("./model");

const {
  refreshTokens,
  COOKIE_OPTIONS,
  generateToken,
  generateRefreshToken,
  getCleanUser,
  verifyToken,
  clearTokens,
  handleResponse,
} = require("../services/token");

const transporter = require("../services/email").transporter;

exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return handleResponse(
      req,
      res,
      400,
      null,
      "Username and Password required."
    );
  }

  Model.findOne({ email: email, password: password }, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!user) {
        return handleResponse(
          req,
          res,
          401,
          null,
          "Username or Password is Wrong."
        );
      } else {
        const userObj = getCleanUser(user);
        const tokenObj = generateToken(user);
        const refreshToken = generateRefreshToken(userObj.userId);
        refreshTokens[refreshToken] = tokenObj.xsrfToken;

        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        res.cookie("XSRF-TOKEN", tokenObj.xsrfToken);

        return handleResponse(req, res, 200, {
          user: userObj,
          token: tokenObj.token,
          expiredAt: tokenObj.expiredAt,
        });
      }
    }
  });
};

exports.logout = (req, res) => {
  clearTokens(req, res);
  return handleResponse(req, res, 204);
};

exports.verifyToken = (req, res) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken) {
    return handleResponse(req, res, 204);
  }

  const xsrfToken = req.cookies["XSRF-TOKEN"];

  if (
    !xsrfToken ||
    !(refreshToken in refreshTokens) ||
    refreshTokens[refreshToken] !== xsrfToken
  ) {
    return handleResponse(req, res, 401);
  }

  verifyToken(refreshToken, "", (err, payload) => {
    if (err) {
      return handleResponse(req, res, 401);
    } else {
      Model.findOne({ _id: payload.userId }, function (err, userData) {
        if (!userData) {
          return handleResponse(req, res, 401);
        }

        const userObj = getCleanUser(userData);

        const tokenObj = generateToken(userData);

        refreshTokens[refreshToken] = tokenObj.xsrfToken;
        res.cookie("XSRF-TOKEN", tokenObj.xsrfToken);

        return handleResponse(req, res, 200, {
          user: userObj,
          token: tokenObj.token,
          expiredAt: tokenObj.expiredAt,
        });
      });
    }
  });
};

exports.add = (req, res) => {
  const email = req.body.email;
  Model.findOne({ email: email }, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (user) {
        res.status(403).send("User already exist");
      } else {
        const newUser = new Model(req.body);
        newUser
          .save()
          .then((user) => {
            res.json(user);
            activity.add({ username: req.body.email }, "user created", {});
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    }
  });
};

exports.getAll = (req, res) => {
  Model.find(function (err, users) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!users) {
        res.status(404).send("No User found");
      } else {
        users.map((user) => {
          delete user.password;
        });
        res.json(users);
      }
    }
  });
};

exports.getById = (req, res) => {
  const _id = req.params._id;
  Model.findOne({ _id: _id }, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!user) {
        res.status(404).send("No User found");
      } else {
        delete user.password;
        res.json(user);
      }
    }
  });
};

exports.editById = (req, res) => {
  const _id = req.params._id;
  const data = req.body;

  Model.findOneAndUpdate({ _id: _id }, data, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!user) {
        res.status(404).send("No User found");
      } else {
        delete user.password;
        res.json(user);
        activity.add(
          { username: user.email, name: user.name },
          "user updated",
          {}
        );
      }
    }
  });
};

exports.deleteById = (req, res) => {
  const _id = req.params._id;

  Model.findOneAndDelete({ _id: _id }, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!user) {
        res.status(404).send("No User found");
      } else {
        activity.add(user, "user deleted", {});
        Model.find(function (err, users) {
          if (err) {
            res.status(500).send(err);
          } else {
            if (!users) {
              res.status(404).send("No User found");
            } else {
              users.map((user) => {
                delete user.password;
              });
              res.json(users);
            }
          }
        });
      }
    }
  });
};

exports.pwForgot = (req, res) => {
  const email = req.body.email;

  Model.findOne({ email: email }, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!user) {
        res.status(404).send("No user found");
      } else {
        try {
          const html = `
            <p>You‘ve requested to reset your CleanAir Portal password for ${email}. If you didn’t request this you can safely ignore this email.</p>
            <a href="https://storeportal.cleanair.com/pw-reset/${user._id}">Reset password</a>
            `;

          const contacts = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: "Reset your password",
            html: html,
          };

          transporter.sendMail(contacts, function (err, status) {
            if (err) {
              console.log(err);
            }
          });
        } catch (error) {
          res.status(500).send(error);
        }
      }
    }
  });
};

exports.pwReset = (req, res) => {
  const id = req.body.id;
  const password = req.body.password;

  Model.findByIdAndUpdate(id, { password: password }, function (err, user) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      if (!user) {
        res.status(404).send("No user found");
      } else {
        try {
          res.json("success");
        } catch (error) {
          console.log(error);
          res.status(500).send(error);
        }
      }
    }
  });
};
