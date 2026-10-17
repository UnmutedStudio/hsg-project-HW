import express from 'express';
import path from 'path';
import { ActivityController } from './controllers/ActivityController.mjs';
import { AuthenticationController } from './controllers/AuthenticationController.mjs';
import { BlogPostController } from './controllers/BlogPostController.mjs';
import { BookingController } from './controllers/BookingController.mjs';
import { LocationController } from './controllers/LocationController.mjs';
import { SessionController } from './controllers/SessionController.mjs';
import { UserController } from './controllers/UserController.mjs';

const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));

// static files
app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(express.static(path.join(import.meta.dirname, 'dist')));

//this is to parse JSON and the submitted HTML form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enables the session and loads the user once authenticated
app.use(AuthenticationController.middleware);

//Use routes (from controllers)
app.use('/activities', ActivityController.routes);
app.use('/login', AuthenticationController.routes);
app.use('/blog-posts', BlogPostController.routes);
app.use('/bookings', BookingController.routes);
app.use('/locations', LocationController.routes);
app.use('/sessions', SessionController.routes);
app.use('/users', UserController.routes);

app.get('/signup', UserController.viewSignup);
app.post('/signup', UserController.handleSignup);

// handles the log out
app.get('/logout', AuthenticationController.handleDeauthenticate);

//admin dashboard
app.get('/admin', AuthenticationController.restrict(['admin']), (req, res) => {
  res.render('admin_dashboard.ejs', {
    authenticatedUser: req.authenticatedUser,
  });
});
// Trainer dashboard
app.get(
  '/trainer',
  AuthenticationController.restrict(['trainer']),
  (req, res) => {
    res.render('trainer_dashboard.ejs', {
      authenticatedUser: req.authenticatedUser,
    });
  },
);
// Member dashboard
app.get(
  '/dashboard',
  AuthenticationController.restrict(['member']),
  (req, res) => {
    res.render('member_dashboard.ejs', {
      authenticatedUser: req.authenticatedUser,
    });
  },
);
// home/default page route
app.get('/', (req, res) => {
  res.redirect('/login');
});
//Privacy policy page
app.get('/privacy', (req, res) => {
  res.render('privacy_policy.ejs', {
    authenticatedUser: req.authenticatedUser,
  });
});
// contact page
app.get('/contact', (req, res) => {
  res.render('contact.ejs', {
    authenticatedUser: req.authenticatedUser,
  });
});

app.listen(port, () => {
  console.log(
    'The High Street Gym application has started on http://localhost:' + port,
  );
});
