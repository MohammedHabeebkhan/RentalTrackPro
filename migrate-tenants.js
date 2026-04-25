const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL environment variable is required');
  process.exit(1);
}

async function migrateTenants() {
  try {
    await mongoose.connect(MONGODB_URL, {
      dbName: 'kfmData',
    });

    // Define schemas
    const tenantSchema = new mongoose.Schema({
      userId: String,
      fullName: String,
      email: String,
      phone: String,
      propertyAddress: String,
      leaseStart: String,
      leaseEnd: String,
      monthlyRent: Number,
      advancePayment: { type: Number, default: 0 },
      status: { type: String, enum: ['Active', 'Pending', 'Terminated'], default: 'Active' },
      photoUrl: String,
      documentUrl: String,
      documentName: String,
      aadharUrl: String,
      aadharName: String,
      paymentHistory: { type: Array, default: [] }
    }, { timestamps: true });

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      root: { type: Boolean, default: false },
      avatar: { type: String, default: 'avatar.png' },
      activated: { type: Boolean, default: true },
      addresses: { type: Array, default: [] },
      photoUrl: String
    }, { timestamps: true });

    const TenantModel = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
    const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

    // Find the first user
    const firstUser = await UserModel.findOne({ email: 'khanbhai@gmail.com' });
    if (!firstUser) {
      console.error('First user (khanbhai@gmail.com) not found');
      process.exit(1);
    }

    console.log(`Found first user: ${firstUser.name} (${firstUser.email}) with ID: ${firstUser._id}`);

    // Find tenants without userId
    const tenantsWithoutUserId = await TenantModel.find({ userId: { $exists: false } });
    console.log(`Found ${tenantsWithoutUserId.length} tenants without userId`);

    if (tenantsWithoutUserId.length === 0) {
      console.log('No migration needed');
      process.exit(0);
    }

    // Update tenants
    const result = await TenantModel.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: firstUser._id.toString() } }
    );

    console.log(`Migration completed: ${result.modifiedCount} tenants updated`);

    // Verify the migration
    const updatedTenants = await TenantModel.find({ userId: firstUser._id.toString() });
    console.log(`First user now has ${updatedTenants.length} tenants`);

    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateTenants();