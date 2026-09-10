const User = require('../models/User');

const ensureAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@sweetandsavory.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Admin Matteo';

    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      // Check if another admin exists and update their email and password
      admin = await User.findOne({ role: 'admin' }).select('+password');
      if (admin) {
        admin.name = adminName;
        admin.email = adminEmail;
        admin.role = 'admin';
        admin.isActive = true;
        const isMatch = await admin.matchPassword(adminPassword);
        if (!isMatch) {
          admin.password = adminPassword;
        }
        await admin.save();
        console.log(`[Admin] Synced admin account from .env: ${adminEmail}`);
        return;
      }

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phone: '+20 100 123 4567',
        role: 'admin',
        isActive: true,
      });
      console.log(`[Admin] Created admin account from .env: ${adminEmail}`);
    } else {
      admin.name = adminName;
      admin.role = 'admin';
      admin.isActive = true;
      const isMatch = await admin.matchPassword(adminPassword);
      if (!isMatch) {
        admin.password = adminPassword;
        console.log(`[Admin] Updated admin password from .env for: ${adminEmail}`);
      }
      await admin.save();
      console.log(`[Admin] Admin account ready from .env: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[Admin] Error ensuring admin account from .env:', err.message);
  }
};

module.exports = ensureAdmin;
