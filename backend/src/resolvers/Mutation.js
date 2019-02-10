const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto'); // via Node
const { promisify } = require('util'); // via Node
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This is how to create a relationship between the item and the user
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // first take a copu of the updates
    const updates = { ...args };
    // remove the ID from the updates, this does not change
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
    // 2. check if they own that item, or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if (!ownsItem && !hasPermissions) {
      throw new Error(`You don't have permissions for that!`);
    }

    // 3. delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();

    // hash their pasword, never storing it in the database
    const password = await bcrypt.hash(args.password, 17);

    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );

    // create the JWT token for them to sign them right in
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    // Finally, we return the user to the browser
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there's a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for this email:\n${email}`);
    }
    // 2. check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error(`Invalid Password.`);
    }
    // 3. generate the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 5. Return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    // clearCookie is available from cookieParser initialized in index.js
    ctx.response.clearCookie('token');
    return { message: `Goodbye!` };
  },
  async requestReset(parent, args, ctx, info) {
    // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });

    if (!user) {
      throw new Error(`No such user found for this email:\n${email}`);
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1hr from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // 3. Email them that reset token
    try {
      const mailRes = await transport.sendMail({
        from: 'noreply@thejump.shop',
        to: user.email,
        subject: 'Your Password Reset Token | The Jump Shop',
        html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
      });
    } catch (error) {
      throw new Error(`Please try again. Message failed to send.\n\n${error}`);
    }
    // 4. Return the message
    return { message: 'Request received!' };
  },
  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error(`Your password does not match!`);
    }
    // 2. Check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error(`This token is either invalid or expired!`);
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 17);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {
        email: user.email,
      },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // 8. return the new user
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they're logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    // 3. Check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure the user is signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error(`Please create an account or login to add to cart!`);
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    // 3. Check if that item is already in their cart and increment by 1 if so
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      );
    }
    // 4. If it's not, create a fresh CartItem for that user!
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          item: {
            connect: {
              id: args.id,
            },
          },
        },
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{id, user{ id }}`
    );
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No CartItem found!');
    // 2. Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('This user does not own this CartItem');
    }
    // 3. Delete that cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

module.exports = Mutations;
