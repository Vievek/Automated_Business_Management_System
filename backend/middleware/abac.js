const Policy = require("../models/Policy");

const evaluatePolicy = (user, resource, action, policy, requestTeamId) => {
  if (policy.resource !== resource || policy.action !== action) return false;

  const { role, department, teams, _id } = user; // Include user ID
  const time = new Date().getHours();

  // Role check
  if (policy.conditions.role && policy.conditions.role !== role) return false;

  // Department check
  if (
    policy.conditions.department &&
    policy.conditions.department !== department
  )
    return false;

  // Time check
  if (policy.conditions.time && !(time >= 9 && time <= 17)) return false;

  // Team Access Check
  if (policy.conditions.teamAccess && !teams.includes(requestTeamId))
    return false;

  // Allowed Users Check
  if (
    policy.conditions.allowedUsers &&
    !policy.conditions.allowedUsers.includes(_id)
  )
    return false;

  return true; // Access granted
};

const abacMiddleware = (resource, action) => async (req, res, next) => {
  const user = req.user; // Authenticated user
  const requestTeamId = req.params.teamId; // Team ID from route

  const policies = await Policy.find({ resource, action });

  const hasAccess = policies.some((policy) =>
    evaluatePolicy(user, resource, action, policy, requestTeamId)
  );

  if (hasAccess) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Insufficient permissions." });
  }
};

module.exports = abacMiddleware;
