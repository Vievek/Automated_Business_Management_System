const Policy = require("../models/Policy");

/**
 * Evaluates a policy against the user's attributes and request details.
 * @param {Object} user - The authenticated user.
 * @param {string} resource - The resource being accessed.
 * @param {string} action - The action being performed.
 * @param {Object} policy - The policy to evaluate.
 * @param {string} requestTeamId - The team ID from the request parameters.
 * @returns {Object} - An object with access status, reason, and details.
 */
const evaluatePolicy = (user, resource, action, policy, requestTeamId) => {
  // Check if the resource and action match the policy
  if (policy.resource !== resource || policy.action !== action) {
    return {
      access: false,
      reason: "Resource or action does not match.",
      details: {
        expectedResource: policy.resource,
        actualResource: resource,
        expectedAction: policy.action,
        actualAction: action,
      },
    };
  }

  const { role, department, teams = [], id } = user; // Include user ID, default teams to empty array
  const time = new Date().getHours();

  // Role check
  if (policy.conditions.role && policy.conditions.role !== role) {
    return {
      access: false,
      reason: "Role does not match.",
      details: {
        expectedRole: policy.conditions.role,
        actualRole: role,
      },
    };
  }

  // Department check
  if (
    policy.conditions.department &&
    policy.conditions.department !== department
  ) {
    return {
      access: false,
      reason: "Department does not match.",
      details: {
        expectedDepartment: policy.conditions.department,
        actualDepartment: department, // Ensure actualDepartment is included
      },
    };
  }

  // Time check
  if (policy.conditions.time && !(time >= 9 && time <= 17)) {
    return {
      access: false,
      reason: "Access is only allowed between 9 AM and 5 PM.",
      details: {
        currentTime: `${time}:00`,
        allowedTime: "9AM-5PM",
      },
    };
  }

  // Team Access Check
  if (policy.conditions.teamAccess && !teams.includes(requestTeamId)) {
    return {
      access: false,
      reason: "User is not part of the requested team.",
      details: {
        userTeams: teams,
        requestedTeamId: requestTeamId,
      },
    };
  }

  // Allowed Users Check
  if (
    policy.conditions.allowedUsers &&
    !policy.conditions.allowedUsers.includes(id)
  ) {
    return {
      access: false,
      reason: "User is not in the allowed users list.",
      details: {
        allowedUsers: policy.conditions.allowedUsers,
        userId: _id,
      },
    };
  }

  return { access: true }; // Access granted
};

/**
 * ABAC Middleware to enforce access control.
 * @param {string} resource - The resource being accessed.
 * @param {string} action - The action being performed.
 * @returns {Function} - Express middleware function.
 */
const abacMiddleware = (resource, action) => async (req, res, next) => {
  const user = req.user; // Authenticated user
  const requestTeamId = req.params.teamId; // Team ID from route

  // Log the user object for debugging
  console.log("User:", user);

  try {
    // Fetch all policies that match the resource and action
    const policies = await Policy.find({ resource, action });

    let accessDeniedReasons = [];

    // Check if any policy grants access
    const hasAccess = policies.some((policy) => {
      const result = evaluatePolicy(
        user,
        resource,
        action,
        policy,
        requestTeamId
      );
      if (!result.access) {
        accessDeniedReasons.push({
          reason: result.reason,
          details: result.details,
        }); // Collect reasons and details for access denial
      }
      return result.access;
    });

    if (hasAccess) {
      next(); // Access granted
    } else {
      // Access denied
      res.status(403).json({
        message: "Access denied. Insufficient permissions.",
        reasons: accessDeniedReasons, // Include reasons and details for access denial
      });
    }
  } catch (error) {
    console.error("ABAC Middleware Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = abacMiddleware;
