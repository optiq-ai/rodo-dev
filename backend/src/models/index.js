const User = require('./user.model');
const Role = require('./role.model');
const Permission = require('./permission.model');
const Document = require('./document.model');
const Incident = require('./incident.model');
const Request = require('./request.model');
const RiskAnalysis = require('./risk-analysis.model');
const RiskAsset = require('./risk-asset.model');
const RiskThreat = require('./risk-threat.model');
const SecurityMeasure = require('./security-measure.model');

// User-Role associations
User.belongsTo(Role);
Role.hasMany(User);

// Role-Permission associations (many-to-many)
Role.belongsToMany(Permission, { through: 'RolePermissions' });
Permission.belongsToMany(Role, { through: 'RolePermissions' });

// Document associations
Document.belongsTo(User, { as: 'Creator', foreignKey: 'createdBy' });
User.hasMany(Document, { foreignKey: 'createdBy' });

// Document version history (self-referencing)
Document.hasMany(Document, { as: 'Versions', foreignKey: 'parentId' });
Document.belongsTo(Document, { as: 'Parent', foreignKey: 'parentId' });

// Incident associations
Incident.belongsTo(User, { as: 'Reporter', foreignKey: 'reportedBy' });
User.hasMany(Incident, { foreignKey: 'reportedBy' });

// Request associations
Request.belongsTo(User, { as: 'Assignee', foreignKey: 'assignedTo' });
User.hasMany(Request, { foreignKey: 'assignedTo' });

// RiskAnalysis associations
RiskAnalysis.belongsTo(User, { as: 'Creator', foreignKey: 'createdBy' });
User.hasMany(RiskAnalysis, { foreignKey: 'createdBy' });

// RiskAsset associations
RiskAsset.belongsTo(RiskAnalysis);
RiskAnalysis.hasMany(RiskAsset);

// RiskThreat associations
RiskThreat.belongsTo(RiskAnalysis);
RiskAnalysis.hasMany(RiskThreat);

// SecurityMeasure associations
SecurityMeasure.belongsTo(RiskAnalysis);
RiskAnalysis.hasMany(SecurityMeasure);

// Export all models
module.exports = {
  User,
  Role,
  Permission,
  Document,
  Incident,
  Request,
  RiskAnalysis,
  RiskAsset,
  RiskThreat,
  SecurityMeasure
};
