const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

// Function to create default admin user if none exists
const createDefaultUsers = async (sequelize, models) => {
  const { User, Role, Permission } = models;
  
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({
      where: { role: 'admin' }
    });

    if (!adminExists) {
      logger.info('Creating default admin user...');
      
      // Create admin role if it doesn't exist
      const [adminRole] = await Role.findOrCreate({
        where: { name: 'admin' },
        defaults: {
          description: 'Administrator with full access'
        }
      });

      // Create default admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      await User.create({
        username: 'admin',
        email: 'admin@rodo.example.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        RoleId: adminRole.id
      });
      
      logger.info('Default admin user created successfully');
    } else {
      logger.info('Admin user already exists, skipping creation');
    }

    // Check if IOD user exists
    const iodExists = await User.findOne({
      where: { role: 'iod' }
    });

    if (!iodExists) {
      logger.info('Creating default IOD user...');
      
      // Create IOD role if it doesn't exist
      const [iodRole] = await Role.findOrCreate({
        where: { name: 'iod' },
        defaults: {
          description: 'Inspektor Ochrony Danych'
        }
      });

      // Create default IOD user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Iod123!', salt);
      
      await User.create({
        username: 'iod',
        email: 'iod@rodo.example.com',
        password: hashedPassword,
        role: 'iod',
        status: 'active',
        RoleId: iodRole.id
      });
      
      logger.info('Default IOD user created successfully');
    } else {
      logger.info('IOD user already exists, skipping creation');
    }

    // Create basic permissions
    await createDefaultPermissions(models);

  } catch (error) {
    logger.error('Error creating default users:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

// Function to create default permissions
const createDefaultPermissions = async (models) => {
  const { Role, Permission } = models;
  
  try {
    // Define basic permissions
    const basicPermissions = [
      { resource: 'documents', action: 'view' },
      { resource: 'documents', action: 'create' },
      { resource: 'documents', action: 'edit' },
      { resource: 'documents', action: 'delete' },
      { resource: 'incidents', action: 'view' },
      { resource: 'incidents', action: 'create' },
      { resource: 'incidents', action: 'edit' },
      { resource: 'incidents', action: 'delete' },
      { resource: 'requests', action: 'view' },
      { resource: 'requests', action: 'create' },
      { resource: 'requests', action: 'edit' },
      { resource: 'requests', action: 'delete' },
      { resource: 'risk-analysis', action: 'view' },
      { resource: 'risk-analysis', action: 'create' },
      { resource: 'risk-analysis', action: 'edit' },
      { resource: 'risk-analysis', action: 'delete' },
      { resource: 'users', action: 'view' },
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'edit' },
      { resource: 'users', action: 'delete' },
    ];

    // Get admin and IOD roles
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const iodRole = await Role.findOne({ where: { name: 'iod' } });

    // Create permissions and associate with roles
    for (const perm of basicPermissions) {
      const [permission] = await Permission.findOrCreate({
        where: {
          resource: perm.resource,
          action: perm.action
        }
      });

      // Associate with admin role
      if (adminRole) {
        await adminRole.addPermission(permission);
      }

      // Associate with IOD role (except user management)
      if (iodRole && perm.resource !== 'users') {
        await iodRole.addPermission(permission);
      }
    }

    logger.info('Default permissions created and associated with roles');
  } catch (error) {
    logger.error('Error creating default permissions:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

module.exports = {
  createDefaultUsers
};
