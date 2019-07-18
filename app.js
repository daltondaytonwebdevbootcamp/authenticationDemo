var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost:27017/authdemo", {
    useNewUrlParser: true
});

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    require("express-session")({
        secret: "asdf",
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==================
// ===== Routes =====
// ==================

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

// === Auth Routes ===
// ===================

// Show sign up form
app.get("/register", (req, res) => {
    res.render("register");
});

// Handling user sign up
app.post("/register", (req, res) => {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                console.log(err);
                res.render("register");
            }
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secret");
            });
        }
    );
});

// === Login Routes ===
// ====================

app.get("/login", (req, res) => {
    res.render("login");
});

// Login logic
// Middleware
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/secret",
        failureRedirect: "/login"
    }),
    (req, res) => {
        //
    }
);

// Logout
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, () => {
    console.log("Server initiated on port 3000.");
});
